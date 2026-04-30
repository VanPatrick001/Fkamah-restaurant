import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, Check, AlertCircle, UtensilsCrossed, Truck, Package } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Order, OrderStatus } from '../types';

export default function Kitchen() {
  const { orders, updateOrderStatus } = useStore();
  
  const kitchenOrders = orders.filter(o => 
    ['pending', 'preparing', 'ready'].includes(o.status) && 
    o.status !== 'completed' && 
    o.status !== 'cancelled'
  );
  
  const pendingOrders = kitchenOrders.filter(o => o.status === 'pending');
  const preparingOrders = kitchenOrders.filter(o => o.status === 'preparing');
  const readyOrders = kitchenOrders.filter(o => o.status === 'ready');
  
  const getOrderTypeIcon = (type: Order['type']) => {
    switch (type) {
      case 'dine-in': return <UtensilsCrossed size={16} />;
      case 'takeaway': return <Package size={16} />;
      case 'delivery': return <Truck size={16} />;
    }
  };
  
  const getOrderTypeLabel = (order: Order) => {
    switch (order.type) {
      case 'dine-in': return `Table ${order.tableNumber}`;
      case 'takeaway': return order.customerName || 'À emporter';
      case 'delivery': return order.customerName || 'Livraison';
    }
  };
  
  const getTimeSince = (date: Date) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
  };
  
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };
  
  const OrderCard = ({ order, showActions = true }: { order: Order; showActions?: boolean }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-2xl p-4 shadow-lg border border-amber-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`
            p-2 rounded-lg
            ${order.type === 'dine-in' ? 'bg-blue-100 text-blue-600' : ''}
            ${order.type === 'takeaway' ? 'bg-purple-100 text-purple-600' : ''}
            ${order.type === 'delivery' ? 'bg-red-100 text-red-600' : ''}
          `}>
            {getOrderTypeIcon(order.type)}
          </span>
          <div>
            <p className="font-bold text-gray-900">{getOrderTypeLabel(order)}</p>
            <p className="text-xs text-gray-500">#{order.id.slice(-4)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-amber-600">
          <Clock size={14} />
          <span className="text-sm font-medium">{getTimeSince(order.createdAt)}</span>
        </div>
      </div>
      
      {/* Waiter Info */}
      {order.waiter && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-green-50 rounded-lg">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
            {order.waiter.name.charAt(0)}
          </div>
          <span className="text-sm text-green-700">Serveur: {order.waiter.name}</span>
        </div>
      )}
      
      {/* Items */}
      <div className="space-y-2 mb-4">
        {order.items.map(item => (
          <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {item.quantity}
              </span>
              <span className="font-medium text-gray-800">{item.menuItem.name}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Notes */}
      {order.notes && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">📝 {order.notes}</p>
        </div>
      )}
      
      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          {order.status === 'pending' && (
            <button
              onClick={() => handleStatusChange(order.id, 'preparing')}
              className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <ChefHat size={18} />
              Commencer
            </button>
          )}
          {order.status === 'preparing' && (
            <button
              onClick={() => handleStatusChange(order.id, 'ready')}
              className="flex-1 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Prêt
            </button>
          )}
          {order.status === 'ready' && (
            <button
              onClick={() => handleStatusChange(order.id, order.type === 'delivery' ? 'delivered' : 'served')}
              className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
            >
              {order.type === 'delivery' ? <Truck size={18} /> : <UtensilsCrossed size={18} />}
              {order.type === 'delivery' ? 'Envoyé' : 'Servi'}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 font-serif">Cuisine</h1>
          <p className="text-amber-700 mt-1">Gestion des commandes en cuisine</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-xl">
            <AlertCircle size={18} className="text-yellow-600" />
            <span className="font-medium text-yellow-700">{pendingOrders.length} en attente</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-xl">
            <ChefHat size={18} className="text-blue-600" />
            <span className="font-medium text-blue-700">{preparingOrders.length} en préparation</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-xl">
            <Check size={18} className="text-green-600" />
            <span className="font-medium text-green-700">{readyOrders.length} prêts</span>
          </div>
        </div>
      </div>
      
      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded-xl">
            <AlertCircle size={20} />
            <h2 className="font-bold">En attente ({pendingOrders.length})</h2>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {pendingOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </AnimatePresence>
            {pendingOrders.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <AlertCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p>Aucune commande en attente</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Preparing */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl">
            <ChefHat size={20} />
            <h2 className="font-bold">En préparation ({preparingOrders.length})</h2>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {preparingOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </AnimatePresence>
            {preparingOrders.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <ChefHat size={48} className="mx-auto mb-2 opacity-50" />
                <p>Aucune commande en préparation</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Ready */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl">
            <Check size={20} />
            <h2 className="font-bold">Prêts ({readyOrders.length})</h2>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {readyOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </AnimatePresence>
            {readyOrders.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Check size={48} className="mx-auto mb-2 opacity-50" />
                <p>Aucune commande prête</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
