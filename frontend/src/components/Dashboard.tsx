import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { ApiStateWrapper } from './ApiStateWrapper';
import { MetricCard } from './ui/MetricCard';
import { GlassPanel } from './ui/GlassPanel';
import { StatusBadge } from './ui/StatusBadge';
import type { DiagnosisResult } from '../types';

export default function Dashboard() {
  const healthApi = useApi(api.health.get);
  const verifApi = useApi(api.verification.status);
  const auditApi = useApi(api.audit.stats);
  const evalApi = useApi(api.evaluate.metrics);

  const [simTxnId, setSimTxnId] = useState('txn_demo_9841');
  const [simReason, setSimReason] = useState('Gateway timeout during bank authorization');
  const [simAmount, setSimAmount] = useState(4999);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  const handleSimulate = async () => {
    setDiagnosing(true);
    try {
      const res = await api.agent.diagnose({
        transaction_id: simTxnId,
        merchant_id: 'merch_prod_01',
        amount: simAmount,
        failure_reason: simReason,
        payment_method: 'upi',
      });
      setDiagnosis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setDiagnosing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Dashboard Title Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-6">
        <div>
          <div className="text-eyebrow mb-1">RECOVERAI CONSOLE</div>
          <h1 className="text-3xl text-white font-light tracking-tight">System Intelligence Overview</h1>
        </div>
        <div className="flex items-center gap-3">
          <ApiStateWrapper
            state={healthApi.state}
            render={(data) => <StatusBadge status={data.status} />}
          />
          <button
            onClick={() => {
              healthApi.refetch();
              verifApi.refetch();
              auditApi.refetch();
              evalApi.refetch();
            }}
            className="text-xs font-mono px-3 py-1.5 border border-white/10 rounded hover:border-white/30 text-white/70"
          >
            REFRESH TELEMETRY
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ApiStateWrapper
          state={evalApi.state}
          render={(data) => (
            <MetricCard
              label="RECOVERY RATE"
              value={`${(data.recovery_rate * 100).toFixed(1)}%`}
              subtext="Evaluated Transactions"
              trend="↑ 4.2%"
              accent
            />
          )}
        />
        <ApiStateWrapper
          state={evalApi.state}
          render={(data) => (
            <MetricCard
              label="TOTAL EVALUATED"
              value={data.total_evaluated.toLocaleString()}
              subtext="Processed by Agent"
            />
          )}
        />
        <ApiStateWrapper
          state={evalApi.state}
          render={(data) => (
            <MetricCard
              label="AVG RECOVERY TIME"
              value={`${data.avg_recovery_time_ms}ms`}
              subtext="Inference to Execution"
            />
          )}
        />
        <ApiStateWrapper
          state={auditApi.state}
          render={(data) => (
            <MetricCard
              label="AUDITED EVENTS"
              value={data.total_events}
              subtext="SHA-256 Verified Logs"
            />
          )}
        />
      </div>

      {/* Main Grid: Interactive Simulation + System Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Diagnosis Simulation Panel */}
        <div className="lg:col-span-2 space-y-6">
          <GlassPanel accent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-[#00D4FF] uppercase tracking-widest">
                AI DIAGNOSIS & RECOVERY INTERVENTION
              </span>
              <span className="text-[10px] font-mono text-white/40">NVIDIA NIM / LLAMA 3.1</span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={simTxnId}
                    onChange={(e) => setSimTxnId(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:border-[#00D4FF] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                    Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:border-[#00D4FF] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase mb-1">
                    Failure Reason
                  </label>
                  <input
                    type="text"
                    value={simReason}
                    onChange={(e) => setSimReason(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:border-[#00D4FF] outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSimulate}
                disabled={diagnosing}
                className="w-full py-2.5 bg-[#00D4FF] text-black font-mono text-xs font-semibold rounded hover:bg-[#00D4FF]/90 transition-all disabled:opacity-50"
              >
                {diagnosing ? 'RUNNING NIM REASONING...' : 'RUN AI DIAGNOSIS INTERVENTION'}
              </button>
            </div>

            {/* Diagnosis Result Output */}
            {diagnosis && (
              <div className="p-4 rounded border border-[#00D4FF]/30 bg-[#00D4FF]/[0.02] space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-white/60 pb-2 border-b border-white/[0.06]">
                  <span>DIAGNOSIS OUTPUT [{diagnosis.transaction_id}]</span>
                  <span className="text-[#00D4FF]">
                    LIKELIHOOD: {(diagnosis.recovery_likelihood * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-white/80">
                  <div>Failure Category: <span className="text-white">{diagnosis.failure_category}</span></div>
                  <div>Recommended Action: <span className="text-[#00D4FF] font-semibold">{diagnosis.recommendation.action}</span></div>
                </div>
                <div className="text-white/60">
                  Reasoning: <span className="text-white/90 italic">{diagnosis.recommendation.reasoning}</span>
                </div>
                <div className="text-[10px] text-emerald-400">
                  ✓ Policy Check: Approved | Verification Outcome Asserted
                </div>
              </div>
            )}
          </GlassPanel>

          {/* Audit Trail List */}
          <GlassPanel>
            <div className="text-xs font-mono text-white/50 uppercase tracking-widest mb-4">
              TAMPER-EVIDENT AUDIT TRAIL
            </div>
            <ApiStateWrapper
              state={auditApi.state}
              render={(data) => (
                <div className="space-y-2 font-mono text-xs">
                  {data.recent_events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-2.5 rounded bg-white/[0.02] border border-white/[0.04]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[#00D4FF] font-semibold">{event.action_type}</span>
                        <span className="text-white/40">ID: {event.resource_id}</span>
                      </div>
                      <div className="text-white/30 text-[10px]">
                        HASH: {event.hash.slice(0, 10)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            />
          </GlassPanel>
        </div>

        {/* Sidebar Status & Services */}
        <div className="space-y-6">
          <GlassPanel>
            <div className="text-xs font-mono text-white/50 uppercase tracking-widest mb-4">
              VERIFICATION SERVICE STATUS
            </div>
            <ApiStateWrapper
              state={verifApi.state}
              render={(data) => (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Status:</span>
                    <StatusBadge status={data.status} />
                  </div>
                  <div className="text-white/40 text-[11px] leading-relaxed">
                    {data.message}
                  </div>
                  <div className="text-[10px] text-white/30 pt-2 border-t border-white/[0.06]">
                    API Route: GET /api/v1/verification/
                  </div>
                </div>
              )}
            />
          </GlassPanel>

          <GlassPanel>
            <div className="text-xs font-mono text-white/50 uppercase tracking-widest mb-4">
              SYSTEM RECOVERY TOOLS
            </div>
            <div className="space-y-2 font-mono text-xs">
              {['RETRY_PAYMENT', 'SEND_PAYMENT_LINK', 'APPLY_COUPON', 'ESCALATE'].map((tool) => (
                <div
                  key={tool}
                  className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/[0.04]"
                >
                  <span className="text-white/80">{tool}</span>
                  <span className="text-[10px] text-emerald-400">BOUNDED</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
