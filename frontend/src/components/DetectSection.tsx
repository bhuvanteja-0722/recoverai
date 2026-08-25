import TransactionNetwork from './TransactionNetwork';

export default function DetectSection() {
  return (
    <section id="detect" className="py-28 px-6 max-w-6xl mx-auto border-t border-white/[0.06]">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="text-eyebrow mb-3">ANOMALY DETECTION NETWORK</div>
        <h2 className="text-headline text-white mb-4">REVENUE IS LEAKING.</h2>
        <p className="text-body max-w-xl mx-auto">
          Payment failures follow subtle behavioral patterns. RecoverAI transforms isolated transaction drops
          into a living graph, identifying transient anomalies before revenue is permanently abandoned.
        </p>
      </div>

      {/* Network Canvas */}
      <TransactionNetwork />

      {/* Narrative grid breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="glass p-6 rounded-lg">
          <div className="text-[10px] font-mono text-[#00D4FF] uppercase tracking-widest mb-2">01 / OBSERVATION</div>
          <h3 className="text-lg text-white font-light mb-2">Continuous Stream</h3>
          <p className="text-xs text-white/50 leading-relaxed font-light">
            Every transaction event is parsed into high-dimensional telemetry without adding checkout latency.
          </p>
        </div>

        <div className="glass p-6 rounded-lg border-t-[#F59E0B]/40">
          <div className="text-[10px] font-mono text-[#F59E0B] uppercase tracking-widest mb-2">02 / DIAGNOSIS</div>
          <h3 className="text-lg text-white font-light mb-2">NVIDIA NIM Inference</h3>
          <p className="text-xs text-white/50 leading-relaxed font-light">
            Llama 3.1 microservices evaluate failure categories (technical, issuer, balance) with bounded confidence.
          </p>
        </div>

        <div className="glass p-6 rounded-lg border-t-[#10B981]/40">
          <div className="text-[10px] font-mono text-[#10B981] uppercase tracking-widest mb-2">03 / RECOVERY</div>
          <h3 className="text-lg text-white font-light mb-2">Verifiable Action</h3>
          <p className="text-xs text-white/50 leading-relaxed font-light">
            Automated payment link dispatch or gateway retry execution, verified against Razorpay test environment.
          </p>
        </div>
      </div>
    </section>
  );
}
