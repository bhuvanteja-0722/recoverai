interface Props {
  currentView: 'landing' | 'dashboard';
  onViewChange: (view: 'landing' | 'dashboard') => void;
}

export default function Navigation({ currentView, onViewChange }: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#050508]/80 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onViewChange('landing')}
          className="cursor-pointer flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" />
          <span className="font-mono text-sm tracking-widest text-white uppercase font-medium">
            Recover<span className="text-[#00D4FF]">AI</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center gap-8">
          <button
            onClick={() => onViewChange('landing')}
            className={`text-xs font-mono tracking-wider transition-colors ${
              currentView === 'landing' ? 'text-[#00D4FF]' : 'text-white/50 hover:text-white'
            }`}
          >
            SYSTEM
          </button>
          <button
            onClick={() => onViewChange('dashboard')}
            className={`text-xs font-mono tracking-wider transition-colors ${
              currentView === 'dashboard' ? 'text-[#00D4FF]' : 'text-white/50 hover:text-white'
            }`}
          >
            INTELLIGENCE DASHBOARD
          </button>
        </nav>

        {/* CTA */}
        <button
          onClick={() => onViewChange('dashboard')}
          className="text-xs font-mono tracking-wider px-4 py-2 border border-white/10 rounded bg-white/[0.03] hover:border-[#00D4FF]/50 hover:text-[#00D4FF] transition-all"
        >
          {currentView === 'dashboard' ? 'CONSOLE ACTIVE' : 'ENTER CONSOLE →'}
        </button>
      </div>
    </header>
  );
}
