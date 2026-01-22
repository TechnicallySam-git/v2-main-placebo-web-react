import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useCasino } from './casino-context';
import { ArrowLeft, Coins, Loader2, Gamepad2 } from 'lucide-react';
import { AmbientStarWaveBackground } from './ambient-star-wave-background';

// Unity type declarations
declare global {
  interface Window {
    createUnityInstance?: (canvas: HTMLCanvasElement, config: any) => Promise<any>;
  }
}

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface PlayingCard {
  suit: Suit;
  rank: Rank;
}

interface BlackjackGameProps {
  onBack: () => void;
}

type GameMode = 'react' | 'unity';

export function BlackjackGame({ onBack }: BlackjackGameProps) {
  const { user, updatePoints, addGameHistory } = useCasino();
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [bet, setBet] = useState(10);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer' | 'ended'>('betting');
  const [result, setResult] = useState<string>('');
  const [showDealerCard, setShowDealerCard] = useState(false);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  
  // Unity WebGL state
  const [gameMode, setGameMode] = useState<GameMode>('react');
  const [isUnityLoading, setIsUnityLoading] = useState(false);
  const [unityError, setUnityError] = useState<string | null>(null);
  const unityInstanceRef = useRef<any>(null);

  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  // Load Unity WebGL Game
  useEffect(() => {
    if (gameMode !== 'unity') return;

    let script: HTMLScriptElement | null = null;
    let mounted = true;

    const loadUnityGame = async () => {
      try {
        setIsUnityLoading(true);
        setUnityError(null);

        // Check if script already exists
        const existingScript = document.querySelector('script[src="/blackjack/Build/Build.loader.js"]');
        if (existingScript) {
          existingScript.remove();
        }

        // Create script element for Unity loader
        script = document.createElement('script');
        script.src = '/blackjack/Build/Build.loader.js';
        script.async = true;

        script.onload = () => {
          if (!mounted) return;
          
          if (window.createUnityInstance) {
            const canvas = document.getElementById('unity-canvas') as HTMLCanvasElement;
            
            if (!canvas) {
              console.error('Unity canvas not found');
              setUnityError('Canvas element not found. Please refresh.');
              setIsUnityLoading(false);
              return;
            }
            
            window.createUnityInstance(canvas, {
              dataUrl: '/blackjack/Build/Build.data',
              frameworkUrl: '/blackjack/Build/Build.framework.js',
              codeUrl: '/blackjack/Build/Build.wasm',
              streamingAssetsUrl: '/blackjack/StreamingAssets',
              companyName: 'Placebo Casino',
              productName: 'Blackjack 3D',
              productVersion: '1.0',
            }).then((unityInstance: any) => {
              if (!mounted) {
                unityInstance.Quit().catch(console.error);
                return;
              }
              
              unityInstanceRef.current = unityInstance;
              setIsUnityLoading(false);
              console.log('Unity Blackjack loaded successfully');
              
              // Send user points to Unity (if GameManager exists)
              try {
                unityInstance.SendMessage('GameManager', 'SetPlayerPoints', user.points);
              } catch (err) {
                console.warn('Could not send points to Unity GameManager:', err);
              }
            }).catch((error: any) => {
              if (!mounted) return;
              console.error('Unity load error:', error);
              setUnityError('Failed to load 3D game. Please try the 2D version or refresh.');
              setIsUnityLoading(false);
            });
          } else {
            if (!mounted) return;
            setUnityError('Unity loader not available.');
            setIsUnityLoading(false);
          }
        };

        script.onerror = () => {
          if (!mounted) return;
          setUnityError('Failed to load Unity loader. Please check your connection.');
          setIsUnityLoading(false);
        };

        document.body.appendChild(script);
      } catch (err) {
        if (!mounted) return;
        console.error('Error loading Unity game:', err);
        setUnityError('An unexpected error occurred.');
        setIsUnityLoading(false);
      }
    };

    loadUnityGame();

    return () => {
      mounted = false;
      if (unityInstanceRef.current) {
        unityInstanceRef.current.Quit().catch(console.error);
        unityInstanceRef.current = null;
      }
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [gameMode, user.points]);

  // Listen for Unity game events
  useEffect(() => {
    const handleUnityGameEnd = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { pointsWon, gameResult } = customEvent.detail;
      
      try {
        await updatePoints(pointsWon);
        await addGameHistory({
          gameName: 'Blackjack 3D',
          result: gameResult,
          pointsChange: pointsWon,
        });
      } catch (err: any) {
        console.error('Failed to update points from Unity:', err);
      }
    };

    window.addEventListener('UnityGameEnd', handleUnityGameEnd);
    
    return () => {
      window.removeEventListener('UnityGameEnd', handleUnityGameEnd);
    };
  }, [updatePoints, addGameHistory]);

  const createDeck = (): PlayingCard[] => {
    const newDeck: PlayingCard[] = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        newDeck.push({ suit, rank });
      }
    }
    return shuffleDeck(newDeck);
  };

  const shuffleDeck = (deck: PlayingCard[]): PlayingCard[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getCardValue = (card: PlayingCard, currentTotal: number): number => {
    if (card.rank === 'A') {
      return currentTotal + 11 > 21 ? 1 : 11;
    } else if (['J', 'Q', 'K'].includes(card.rank)) {
      return 10;
    }
    return parseInt(card.rank);
  };

  const calculateHandValue = (hand: PlayingCard[]): number => {
    let total = 0;
    let aces = 0;

    for (const card of hand) {
      if (card.rank === 'A') {
        aces++;
        total += 11;
      } else if (['J', 'Q', 'K'].includes(card.rank)) {
        total += 10;
      } else {
        total += parseInt(card.rank);
      }
    }

    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    return total;
  };

  const dealInitialCards = async () => {
    if (bet > user.points) {
      alert('Insufficient points!');
      return;
    }

    setIsPlacingBet(true);
    try {
      await updatePoints(-bet);
    } catch (err: any) {
      console.error('Failed to place bet:', err);
      alert(typeof err === 'string' ? err : (err?.message || 'Failed to place bet. Try again later.'));
      setIsPlacingBet(false);
      return;
    }
    setIsPlacingBet(false);

    const newDeck = createDeck();
    const player = [newDeck[0], newDeck[2]];
    const dealer = [newDeck[1], newDeck[3]];
    
    setDeck(newDeck.slice(4));
    setPlayerHand(player);
    setDealerHand(dealer);
    setGameState('playing');
    setResult('');
    setShowDealerCard(false);

    const playerValue = calculateHandValue(player);
    if (playerValue === 21) {
      setShowDealerCard(true);
      const dealerValue = calculateHandValue(dealer);
      if (dealerValue === 21) {
        await endGame('push', 0);
      } else {
        await endGame('win', Math.floor(bet * 2.5));
      }
    }
  };

  const hit = () => {
    if (deck.length === 0) return;

    const newCard = deck[0];
    const newPlayerHand = [...playerHand, newCard];
    setPlayerHand(newPlayerHand);
    setDeck(deck.slice(1));

    const playerValue = calculateHandValue(newPlayerHand);
    if (playerValue > 21) {
      setShowDealerCard(true);
      endGame('loss', 0);
    } else if (playerValue === 21) {
      stand();
    }
  };

  const stand = () => {
    setShowDealerCard(true);
    setGameState('dealer');
    dealerPlay();
  };

  const dealerPlay = async () => {
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];

    while (calculateHandValue(currentDealerHand) < 17) {
      if (currentDeck.length === 0) break;
      currentDealerHand.push(currentDeck[0]);
      currentDeck = currentDeck.slice(1);
    }

    setDealerHand(currentDealerHand);
    setDeck(currentDeck);

    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(currentDealerHand);

    if (dealerValue > 21) {
      endGame('win', bet * 2);
    } else if (dealerValue > playerValue) {
      endGame('loss', 0);
    } else if (dealerValue < playerValue) {
      endGame('win', bet * 2);
    } else {
      endGame('push', 0);
    }
  };

  const endGame = async (outcome: 'win' | 'loss' | 'push', payout: number) => {
    setGameState('ended');
    
    if (outcome === 'win') {
      setResult(`You Win! +${payout} points`);
      try {
        await updatePoints(payout);
      } catch (err: any) {
        console.error('Failed to credit payout:', err);
        alert('Round finished but server failed to credit points. Contact support.');
      }
      addGameHistory({
        gameName: 'Blackjack',
        result: 'win',
        pointsChange: payout - bet,
      });
    } else if (outcome === 'loss') {
      setResult('Dealer Wins!');
      addGameHistory({
        gameName: 'Blackjack',
        result: 'loss',
        pointsChange: -bet,
      });
    } else {
      setResult('Push! Bet Returned');
      try {
        await updatePoints(bet);
      } catch (err: any) {
        console.error('Failed to return bet:', err);
        alert('Round finished but server failed to return bet. Contact support.');
      }
      addGameHistory({
        gameName: 'Blackjack',
        result: 'push',
        pointsChange: 0,
      });
    }
  };

  const newRound = () => {
    setGameState('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setResult('');
    setShowDealerCard(false);
  };

  const PlayingCardComponent = ({ card, hidden = false }: { card: PlayingCard; hidden?: boolean }) => {
    const isRed = card.suit === '♥' || card.suit === '♦';
    
    if (hidden) {
      return (
        <div className="w-20 h-28 bg-gradient-to-br from-[#6b46ff] to-[#ff2b9e] rounded-lg flex items-center justify-center border-2 border-white/20">
          <div className="text-white text-4xl">?</div>
        </div>
      );
    }

    return (
      <div className="w-20 h-28 bg-white rounded-lg flex flex-col items-center justify-between p-2 border-2 border-gray-300 shadow-lg">
        <div className={`text-2xl ${isRed ? 'text-red-600' : 'text-black'}`}>
          {card.rank}
        </div>
        <div className={`text-3xl ${isRed ? 'text-red-600' : 'text-black'}`}>
          {card.suit}
        </div>
        <div className={`text-2xl ${isRed ? 'text-red-600' : 'text-black'}`}>
          {card.rank}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      <AmbientStarWaveBackground />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen" style={{ zIndex: 2 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-[#6b46ff]/30 hover:border-[#6b46ff]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lobby
            </Button>
            
            {/* Game Mode Switcher */}
            <div className="flex gap-2 bg-card border border-[#6b46ff]/30 rounded-lg p-1">
              <Button
                onClick={() => setGameMode('react')}
                variant={gameMode === 'react' ? 'default' : 'ghost'}
                className={`h-9 ${gameMode === 'react' ? 'bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e]' : ''}`}
              >
                2D Classic
              </Button>
              <Button
                onClick={() => setGameMode('unity')}
                variant={gameMode === 'unity' ? 'default' : 'ghost'}
                className={`h-9 ${gameMode === 'unity' ? 'bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e]' : ''}`}
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                3D Unity
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Card className="bg-card border-[#6b46ff]/30 px-4 py-2">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#00ff88]" />
                <span className="text-white">{user.points} pts</span>
              </div>
            </Card>
          </div>
        </div>

        {/* React Game Mode */}
        {gameMode === 'react' && (
          <Card className="bg-gradient-to-br from-[#1a0f2e] to-[#2a1f4b] border-[#6b46ff]/30 p-8">
            {/* Dealer Hand */}
            <div className="mb-12">
              <h3 className="text-white mb-4">
                Dealer's Hand {showDealerCard && `(${calculateHandValue(dealerHand)})`}
              </h3>
              <div className="flex gap-3 flex-wrap">
                {dealerHand.map((card, idx) => (
                  <PlayingCardComponent
                    key={idx}
                    card={card}
                    hidden={idx === 1 && !showDealerCard}
                  />
                ))}
              </div>
            </div>

            {/* Player Hand */}
            <div className="mb-8">
              <h3 className="text-white mb-4">
                Your Hand {playerHand.length > 0 && `(${calculateHandValue(playerHand)})`}
              </h3>
              <div className="flex gap-3 flex-wrap">
                {playerHand.map((card, idx) => (
                  <PlayingCardComponent key={idx} card={card} />
                ))}
              </div>
            </div>

            {/* Result Message */}
            {result && (
              <div className={`text-center mb-6 p-4 rounded-lg ${
                result.includes('Win') ? 'bg-[#00ff88]/20 text-[#00ff88]' : 
                result.includes('Push') ? 'bg-[#00d9ff]/20 text-[#00d9ff]' : 
                'bg-[#ff2b9e]/20 text-[#ff2b9e]'
              }`}>
                <p className="text-2xl">{result}</p>
              </div>
            )}

            {/* Betting Controls */}
            {gameState === 'betting' && (
              <div className="space-y-6">
                <div>
                  <label className="text-white block mb-3">Place Your Bet:</label>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {[10, 25, 50, 100, 250].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setBet(amount)}
                        disabled={amount > user.points}
                        className={`
                          relative h-12 px-5 rounded-full transition-all duration-200
                          ${bet === amount 
                            ? 'bg-gradient-to-br from-[#6b46ff] to-[#ff2b9e] text-white shadow-lg shadow-[#6b46ff]/50 scale-105' 
                            : 'bg-[#2a1f4b] text-gray-300 border-2 border-[#6b46ff]/30 hover:border-[#6b46ff] hover:bg-[#2a1f4b]/80'
                          }
                          ${amount > user.points ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                          font-medium
                        `}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm">Selected bet: <span className="text-[#00ff88]">{bet} points</span></p>
                </div>
                
                <Button
                  onClick={dealInitialCards}
                  disabled={bet > user.points || isPlacingBet}
                  className="w-full h-14 bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] hover:from-[#5a38e6] hover:to-[#e6278f] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  {isPlacingBet ? 'Placing bet...' : 'Deal Cards'}
                </Button>
              </div>
            )}

            {/* Game Controls */}
            {gameState === 'playing' && (
              <div className="flex gap-4">
                <Button
                  onClick={hit}
                  className="flex-1 h-14 bg-[#6b46ff] hover:bg-[#5a38e6] text-white transition-all hover:-translate-y-0.5"
                >
                  Hit
                </Button>
                <Button
                  onClick={stand}
                  className="flex-1 h-14 bg-[#ff2b9e] hover:bg-[#e6278f] text-white transition-all hover:-translate-y-0.5"
                >
                  Stand
                </Button>
              </div>
            )}

            {/* New Round Button */}
            {gameState === 'ended' && (
              <Button
                onClick={newRound}
                className="w-full h-14 bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] hover:from-[#5a38e6] hover:to-[#e6278f] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                New Round
              </Button>
            )}
          </Card>
        )}

        {/* Unity WebGL Game Mode */}
        {gameMode === 'unity' && (
          <Card className="bg-gradient-to-br from-[#1a0f2e] to-[#2a1f4b] border-[#6b46ff]/30 p-8">
            <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {isUnityLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#1a0f2e]">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#6b46ff] animate-spin mx-auto mb-4" />
                    <p className="text-white">Loading 3D Blackjack...</p>
                    <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
                  </div>
                </div>
              )}
              
              {unityError && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#1a0f2e]">
                  <div className="text-center max-w-md px-4">
                    <p className="text-[#ff2b9e] mb-4">{unityError}</p>
                    <div className="flex gap-3 justify-center">
                      <Button 
                        onClick={() => setGameMode('react')}
                        className="bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e]"
                      >
                        Play 2D Version
                      </Button>
                      <Button 
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="border-[#6b46ff]/30"
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <canvas
                id="unity-canvas"
                className="w-full h-full"
                style={{ 
                  display: isUnityLoading || unityError ? 'none' : 'block',
                  width: '100%',
                  height: '100%'
                }}
              />
            </div>
          </Card>
        )}

        {/* Game Info */}
        <Card className="bg-card border-[#6b46ff]/30 p-6 mt-8">
          <h3 className="text-white mb-3">
            {gameMode === 'react' ? 'How to Play Blackjack' : '3D Blackjack Experience'}
          </h3>
          {gameMode === 'react' ? (
            <ul className="text-gray-400 text-sm space-y-2">
              <li>• Goal: Get as close to 21 as possible without going over</li>
              <li>• Face cards (J, Q, K) are worth 10 points</li>
              <li>• Aces can be worth 1 or 11 points</li>
              <li>• Hit: Take another card</li>
              <li>• Stand: Keep your current hand</li>
              <li>• Dealer must hit on 16 or less, stand on 17 or more</li>
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">
              Experience our immersive 3D Unity blackjack game with realistic graphics, 
              smooth animations, and an authentic casino atmosphere. Your progress syncs 
              automatically with your account!
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}