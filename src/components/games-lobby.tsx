import { Card } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Spade, Diamond, Club } from 'lucide-react';
import { AmbientStarWaveBackground } from './ambient-star-wave-background';
import { ComingSoonModal } from './coming-soon-modal';
import { useState } from 'react';

interface Game {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  minBet: number;
}

const games: Game[] = [
  {
    id: 'blackjack',
    name: 'Blackjack',
    category: 'blackjack',
    image: 'https://images.unsplash.com/photo-1618304925090-b68a8c744cbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFja2phY2slMjBjYXJkcyUyMGNhc2lub3xlbnwxfHx8fDE3NjYwNjIwNjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Beat the dealer by getting as close to 21 as possible',
    minBet: 10,
  },
  {
    id: 'poker',
    name: 'Texas Hold\'em Poker',
    category: 'poker',
    image: 'https://images.unsplash.com/photo-1618304925090-b68a8c744cbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2tlciUyMGNhcmRzJTIwdGFibGV8ZW58MXx8fHwxNzY1OTcyMDM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Classic poker game with community cards',
    minBet: 20,
  },
  {
    id: 'baccarat',
    name: 'Baccarat',
    category: 'baccarat',
    image: 'https://images.unsplash.com/photo-1615798533540-70a52a0e91ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWNjYXJhdCUyMGNhc2lubyUyMGNhcmRzfGVufDF8fHx8MTc2NjA2MjA3MHww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Bet on Player, Banker, or Tie to win',
    minBet: 25,
  },
];

interface GamesLobbyProps {
  onSelectGame: (gameId: string) => void;
}

export function GamesLobby({ onSelectGame }: GamesLobbyProps) {
  const [isComingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  const [selectedGameName, setSelectedGameName] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const handleGameClick = (game: Game) => {
    if (game.id === 'blackjack') {
      // Navigate to Blackjack game
      onSelectGame(game.id);
    } else {
      // Show coming soon modal for other games
      setSelectedGameName(game.name);
      setComingSoonModalOpen(true);
    }
  };

  // Filter games based on active filter
  const filteredGames = activeFilter === 'all' 
    ? games 
    : games.filter(game => game.category === activeFilter);

  return (
    <div className="relative min-h-screen">
      {/* Ambient Star Wave Background */}
      <AmbientStarWaveBackground />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ zIndex: 2 }}>
        <div className="mb-8">
          <h1 className="text-4xl text-white mb-2">Card Games</h1>
          <p className="text-gray-400">Choose your favorite card game and start playing!</p>
        </div>
        
        {/* Filter Tabs */}
        <Tabs defaultValue="all" onValueChange={setActiveFilter} className="mb-8">
          <TabsList className="bg-card border border-[#6b46ff]/30">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#6b46ff]">
              All Games
            </TabsTrigger>
            <TabsTrigger value="blackjack" className="data-[state=active]:bg-[#6b46ff]">
              Blackjack
            </TabsTrigger>
            <TabsTrigger value="poker" className="data-[state=active]:bg-[#6b46ff]">
              Poker
            </TabsTrigger>
            <TabsTrigger value="baccarat" className="data-[state=active]:bg-[#6b46ff]">
              Baccarat
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <Card
              key={game.id}
              onClick={() => handleGameClick(game)}
              className="bg-card border-[#6b46ff]/30 overflow-hidden hover:border-[#6b46ff] transition-all hover:scale-105 group cursor-pointer"
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
                  {game.id === 'blackjack' && <Spade className="w-6 h-6 text-white" />}
                  {game.id === 'poker' && <Diamond className="w-6 h-6 text-white" />}
                  {game.id === 'baccarat' && <Club className="w-6 h-6 text-white" />}
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
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleGameClick(game);
                  }}
                  className="w-full bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] hover:from-[#5a38e6] hover:to-[#e6278f] text-white rounded-lg"
                >
                  Play Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Coming Soon Section */}
        <Card className="bg-card border-[#6b46ff]/30 p-8 mt-8">
          <div className="text-center">
            <h3 className="text-white mb-2">More Games Coming Soon!</h3>
            <p className="text-gray-400">
              We're constantly adding new card games to our platform. Stay tuned for updates!
            </p>
          </div>
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