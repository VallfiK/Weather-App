import { HourlyItem } from './HourlyItem';
import type { HourlyPoint } from '../../domain/types';

export function HourlyList({ points }: { points: HourlyPoint[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" data-testid="hourly-list">
      {points.map((p, i) => <HourlyItem key={i} {...p} />)}
    </div>
  );
}
