import { create } from 'zustand';
import type { User, Order, MenuItem, Table, OrderStatus, PaymentStatus } from '../types';

interface Notification {
  id: string;
  type: 'order_ready' | 'new_order' | 'order_updated';
  message: string;
  orderId: string;
  forRole: string[];
  read: boolean;
  createdAt: Date;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  orders: Order[];
  menuItems: MenuItem[];
  tables: Table[];
  notifications: Notification[];
  
  // Auth actions
  login: (email: string, password: string) => boolean;
  logout: () => void;
  
  // Order actions
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (orderId: string, items: Order['items'], total: number) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => void;
  
  // User actions
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Table actions
  updateTableStatus: (tableId: string, status: Table['status']) => void;
  
  // Menu actions
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, data: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
}

const initialMenuItems: MenuItem[] = [
  // Plats Principaux - Poulet
  { id: '1', name: 'Madhbi (Poulet Braisé)', description: 'Poulet entier braisé aux épices yéménites, servi avec riz basmati parfumé', price: 95, category: 'Poulet', available: true },
  { id: '2', name: 'Madhbi Demi-Poulet', description: 'Demi-poulet braisé aux épices, accompagné de riz', price: 55, category: 'Poulet', available: true },
  { id: '3', name: 'Mandi Poulet', description: 'Poulet cuit lentement au four traditionnel avec riz mandi parfumé', price: 85, category: 'Poulet', available: true },
  
  // Plats Principaux - Mouton
  { id: '4', name: 'Côtes de Mouton Grillées', description: 'Côtes de mouton marinées et grillées, servies avec riz', price: 120, category: 'Mouton', available: true },
  { id: '5', name: 'Mandi Mouton', description: 'Mouton tendre cuit au four avec riz mandi et sauce tomate', price: 130, category: 'Mouton', available: true },
  { id: '6', name: 'Haneeth Mouton', description: 'Épaule de mouton fondante cuite lentement, riz aux épices', price: 140, category: 'Mouton', available: true },
  { id: '7', name: 'Kabsa Mouton', description: 'Riz kabsa aux épices avec morceaux de mouton tendres', price: 110, category: 'Mouton', available: true },
  
  // Plats Légers
  { id: '8', name: 'Lahsa', description: 'Soupe yéménite épicée aux légumes et viande hachée', price: 35, category: 'Plats Légers', available: true },
  { id: '9', name: 'Saltah', description: 'Ragoût traditionnel yéménite avec fenugrec (Hulba)', price: 45, category: 'Plats Légers', available: true },
  { id: '10', name: 'Fattah', description: 'Pain yéménite avec bouillon de viande et légumes', price: 40, category: 'Plats Légers', available: true },
  { id: '11', name: 'Shorbat Adas', description: 'Soupe de lentilles aux épices arabes', price: 30, category: 'Plats Légers', available: true },
  
  // Entrées
  { id: '12', name: 'Houmous', description: 'Purée de pois chiches à la tahina et huile d\'olive', price: 25, category: 'Entrées', available: true },
  { id: '13', name: 'Moutabal', description: 'Caviar d\'aubergines grillées à la tahina', price: 28, category: 'Entrées', available: true },
  { id: '14', name: 'Foul', description: 'Fèves cuisinées à l\'huile d\'olive et épices', price: 25, category: 'Entrées', available: true },
  { id: '15', name: 'Samboussa Viande', description: 'Triangles croustillants farcis à la viande épicée (4 pcs)', price: 30, category: 'Entrées', available: true },
  { id: '16', name: 'Samboussa Fromage', description: 'Triangles croustillants au fromage (4 pcs)', price: 28, category: 'Entrées', available: true },
  
  // Accompagnements
  { id: '17', name: 'Riz Basmati', description: 'Portion de riz basmati parfumé', price: 15, category: 'Accompagnements', available: true },
  { id: '18', name: 'Riz Mandi', description: 'Riz aux épices mandi traditionnel', price: 20, category: 'Accompagnements', available: true },
  { id: '19', name: 'Pain Yéménite (Malawah)', description: 'Pain feuilleté traditionnel', price: 12, category: 'Accompagnements', available: true },
  { id: '20', name: 'Salade Fattoush', description: 'Salade fraîche aux herbes et pain croustillant', price: 25, category: 'Accompagnements', available: true },
  
  // Boissons
  { id: '21', name: 'Thé Yéménite (Shai Aden)', description: 'Thé noir aux épices et cardamome', price: 15, category: 'Boissons', available: true },
  { id: '22', name: 'Qahwa (Café Arabe)', description: 'Café arabe traditionnel à la cardamome', price: 18, category: 'Boissons', available: true },
  { id: '23', name: 'Jus de Tamarin', description: 'Boisson rafraîchissante au tamarin', price: 20, category: 'Boissons', available: true },
  { id: '24', name: 'Laban', description: 'Lait fermenté traditionnel', price: 15, category: 'Boissons', available: true },
  { id: '25', name: 'Eau minérale', description: 'Bouteille 1.5L', price: 10, category: 'Boissons', available: true },
  
  // Desserts
  { id: '26', name: 'Bint Al Sahn', description: 'Pâtisserie yéménite au miel et beurre', price: 35, category: 'Desserts', available: true },
  { id: '27', name: 'Masoub', description: 'Bananes écrasées avec pain, crème et miel', price: 30, category: 'Desserts', available: true },
  { id: '28', name: 'Basbousa', description: 'Gâteau de semoule au sirop', price: 25, category: 'Desserts', available: true },
];

