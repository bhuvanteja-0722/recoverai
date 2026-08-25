import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}

export function GlassPanel({ children, className = '', accent = false }: Props) {
  return (
    <div
      className={`
        rounded-lg p-6
        bg-white/[0.03] backdrop-blur-xl
        border border-white/[0.06]
        ${accent ? 'border-t-[#00D4FF]/40 shadow-[0_0_25px_rgba(0,212,255,0.05)]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
