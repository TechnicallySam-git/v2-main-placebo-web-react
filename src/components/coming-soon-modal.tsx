import { X } from 'lucide-react';
import { Button } from './ui/button';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameName?: string;
}

export function ComingSoonModal({ isOpen, onClose, gameName }: ComingSoonModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative bg-[#1a0f2e] border-2 border-[#6b46ff] rounded-2xl max-w-md w-full p-8 shadow-[0_0_50px_rgba(107,70,255,0.3)] animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Neon glow effect */}
            <div className="mb-6 relative">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] opacity-20 blur-2xl absolute top-0 left-1/2 transform -translate-x-1/2" />
              <div className="relative text-6xl">🎴</div>
            </div>

            <h2 className="text-3xl text-white mb-4 bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] bg-clip-text text-transparent">
              Coming Soon
            </h2>

            <p className="text-gray-300 mb-8 text-lg">
              {gameName || 'This game'} is still in development. Thanks for your patience!
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] hover:from-[#5a38e6] hover:to-[#e6278f] text-white py-6 rounded-lg text-lg shadow-[0_0_20px_rgba(107,70,255,0.5)]"
              >
                Back to Games
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full border-[#6b46ff]/50 hover:border-[#6b46ff] hover:bg-[#6b46ff]/10 text-white py-6 rounded-lg text-lg"
              >
                Notify Me
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
