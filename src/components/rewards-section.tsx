import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useCasino } from './casino-context';
import { Gift, Star, Zap, Trophy } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AmbientStarWaveBackground } from './ambient-star-wave-background';

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: 'gift' | 'star' | 'zap' | 'trophy';
  color: string;
}

const rewards: Reward[] = [
  {
    id: 'bonus-100',
    name: '100 Bonus Points',
    description: 'Instant 100 points added to your balance',
    cost: 500,
    icon: 'gift',
    color: '#6b46ff',
  },
  {
    id: 'bonus-250',
    name: '250 Bonus Points',
    description: 'Instant 250 points added to your balance',
    cost: 1000,
    icon: 'star',
    color: '#ff2b9e',
  },
  {
    id: 'bonus-500',
    name: '500 Bonus Points',
    description: 'Instant 500 points added to your balance',
    cost: 1800,
    icon: 'zap',
    color: '#00d9ff',
  },
  {
    id: 'bonus-1000',
    name: '1000 Bonus Points',
    description: 'Instant 1000 points added to your balance',
    cost: 3200,
    icon: 'trophy',
    color: '#00ff88',
  },
  {
    id: 'double-next',
    name: 'Double Next Win',
    description: 'Your next win will be doubled (one-time use)',
    cost: 800,
    icon: 'zap',
    color: '#ff6b35',
  },
  {
    id: 'free-games',
    name: '5 Free Games',
    description: 'Play 5 games without risking your points',
    cost: 600,
    icon: 'star',
    color: '#6b46ff',
  },
];

export function RewardsSection() {
  const { user, updatePoints } = useCasino();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
    setShowDialog(true);
  };

  const handleConfirmRedeem = () => {
    if (!selectedReward) return;

    if (user.points < selectedReward.cost) {
      alert('Insufficient points!');
      setShowDialog(false);
      return;
    }

    // Deduct cost
    updatePoints(-selectedReward.cost);

    // Give reward
    if (selectedReward.id === 'bonus-100') {
      updatePoints(100);
    } else if (selectedReward.id === 'bonus-250') {
      updatePoints(250);
    } else if (selectedReward.id === 'bonus-500') {
      updatePoints(500);
    } else if (selectedReward.id === 'bonus-1000') {
      updatePoints(1000);
    }

    setShowDialog(false);
    alert(`Successfully redeemed: ${selectedReward.name}!`);
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'gift':
        return <Gift className="w-8 h-8" />;
      case 'star':
        return <Star className="w-8 h-8" />;
      case 'zap':
        return <Zap className="w-8 h-8" />;
      case 'trophy':
        return <Trophy className="w-8 h-8" />;
      default:
        return <Gift className="w-8 h-8" />;
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Ambient Star Wave Background */}
      <AmbientStarWaveBackground />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ zIndex: 2 }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-white mb-2">Rewards Shop</h1>
          <p className="text-gray-400">Redeem your points for exciting rewards and bonuses!</p>
        </div>

        {/* Points Balance Card */}
        <Card className="bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] border-none p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 mb-1">Your Available Points</p>
              <p className="text-4xl text-white">{user.points}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Gift className="w-8 h-8 text-white" />
            </div>
          </div>
        </Card>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const canAfford = user.points >= reward.cost;
            
            return (
              <Card
                key={reward.id}
                className={`bg-card border-2 p-6 transition-all ${
                  canAfford 
                    ? 'border-[#6b46ff]/30 hover:border-[#6b46ff] hover:scale-105' 
                    : 'border-gray-700/30 opacity-60'
                }`}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${reward.color}20` }}
                >
                  <div style={{ color: reward.color }}>
                    {getIcon(reward.icon)}
                  </div>
                </div>
                
                <h3 className="text-white mb-2">{reward.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{reward.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Cost</p>
                    <p className="text-xl" style={{ color: reward.color }}>
                      {reward.cost} pts
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleRedeemClick(reward)}
                  disabled={!canAfford}
                  className={`w-full ${
                    canAfford
                      ? 'bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] hover:from-[#5a38e6] hover:to-[#e6278f]'
                      : 'bg-gray-700 cursor-not-allowed'
                  } text-white`}
                >
                  {canAfford ? 'Redeem' : 'Insufficient Points'}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="bg-card border-[#6b46ff]/30 p-8 mt-8">
          <h3 className="text-white mb-4">How to Earn More Points</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
            <div>
              <h4 className="text-[#6b46ff] mb-2">Play Games</h4>
              <p>Win games to earn points and grow your balance.</p>
            </div>
            <div>
              <h4 className="text-[#ff2b9e] mb-2">Daily Bonuses</h4>
              <p>Log in daily to receive bonus points (coming soon).</p>
            </div>
            <div>
              <h4 className="text-[#00d9ff] mb-2">Achievements</h4>
              <p>Complete challenges to unlock special rewards (coming soon).</p>
            </div>
            <div>
              <h4 className="text-[#00ff88] mb-2">Tournaments</h4>
              <p>Compete in tournaments for big point prizes (coming soon).</p>
            </div>
          </div>
        </Card>

        {/* Redeem Confirmation Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-card border-[#6b46ff]/30">
            <DialogHeader>
              <DialogTitle className="text-white">Confirm Redemption</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to redeem this reward?
              </DialogDescription>
            </DialogHeader>
            
            {selectedReward && (
              <div className="py-4">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${selectedReward.color}20` }}
                  >
                    <div style={{ color: selectedReward.color }}>
                      {getIcon(selectedReward.icon)}
                    </div>
                  </div>
                  <div>
                    <p className="text-white">{selectedReward.name}</p>
                    <p className="text-gray-400 text-sm">{selectedReward.description}</p>
                  </div>
                </div>
                
                <div className="bg-secondary p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Cost:</span>
                    <span className="text-[#ff2b9e]">{selectedReward.cost} pts</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Current Balance:</span>
                    <span className="text-white">{user.points} pts</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-gray-400">After Redemption:</span>
                    <span className="text-[#00ff88]">{user.points - selectedReward.cost} pts</span>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="border-[#6b46ff]/30 hover:border-[#6b46ff]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRedeem}
                className="bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] hover:from-[#5a38e6] hover:to-[#e6278f] text-white"
              >
                Confirm Redemption
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}