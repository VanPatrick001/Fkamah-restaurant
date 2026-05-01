import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  UtensilsCrossed, 
  Package, 
  Truck,
  X,
  Minus,
  ShoppingCart,
  Edit,
  Save,
  User
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Order, OrderType, MenuItem, OrderItem, User as UserType } from '../types';

export default function Orders() {
  const { orders, menuItems, addOrder, updateOrder, currentUser, users } = useStore();
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | OrderType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const activeStatuses: Order['status'][] = ['pending', 'preparing', 'ready', 'served', 'delivered'];

  // Get list of waiters for selection
  const waiters = users.filter(u => u.role === 'waiter' && u.active);
  
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all'
      || (filter === 'active' ? activeStatuses.includes(order.status) : order.type === filter);
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableNumber?.toString().includes(searchTerm) ||
      order.waiter?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  const getStatusLabel = (status: Order['status']) => {
    const labels: Record<Order['status'], string> = {
      pending: 'En attente',
      preparing: 'En préparation',
      ready: 'Prêt',
      served: 'Servi',
      delivered: 'Livré',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };
    return labels[status];
  };
  
  const getStatusColor = (status: Order['status']) => {
    const colors: Record<Order['status'], string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      preparing: 'bg-blue-100 text-blue-700',
      ready: 'bg-green-100 text-green-700',
      served: 'bg-purple-100 text-purple-700',
      delivered: 'bg-indigo-100 text-indigo-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status];
  };
  
  const canEditOrder = (order: Order) => {
    // Waiter, admin, and manager can edit orders that are not paid
    const editableRoles = ['waiter', 'admin', 'manager'];
    // Order can be edited as long as it's not paid
    const isNotPaid = order.paymentStatus !== 'paid';
    const isNotCancelled = order.status !== 'cancelled';
    return currentUser && 
           editableRoles.includes(currentUser.role) && 
           isNotPaid &&
           isNotCancelled;
  };
  
  const canCreateOrder = () => {
    // Waiter, admin, and manager can create orders
    const allowedRoles = ['waiter', 'admin', 'manager'];
    return currentUser && allowedRoles.includes(currentUser.role);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 font-serif">Commandes</h1>
          <p className="text-amber-700 mt-1">Gérez toutes les commandes du restaurant</p>
        </div>
        {canCreateOrder() && (
          <button
            onClick={() => setShowNewOrder(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
          >
            <Plus size={20} />
            Nouvelle commande
          </button>
        )}
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher une commande ou serveur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'dine-in', 'takeaway', 'delivery'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2
                ${filter === f 
                  ? 'bg-amber-500 text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-200'
                }
              `}
            >
              {f === 'all' && <Filter size={18} />}
              {f === 'active' && <ShoppingCart size={18} />}
              {f === 'dine-in' && <UtensilsCrossed size={18} />}
              {f === 'takeaway' && <Package size={18} />}
              {f === 'delivery' && <Truck size={18} />}
              <span className="hidden sm:inline">
                {f === 'all' && 'Toutes'}
                {f === 'active' && 'Actives'}
                {f === 'dine-in' && 'Sur place'}
                {f === 'takeaway' && 'À emporter'}
                {f === 'delivery' && 'Livraison'}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Orders List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`
                    p-3 rounded-xl
                    ${order.type === 'dine-in' ? 'bg-blue-100 text-blue-600' : ''}
                    ${order.type === 'takeaway' ? 'bg-purple-100 text-purple-600' : ''}
                    ${order.type === 'delivery' ? 'bg-red-100 text-red-600' : ''}
                  `}>
                    {order.type === 'dine-in' && <UtensilsCrossed size={24} />}
                    {order.type === 'takeaway' && <Package size={24} />}
                    {order.type === 'delivery' && <Truck size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-900">
                        {order.type === 'dine-in' && `Table ${order.tableNumber}`}
                        {order.type !== 'dine-in' && order.customerName}
                      </h3>
                      <span className="text-sm text-gray-500">#{order.id.slice(-4)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {order.items.length} article(s) • {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {order.type === 'delivery' && order.customerAddress && (
                      <p className="text-sm text-gray-400 mt-1 truncate max-w-md">{order.customerAddress}</p>
                    )}
                    {/* Waiter Info */}
                    {order.waiter && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                          {order.waiter.name.charAt(0)}
                        </div>
                        <span className="text-sm text-green-700 font-medium">
                          Serveur: {order.waiter.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-600">{order.total} DH</p>
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${order.paymentStatus === 'unpaid' ? 'bg-red-100 text-red-700' : ''}
                      ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : ''}
                      ${order.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' : ''}
                    `}>
                      {order.paymentStatus === 'unpaid' && 'Non payé'}
                      {order.paymentStatus === 'paid' && 'Payé'}
                      {order.paymentStatus === 'partial' && 'Partiel'}
                    </span>
                  </div>
                  <span className={`px-4 py-2 rounded-xl font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  {canEditOrder(order) && (
                    <button
                      onClick={() => setEditingOrder(order)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all"
                      title="Modifier la commande"
                    >
                      <Edit size={20} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Items Preview */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {order.items.map(item => (
                    <span key={item.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                      {item.quantity}x {item.menuItem.name}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <ShoppingCart size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-xl">Aucune commande trouvée</p>
          </div>
        )}
      </div>
      
      {/* New Order Modal */}
      <AnimatePresence>
        {showNewOrder && (
          <OrderModal 
            onClose={() => setShowNewOrder(false)} 
            menuItems={menuItems} 
            addOrder={addOrder}
            updateOrder={updateOrder}
            order={null}
            currentUser={currentUser}
            waiters={waiters}
          />
        )}
      </AnimatePresence>
      
      {/* Edit Order Modal */}
      <AnimatePresence>
        {editingOrder && (
          <OrderModal 
            onClose={() => setEditingOrder(null)} 
            menuItems={menuItems} 
            addOrder={addOrder}
            updateOrder={updateOrder}
            order={editingOrder}
            currentUser={currentUser}
            waiters={waiters}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface OrderModalProps {
  onClose: () => void;
  menuItems: MenuItem[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (orderId: string, items: Order['items'], total: number) => void;
  order: Order | null;
  currentUser: UserType | null;
  waiters: UserType[];
}

function OrderModal({ onClose, menuItems, addOrder, updateOrder, order, currentUser, waiters }: OrderModalProps) {
  const isEditing = order !== null;
  const [orderType, setOrderType] = useState<OrderType>(order?.type || 'dine-in');
  const [tableNumber, setTableNumber] = useState(order?.tableNumber || 1);
  const [customerName, setCustomerName] = useState(order?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(order?.customerPhone || '');
  const [customerAddress, setCustomerAddress] = useState(order?.customerAddress || '');
  const [items, setItems] = useState<OrderItem[]>(order?.items || []);
  const [notes, setNotes] = useState(order?.notes || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Waiter selection - default to current user if they are a waiter, or first waiter
  const [selectedWaiterId, setSelectedWaiterId] = useState<string>(
    order?.waiter?.id || 
    (currentUser?.role === 'waiter' ? currentUser.id : waiters[0]?.id || '')
  );
  
  const categories = ['all', ...new Set(menuItems.map(m => m.category))];
  
  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems.filter(m => m.available)
    : menuItems.filter(m => m.category === selectedCategory && m.available);
  
  const selectedWaiter = waiters.find(w => w.id === selectedWaiterId) || 
    (currentUser?.role === 'waiter' ? currentUser : null);
  
  const addItem = (menuItem: MenuItem) => {
    const existing = items.find(i => i.menuItem.id === menuItem.id);
    if (existing) {
      setItems(items.map(i => 
        i.menuItem.id === menuItem.id 
          ? { ...i, quantity: i.quantity + 1, price: (i.quantity + 1) * menuItem.price }
          : i
      ));
    } else {
      setItems([...items, {
        id: `item-${Date.now()}`,
        menuItem,
        quantity: 1,
        price: menuItem.price,
      }]);
    }
  };
  
  const removeItem = (menuItemId: string) => {
    const existing = items.find(i => i.menuItem.id === menuItemId);
    if (existing && existing.quantity > 1) {
      setItems(items.map(i => 
        i.menuItem.id === menuItemId 
          ? { ...i, quantity: i.quantity - 1, price: (i.quantity - 1) * i.menuItem.price }
          : i
      ));
    } else {
      setItems(items.filter(i => i.menuItem.id !== menuItemId));
    }
  };
  
  const total = items.reduce((sum, i) => sum + i.price, 0);
  
  const handleSubmit = () => {
    if (items.length === 0) return;
    
    if (isEditing && order) {
      // Update existing order
      updateOrder(order.id, items, total);
    } else {
      // Create new order with waiter assigned
      addOrder({
        type: orderType,
        status: 'pending',
        paymentStatus: 'unpaid',
        items,
        total,
        tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
        customerName: orderType !== 'dine-in' ? customerName : undefined,
        customerPhone: orderType !== 'dine-in' ? customerPhone : undefined,
        customerAddress: orderType === 'delivery' ? customerAddress : undefined,
        notes: notes || undefined,
        waiter: selectedWaiter || undefined,
      });
    }
    
    onClose();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div>
            <h2 className="text-2xl font-bold">
              {isEditing ? `Modifier commande #${order.id.slice(-4)}` : 'Nouvelle commande'}
            </h2>
            {isEditing && order.waiter && (
              <p className="text-amber-100 text-sm mt-1">
                Serveur responsable: {order.waiter.name}
              </p>
            )}
            {!isEditing && selectedWaiter && (
              <p className="text-amber-100 text-sm mt-1">
                Serveur: {selectedWaiter.name}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-100px)]">
          {/* Left: Menu */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-gray-100">
            {/* Waiter Selection - Only for new orders and admin/manager */}
            {!isEditing && (currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User size={16} />
                  Serveur responsable
                </label>
                <select
                  value={selectedWaiterId}
                  onChange={e => setSelectedWaiterId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                >
                  {waiters.map(waiter => (
                    <option key={waiter.id} value={waiter.id}>
                      {waiter.name} {waiter.phone ? `(${waiter.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Show assigned waiter for waiters creating orders */}
            {!isEditing && currentUser?.role === 'waiter' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Serveur responsable</p>
                    <p className="font-bold text-green-800">{currentUser.name}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Order Type - Only for new orders */}
            {!isEditing && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de commande</label>
                <div className="flex gap-2">
                  {(['dine-in', 'takeaway', 'delivery'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={`
                        flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                        ${orderType === type 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {type === 'dine-in' && <><UtensilsCrossed size={18} /> Sur place</>}
                      {type === 'takeaway' && <><Package size={18} /> À emporter</>}
                      {type === 'delivery' && <><Truck size={18} /> Livraison</>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Customer Info - Only for new orders */}
            {!isEditing && orderType === 'dine-in' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de table</label>
                <select
                  value={tableNumber}
                  onChange={e => setTableNumber(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Table {i + 1}</option>
                  ))}
                </select>
              </div>
            )}
            
            {!isEditing && orderType !== 'dine-in' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom du client</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    placeholder="Nom complet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    placeholder="06XXXXXXXX"
                  />
                </div>
                {orderType === 'delivery' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse de livraison</label>
                    <textarea
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      placeholder="Adresse complète"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Category Filter */}
            <div className="mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                      ${selectedCategory === cat 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {cat === 'all' ? 'Tous' : cat}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="grid grid-cols-2 gap-2">
              {filteredMenuItems.map(item => {
                const cartItem = items.find(i => i.menuItem.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    className={`
                      p-3 rounded-xl text-left transition-all
                      ${cartItem ? 'bg-amber-100 border-2 border-amber-400' : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                      {cartItem && (
                        <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {cartItem.quantity}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                    <span className="text-amber-600 font-semibold text-sm">{item.price} DH</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Right: Cart */}
          <div className="w-full lg:w-96 p-6 bg-gray-50 flex flex-col">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart size={20} />
              {isEditing ? 'Articles de la commande' : 'Panier'}
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{item.menuItem.name}</p>
                    <p className="text-amber-600 font-semibold text-sm">{item.price} DH</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeItem(item.menuItem.id)}
                      className="w-8 h-8 bg-gray-100 hover:bg-red-100 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-600"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => addItem(item.menuItem)}
                      className="w-8 h-8 bg-gray-100 hover:bg-green-100 rounded-lg flex items-center justify-center text-gray-600 hover:text-green-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              {items.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Panier vide</p>
                </div>
              )}
            </div>
            
            {/* Notes */}
            {!isEditing && (
              <div className="mt-4">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Notes pour la cuisine..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  rows={2}
                />
              </div>
            )}
            
            {/* Total & Submit */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Total</span>
                <span className="text-2xl font-bold text-amber-600">{total} DH</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={items.length === 0}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isEditing ? (
                  <>
                    <Save size={20} />
                    Enregistrer les modifications
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Créer la commande
                  </>
                )}
              </button>
              {isEditing && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  La facture sera automatiquement mise à jour
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
