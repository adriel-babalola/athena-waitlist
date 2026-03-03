import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Loader2, Mail } from 'lucide-react';

export default function WaitlistHero({ waitlistCount, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return setError('Please enter a valid email address.');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      onSuccess({ position: data.position, count: data.count });
      setName('');
      setEmail('');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="join"
      className="min-h-screen flex flex-col items-center justify-center relative px-6 pt-24 pb-16"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-athena-gold/[0.04] via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center relative z-10 max-w-2xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 border border-athena-gold/20 bg-athena-gold/5 mb-8"
        >
          <span className="w-2 h-2 bg-athena-teal animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-athena-gold">
            Early Access — Limited Spots
          </span>
        </motion.div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light leading-tight tracking-tight mb-6">
          Stop searching.
          <br />
          <span className="text-athena-gold italic">Start understanding.</span>
        </h1>

        <p className="text-athena-offwhite/40 text-md max-w-lg mx-auto mb-6 leading-relaxed">
          Athena uses AI to find the perfect YouTube videos that explain anything
          you're struggling with — ranked by difficulty, powered by Gemini.
        </p>

        {/* Waitlist Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          onSubmit={handleSubmit}
          className="max-w-md mx-auto space-y-4"
          noValidate
        >
          {/* Honeypot — invisible to humans */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute opacity-0 pointer-events-none h-0 w-0"
          />

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="w-full px-5 py-3.5 bg-athena-black border border-athena-border text-athena-offwhite placeholder:text-athena-offwhite/20 font-mono text-sm tracking-wide transition-all duration-300"
              disabled={loading}
            />
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-athena-offwhite/20 pointer-events-none" />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={254}
                className="w-full pl-11 pr-5 py-3.5 bg-athena-black border border-athena-border text-athena-offwhite placeholder:text-athena-offwhite/20 font-mono text-sm tracking-wide transition-all duration-300"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-xs font-mono tracking-wide"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-athena-gold text-white font-mono text-sm uppercase tracking-widest px-8 py-4 hover:shadow-[0_0_30px_rgba(124,111,255,0.4)] transition-all duration-300 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                <span className="relative z-10">Joining...</span>
              </>
            ) : (
              <>
                <span className="relative z-10">Join the Waitlist</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {waitlistCount > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-athena-offwhite/30 text-xs font-mono tracking-wide mt-4"
            >
              <span className="text-athena-gold">{waitlistCount.toLocaleString()}</span>{' '}
              people already on the waitlist
            </motion.p>
          )}
        </motion.form>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <div className="w-px h-12 bg-gradient-to-b from-athena-gold/40 to-transparent animate-pulse" />
      </motion.div>
    </section>
  );
}
