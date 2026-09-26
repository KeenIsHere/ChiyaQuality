import type {
  MenuItem,
  Table,
  KitchenOrder,
  CustomerCart,
  Notification,
  Invoice,
  StaffAccount,
} from '@/types';

export const menuCategories = [
  'Tea & Coffee',
  'Momo',
  'Noodles',
  'Rice & Curry',
  'Snacks',
  'Beverages',
  'Desserts',
];

export const menuItems: MenuItem[] = [
  { id: 'm1', name: 'Milk Tea', description: 'Traditional Nepali chiya with fresh milk', price: 45, category: 'Tea & Coffee', image: '', available: true },
  { id: 'm2', name: 'Black Tea', description: 'Strong black tea without milk', price: 35, category: 'Tea & Coffee', image: '', available: true },
  { id: 'm3', name: 'Lemon Ginger Honey Tea', description: 'Refreshing herbal infusion', price: 60, category: 'Tea & Coffee', image: '', available: true },
  { id: 'm4', name: 'Cappuccino', description: 'Espresso with steamed milk and foam', price: 90, category: 'Tea & Coffee', image: '', available: true },
  { id: 'm5', name: 'Latte', description: 'Smooth espresso with silky steamed milk', price: 95, category: 'Tea & Coffee', image: '', available: true },

  { id: 'm6', name: 'Steamed Momo', description: '10 pieces, buffalo filling, sesame sauce', price: 140, category: 'Momo', image: '', available: true },
  { id: 'm7', name: 'Fried Momo', description: '10 pieces, crispy fried, tangy tomato chutney', price: 160, category: 'Momo', image: '', available: true },
  { id: 'm8', name: 'Chilli Momo', description: '10 pieces, tossed in spicy chilli sauce', price: 180, category: 'Momo', image: '', available: true },
  { id: 'm9', name: 'Chicken Momo', description: '10 pieces, juicy chicken filling', price: 160, category: 'Momo', image: '', available: false },
  { id: 'm10', name: 'Jhol Momo', description: '8 pieces in savory sesame-tomato broth', price: 170, category: 'Momo', image: '', available: true },

  { id: 'm11', name: 'Chicken Chowmein', description: 'Stir-fried noodles with chicken and vegetables', price: 120, category: 'Noodles', image: '', available: true },
  { id: 'm12', name: 'Veg Chowmein', description: 'Stir-fried noodles with seasonal vegetables', price: 100, category: 'Noodles', image: '', available: true },
  { id: 'm13', name: 'Thukpa', description: 'Tibetan noodle soup with chicken and greens', price: 130, category: 'Noodles', image: '', available: true },
  { id: 'm14', name: 'Schezwan Noodles', description: 'Spicy schezwan sauce with veggies and egg', price: 140, category: 'Noodles', image: '', available: true },

  { id: 'm15', name: 'Chicken Fried Rice', description: 'Wok-fried rice with chicken and egg', price: 130, category: 'Rice & Curry', image: '', available: true },
  { id: 'm16', name: 'Veg Fried Rice', description: 'Wok-fried rice with mixed vegetables', price: 110, category: 'Rice & Curry', image: '', available: true },
  { id: 'm17', name: 'Dal Bhat Tarkari', description: 'Lentil soup, steamed rice, seasonal curry', price: 150, category: 'Rice & Curry', image: '', available: true },
  { id: 'm18', name: 'Chicken Curry Rice', description: 'Tender chicken curry served with rice', price: 180, category: 'Rice & Curry', image: '', available: true },

  { id: 'm19', name: 'Samosa (2 pcs)', description: 'Crispy pastry with spiced potato filling', price: 50, category: 'Snacks', image: '', available: true },
  { id: 'm20', name: 'Pakora', description: 'Assorted vegetable fritters, 6 pieces', price: 60, category: 'Snacks', image: '', available: true },
  { id: 'm21', name: 'French Fries', description: 'Crispy salted fries with ketchup', price: 90, category: 'Snacks', image: '', available: true },
  { id: 'm22', name: 'Spring Rolls (4 pcs)', description: 'Crispy rolls with vegetable filling', price: 100, category: 'Snacks', image: '', available: true },

  { id: 'm23', name: 'Fresh Lime Soda', description: 'Sweet or salted, with mint', price: 70, category: 'Beverages', image: '', available: true },
  { id: 'm24', name: 'Mango Lassi', description: 'Creamy yogurt drink with mango pulp', price: 80, category: 'Beverages', image: '', available: true },
  { id: 'm25', name: 'Cold Coffee', description: 'Blended iced coffee with ice cream', price: 100, category: 'Beverages', image: '', available: true },
  { id: 'm26', name: 'Mineral Water', description: '500ml bottled water', price: 25, category: 'Beverages', image: '', available: true },

  { id: 'm27', name: 'Rice Pudding', description: 'Creamy kheer with cardamom and nuts', price: 70, category: 'Desserts', image: '', available: true },
  { id: 'm28', name: 'Chocolate Brownie', description: 'Warm fudgy brownie with vanilla scoop', price: 120, category: 'Desserts', image: '', available: true },
  { id: 'm29', name: 'Gulab Jamun (2 pcs)', description: 'Soaked in rose-scented syrup', price: 60, category: 'Desserts', image: '', available: true },
];

