type Status = 'healthy' | 'active' | 'warning' | 'error' | 'unhealthy' | 'degraded';

const STATUS_CONFIG: Record<Status, { color: string; label: string }> = {
  healthy: { color: '#10B981', label: 'Healthy' },
  active: { color: '#10B981', label: 'Active' },
  warning: { color: '#F59E0B', label: 'Warning' },
  error: { color: '#EF4444', label: 'Error' },
  unhealthy: { color: '#EF4444', label: 'Unhealthy' },
  degraded: { color: '#F59E0B', label: 'Degraded' },
};

export function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = (status.toLowerCase() as Status) in STATUS_CONFIG
    ? (status.toLowerCase() as Status)
    : 'active';
  const config = STATUS_CONFIG[normalizedStatus];

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono tracking-wider bg-white/[0.04] border border-white/[0.08]">
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ backgroundColor: config.color }}
      />
      <span style={{ color: config.color }}>{config.label}</span>
    </span>
  );
}
