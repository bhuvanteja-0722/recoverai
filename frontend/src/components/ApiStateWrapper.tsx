import type { ReactNode } from 'react';
import type { ApiState } from '../types';

interface Props<T> {
  state: ApiState<T>;
  onRetry?: () => void;
  render: (data: T) => ReactNode;
  emptyMessage?: string;
  loadingRows?: number;
}

export function ApiStateWrapper<T>({
  state,
  onRetry,
  render,
  emptyMessage = 'No data available.',
  loadingRows = 3,
}: Props<T>) {
  if (state.state === 'loading') {
    return (
      <div className="space-y-3 py-4">
        {Array.from({ length: loadingRows }).map((_, i) => (
          <div
            key={i}
            className="h-10 bg-white/[0.03] border border-white/[0.05] rounded animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (state.state === 'error') {
    return (
      <div className="text-center py-8 px-4 border border-white/[0.06] rounded-lg bg-white/[0.01]">
        <p className="text-xs font-mono text-white/50 mb-3">{state.message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-mono px-3 py-1.5 border border-white/20 rounded hover:border-[#00D4FF] hover:text-[#00D4FF] transition-colors"
          >
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  if (state.state === 'empty') {
    return (
      <div className="text-center py-8 border border-dashed border-white/[0.06] rounded-lg">
        <p className="text-xs font-mono text-white/30">{emptyMessage}</p>
      </div>
    );
  }

  if (state.state === 'success') {
    return <>{render(state.data)}</>;
  }

  return null;
}