const initialUsers: User[] = [
  { id: '1', name: 'Ahmed Admin', email: 'admin@babelfkamah.ma', role: 'admin', active: true, phone: '0661234567' },
  { id: '2', name: 'Fatima Manager', email: 'manager@babelfkamah.ma', role: 'manager', active: true, phone: '0662345678' },
  { id: '3', name: 'Hassan Cuisinier', email: 'cook@babelfkamah.ma', role: 'cook', active: true, phone: '0663456789' },
  { id: '4', name: 'Khadija Serveuse', email: 'waiter@babelfkamah.ma', role: 'waiter', active: true, phone: '0664567890' },
  { id: '5', name: 'Omar Caissier', email: 'cashier@babelfkamah.ma', role: 'cashier', active: true, phone: '0665678901' },
  { id: '6', name: 'Youssef Livreur', email: 'delivery@babelfkamah.ma', role: 'delivery', active: true, phone: '0666789012' },
];

const initialTables: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: `table-${i + 1}`,
  number: i + 1,
  seats: i < 4 ? 2 : i < 8 ? 4 : 6,
  status: 'available' as const,
}));

const initialOrders: Order[] = [
  {
    id: 'order-1',
    type: 'dine-in',
    status: 'preparing',
    paymentStatus: 'unpaid',
    items: [
      { id: 'item-1', menuItem: initialMenuItems[0], quantity: 2, price: 190 }, // 2x Madhbi
      { id: 'item-2', menuItem: initialMenuItems[20], quantity: 2, price: 30 }, // 2x Thé Yéménite
    ],
    total: 220,
    tableNumber: 3,
    waiter: initialUsers[3], // Khadija Serveuse
    createdAt: new Date(Date.now() - 30 * 60000),
    updatedAt: new Date(),
  },
  {
    id: 'order-2',
    type: 'delivery',
    status: 'ready',
    paymentStatus: 'unpaid',
    items: [
      { id: 'item-3', menuItem: initialMenuItems[4], quantity: 1, price: 130 }, // Mandi Mouton
      { id: 'item-4', menuItem: initialMenuItems[7], quantity: 2, price: 70 }, // 2x Lahsa
      { id: 'item-5', menuItem: initialMenuItems[11], quantity: 1, price: 25 }, // Houmous
    ],
    total: 225,
    customerName: 'Mohammed Alami',
    customerPhone: '0667891234',
    customerAddress: '45 Rue Hassan II, Casablanca',
    waiter: initialUsers[3], // Khadija Serveuse
    createdAt: new Date(Date.now() - 45 * 60000),
    updatedAt: new Date(),
  },
  {
    id: 'order-3',
    type: 'takeaway',
    status: 'pending',
    paymentStatus: 'unpaid',
    items: [
      { id: 'item-6', menuItem: initialMenuItems[3], quantity: 2, price: 240 }, // 2x Côtes de Mouton
      { id: 'item-7', menuItem: initialMenuItems[14], quantity: 4, price: 120 }, // 4x Samboussa Viande
      { id: 'item-8', menuItem: initialMenuItems[25], quantity: 2, price: 70 }, // 2x Bint Al Sahn
    ],
    total: 430,
    customerName: 'Sara Bennani',
    customerPhone: '0668912345',
    waiter: initialUsers[3], // Khadija Serveuse
    createdAt: new Date(Date.now() - 15 * 60000),
    updatedAt: new Date(),
  },
];

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: initialUsers,
  orders: initialOrders,
  menuItems: initialMenuItems,
  tables: initialTables,
  notifications: [],
  
  login: (email: string, _password: string) => {
    const user = get().users.find(u => u.email === email && u.active);
    if (user) {
      set({ currentUser: user });
      return true;
    }
    return false;
  },
  
  logout: () => set({ currentUser: null }),
  
  addOrder: (orderData) => {
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set(state => ({ orders: [...state.orders, newOrder] }));
    
    // Notify kitchen
    const waiterName = orderData.waiter?.name || 'Inconnu';
    get().addNotification({
      type: 'new_order',
      message: `Nouvelle commande #${newOrder.id.slice(-4)} - ${orderData.type === 'dine-in' ? `Table ${orderData.tableNumber}` : orderData.customerName} (Serveur: ${waiterName})`,
      orderId: newOrder.id,
      forRole: ['cook', 'admin', 'manager'],
    });
  },
  
  updateOrder: (orderId, items, total) => {
    set(state => ({
      orders: state.orders.map(o => 
        o.id === orderId ? { ...o, items, total, updatedAt: new Date() } : o
      )
    }));
    
    // Notify kitchen about modification
    get().addNotification({
      type: 'order_updated',
      message: `Commande #${orderId.slice(-4)} modifiée`,
      orderId,
      forRole: ['cook', 'admin', 'manager'],
    });
  },
  
  updateOrderStatus: (orderId, status) => {
    const order = get().orders.find(o => o.id === orderId);
    set(state => ({
      orders: state.orders.map(o => 
        o.id === orderId ? { ...o, status, updatedAt: new Date() } : o
      )
    }));
    
    // Notify waiter when order is ready
    if (status === 'ready' && order) {
      get().addNotification({
        type: 'order_ready',
        message: `🍽️ Commande #${orderId.slice(-4)} PRÊTE! ${order.type === 'dine-in' ? `Table ${order.tableNumber}` : order.customerName}`,
        orderId,
        forRole: ['waiter', 'delivery', 'admin', 'manager'],
      });
    }
  },
  
  updatePaymentStatus: (orderId, paymentStatus) => {
    set(state => ({
      orders: state.orders.map(o => 
        o.id === orderId ? { ...o, paymentStatus, updatedAt: new Date() } : o
      )
    }));
  },
  
  addUser: (userData) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
    };
    set(state => ({ users: [...state.users, newUser] }));
  },
  
  updateUser: (id, data) => {
    set(state => ({
      users: state.users.map(u => u.id === id ? { ...u, ...data } : u)
    }));
  },
  
  deleteUser: (id) => {
    set(state => ({ users: state.users.filter(u => u.id !== id) }));
  },
  
  updateTableStatus: (tableId, status) => {
    set(state => ({
      tables: state.tables.map(t => t.id === tableId ? { ...t, status } : t)
    }));
  },
  
  addMenuItem: (itemData) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `menu-${Date.now()}`,
    };
    set(state => ({ menuItems: [...state.menuItems, newItem] }));
  },
  
  updateMenuItem: (id, data) => {
    set(state => ({
      menuItems: state.menuItems.map(m => m.id === id ? { ...m, ...data } : m)
    }));
  },
  
  deleteMenuItem: (id) => {
    set(state => ({ menuItems: state.menuItems.filter(m => m.id !== id) }));
  },
  
  // Notification actions
  addNotification: (notificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date(),
    };
    set(state => ({ notifications: [newNotification, ...state.notifications].slice(0, 50) }));
  },
  
  markNotificationRead: (notificationId) => {
    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    }));
  },
  
  clearNotifications: () => {
    set({ notifications: [] });
  },
}));