export const tables: Table[] = [
  { id: 't1', number: 1, seats: 4, status: 'available' },
  { id: 't2', number: 2, seats: 2, status: 'occupied', guests: 2, serverName: 'Ramesh' },
  { id: 't3', number: 3, seats: 4, status: 'order_placed', guests: 3, serverName: 'Ramesh' },
  { id: 't4', number: 4, seats: 6, status: 'preparing', guests: 5, serverName: 'Sita' },
  { id: 't5', number: 5, seats: 4, status: 'ready', guests: 4, serverName: 'Sita' },
  { id: 't6', number: 6, seats: 2, status: 'served', guests: 2, serverName: 'Ramesh' },
  { id: 't7', number: 7, seats: 4, status: 'bill_requested', guests: 3, serverName: 'Sita' },
  { id: 't8', number: 8, seats: 8, status: 'available' },
  { id: 't9', number: 9, seats: 4, status: 'available' },
  { id: 't10', number: 10, seats: 4, status: 'occupied', guests: 4, serverName: 'Ramesh' },
  { id: 't11', number: 11, seats: 2, status: 'available' },
  { id: 't12', number: 12, seats: 6, status: 'preparing', guests: 6, serverName: 'Sita' },
];

export const kitchenOrders: KitchenOrder[] = [
  {
    id: 'ko1',
    tableNumber: 3,
    items: [
      { name: 'Milk Tea', quantity: 3, notes: 'Extra sugar' },
      { name: 'Steamed Momo', quantity: 1, notes: '' },
      { name: 'Veg Chowmein', quantity: 1, notes: 'No MSG' },
    ],
    status: 'received',
    receivedAt: '12:42 PM',
    elapsedMin: 3,
  },
  {
    id: 'ko2',
    tableNumber: 4,
    items: [
      { name: 'Chicken Chowmein', quantity: 2, notes: '' },
      { name: 'Chilli Momo', quantity: 1, notes: 'Extra spicy' },
      { name: 'Fresh Lime Soda', quantity: 3, notes: '2 sweet, 1 salted' },
    ],
    status: 'preparing',
    receivedAt: '12:30 PM',
    elapsedMin: 15,
  },
  {
    id: 'ko3',
    tableNumber: 12,
    items: [
      { name: 'Dal Bhat Tarkari', quantity: 4, notes: '' },
      { name: 'Chicken Curry Rice', quantity: 2, notes: '' },
      { name: 'Mango Lassi', quantity: 3, notes: '' },
    ],
    status: 'preparing',
    receivedAt: '12:25 PM',
    elapsedMin: 20,
  },
  {
    id: 'ko4',
    tableNumber: 5,
    items: [
      { name: 'Jhol Momo', quantity: 2, notes: '' },
      { name: 'Milk Tea', quantity: 4, notes: '' },
    ],
    status: 'ready',
    receivedAt: '12:20 PM',
    elapsedMin: 25,
  },
];

