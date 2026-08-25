import { GlassPanel } from './GlassPanel';

interface Props {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  accent?: boolean;
}

export function MetricCard({ label, value, subtext, trend, accent }: Props) {
  return (
    <GlassPanel accent={accent}>
      <div className="text-[10px] font-mono tracking-widest text-white/40 uppercase mb-2">
        {label}
      </div>
      <div className="text-3xl font-light tracking-tight text-white mb-1 font-mono">
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-white/40 font-light flex items-center justify-between">
          <span>{subtext}</span>
          {trend && <span className="text-[#00D4FF] font-mono">{trend}</span>}
        </div>
      )}
    </GlassPanel>
  );
}
