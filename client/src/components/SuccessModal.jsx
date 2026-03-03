import { useEffect } from 'react';
import { motion } from 'motion/react';

export default function SuccessModal({ position, count, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-athena-black/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 max-w-md w-full border border-athena-border bg-athena-black p-8 text-center"
      >
        {/* Success icon */}
        <div className="w-16 h-16 mx-auto mb-6 border border-athena-teal/30 bg-athena-teal/5 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-athena-teal"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-light tracking-tight mb-2">
          You're <span className="text-athena-teal italic">in.</span>
        </h2>

        <p className="text-athena-offwhite/40 text-sm mb-8 leading-relaxed">
          Welcome to Athena. We'll notify you when it's your turn.
        </p>

        {/* Position card */}
        <div className="border border-athena-border bg-athena-gold/5 p-6 mb-8">
          <div className="font-mono text-[10px] tracking-widest text-athena-offwhite/40 uppercase mb-2">
            Your Position
          </div>
          <div className="text-5xl font-light text-athena-gold tracking-tight count-animate">
            #{position}
          </div>
          <div className="font-mono text-[10px] tracking-widest text-athena-offwhite/20 uppercase mt-2">
            of {count.toLocaleString()} on the waitlist
          </div>
        </div>

        {/* What to expect */}
        <div className="text-left space-y-3 mb-8">
          <div className="flex items-start gap-3">
            <span className="font-mono text-[10px] text-athena-gold mt-1">01</span>
            <p className="text-xs text-athena-offwhite/40 leading-relaxed">
              You'll get an email when early access opens for your spot.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-mono text-[10px] text-athena-gold mt-1">02</span>
            <p className="text-xs text-athena-offwhite/40 leading-relaxed">
              Earlier positions get priority — share with friends to move up.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-mono text-[10px] text-athena-gold mt-1">03</span>
            <p className="text-xs text-athena-offwhite/40 leading-relaxed">
              Founding members get Athena Pro free for the first 3 months.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 border border-athena-border bg-transparent text-athena-offwhite/60 font-mono text-xs uppercase tracking-widest hover:border-athena-gold/40 hover:text-athena-gold transition-all duration-300 cursor-pointer"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}
