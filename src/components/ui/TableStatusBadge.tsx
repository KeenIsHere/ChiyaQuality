import type { TableStatus } from '@/types';
import { tableStatusConfig } from '@/lib/status';

interface Props {
  status: TableStatus;
  size?: 'sm' | 'md';
}

export function TableStatusBadge({ status, size = 'sm' }: Props) {
  const cfg = tableStatusConfig[status];
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full border font-medium
      ${cfg.bgColor} ${cfg.borderColor} ${cfg.color}
      ${sizeClass}
    `}>
      <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
      {cfg.label}
    </span>
  );
}
