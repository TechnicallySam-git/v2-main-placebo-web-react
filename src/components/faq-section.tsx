import { Card } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { HelpCircle } from 'lucide-react';
import { AmbientStarWaveBackground } from './ambient-star-wave-background';

export function FAQSection() {
  return (
    <div className="relative min-h-screen">
      {/* Ambient Star Wave Background */}
      <AmbientStarWaveBackground />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ zIndex: 2 }}>
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-[#6b46ff]" />
          </div>
          <h1 className="text-4xl text-white mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-400">Find answers to common questions about Placebo Casino</p>
        </div>

        {/* FAQ Accordion */}
        <Card className="bg-card border-[#6b46ff]/30 p-6">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border-[#6b46ff]/20">
              <AccordionTrigger className="text-white hover:text-[#6b46ff]">
                What is Placebo Casino?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Placebo Casino is a safe, points-based casino platform where you can play card games 
                like Blackjack, Poker, and Baccarat without using real money. It's designed for 
                entertainment and learning purposes, allowing you to enjoy casino games risk-free.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-[#6b46ff]/20">
              <AccordionTrigger className="text-white hover:text-[#6b46ff]">
                Do I need to pay real money to play?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                No! Placebo Casino is completely free. You never need to deposit or spend real money. 
                All games use virtual points that have no monetary value. New users automatically 
                receive 1,000 free points to start playing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-[#6b46ff]/20">
              <AccordionTrigger className="text-white hover:text-[#6b46ff]">
                Can I convert my points to real money?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                No, points cannot be converted to real money or withdrawn. They are purely for 
                entertainment within the platform. You can use points to play games and redeem 
                them for in-platform rewards and bonuses.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-[#6b46ff]/20">
              <AccordionTrigger className="text-white hover:text-[#6b46ff]">
                What happens if I run out of points?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                If you run out of points, you can simply create a new account or contact support 
                for a points refresh. Since there's no real money involved, we want you to keep 
                playing and having fun! We may also add daily bonus points in future updates.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-[#6b46ff]/20">
              <AccordionTrigger className="text-white hover:text-[#6b46ff]">
                What games are available?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Currently, we offer classic card games including Blackjack, Texas Hold'em Poker, 
                and Baccarat. Each game has its own rules and strategies. We're constantly working 
                on adding more card games to the platform!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border-[#6b46ff]/20">
              <AccordionTrigger className="text-white hover:text-[#6b46ff]">
                How do I earn more points?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                You can earn points by winning games. Each game has different payout rates. 
                You can also redeem rewards that give you bonus points. We're planning to add 
                daily bonuses, achievements, and tournaments in future updates where you can 
                earn even more points!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border-[#6b46ff]/20">
              <AccordionTrigger className="text-white hover:text-[#6b46ff]">
                Are the games fair?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Yes! All our games use random number generation to ensure fair outcomes. The odds 
                are similar to real casino games, and all game rules are transparent. Since there's 
                no real money involved, we have no incentive to manipulate results.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border-[#6b46ff]/20">
              <AccordionTrigger className="text-white hover:text-[#6b46ff]">
                Can I play on mobile devices?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Yes! Placebo Casino is fully responsive and works on desktop computers, tablets, 
                and mobile phones. Simply access the website from any device with a web browser.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9" className="border-[#6b46ff]/20">
              <AccordionTrigger className="text-white hover:text-[#6b46ff]">
                Is my data safe?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Your data is stored locally in your browser and is only used to track your points 
                and game history. We don't collect personal information beyond your username, and 
                there are no financial transactions to worry about.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10" className="border-[#6b46ff]/20">
              <AccordionTrigger className="text-white hover:text-[#6b46ff]">
                What are the rewards?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Rewards are special bonuses you can redeem using your points. These include bonus 
                points boosts, free games, and special perks like doubling your next win. Check 
                the Rewards section to see all available options and their costs.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-11" className="border-[#6b46ff]/20">
              <AccordionTrigger className="text-white hover:text-[#6b46ff]">
                Can I play with friends?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Currently, all games are single-player against the house/dealer. We're considering 
                adding multiplayer features in the future where you can compete with friends and 
                other players. Stay tuned for updates!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-12" className="border-[#6b46ff]/20">
              <AccordionTrigger className="text-white hover:text-[#6b46ff]">
                Is this related to real gambling?
              </AccordionTrigger>
              <AccordionContent className="text-gray-400">
                No. Placebo Casino is purely for entertainment and educational purposes. It uses 
                no real money and is designed to be a safe way to enjoy casino games. If you choose 
                to gamble with real money elsewhere, please do so responsibly. See our Responsible 
                Gambling section for more information.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* Still Have Questions Card */}
        <Card className="bg-gradient-to-br from-[#6b46ff] to-[#ff2b9e] border-none p-8 mt-8">
          <div className="text-center text-white">
            <h3 className="mb-2">Still Have Questions?</h3>
            <p className="text-white/90 mb-4">
              If you couldn't find the answer you were looking for, feel free to reach out!
            </p>
            <p className="text-white/80 text-sm">
              Contact us at: support@placebocasino.example.com
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}