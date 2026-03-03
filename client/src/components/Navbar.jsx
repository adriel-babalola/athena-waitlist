export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-transparent bg-athena-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <img src="/logo.svg" alt="Athena" className="h-7 w-auto" />
          <span className="font-mono text-sm tracking-widest uppercase font-bold group-hover:text-athena-gold transition-colors">
            ATHENA
          </span>
        </a>

        {/* Right side */}
        <nav className="flex items-center gap-6 font-mono text-xs tracking-wider text-athena-offwhite/60">
          <a
            href="#features"
            className="hidden sm:inline-block hover:text-athena-gold transition-colors"
          >
            FEATURES
          </a>
          <a
            href="#join"
            className="px-5 py-2 border border-athena-gold/40 text-athena-gold hover:bg-athena-gold hover:text-white transition-all duration-300 tracking-widest"
          >
            JOIN WAITLIST
          </a>
        </nav>
      </div>
    </header>
  );
}
