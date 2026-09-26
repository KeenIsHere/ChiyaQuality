import { Minus, Plus } from 'lucide-react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  size?: 'sm' | 'md';
}

export function QuantityStepper({ value, onChange, min = 0, size = 'md' }: Props) {
  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`touch-target ${btnSize} flex items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <Minus className={iconSize} />
      </button>
      <span className={`font-medium text-neutral-800 min-w-[1.5rem] text-center ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className={`touch-target ${btnSize} flex items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 transition-colors`}
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
}
