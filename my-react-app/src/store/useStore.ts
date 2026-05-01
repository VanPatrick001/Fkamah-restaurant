import { create } from 'zustand';
import type { User, Order, MenuItem, Table, OrderStatus, PaymentStatus, UserRole } from '../types';
import { loginApi, fetchMenuItemsApi, fetchTablesApi, fetchUsersApi, createUserApi,
  fetchOrdersApi, createOrderApi, updateOrderApi, updateOrderStatusApi, updateOrderPaymentStatusApi,
  changePasswordApi, fetchGroupsApi } from '../api/client';

interface Notification {
  id: string;
  type: 'order_ready' | 'new_order' | 'order_updated';
  message: string;
  orderId: string;
  forRole: string[];
  read: boolean;
  createdAt: Date;
}

interface NewUserPayload {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  active: boolean;
  password: string;
}

interface AppState {
  token: string | null;
  currentUser: User | null;
  users: User[];
  orders: Order[];
  menuItems: MenuItem[];
  tables: Table[];
  notifications: Notification[];
  groups?: Array<{ id: string; name: string; description?: string }>;
  
  // Auth actions
  initializeApp: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadMenuItems: () => Promise<void>;
  loadTables: () => Promise<void>;
  loadUsers: () => Promise<void>;
  loadOrders: () => Promise<void>;
  loadGroups: () => Promise<void>;
  addUser: (user: NewUserPayload) => Promise<boolean>;
  changePassword: (userId: string, oldPassword: string | undefined, newPassword: string) => Promise<boolean>;
  
  // Order actions
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateOrder: (orderId: string, items: Order['items'], total: number) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => Promise<boolean>;
  
