import { Button } from './ui/button';
import { Card } from './ui/card';
import { Sparkles, Shield, Trophy, Users, Spade, Diamond } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AmbientStarWaveBackground } from './ambient-star-wave-background';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Ambient Star Wave Background */}
        <AmbientStarWaveBackground />
        
        <div className="absolute inset-0 bg-gradient-to-br from-[#6b46ff]/20 via-[#ff2b9e]/10 to-[#00d9ff]/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24" style={{ zIndex: 2 }}>
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-[#6b46ff]" />
            </div>
            
            <h1 className="text-4xl sm:text-6xl text-white mb-6">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e]">Placebo Casino</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Experience the thrill of casino games without any risk. Play with points, not money. 
              Safe, fun, and completely free!
            </p>
            
            {/* Bonus Offer Banner */}
            <button
              onClick={onRegister}
              className="block max-w-2xl mx-auto bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] border-none p-6 mb-8 rounded-xl ambient-glow cursor-pointer transition-all hover:scale-105 hover:shadow-2xl"
            >
              <div className="flex items-center justify-center gap-3">
                <Trophy className="w-8 h-8 text-white" />
                <p className="text-xl text-white">
                  New Players Get 1,000 FREE Points!
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Featured Games Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl text-white mb-2">Featured Card Games</h2>
          <p className="text-gray-400">Explore our exciting collection of classic card games</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                  onClick={onRegister}
                  className="w-full bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] hover:from-[#5a38e6] hover:to-[#e6278f] text-white rounded-lg"
                >
                  Register to Play
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-400 mb-4">Sign up now to start playing these amazing games!</p>
          <Button
            onClick={onRegister}
            size="lg"
            className="bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] hover:from-[#5a38e6] hover:to-[#e6278f] text-white px-8 py-6 rounded-xl"
          >
            Get Started - It's Free!
          </Button>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-[#6b46ff]/30 p-6 hover:border-[#6b46ff] transition-colors">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#6b46ff]/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#6b46ff]" />
              </div>
              <h3 className="text-white mb-2">100% Safe</h3>
              <p className="text-gray-400">
                Play with points, not real money. No financial risk involved.
              </p>
            </div>
          </Card>
          
          <Card className="bg-card border-[#ff2b9e]/30 p-6 hover:border-[#ff2b9e] transition-colors">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#ff2b9e]/20 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[#ff2b9e]" />
              </div>
              <h3 className="text-white mb-2">Classic Card Games</h3>
              <p className="text-gray-400">
                Enjoy popular card games like Blackjack, Poker, and Baccarat.
              </p>
            </div>
          </Card>
          
          <Card className="bg-card border-[#00d9ff]/30 p-6 hover:border-[#00d9ff] transition-colors sm:col-span-2 lg:col-span-1">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#00d9ff]/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[#00d9ff]" />
              </div>
              <h3 className="text-white mb-2">Responsible Gaming</h3>
              <p className="text-gray-400">
                Learn gambling strategies without any addiction risk.
              </p>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Why Choose Us Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-gradient-to-br from-card to-[#2a1f4b] border-[#6b46ff]/30 p-8 sm:p-12">
          <h2 className="text-3xl text-white text-center mb-8">
            Why Placebo Casino?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="text-[#6b46ff] mb-2">✓ Zero Financial Risk</h4>
              <p>Play all you want without spending a single dollar.</p>
            </div>
            <div>
              <h4 className="text-[#ff2b9e] mb-2">✓ Learn & Practice</h4>
              <p>Perfect your gaming strategies and learn card games in a risk-free environment.</p>
            </div>
            <div>
              <h4 className="text-[#00d9ff] mb-2">✓ Earn Rewards</h4>
              <p>Redeem your points for exciting prizes and bonuses.</p>
            </div>
            <div>
              <h4 className="text-[#00ff88] mb-2">✓ Always Available</h4>
              <p>Play anytime, anywhere, on any device.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}