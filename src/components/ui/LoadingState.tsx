import { Loader2 } from 'lucide-react';

interface Props {
  label?: string;
}

export function LoadingState({ label = 'Loading...' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  );
}
