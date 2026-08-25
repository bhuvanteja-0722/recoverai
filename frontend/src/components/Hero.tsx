import RecoveryScene from './RecoveryScene';

interface Props {
  onEnter: () => void;
}

export default function Hero({ onEnter }: Props) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
      {/* 3D WebGL Background Scene */}
      <RecoveryScene />

      {/* Atmospheric Glow */}
      <div className="absolute inset-0 atmosphere pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
          <span className="text-eyebrow">TRANSACTION INTELLIGENCE SYSTEM</span>
        </div>

        {/* Massive Editorial Headline */}
        <h1 className="text-display text-white mb-6 font-extralight tracking-tight">
          Money moves.
          <br />
          Loss hides.
          <br />
          <span className="text-[#00D4FF] font-normal">RecoverAI sees it.</span>
        </h1>

        {/* Short intelligent explanation */}
        <p className="text-body max-w-xl mx-auto mb-10 text-white/60">
          An AI observation layer watching payment infrastructure in real time.
          Detecting revenue leakage, executing bounded intervention, and asserting verifiable outcomes.
        </p>

        {/* Primary and Secondary Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onEnter}
            className="text-xs font-mono tracking-wider px-8 py-3.5 rounded bg-[#00D4FF] text-black font-semibold hover:bg-[#00D4FF]/90 transition-all shadow-[0_0_20px_rgba(0,212,255,0.25)]"
          >
            ENTER INTELLIGENCE CONSOLE
          </button>
          <a
            href="#detect"
            className="text-xs font-mono tracking-wider px-6 py-3.5 rounded border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-all"
          >
            EXPLORE ARCHITECTURE ↓
          </a>
        </div>

        {/* Metadata Footer */}
        <div className="mt-20 pt-8 border-t border-white/[0.06] grid grid-cols-3 gap-6 text-left max-w-2xl mx-auto">
          <div>
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">MONITORING</div>
            <div className="text-xs font-mono text-white/80 mt-1">RAZORPAY TEST GATEWAY</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">RECOVERY MODEL</div>
            <div className="text-xs font-mono text-[#00D4FF] mt-1">NVIDIA NIM / LLAMA 3.1</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">VERIFICATION</div>
            <div className="text-xs font-mono text-white/80 mt-1">SHA-256 AUDITED</div>
          </div>
        </div>
      </div>
    </section>
  );
}
