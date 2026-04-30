export type UserRole = 'admin' | 'manager' | 'cook' | 'waiter' | 'cashier' | 'delivery';

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'delivered' | 'completed' | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'partial';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  active: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  price: number;
}

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  total: number;
  tableNumber?: number;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  waiter?: User;
  cook?: User;
  delivery?: User;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrder?: Order;
}
