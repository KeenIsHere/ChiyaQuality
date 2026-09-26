import type { TableStatus } from '@/types';

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
}

export const tableStatusConfig: Record<TableStatus, StatusConfig> = {
  available: {
    label: 'Available',
    color: 'text-status-available',
    bgColor: 'bg-status-available-bg',
    borderColor: 'border-status-available-border',
    dotColor: 'bg-status-available',
  },
  occupied: {
    label: 'Occupied',
    color: 'text-status-occupied',
    bgColor: 'bg-status-occupied-bg',
    borderColor: 'border-status-occupied-border',
    dotColor: 'bg-status-occupied',
  },
  order_placed: {
    label: 'Order Placed',
    color: 'text-status-occupied',
    bgColor: 'bg-status-occupied-bg',
    borderColor: 'border-status-occupied-border',
    dotColor: 'bg-status-occupied',
  },
  preparing: {
    label: 'Preparing',
    color: 'text-status-occupied',
    bgColor: 'bg-status-occupied-bg',
    borderColor: 'border-status-occupied-border',
    dotColor: 'bg-status-occupied',
  },
  ready: {
    label: 'Ready to Serve',
    color: 'text-status-ready',
    bgColor: 'bg-status-ready-bg',
    borderColor: 'border-status-ready-border',
    dotColor: 'bg-status-ready',
  },
  served: {
    label: 'Served',
    color: 'text-neutral-500',
    bgColor: 'bg-neutral-100',
    borderColor: 'border-neutral-300',
    dotColor: 'bg-neutral-400',
  },
  bill_requested: {
    label: 'Bill Requested',
    color: 'text-status-cancelled',
    bgColor: 'bg-status-cancelled-bg',
    borderColor: 'border-status-cancelled-border',
    dotColor: 'bg-status-cancelled',
  },
};

export const orderStatusConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  received: { label: 'Received', color: 'text-status-occupied', bgColor: 'bg-status-occupied-bg', borderColor: 'border-status-occupied-border' },
  preparing: { label: 'Preparing', color: 'text-status-occupied', bgColor: 'bg-status-occupied-bg', borderColor: 'border-status-occupied-border' },
  ready: { label: 'Ready', color: 'text-status-ready', bgColor: 'bg-status-ready-bg', borderColor: 'border-status-ready-border' },
  served: { label: 'Served', color: 'text-neutral-500', bgColor: 'bg-neutral-100', borderColor: 'border-neutral-300' },
  cancelled: { label: 'Cancelled', color: 'text-status-cancelled', bgColor: 'bg-status-cancelled-bg', borderColor: 'border-status-cancelled-border' },
};

export function formatCurrency(amount: number): string {
  return 'Rs. ' + amount.toLocaleString('en-IN');
}
