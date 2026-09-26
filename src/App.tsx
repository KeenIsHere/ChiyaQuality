import { useState } from 'react';
import {
  Grid3x3, ClipboardList, Bell, QrCode, ShoppingCart,
  ChefHat, Package, Receipt, FileText,
  LayoutDashboard, Utensils, Table2, Users, DollarSign, TrendingUp, Settings,
} from 'lucide-react';
import type { Role, Table, OrderItem } from '@/types';
import { notifications as notifData } from '@/data';
import { AppShell, type NavItem } from '@/components/ui/AppShell';

import { LoginScreen } from '@/screens/LoginScreen';

import { TableMap } from '@/screens/waiter/TableMap';
import { OrderScreen } from '@/screens/waiter/OrderScreen';
import { OrderReview } from '@/screens/waiter/OrderReview';
import { PendingCustomerOrders } from '@/screens/waiter/PendingCustomerOrders';
import { NotificationsPanel } from '@/screens/waiter/NotificationsPanel';
import { PaymentQRScreen } from '@/screens/waiter/PaymentQRScreen';

import { KOTQueue } from '@/screens/kitchen/KOTQueue';
import { ItemAvailability } from '@/screens/kitchen/ItemAvailability';

import { BillingDashboard } from '@/screens/billing/BillingDashboard';
import { BillDetail } from '@/screens/billing/BillDetail';
import { PaymentRecording } from '@/screens/billing/PaymentRecording';
import { BillingHistory } from '@/screens/billing/BillingHistory';

import { AdminDashboard } from '@/screens/admin/AdminDashboard';
import { MenuManagement } from '@/screens/admin/MenuManagement';
import { AddEditMenuItem } from '@/screens/admin/AddEditMenuItem';
import { TableManagement } from '@/screens/admin/TableManagement';
import { StaffManagement } from '@/screens/admin/StaffManagement';
import { PaymentQRUpload } from '@/screens/admin/PaymentQRUpload';
import { Reports } from '@/screens/admin/Reports';
import { TaxSettings } from '@/screens/admin/TaxSettings';

import { CustomerMenuBrowse } from '@/screens/customer/CustomerMenuBrowse';
import { CustomerCartReview } from '@/screens/customer/CustomerCartReview';
import { CustomerOrderStatus } from '@/screens/customer/CustomerOrderStatus';
import { CustomerRejected } from '@/screens/customer/CustomerRejected';
import type { MenuItem } from '@/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface Session {
  role: Role;
  name: string;
}

