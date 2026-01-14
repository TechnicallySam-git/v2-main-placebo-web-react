import { Card } from './ui/card';
import { Shield, Heart, AlertCircle, Info, PhoneCall, MessageCircle, CheckCircle } from 'lucide-react';
import { AmbientStarWaveBackground } from './ambient-star-wave-background';

export function ResponsibleGambling() {
  return (
    <div className="relative min-h-screen">
      {/* Ambient Star Wave Background */}
      <AmbientStarWaveBackground />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ zIndex: 2 }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-white mb-2">Responsible Gambling</h1>
          <p className="text-gray-400">
            At Placebo Casino, your wellbeing is our priority. Learn about safe gaming practices.
          </p>
        </div>

        {/* Hero Card */}
        <Card className="bg-gradient-to-br from-[#6b46ff] to-[#ff2b9e] border-none p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h2 className="mb-3">Why Placebo Casino is Safe</h2>
              <p className="text-white/90 mb-4">
                Placebo Casino uses a points-based system instead of real money, making it a completely 
                safe environment to enjoy casino games. There is no financial risk, no real money transactions, 
                and no possibility of gambling addiction related to monetary loss.
              </p>
              <p className="text-white/80 text-sm">
                This platform is designed for entertainment and learning purposes only.
              </p>
            </div>
          </div>
        </Card>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card border-[#6b46ff]/30 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#6b46ff]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-[#6b46ff]" />
              </div>
              <div>
                <h3 className="text-white mb-2">No Financial Risk</h3>
                <p className="text-gray-400 text-sm">
                  Play freely without worrying about losing money. All games use virtual points that 
                  have no real-world monetary value.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-[#ff2b9e]/30 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#ff2b9e]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-[#ff2b9e]" />
              </div>
              <div>
                <h3 className="text-white mb-2">Learn & Practice</h3>
                <p className="text-gray-400 text-sm">
                  Perfect your gaming strategies and learn card games in a risk-free environment 
                  before playing for real money elsewhere.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-[#00d9ff]/30 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#00d9ff]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-[#00d9ff]" />
              </div>
              <div>
                <h3 className="text-white mb-2">Safe for Everyone</h3>
                <p className="text-gray-400 text-sm">
                  Suitable for all ages (where legal) as it contains no real gambling. It's pure 
                  entertainment without the dangers of traditional gambling.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-[#00ff88]/30 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#00ff88]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-[#00ff88]" />
              </div>
              <div>
                <h3 className="text-white mb-2">Healthy Entertainment</h3>
                <p className="text-gray-400 text-sm">
                  Enjoy the excitement of casino games as a form of entertainment, without the 
                  addictive potential of real money gambling.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Platform Safeguards */}
        <Card className="bg-card border-[#6b46ff]/30 p-8 mb-8">
          <h2 className="text-white mb-6">Our Platform Safeguards</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#00ff88] flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-white mb-1">No Real Money Transactions</h4>
                <p className="text-gray-400 text-sm">
                  You cannot deposit or withdraw real money. All transactions are point-based only.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#00ff88] flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-white mb-1">Educational Focus</h4>
                <p className="text-gray-400 text-sm">
                  Our platform is designed to teach game strategies and rules in a safe environment.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#00ff88] flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-white mb-1">Points Reset Available</h4>
                <p className="text-gray-400 text-sm">
                  If you run out of points, you can easily get more. There's no consequence to losing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#00ff88] flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-white mb-1">Transparent Odds</h4>
                <p className="text-gray-400 text-sm">
                  All game rules and odds are clearly displayed, helping you make informed decisions.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* General Gambling Awareness */}
        <Card className="bg-card border-[#ff2b9e]/30 p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <AlertCircle className="w-6 h-6 text-[#ff2b9e] flex-shrink-0" />
            <div>
              <h2 className="text-white mb-2">About Real Gambling</h2>
              <p className="text-gray-400">
                While Placebo Casino is completely safe, it's important to understand the risks 
                of real money gambling if you choose to participate elsewhere.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-gray-400 text-sm">
            <div>
              <h4 className="text-white mb-2">Warning Signs of Problem Gambling:</h4>
              <ul className="space-y-2 ml-4">
                <li>• Spending more money or time gambling than you can afford</li>
                <li>• Chasing losses or trying to win back money</li>
                <li>• Lying to family or friends about gambling activities</li>
                <li>• Feeling anxious, depressed, or guilty about gambling</li>
                <li>• Neglecting work, family, or personal responsibilities</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white mb-2">If You Need Help:</h4>
              <p className="mb-2">
                If you or someone you know has a gambling problem, help is available:
              </p>
              <ul className="space-y-1 ml-4">
                <li>• National Problem Gambling Helpline: 1-800-522-4700</li>
                <li>• GamblersAnonymous.org - Support groups worldwide</li>
                <li>• SAMHSA National Helpline: 1-800-662-4357</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Tips for Healthy Gaming */}
        <Card className="bg-gradient-to-br from-card to-[#2a1f4b] border-[#6b46ff]/30 p-8">
          <h2 className="text-white mb-6">Tips for Healthy Gaming</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-400 text-sm">
            <div>
              <h4 className="text-[#6b46ff] mb-2">1. Set Time Limits</h4>
              <p>Even with points, it's healthy to take breaks and not spend excessive time gaming.</p>
            </div>

            <div>
              <h4 className="text-[#ff2b9e] mb-2">2. Play for Fun</h4>
              <p>Remember that this is entertainment. Don't let virtual wins or losses affect your mood.</p>
            </div>

            <div>
              <h4 className="text-[#00d9ff] mb-2">3. Learn the Games</h4>
              <p>Use this platform to understand game mechanics and develop strategies.</p>
            </div>

            <div>
              <h4 className="text-[#00ff88] mb-2">4. Stay Balanced</h4>
              <p>Maintain a balanced lifestyle with various activities beyond gaming.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}