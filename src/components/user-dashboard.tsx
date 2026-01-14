import { Card } from './ui/card';
import { Button } from './ui/button';
import { useCasino } from './casino-context';
import { Coins, TrendingUp, Trophy, Clock, Spade, Diamond, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AmbientStarWaveBackground } from './ambient-star-wave-background';
import { ComingSoonModal } from './coming-soon-modal';

interface UserDashboardProps {
  onNavigateToGames: () => void;
  onNavigateToRewards: () => void;
  onSelectGame?: (gameId: string) => void;
}

export function UserDashboard({ onNavigateToGames, onNavigateToRewards, onSelectGame }: UserDashboardProps) {
  const { user, gameHistory, markWelcomed } = useCasino();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isComingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  const [selectedGameName, setSelectedGameName] = useState<string>('');

  // Show welcome modal for first-time users - ONLY ONCE per session
  useEffect(() => {
    if (user.isFirstLogin && user.isLoggedIn) {
      setShowWelcomeModal(true);
    }
  }, []); // Empty dependency array - only run once on mount

  const handleCloseWelcome = () => {
    setShowWelcomeModal(false);
    // Mark as welcomed when user closes the modal
    markWelcomed();
  };

  const handleGameClick = (game: { id: string; name: string }) => {
    if (game.id === 'blackjack') {
      // Navigate to Blackjack game
      onSelectGame?.(game.id);
    } else {
      // Show coming soon modal for other games
      setSelectedGameName(game.name);
      setComingSoonModalOpen(true);
    }
  };

  const totalGames = gameHistory.length;
  const wins = gameHistory.filter(g => g.result === 'win').length;
  const losses = gameHistory.filter(g => g.result === 'loss').length;
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0';
  
  const totalWinnings = gameHistory
    .filter(g => g.result === 'win')
    .reduce((sum, g) => sum + g.pointsChange, 0);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const featuredGames = [
    {
      id: 'blackjack',
      name: 'Blackjack',
      image: 'https://images.unsplash.com/photo-1618304925090-b68a8c744cbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFja2phY2slMjBjYXJkcyUyMGNhc2lub3xlbnwxfHx8fDE3NjYwNjIwNjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Beat the dealer by getting as close to 21 as possible',
      minBet: 10,
      icon: Spade,
    },
    {
      id: 'poker',
      name: 'Texas Hold\'em Poker',
      image: 'https://images.unsplash.com/photo-1618304925090-b68a8c744cbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2tlciUyMGNhcmRzJTIwdGFibGV8ZW58MXx8fHwxNzY1OTcyMDM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Classic poker game with community cards',
      minBet: 20,
      icon: Diamond,
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Ambient Star Wave Background */}
      <AmbientStarWaveBackground />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ zIndex: 2 }}>
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl text-white mb-2">
            {user.isFirstLogin ? `Welcome, ${user.name}!` : `Welcome back, ${user.name}!`}
          </h1>
          <p className="text-gray-400">
            {user.isFirstLogin ? `You received 1,000 free points to get started!` : `Here's your gaming overview`}
          </p>
        </div>

        {/* Welcome Modal for First-Time Users */}
        <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
          <DialogContent className="bg-card border-[#6b46ff]/30 max-w-md">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#6b46ff] to-[#ff2b9e] rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <DialogTitle className="text-white text-center text-2xl">Welcome to Placebo Casino!</DialogTitle>
              <DialogDescription className="text-gray-400 text-center">
                Congratulations on joining, {user.name}!
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6 space-y-4">
              <div className="bg-gradient-to-r from-[#6b46ff]/20 to-[#ff2b9e]/20 border border-[#6b46ff]/30 p-4 rounded-lg text-center">
                <p className="text-white mb-2">🎉 Welcome Bonus</p>
                <p className="text-3xl text-[#00ff88] mb-1">1,000 Points</p>
                <p className="text-gray-400 text-sm">Added to your account!</p>
              </div>
              
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Play classic card games like Blackjack and Poker</p>
                <p>• No real money involved - just points and fun!</p>
                <p>• Earn rewards as you play</p>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                onClick={() => {
                  handleCloseWelcome();
                  onNavigateToGames();
                }}
                className="w-full bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] hover:from-[#5a38e6] hover:to-[#e6278f] text-white"
              >
                Start Playing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[#6b46ff] to-[#5a38e6] border-none p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Current Balance</p>
                <p className="text-3xl text-white">{user.points}</p>
                <p className="text-white/60 text-sm">points</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-[#ff2b9e] to-[#e6278f] border-none p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Games</p>
                <p className="text-3xl text-white">{totalGames}</p>
                <p className="text-white/60 text-sm">played</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-[#00d9ff] to-[#00a8cc] border-none p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Win Rate</p>
                <p className="text-3xl text-white">{winRate}%</p>
                <p className="text-white/60 text-sm">{wins}W / {losses}L</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-[#00ff88] to-[#00cc6e] border-none p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Winnings</p>
                <p className="text-3xl text-white">{totalWinnings}</p>
                <p className="text-white/60 text-sm">points</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Featured Games Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white">Featured Games</h2>
            <Button
              onClick={onNavigateToGames}
              variant="outline"
              className="border-[#6b46ff]/30 hover:border-[#6b46ff]"
            >
              View All Games
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredGames.map((game) => (
              <Card
                key={game.id}
                className="bg-card border-[#6b46ff]/30 overflow-hidden hover:border-[#6b46ff] transition-all hover:scale-105 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0118] via-transparent to-transparent" />
                  
                  {/* Icon overlay */}
                  <div className="absolute top-4 right-4 bg-[#6b46ff]/80 backdrop-blur-sm rounded-full p-3">
                    <game.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-white mb-2">{game.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{game.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm">
                      <span className="text-gray-400">Min Bet: </span>
                      <span className="text-[#00ff88]">{game.minBet} pts</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleGameClick(game)}
                    className="w-full bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] hover:from-[#5a38e6] hover:to-[#e6278f] text-white rounded-lg"
                  >
                    Play Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card border-[#6b46ff]/30 p-6 hover:border-[#6b46ff] transition-colors">
            <h3 className="text-white mb-3">Explore More Games</h3>
            <p className="text-gray-400 mb-4">
              Discover all our exciting card games including Baccarat and more!
            </p>
            <Button
              onClick={onNavigateToGames}
              className="w-full bg-[#6b46ff] hover:bg-[#5a38e6] text-white"
            >
              Browse All Games
            </Button>
          </Card>

          <Card className="bg-card border-[#ff2b9e]/30 p-6 hover:border-[#ff2b9e] transition-colors">
            <h3 className="text-white mb-3">Redeem Rewards</h3>
            <p className="text-gray-400 mb-4">
              Turn your points into exciting prizes and bonuses!
            </p>
            <Button
              onClick={onNavigateToRewards}
              className="w-full bg-[#ff2b9e] hover:bg-[#e6278f] text-white"
            >
              View Rewards
            </Button>
          </Card>
        </div>

        {/* Recent Games */}
        <Card className="bg-card border-[#6b46ff]/30 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-[#6b46ff]" />
            <h3 className="text-white">Recent Games</h3>
          </div>

          {gameHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No games played yet</p>
              <Button
                onClick={onNavigateToGames}
                variant="outline"
                className="border-[#6b46ff]/30 hover:border-[#6b46ff]"
              >
                Play Your First Game
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {gameHistory.slice(0, 10).map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      game.result === 'win' ? 'bg-[#00ff88]' :
                      game.result === 'loss' ? 'bg-[#ff2b9e]' :
                      'bg-[#00d9ff]'
                    }`} />
                    <div>
                      <p className="text-white">{game.gameName}</p>
                      <p className="text-gray-400 text-sm">{formatDate(game.timestamp)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`${
                      game.pointsChange > 0 ? 'text-[#00ff88]' :
                      game.pointsChange < 0 ? 'text-[#ff2b9e]' :
                      'text-[#00d9ff]'
                    }`}>
                      {game.pointsChange > 0 ? '+' : ''}{game.pointsChange} pts
                    </p>
                    <p className="text-gray-400 text-sm capitalize">{game.result}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={isComingSoonModalOpen}
        onClose={() => setComingSoonModalOpen(false)}
        gameName={selectedGameName}
      />
    </div>
  );
}