const roleNames: Record<Role, string> = {
  waiter: 'Waiter Station',
  kitchen: 'Kitchen Display',
  billing: 'Billing Counter',
  admin: 'Admin Panel',
  customer: 'Customer Menu',
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeScreen, setActiveScreen] = useState<string>(() => (
    window.location.pathname.startsWith('/menu/') ? 'customer-menu' : ''
  ));
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [editItemId, setEditItemId] = useState<string | undefined>(undefined);
  const [customerCart, setCustomerCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [customerRejected, setCustomerRejected] = useState<string | undefined>(undefined);
  const [customerOrderId, setCustomerOrderId] = useState<string | undefined>(undefined);

  const handleLogin = (role: Role, name: string) => {
    setSession({ role, name });
    if (role === 'waiter') setActiveScreen('table-map');
    else if (role === 'kitchen') setActiveScreen('kot-queue');
    else if (role === 'billing') setActiveScreen('billing-dashboard');
    else if (role === 'admin') setActiveScreen('admin-dashboard');
    else if (role === 'customer') setActiveScreen('customer-menu');
  };

  const handleLogout = () => {
    setSession(null);
    setActiveScreen('');
    setSelectedTable(null);
    setOrderItems([]);
    setCustomerCart([]);
    setCustomerOrderId(undefined);
  };

  // Customer QR URLs are public and do not use AppShell or staff authentication.
  if (session?.role === 'customer' || window.location.pathname.startsWith('/menu/')) {
    return (
      <CustomerFlow
        screen={activeScreen}
        cart={customerCart}
        setCart={setCustomerCart}
        rejectedReason={customerRejected}
        onNavigate={setActiveScreen}
        onExit={handleLogout}
        setRejectedReason={setCustomerRejected}
        orderId={customerOrderId}
        onSubmitOrder={async cart => {
          if (!isSupabaseConfigured) {
            setCustomerOrderId('demo-order');
            setActiveScreen('customer-status');
            return;
          }
          const qrToken = window.location.pathname.startsWith('/menu/')
            ? window.location.pathname.split('/menu/')[1]
            : new URLSearchParams(window.location.search).get('table_token');
          if (!qrToken) throw new Error('Open this menu from a table QR code to submit an order.');
          const { data, error } = await supabase.rpc('submit_customer_order', {
            p_qr_token: qrToken,
            p_items: cart.map(entry => ({ menu_item_id: entry.item.id, quantity: entry.qty, notes: entry.notes || null })),
          });
          if (error) throw error;
          setCustomerOrderId(data);
          setActiveScreen('customer-status');
        }}
      />
    );
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const role = session.role;
  const navItems: NavItem[] = [];
  let content: React.ReactNode = null;

  if (role === 'waiter') {
    navItems.push(
      { key: 'table-map', label: 'Tables', icon: <Grid3x3 className="w-4 h-4" /> },
      { key: 'pending-orders', label: 'Customer Orders', icon: <ShoppingCart className="w-4 h-4" /> },
      { key: 'notifications', label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
    );

    switch (activeScreen) {
      case 'table-map':
        content = <TableMap onSelectTable={(t) => { setSelectedTable(t); setActiveScreen('order'); }} />;
        break;
      case 'order':
        content = selectedTable ? (
          <OrderScreen
            table={selectedTable}
            onProceedToReview={(items) => { setOrderItems(items); setActiveScreen('review'); }}
          />
        ) : null;
        break;
      case 'review':
        content = selectedTable ? (
          <OrderReview
            table={selectedTable}
            items={orderItems}
            onConfirm={() => setActiveScreen('table-map')}
            onBack={() => setActiveScreen('order')}
          />
        ) : null;
        break;
      case 'pending-orders':
        content = <PendingCustomerOrders />;
        break;
      case 'notifications':
        content = <NotificationsPanel onGoToTable={() => setActiveScreen('table-map')} />;
        break;
      case 'payment-qr':
        content = selectedTable ? (
          <PaymentQRScreen table={selectedTable} onBack={() => setActiveScreen('table-map')} />
        ) : null;
        break;
      default:
        content = <TableMap onSelectTable={(t) => { setSelectedTable(t); setActiveScreen('order'); }} />;
    }
  } else if (role === 'kitchen') {
    navItems.push(
      { key: 'kot-queue', label: 'Order Queue', icon: <ChefHat className="w-4 h-4" /> },
      { key: 'item-availability', label: 'Availability', icon: <Package className="w-4 h-4" /> },
    );

    switch (activeScreen) {
      case 'kot-queue': content = <KOTQueue />; break;
      case 'item-availability': content = <ItemAvailability />; break;
      default: content = <KOTQueue />;
    }
  } else if (role === 'billing') {
    navItems.push(
      { key: 'billing-dashboard', label: 'Active Tables', icon: <Receipt className="w-4 h-4" /> },
      { key: 'billing-history', label: 'History', icon: <FileText className="w-4 h-4" /> },
    );

    switch (activeScreen) {
      case 'billing-dashboard':
        content = <BillingDashboard onSelectTable={(t) => { setSelectedTable(t); setActiveScreen('bill-detail'); }} />;
        break;
      case 'bill-detail':
        content = selectedTable ? (
          <BillDetail
            table={selectedTable}
            onRecordPayment={() => setActiveScreen('payment-recording')}
            onBack={() => setActiveScreen('billing-dashboard')}
          />
        ) : null;
        break;
      case 'payment-recording':
        content = (
          <PaymentRecording
            total={784}
            onBack={() => setActiveScreen('bill-detail')}
            onComplete={() => setActiveScreen('billing-dashboard')}
          />
        );
        break;
      case 'billing-history': content = <BillingHistory />; break;
      default: content = <BillingDashboard onSelectTable={(t) => { setSelectedTable(t); setActiveScreen('bill-detail'); }} />;
    }
  } else if (role === 'admin') {
    navItems.push(
      { key: 'admin-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { key: 'menu', label: 'Menu', icon: <Utensils className="w-4 h-4" /> },
      { key: 'tables', label: 'Tables', icon: <Table2 className="w-4 h-4" /> },
      { key: 'staff', label: 'Staff', icon: <Users className="w-4 h-4" /> },
      { key: 'payment-qr', label: 'Payment QR', icon: <DollarSign className="w-4 h-4" /> },
      { key: 'reports', label: 'Reports', icon: <TrendingUp className="w-4 h-4" /> },
      { key: 'tax', label: 'Tax Settings', icon: <Settings className="w-4 h-4" /> },
    );

    switch (activeScreen) {
      case 'admin-dashboard':
        content = <AdminDashboard onQuickLink={(key) => setActiveScreen(key)} />;
        break;
      case 'menu':
        content = <MenuManagement onAddItem={() => { setEditItemId(undefined); setActiveScreen('menu-edit'); }} onEditItem={(id) => { setEditItemId(id); setActiveScreen('menu-edit'); }} />;
        break;
      case 'menu-edit':
        content = <AddEditMenuItem itemId={editItemId} onBack={() => setActiveScreen('menu')} />;
        break;
      case 'tables': content = <TableManagement />; break;
      case 'staff': content = <StaffManagement />; break;
      case 'payment-qr': content = <PaymentQRUpload />; break;
      case 'reports': content = <Reports />; break;
      case 'tax': content = <TaxSettings />; break;
      default: content = <AdminDashboard onQuickLink={(key) => setActiveScreen(key)} />;
    }
  }

  const showBack = ['order', 'review', 'bill-detail', 'payment-recording', 'payment-qr', 'menu-edit'].includes(activeScreen);
  const handleBack = () => {
    if (role === 'waiter') {
      if (activeScreen === 'order' || activeScreen === 'review' || activeScreen === 'payment-qr') setActiveScreen('table-map');
    } else if (role === 'billing') {
      if (activeScreen === 'bill-detail') setActiveScreen('billing-dashboard');
      if (activeScreen === 'payment-recording') setActiveScreen('bill-detail');
    } else if (role === 'admin') {
      if (activeScreen === 'menu-edit') setActiveScreen('menu');
    }
  };

  return (
    <AppShell
      role={role}
      roleName={roleNames[role]}
      staffName={session.name}
      navItems={navItems}
      activeNav={activeScreen}
      onNavClick={setActiveScreen}
      onLogout={handleLogout}
      notifications={role === 'waiter' ? notifData : []}
      onNotificationDismiss={(id) => {
        // For prototype: just visual
      }}
      showBack={showBack}
      onBack={handleBack}
    >
      {content}
    </AppShell>
  );
}

interface CustomerFlowProps {
  screen: string;
  cart: { item: MenuItem; qty: number }[];
  setCart: (cart: { item: MenuItem; qty: number }[]) => void;
  rejectedReason?: string;
  onNavigate: (screen: string) => void;
  onExit: () => void;
  setRejectedReason: (reason: string | undefined) => void;
  orderId?: string;
  onSubmitOrder: (cart: { item: MenuItem; qty: number; notes?: string }[]) => Promise<void>;
}

function CustomerFlow({ screen, cart, setCart, rejectedReason, onNavigate, onExit, setRejectedReason, orderId, onSubmitOrder }: CustomerFlowProps) {
  const tableNumber = 7;

  switch (screen) {
    case 'customer-menu':
      return (
        <CustomerMenuBrowse
          tableNumber={tableNumber}
          onCheckout={(c) => { setCart(c); onNavigate('customer-cart'); }}
        />
      );
    case 'customer-cart':
      return (
        <CustomerCartReview
          tableNumber={tableNumber}
          cart={cart}
          onSubmit={onSubmitOrder}
          onBack={() => onNavigate('customer-menu')}
        />
      );
    case 'customer-status':
      return (
        <CustomerOrderStatus
          tableNumber={tableNumber}
          orderId={orderId}
          onResubmit={() => { setCart([]); onNavigate('customer-menu'); }}
        />
      );
    case 'customer-rejected':
      return (
        <CustomerRejected
          tableNumber={tableNumber}
          reason={rejectedReason}
          onBackToMenu={() => { setRejectedReason(undefined); onNavigate('customer-menu'); }}
        />
      );
    default:
      onExit();
      return null;
  }
}
