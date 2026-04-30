import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  DollarSign, 
  UtensilsCrossed,
  Truck,
  Users,
  AlertCircle,
  ChefHat,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Dashboard() {
  const { orders, tables, users } = useStore();
  
  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const unpaidOrders = orders.filter(o => o.paymentStatus === 'unpaid');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const deliveryOrders = orders.filter(o => o.type === 'delivery' && o.status !== 'delivered');
  
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);
  
  const stats = [
    { label: 'Commandes actives', value: activeOrders.length, icon: <ShoppingBag />, color: 'from-blue-500 to-blue-600', link: '/orders' },
    { label: 'En préparation', value: preparingOrders.length, icon: <ChefHat />, color: 'from-orange-500 to-orange-600', link: '/kitchen' },
    { label: 'Factures impayées', value: unpaidOrders.length, icon: <AlertCircle />, color: 'from-red-500 to-red-600', link: '/invoices' },
    { label: 'Recettes (DH)', value: totalRevenue.toLocaleString(), icon: <DollarSign />, color: 'from-green-500 to-green-600', link: '/invoices' },
  ];
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-amber-900 font-serif">Tableau de bord</h1>
        <p className="text-amber-700 mt-1">Bienvenue sur le système de gestion Bab Al Fkamah</p>
      </div>
      
      {/* Stats Grid - Clickable Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Link key={stat.label} to={stat.link}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
                <ArrowRight size={20} className="text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </motion.div>
          </Link>
        ))}
      </div>
      
      {/* Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tables Status - Clickable */}
        <Link to="/tables">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-all cursor-pointer h-full"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                  <UtensilsCrossed size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">État des tables</h2>
              </div>
              <ArrowRight size={20} className="text-gray-300" />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {tables.map(table => (
                <div
                  key={table.id}
                  className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium
                    ${table.status === 'available' ? 'bg-green-100 text-green-700' : ''}
                    ${table.status === 'occupied' ? 'bg-red-100 text-red-700' : ''}
                    ${table.status === 'reserved' ? 'bg-yellow-100 text-yellow-700' : ''}
                  `}
                >
                  <span className="text-lg font-bold">{table.number}</span>
                  <span className="text-xs">{table.seats}p</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600">Libre</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600">Occupée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-gray-600">Réservée</span>
              </div>
            </div>
          </motion.div>
        </Link>
        
        {/* Active Orders - Clickable */}
        <Link to="/orders">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-all cursor-pointer h-full"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                  <ShoppingBag size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Commandes récentes</h2>
              </div>
              <ArrowRight size={20} className="text-gray-300" />
            </div>
            
            <div className="space-y-3">
              {activeOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.type === 'dine-in' && `Table ${order.tableNumber}`}
                      {order.type === 'takeaway' && order.customerName}
                      {order.type === 'delivery' && order.customerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.type === 'dine-in' && '🍽️ Sur place'}
                      {order.type === 'takeaway' && '📦 À emporter'}
                      {order.type === 'delivery' && '🚗 Livraison'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600">{order.total} DH</p>
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${order.status === 'preparing' ? 'bg-blue-100 text-blue-700' : ''}
                      ${order.status === 'ready' ? 'bg-green-100 text-green-700' : ''}
                    `}>
                      {order.status === 'pending' && 'En attente'}
                      {order.status === 'preparing' && 'En préparation'}
                      {order.status === 'ready' && 'Prêt'}
                    </span>
                  </div>
                </div>
              ))}
              
              {activeOrders.length === 0 && (
                <p className="text-center text-gray-500 py-8">Aucune commande active</p>
              )}
            </div>
          </motion.div>
        </Link>
        
        {/* Delivery Orders - Clickable */}
        <Link to="/delivery">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-all cursor-pointer h-full"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white">
                  <Truck size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Livraisons en cours</h2>
              </div>
              <ArrowRight size={20} className="text-gray-300" />
            </div>
            
            <div className="space-y-3">
              {deliveryOrders.slice(0, 4).map(order => (
                <div key={order.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${order.status === 'preparing' ? 'bg-blue-100 text-blue-700' : ''}
                      ${order.status === 'ready' ? 'bg-green-100 text-green-700' : ''}
                    `}>
                      {order.status === 'pending' && 'En attente'}
                      {order.status === 'preparing' && 'En préparation'}
                      {order.status === 'ready' && 'Prêt à livrer'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{order.customerAddress}</p>
                  <p className="text-sm text-amber-600 font-medium mt-1">{order.total} DH</p>
                </div>
              ))}
              
              {deliveryOrders.length === 0 && (
                <p className="text-center text-gray-500 py-8">Aucune livraison en cours</p>
              )}
            </div>
          </motion.div>
        </Link>
      </div>
      
      {/* Staff Overview - Clickable */}
      <Link to="/users">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white">
                <Users size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Équipe active</h2>
            </div>
            <ArrowRight size={20} className="text-gray-300" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {users.filter(u => u.active).map(user => (
              <div key={user.id} className="text-center p-4 bg-gray-50 rounded-xl">
                <div className={`
                  w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg mb-2
                  ${user.role === 'admin' ? 'bg-purple-500' : ''}
                  ${user.role === 'manager' ? 'bg-blue-500' : ''}
                  ${user.role === 'cook' ? 'bg-orange-500' : ''}
                  ${user.role === 'waiter' ? 'bg-green-500' : ''}
                  ${user.role === 'cashier' ? 'bg-yellow-500' : ''}
                  ${user.role === 'delivery' ? 'bg-red-500' : ''}
                `}>
                  {user.name.charAt(0)}
                </div>
                <p className="font-medium text-gray-900 text-sm truncate">{user.name.split(' ')[0]}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {user.role === 'admin' && 'Admin'}
                  {user.role === 'manager' && 'Manager'}
                  {user.role === 'cook' && 'Cuisinier'}
                  {user.role === 'waiter' && 'Serveur'}
                  {user.role === 'cashier' && 'Caissier'}
                  {user.role === 'delivery' && 'Livreur'}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