export const customerCarts: CustomerCart[] = [
  {
    id: 'cc1',
    tableNumber: 10,
    items: [
      { name: 'Milk Tea', quantity: 2, price: 45 },
      { name: 'Steamed Momo', quantity: 1, price: 140 },
      { name: 'Fresh Lime Soda', quantity: 1, price: 70 },
    ],
    total: 300,
    status: 'pending',
    submittedAt: '12:50 PM',
  },
  {
    id: 'cc2',
    tableNumber: 2,
    items: [
      { name: 'Cappuccino', quantity: 2, price: 90 },
      { name: 'Chocolate Brownie', quantity: 1, price: 120 },
    ],
    total: 300,
    status: 'pending',
    submittedAt: '12:55 PM',
  },
];

export const notifications: Notification[] = [
  { id: 'n1', type: 'ready', title: 'Order Ready to Serve', message: 'Table 5 order is ready', tableNumber: 5, time: '12:48 PM', read: false },
  { id: 'n2', type: 'cart_submitted', title: 'New Customer Order', message: 'Table 10 submitted a cart for review', tableNumber: 10, time: '12:50 PM', read: false },
  { id: 'n3', type: 'cart_submitted', title: 'New Customer Order', message: 'Table 2 submitted a cart for review', tableNumber: 2, time: '12:55 PM', read: false },
  { id: 'n4', type: 'bill_requested', title: 'Bill Requested', message: 'Table 7 requested the bill', tableNumber: 7, time: '12:40 PM', read: true },
  { id: 'n5', type: 'item_soldout', title: 'Item Marked Sold Out', message: 'Chicken Momo marked as sold out', time: '12:35 PM', read: true },
];

export const invoices: Invoice[] = [
  { id: 'inv1', invoiceNo: 'INV-2026-0451', tableNumber: 3, date: '2026-09-26 12:15 PM', total: 645, status: 'paid', paymentMethod: 'qr' },
  { id: 'inv2', invoiceNo: 'INV-2026-0450', tableNumber: 6, date: '2026-09-26 11:30 AM', total: 420, status: 'paid', paymentMethod: 'cash' },
  { id: 'inv3', invoiceNo: 'INV-2026-0449', tableNumber: 8, date: '2026-09-26 11:00 AM', total: 1200, status: 'paid', paymentMethod: 'card' },
  { id: 'inv4', invoiceNo: 'INV-2026-0448', tableNumber: 1, date: '2026-09-26 10:15 AM', total: 180, status: 'paid', paymentMethod: 'cash' },
  { id: 'inv5', invoiceNo: 'INV-2026-0447', tableNumber: 9, date: '2026-09-26 09:50 AM', total: 540, status: 'paid', paymentMethod: 'qr' },
  { id: 'inv6', invoiceNo: 'INV-2026-0446', tableNumber: 5, date: '2026-09-25 09:20 PM', total: 870, status: 'paid', paymentMethod: 'card' },
  { id: 'inv7', invoiceNo: 'INV-2026-0445', tableNumber: 2, date: '2026-09-25 08:30 PM', total: 310, status: 'paid', paymentMethod: 'qr' },
  { id: 'inv8', invoiceNo: 'INV-2026-0444', tableNumber: 11, date: '2026-09-25 07:15 PM', total: 960, status: 'void' },
];

export const staffAccounts: StaffAccount[] = [
  { id: 's1', name: 'Ramesh Thapa', username: 'ramesh', role: 'waiter', pin: '1234', active: true },
  { id: 's2', name: 'Sita Gurung', username: 'sita', role: 'waiter', pin: '5678', active: true },
  { id: 's3', name: 'Bikash Lama', username: 'bikash', role: 'kitchen', pin: '2345', active: true },
  { id: 's4', name: 'Pooja Shrestha', username: 'pooja', role: 'billing', pin: '3456', active: true },
  { id: 's5', name: 'Dipak KC', username: 'dipak', role: 'admin', pin: '9999', active: true },
  { id: 's6', name: 'Anita Rai', username: 'anita', role: 'waiter', pin: '4567', active: false },
];
