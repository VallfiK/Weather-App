import type { ReactNode } from 'react';

export function Metric({ icon, label, value }: { icon: string; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-bg/50 p-3">
      <span className="text-xl" aria-hidden>{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs text-muted">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  );
}
