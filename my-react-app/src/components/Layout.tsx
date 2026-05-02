import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Users, 
  ClipboardList, 
  Receipt, 
  Truck,
  ChefHat,
  LogOut,
  Menu,
  X,
  Settings,
  Table,
  Bell,
  Check,
  Volume2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { connectSocket, disconnectSocket } from '../utils/socket';
import type { UserRole } from '../types';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} />, roles: ['admin', 'manager'] },
  { path: '/orders', label: 'Commandes', icon: <ClipboardList size={20} />, roles: ['admin', 'manager', 'waiter', 'cashier'] },
  { path: '/kitchen', label: 'Cuisine', icon: <ChefHat size={20} />, roles: ['admin', 'manager', 'cook'] },
  { path: '/tables', label: 'Tables', icon: <Table size={20} />, roles: ['admin', 'manager', 'waiter'] },
  { path: '/delivery', label: 'Livraisons', icon: <Truck size={20} />, roles: ['admin', 'manager', 'delivery'] },
  { path: '/invoices', label: 'Factures', icon: <Receipt size={20} />, roles: ['admin', 'manager', 'cashier'] },
  { path: '/menu', label: 'Menu', icon: <UtensilsCrossed size={20} />, roles: ['admin', 'manager', 'cook'] },
  { path: '/users', label: 'Utilisateurs', icon: <Users size={20} />, roles: ['admin'] },
  { path: '/settings', label: 'Paramètres', icon: <Settings size={20} />, roles: ['admin', 'manager'] },
];

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  cook: 'Cuisinier',
  waiter: 'Serveur',
  cashier: 'Caissier',
  delivery: 'Livreur',
  staff: 'Personnel',
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-500',
  manager: 'bg-blue-500',
  cook: 'bg-orange-500',
  waiter: 'bg-green-500',
  cashier: 'bg-yellow-500',
  delivery: 'bg-red-500',
  staff: 'bg-slate-500',
};

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, token, logout, notifications, markNotificationRead, clearNotifications, addNotification } = useStore();
  
  // Filter notifications for current user's role
  const userNotifications = notifications.filter(n => 
    currentUser && n.forRole.includes(currentUser.role)
  );
  const unreadCount = userNotifications.filter(n => !n.read).length;
  
  // Play sound when new notification arrives
  useEffect(() => {
    if (unreadCount > lastNotificationCount && lastNotificationCount > 0) {
      // Play notification sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleOAIPpXk9aSJ4BQ+kO37sZDgFT6N8f+9l+AVPov1/8qd4BU+ifn/1qPgFT6H/f/hqeAVPoX//+uv4BU+g///9LXgFT6B//78u+AVPn///v/B4BU+ff///8fgFT57////zeAVPnn////T4BU+d////9ngFT51////3+AVPnP////l4BU+cf///+vgFT5v////8eAVPm3////34BU+a////f3gFT5p////');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
    setLastNotificationCount(unreadCount);
  }, [unreadCount, lastNotificationCount]);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const filteredNavItems = navItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );
  
  useEffect(() => {
    if (!currentUser) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();

    const handleSocketNotification = (payload: any) => {
      addNotification({
        type: payload.type === 'order_ready' ? 'order_ready' : 'order_updated',
        message: payload.message || payload.title || 'Nouvelle notification',
        orderId: payload.orderId || payload.order_id || '',
        forRole: [currentUser.role],
      });
    };

    socket.on('notification', handleSocketNotification);

    return () => {
      socket.off('notification', handleSocketNotification);
    };
  }, [currentUser, token, addNotification]);

  const handleNotificationClick = (notificationId: string, _orderId: string) => {
    markNotificationRead(notificationId);
    // Navigate to relevant page based on order
    if (currentUser?.role === 'cook') {
      navigate('/kitchen');
    } else if (currentUser?.role === 'delivery') {
      navigate('/delivery');
    } else {
      navigate('/orders');
    }
    setNotificationsOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-amber-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-amber-100 rounded-lg">
            <Menu size={24} className="text-amber-800" />
          </button>
          <h1 className="text-xl font-bold text-amber-800 font-serif">Bab Al Fkamah</h1>
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-amber-100 rounded-lg"
            >
              <Bell size={24} className="text-amber-800" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className={`w-8 h-8 rounded-full ${roleColors[currentUser?.role || 'admin']} flex items-center justify-center text-white text-sm font-bold`}>
              {currentUser?.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-amber-900 via-amber-800 to-orange-900 
        transform transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-amber-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-amber-100 font-serif">Bab Al Fkamah</h1>
                <p className="text-amber-300 text-sm mt-1">Cuisine Yéménite & Émiratie</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-amber-700/50 rounded-lg">
                <X size={20} className="text-amber-200" />
              </button>
            </div>
          </div>
          
          {/* User Info */}
          <div className="p-4 border-b border-amber-700/50">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${roleColors[currentUser?.role || 'admin']} flex items-center justify-center text-white font-bold`}>
                {currentUser?.name.charAt(0)}
              </div>
              <div>
                <p className="text-amber-100 font-medium">{currentUser?.name}</p>
                <p className="text-amber-300 text-sm">{roleLabels[currentUser?.role || 'admin']}</p>
              </div>
            </div>
          </div>
          
          {/* Notification Bell for Desktop */}
          <div className="hidden lg:block p-4 border-b border-amber-700/50">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-amber-700/30 hover:bg-amber-700/50 transition-all"
            >
              <div className="flex items-center gap-3 text-amber-100">
                <Bell size={20} />
                <span className="font-medium">Notifications</span>
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-amber-100 text-amber-900 shadow-lg' 
                      : 'text-amber-200 hover:bg-amber-700/50 hover:text-amber-100'
                    }
                  `}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Logout */}
          <div className="p-4 border-t border-amber-700/50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-amber-200 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
      
      {/* Notifications Panel */}
      <AnimatePresence>
        {notificationsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setNotificationsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20, y: -20 }}
              className="fixed top-16 right-4 lg:top-4 lg:left-80 z-50 w-80 max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 size={20} />
                    <h3 className="font-bold">Notifications</h3>
                  </div>
                  {userNotifications.length > 0 && (
                    <button 
                      onClick={() => clearNotifications()}
                      className="text-xs bg-white/20 px-2 py-1 rounded-lg hover:bg-white/30"
                    >
                      Tout effacer
                    </button>
                  )}
                </div>
              </div>
              
              <div className="max-h-[50vh] overflow-y-auto">
                {userNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  userNotifications.map(notification => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id, notification.orderId)}
                      className={`w-full p-4 border-b border-gray-100 text-left hover:bg-amber-50 transition-all ${!notification.read ? 'bg-amber-50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.read ? 'bg-amber-500' : 'bg-gray-300'}`} />
                        <div className="flex-1">
                          <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!notification.read && (
                          <Check size={16} className="text-green-500" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
