import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useCasino } from './casino-context';
import { Gift, Star, Zap, Trophy, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AmbientStarWaveBackground } from './ambient-star-wave-background';

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: 'gift' | 'star' | 'zap' | 'trophy';
  color: string;
  company: string;
  website: string;
}

const rewards: Reward[] = [
  {
    id: 'mcdonalds-discount',
    name: "McDonald's 20% Discount",
    description: '20% discount on any meal',
    cost: 2500,
    icon: 'gift',
    color: '#da291c',
    company: "McDonald's",
    website: 'https://www.mcdonalds.com',
  },
  {
    id: 'lidl-discount',
    name: 'Lidl €5 Off',
    description: '€5 off on purchases over €30',
    cost: 3000,
    icon: 'star',
    color: '#0066cc',
    company: 'Lidl',
    website: 'https://www.lidl.com',
  },
  {
    id: 'hm-discount',
    name: 'H&M 15% Off',
    description: '15% off any clothing item',
    cost: 2800,
    icon: 'zap',
    color: '#ed2939',
    company: 'H&M',
    website: 'https://www.hm.com',
  },
  {
    id: 'starbucks-bogo',
    name: 'Starbucks Buy One Get One',
    description: 'Buy one, get one free on any beverage',
    cost: 3500,
    icon: 'trophy',
    color: '#00704a',
    company: 'Starbucks',
    website: 'https://www.starbucks.com',
  },
  {
    id: 'decathlon-discount',
    name: 'Decathlon 10% Off',
    description: '10% off sports equipment',
    cost: 3200,
    icon: 'star',
    color: '#003da5',
    company: 'Decathlon',
    website: 'https://www.decathlon.com',
  },
  {
    id: 'dominos-discount',
    name: "Domino's 25% Off",
    description: '25% off any large pizza',
    cost: 4000,
    icon: 'zap',
    color: '#0052cc',
    company: "Domino's Pizza",
    website: 'https://www.dominos.com',
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

    // Show success message with company website link
    alert(`Successfully redeemed: ${selectedReward.name}!\n\nVisit ${selectedReward.company} to use your reward.`);
    
    setShowDialog(false);
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
                <p className="text-gray-400 text-sm mb-2">{reward.description}</p>
                <p className="text-gray-500 text-xs mb-4">{reward.company}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Cost</p>
                    <p className="text-xl" style={{ color: reward.color }}>
                      {reward.cost} pts
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleRedeemClick(reward)}
                    disabled={!canAfford}
                    className={`flex-1 ${
                      canAfford
                        ? 'bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] hover:from-[#5a38e6] hover:to-[#e6278f]'
                        : 'bg-gray-700 cursor-not-allowed'
                    } text-white`}
                  >
                    {canAfford ? 'Redeem' : 'Insufficient Points'}
                  </Button>
                  <Button
                    onClick={() => window.open(reward.website, '_blank')}
                    variant="outline"
                    className="border-[#6b46ff]/30 hover:border-[#6b46ff] text-white px-3"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
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