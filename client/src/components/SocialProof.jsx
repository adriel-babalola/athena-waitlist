import { motion } from 'motion/react';
import { Users } from 'lucide-react';

export default function SocialProof({ count }) {
  return (
    <section className="relative z-10 px-6 py-32">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          {/* Counter */}
          <div className="border border-athena-border bg-athena-gold/[0.03] p-12 mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-5 h-5 text-athena-gold" strokeWidth={1.5} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-athena-offwhite/40">
                Waitlist Members
              </span>
            </div>
            <div className="text-6xl sm:text-7xl font-light text-athena-gold tracking-tight mb-3 count-animate">
              {count > 0 ? count.toLocaleString() : '—'}
            </div>
            <p className="text-athena-offwhite/20 text-sm font-mono tracking-wide">
              students, researchers & lifelong learners
            </p>
          </div>

          {/* CTA */}
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight mb-6">
            Ready to <span className="text-athena-gold italic">understand?</span>
          </h2>
          <p className="text-athena-offwhite/30 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            Join the waitlist now. Early members get priority access and 3 months
            of Athena Pro free.
          </p>
          <a
            href="#join"
            className="inline-flex items-center gap-2 bg-athena-gold text-white font-mono text-sm uppercase tracking-widest px-8 py-4 hover:shadow-[0_0_30px_rgba(124,111,255,0.4)] transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10">Claim Your Spot</span>
            <span className="relative z-10">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
