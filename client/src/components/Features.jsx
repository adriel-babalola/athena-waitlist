import { motion } from 'motion/react';
import { Brain, Search, BarChart3, Zap, ShieldCheck, Image } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    desc: 'Gemini AI breaks down your text or image into core concepts and finds what matters.',
  },
  {
    icon: Search,
    title: 'Smart Video Curation',
    desc: 'Surfaces the best YouTube tutorials from millions of videos — no more endless scrolling.',
  },
  {
    icon: BarChart3,
    title: 'Difficulty Ranking',
    desc: 'Videos ranked by complexity so you start at your level and build up.',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    desc: 'Paste any text and get curated videos in seconds. No account required.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Quality',
    desc: 'AI filters out clickbait and low-quality content. Only real explanations.',
  },
  {
    icon: Image,
    title: 'Image Support',
    desc: 'Screenshot a slide, diagram, or formula — Athena understands images too.',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative z-10 px-6 py-25">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-athena-border bg-athena-gold/5 mb-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-athena-gold">
              What You're Waiting For
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-4xl font-light tracking-tight">
            Everything you need to{' '}
            <span className="text-athena-gold italic">actually learn.</span>
          </h2>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group border border-athena-border p-8 hover:border-athena-gold/20 transition-all duration-300 bg-athena-black/40"
            >
              <div className="w-10 h-10 border border-athena-gold/20 bg-athena-gold/5 flex items-center justify-center mb-5 group-hover:border-athena-gold/40 transition-colors">
                <f.icon className="w-5 h-5 text-athena-gold" strokeWidth={1.5} />
              </div>

              <h3 className="font-mono text-xs uppercase tracking-widest text-athena-offwhite/80 mb-3">
                {f.title}
              </h3>

              <p className="text-sm text-athena-offwhite/30 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
