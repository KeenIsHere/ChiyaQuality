export type Role = 'waiter' | 'kitchen' | 'billing' | 'admin' | 'customer';

export type TableStatus =
  | 'available'
  | 'occupied'
  | 'order_placed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'bill_requested';

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'served' | 'cancelled';

export type CustomerCartStatus = 'pending' | 'confirmed' | 'rejected';

export type PaymentMethod = 'cash' | 'qr' | 'card';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  qrToken?: string;
  currentSessionId?: string;
  status: TableStatus;
  serverName?: string;
  guests?: number;
  orderId?: string;
}

export interface KitchenOrder {
  id: string;
  tableNumber: number;
  items: { name: string; quantity: number; notes: string }[];
  status: OrderStatus;
  receivedAt: string;
  elapsedMin: number;
}

export interface CustomerCart {
  id: string;
  tableNumber: number;
  items: { id?: string; menuItemId?: string; name: string; quantity: number; price: number }[];
  total: number;
  status: CustomerCartStatus;
  submittedAt: string;
  rejectReason?: string;
}

export interface Notification {
  id: string;
  type: 'ready' | 'cart_submitted' | 'bill_requested' | 'item_soldout';
  title: string;
  message: string;
  tableNumber?: number;
  time: string;
  read: boolean;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  tableNumber: number;
  date: string;
  total: number;
  status: 'paid' | 'void';
  paymentMethod?: PaymentMethod;
}

export interface StaffAccount {
  id: string;
  name: string;
  username: string;
  role: Role;
  pin: string;
  active: boolean;
}
