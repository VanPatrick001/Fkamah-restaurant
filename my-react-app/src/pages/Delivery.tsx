import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, Phone, Clock, Check, Package, Navigation } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Order } from '../types';

export default function Delivery() {
  const { orders, updateOrderStatus } = useStore();
  
  const deliveryOrders = orders.filter(o => o.type === 'delivery');
  const pendingDeliveries = deliveryOrders.filter(o => ['pending', 'preparing'].includes(o.status));
  const readyDeliveries = deliveryOrders.filter(o => o.status === 'ready');
  const inTransitDeliveries = deliveryOrders.filter(o => o.status === 'served'); // Using 'served' as 'in transit'
  const completedDeliveries = deliveryOrders.filter(o => o.status === 'delivered');
  
  const getTimeSince = (date: Date) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
  };
  
  const DeliveryCard = ({ order }: { order: Order }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl p-5 shadow-lg border border-amber-100"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900">{order.customerName}</h3>
          <p className="text-sm text-gray-500">#{order.id.slice(-4)}</p>
        </div>
        <div className="flex items-center gap-1 text-amber-600">
          <Clock size={14} />
          <span className="text-sm font-medium">{getTimeSince(order.createdAt)}</span>
        </div>
      </div>
      
      {/* Address */}
      <div className="flex items-start gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
        <MapPin size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-600">{order.customerAddress}</p>
      </div>
      
      {/* Phone */}
      <div className="flex items-center gap-3 mb-4">
        <Phone size={18} className="text-green-500" />
        <a href={`tel:${order.customerPhone}`} className="text-sm text-blue-600 hover:underline">
          {order.customerPhone}
        </a>
      </div>
      
      {/* Items */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Articles:</p>
        <div className="flex flex-wrap gap-1">
          {order.items.map(item => (
            <span key={item.id} className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
              {item.quantity}x {item.menuItem.name}
            </span>
          ))}
        </div>
      </div>
      
      {/* Total & Status */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xl font-bold text-amber-600">{order.total} DH</span>
        <span className={`
          px-3 py-1 rounded-full text-sm font-medium
          ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
          ${order.status === 'preparing' ? 'bg-blue-100 text-blue-700' : ''}
          ${order.status === 'ready' ? 'bg-green-100 text-green-700' : ''}
          ${order.status === 'served' ? 'bg-purple-100 text-purple-700' : ''}
          ${order.status === 'delivered' ? 'bg-gray-100 text-gray-700' : ''}
        `}>
          {order.status === 'pending' && 'En attente'}
          {order.status === 'preparing' && 'En cuisine'}
          {order.status === 'ready' && 'Prêt'}
          {order.status === 'served' && 'En route'}
          {order.status === 'delivered' && 'Livré'}
        </span>
      </div>
      
      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {order.status === 'ready' && (
          <button
            onClick={() => updateOrderStatus(order.id, 'served')}
            className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <Navigation size={18} />
            Démarrer livraison
          </button>
        )}
        {order.status === 'served' && (
          <button
            onClick={() => updateOrderStatus(order.id, 'delivered')}
            className="flex-1 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
          >
            <Check size={18} />
            Confirmer livraison
          </button>
        )}
      </div>
    </motion.div>
  );
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 font-serif">Livraisons</h1>
          <p className="text-amber-700 mt-1">Gestion des commandes à livrer</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-xl">
            <Package size={18} className="text-green-600" />
            <span className="font-medium text-green-700">{readyDeliveries.length} prêtes</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-xl">
            <Truck size={18} className="text-purple-600" />
            <span className="font-medium text-purple-700">{inTransitDeliveries.length} en route</span>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-lg border border-amber-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingDeliveries.length}</p>
              <p className="text-sm text-gray-500">En préparation</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-lg border border-amber-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Package size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{readyDeliveries.length}</p>
              <p className="text-sm text-gray-500">Prêtes</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-lg border border-amber-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Truck size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inTransitDeliveries.length}</p>
              <p className="text-sm text-gray-500">En route</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 shadow-lg border border-amber-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Check size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedDeliveries.length}</p>
              <p className="text-sm text-gray-500">Livrées</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Deliveries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {[...readyDeliveries, ...inTransitDeliveries, ...pendingDeliveries].map(order => (
            <DeliveryCard key={order.id} order={order} />
          ))}
        </AnimatePresence>
      </div>
      
      {deliveryOrders.filter(o => o.status !== 'delivered').length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Truck size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">Aucune livraison en cours</p>
        </div>
      )}
    </div>
  );
}