  // User actions
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
  { id: '1', name: 'Admin User', email: 'admin@restaurant.com', role: 'admin', active: true, phone: '0661234567' },
  { id: '2', name: 'Manager User', email: 'manager@restaurant.com', role: 'manager', active: true, phone: '0662345678' },
  { id: '3', name: 'Staff User', email: 'staff@restaurant.com', role: 'staff', active: true, phone: '0663456789' },
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

const initialOrders: Order[] = [];

const formatBackendUser = (user: Record<string, unknown>): User => ({
  id: typeof user.id === 'string' ? user.id : '',
  name: `${typeof user.first_name === 'string' ? user.first_name : ''} ${typeof user.last_name === 'string' ? user.last_name : ''}`.trim() || (typeof user.email === 'string' ? user.email : ''),
  email: typeof user.email === 'string' ? user.email : '',
  role: typeof user.role === 'string' ? (user.role as UserRole) : 'staff',
  active: user.is_active !== false,
  phone: typeof user.phone === 'string' ? user.phone : '',
});

const formatOrderItem = (item: Record<string, unknown>) => {
  const itemAny = item as Record<string, unknown>;
  const menu = itemAny.menuItem as Record<string, unknown> | undefined;
  return {
    id: typeof itemAny.id === 'string' ? itemAny.id : `item-${Date.now()}`,
    menuItem: {
      id: typeof menu?.id === 'string' ? menu.id : typeof itemAny.menuItemId === 'string' ? itemAny.menuItemId : '',
      name: typeof menu?.name === 'string' ? menu.name : '',
      description: typeof menu?.description === 'string' ? menu.description : '',
      price: Number(menu?.price ?? itemAny.unitPrice ?? 0),
      category: typeof menu?.category === 'string' ? menu.category : 'Menu',
      available: true,
    },
    quantity: Number(itemAny.quantity ?? 1),
    price: Number(itemAny.unitPrice ?? itemAny.price ?? 0),
    notes: typeof itemAny.specialInstructions === 'string' ? itemAny.specialInstructions : undefined,
  };
};

const formatBackendOrder = (order: Record<string, unknown>): Order => {
  const orderAny = order as Record<string, unknown>;
  const waiter = orderAny.waiter as Record<string, unknown> | undefined;

  return {
    id: typeof orderAny.id === 'string' ? orderAny.id : '',
    type: typeof orderAny.type === 'string' ? orderAny.type as Order['type'] : orderAny.table_id ? 'dine-in' : 'delivery',
    status: typeof orderAny.status === 'string' ? orderAny.status as OrderStatus : 'pending',
    paymentStatus: typeof orderAny.payment_status === 'string' ? orderAny.payment_status as PaymentStatus : 'unpaid',
    items: Array.isArray(orderAny.items) ? orderAny.items.map(formatOrderItem) : [],
    total: Number(orderAny.total_amount ?? 0),
    tableNumber: orderAny.table_number ? Number(orderAny.table_number) : undefined,
    customerName: typeof orderAny.customer_name === 'string' ? orderAny.customer_name : undefined,
    customerPhone: typeof orderAny.customer_phone === 'string' ? orderAny.customer_phone : undefined,
    customerAddress: typeof orderAny.customer_address === 'string' ? orderAny.customer_address : undefined,
    waiter: waiter ? {
      id: typeof waiter.id === 'string' ? waiter.id : '',
      name: `${typeof waiter.first_name === 'string' ? waiter.first_name : ''} ${typeof waiter.last_name === 'string' ? waiter.last_name : ''}`.trim(),
      email: typeof waiter.email === 'string' ? waiter.email : '',
      role: typeof waiter.role === 'string' ? waiter.role as UserRole : 'waiter',
      active: true,
    } : undefined,
    createdAt: new Date(typeof orderAny.created_at === 'string' ? orderAny.created_at : Date.now()),
    updatedAt: new Date(typeof orderAny.updated_at === 'string' ? orderAny.updated_at : Date.now()),
    notes: typeof orderAny.notes === 'string' ? orderAny.notes : undefined,
  };
};

const formatBackendMenuItem = (item: Record<string, unknown>): MenuItem => ({
  id: typeof item.id === 'string' ? item.id : '',
  name: typeof item.name === 'string' ? item.name : '',
  description: typeof item.description === 'string' ? item.description : '',
  price: Number(item.price ?? 0),
  category: typeof item.category === 'string' ? item.category : typeof item.category_id === 'string' ? item.category_id : 'Menu',
  image: typeof item.image_url === 'string' ? item.image_url : typeof item.imageUrl === 'string' ? item.imageUrl : undefined,
  available: item.is_available !== false,
});

const formatBackendTable = (table: Record<string, unknown>): Table => ({
  id: typeof table.id === 'string' ? table.id : '',
  number: Number(table.table_number ?? table.number ?? 0),
  seats: Number(table.capacity ?? table.seats ?? 0),
  status: typeof table.status === 'string' ? (table.status as Table['status']) : 'available',
});

export const useStore = create<AppState>((set, get) => ({
  token: null,
  currentUser: null,
  users: initialUsers,
  orders: initialOrders,
  menuItems: initialMenuItems,
  tables: initialTables,
  notifications: [],

  initializeApp: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const currentUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;

    if (token && currentUser) {
      set({ token, currentUser: JSON.parse(currentUser) as User });
    }

    await get().loadMenuItems();

    if (token) {
      await get().loadTables();
      await get().loadUsers();
      await get().loadOrders();
      await get().loadGroups();
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await loginApi(email, password);
      const user = formatBackendUser(response.user);
      set({ currentUser: user, token: response.token, users: [user] });
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(user));

      await get().loadMenuItems();
      await get().loadTables();
      await get().loadOrders();
      await get().loadGroups();
      if (user.role === 'admin' || user.role === 'manager') {
        await get().loadUsers();
      }

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
    set({ currentUser: null, token: null, users: initialUsers, tables: initialTables, notifications: [] });
  },

  loadMenuItems: async () => {
    try {
      const data = await fetchMenuItemsApi();
      set({ menuItems: data.map(formatBackendMenuItem) });
    } catch (error) {
      console.error('Could not load menu items from backend:', error);
    }
  },

  loadTables: async () => {
    try {
      const data = await fetchTablesApi();
      set({ tables: data.map(formatBackendTable) });
    } catch (error) {
      console.error('Could not load tables from backend:', error);
    }
  },

  loadUsers: async () => {
    if (!get().token) {
      return;
    }

    try {
      const data = await fetchUsersApi();
      set({ users: data.map(formatBackendUser) });
    } catch (error) {
      console.error('Could not load users from backend:', error);
    }
  },

  loadOrders: async () => {
    if (!get().token) {
      return;
    }

    try {
      const data = await fetchOrdersApi();
      set({ orders: Array.isArray(data) ? data.map(formatBackendOrder) : [] });
    } catch (error) {
      console.error('Could not load orders from backend:', error);
    }
  },

  loadGroups: async () => {
    if (!get().token) {
      return;
    }

    try {
      const data = await fetchGroupsApi();
      set({ groups: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error('Could not load groups from backend:', error);
    }
  },

  addOrder: async (orderData) => {
    try {
      const table = orderData.tableNumber ? get().tables.find(t => t.number === orderData.tableNumber) : undefined;
      const response = await createOrderApi({
        orderType: orderData.type,
        tableId: table?.id ?? null,
        userId: orderData.waiter?.id ?? '',
        items: orderData.items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          specialInstructions: item.notes,
        })),
        notes: orderData.notes,
      });

      const backendOrder = formatBackendOrder(response);
      set(state => ({ orders: [backendOrder, ...state.orders] }));
      return true;
    } catch (error) {
      console.error('Could not create order:', error);
      return false;
    }
  },

  updateOrder: async (orderId, _items, total) => {
    try {
      const response = await updateOrderApi(orderId, { totalAmount: total });
      const updatedOrder = formatBackendOrder(response);
      set(state => ({
        orders: state.orders.map(o =>
          o.id === orderId ? updatedOrder : o
        )
      }));

      get().addNotification({
        type: 'order_updated',
        message: `Commande #${orderId.slice(-4)} modifiée`,
        orderId,
        forRole: ['cook', 'admin', 'manager'],
      });
      return true;
    } catch (error) {
      console.error('Could not update order:', error);
      return false;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await updateOrderStatusApi(orderId, status);
      const updatedOrder = formatBackendOrder(response);
      const order = get().orders.find(o => o.id === orderId);

      set(state => ({
        orders: state.orders.map(o =>
          o.id === orderId ? updatedOrder : o
        )
      }));

      if (status === 'ready' && order) {
        get().addNotification({
          type: 'order_ready',
          message: `🍽️ Commande #${orderId.slice(-4)} PRÊTE! ${order.type === 'dine-in' ? `Table ${order.tableNumber}` : order.customerName}`,
          orderId,
          forRole: ['waiter', 'delivery', 'admin', 'manager'],
        });
      }
      return true;
    } catch (error) {
      console.error('Could not update order status:', error);
      return false;
    }
  },

  updatePaymentStatus: async (orderId, paymentStatus) => {
    try {
      const response = await updateOrderPaymentStatusApi(orderId, paymentStatus);
      const updatedOrder = formatBackendOrder(response);
      set(state => ({
        orders: state.orders.map(o =>
          o.id === orderId ? updatedOrder : o
        )
      }));
      return true;
    } catch (error) {
      console.error('Could not update payment status:', error);
      return false;
    }
  },

  addUser: async (userData) => {
    try {
      const [firstName, ...rest] = userData.name.trim().split(' ');
      const lastName = rest.join(' ') || '';

      const response = await createUserApi({
        email: userData.email,
        password: userData.password,
        firstName,
        lastName,
        role: userData.role,
        phone: userData.phone,
        isActive: userData.active,
      });

      const created = response.user;
      const createdUser: User = {
        id: created.id,
        name: `${created.first_name ?? ''} ${created.last_name ?? ''}`.trim() || created.email,
        email: created.email,
        role: created.role,
        phone: created.phone || '',
        active: created.is_active !== false,
      };

      set(state => ({ users: [...state.users, createdUser] }));
      return true;
    } catch (error) {
      console.error('Could not create user:', error);
      return false;
    }
  },

  changePassword: async (userId, oldPassword, newPassword) => {
    try {
      await changePasswordApi(userId, { oldPassword, newPassword });
      return true;
    } catch (error) {
      console.error('Could not change password:', error);
      return false;
    }
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
