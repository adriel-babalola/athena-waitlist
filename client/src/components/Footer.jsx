export default function Footer() {
  return (
    <footer className="border-t border-athena-border relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.svg" alt="Athena" className="h-6 w-auto opacity-60" />
              <span className="font-mono text-sm tracking-widest uppercase font-bold text-athena-offwhite/60">
                ATHENA
              </span>
            </div>
            <p className="text-sm text-athena-offwhite/30 max-w-xs leading-relaxed">
              AI-powered study companion that finds the perfect YouTube videos to
              explain anything you're struggling with.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-mono text-[10px] tracking-widest uppercase text-athena-offwhite/50 mb-4">
              Navigate
            </h4>
            <ul className="space-y-3 font-mono text-xs text-athena-offwhite/30">
              <li>
                <a href="#join" className="hover:text-athena-gold transition-colors">
                  Join Waitlist
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-athena-gold transition-colors">
                  Features
                </a>
              </li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-mono text-[10px] tracking-widest uppercase text-athena-offwhite/50 mb-4">
              Product
            </h4>
            <ul className="space-y-3 font-mono text-xs text-athena-offwhite/30">
              <li>
                <span className="text-athena-offwhite/15">Launch App (Coming Soon)</span>
              </li>
              <li>
                <span className="text-athena-offwhite/15">API (Coming Soon)</span>
              </li>
              <li>
                <span className="text-athena-offwhite/15">Changelog</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-athena-border mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-athena-offwhite/15 font-mono tracking-wider">
            © 2026 Athena · RIEL Inc
          </p>
          <p className="text-[10px] text-athena-offwhite/15 font-mono tracking-wider">
            Powered by Gemini AI
          </p>
        </div>
      </div>
    </footer>
  );
}
