import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, 
  Search, 
  Filter, 
  Check, 
  AlertCircle, 
  CreditCard, 
  Banknote, 
  X, 
  Printer,
  Edit,
  Save,
  Minus,
  Plus,
  ShoppingCart,
  Lock
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Order, PaymentStatus, OrderItem, MenuItem } from '../types';

export default function Invoices() {
  const { orders, updatePaymentStatus, updateOrderStatus, updateOrder, currentUser, menuItems } = useStore();
  const [filter, setFilter] = useState<'all' | PaymentStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  
  // Check if user can modify prices (only admin and manager)
  const canModifyPrices = currentUser && ['admin', 'manager'].includes(currentUser.role);
  
  // Check if user can edit invoices
  // Cashier can only edit unpaid invoices or paid invoices less than 1 hour old
  // Admin and manager can edit any invoice
  const canEditInvoice = (order: Order) => {
    if (!currentUser) return false;
    
    // Admin and manager can always edit
    if (['admin', 'manager'].includes(currentUser.role)) {
      return true;
    }
    
    // Cashier can edit unpaid invoices
    if (currentUser.role === 'cashier') {
      if (order.paymentStatus === 'unpaid') {
        return true;
      }
      
      // Cashier can edit paid invoices only if less than 1 hour old
      if (order.paymentStatus === 'paid') {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const orderTime = new Date(order.updatedAt).getTime();
        return orderTime > oneHourAgo;
      }
    }
    
    return false;
  };
  
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.paymentStatus === filter;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableNumber?.toString().includes(searchTerm) ||
      order.waiter?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  const unpaidTotal = orders
    .filter(o => o.paymentStatus === 'unpaid')
    .reduce((sum, o) => sum + o.total, 0);
  
  const paidTotal = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);
  
  const handlePayment = (orderId: string) => {
    updatePaymentStatus(orderId, 'paid');
    updateOrderStatus(orderId, 'completed');
    setSelectedOrder(null);
  };
  
  const handleEditInvoice = (order: Order) => {
    setSelectedOrder(null);
    setEditingOrder(order);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-amber-900 font-serif">Factures</h1>
        <p className="text-amber-700 mt-1">Gestion des paiements et factures</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{unpaidTotal.toLocaleString()} DH</p>
              <p className="text-gray-500 text-sm">Impayées ({orders.filter(o => o.paymentStatus === 'unpaid').length})</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
              <Check size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{paidTotal.toLocaleString()} DH</p>
              <p className="text-gray-500 text-sm">Payées ({orders.filter(o => o.paymentStatus === 'paid').length})</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
              <Receipt size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              <p className="text-gray-500 text-sm">Total factures</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher une facture ou serveur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'unpaid', 'paid'] as const).map(f => (
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
              {f === 'unpaid' && <AlertCircle size={18} />}
              {f === 'paid' && <Check size={18} />}
              <span>
                {f === 'all' && 'Toutes'}
                {f === 'unpaid' && 'Impayées'}
                {f === 'paid' && 'Gérées'}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Invoices List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedOrder(order)}
              className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 cursor-pointer hover:shadow-xl transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`
                    p-3 rounded-xl
                    ${order.paymentStatus === 'unpaid' ? 'bg-red-100 text-red-600' : ''}
                    ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : ''}
                    ${order.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-600' : ''}
                  `}>
                    <Receipt size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-900">
                        Facture #{order.id.slice(-4)}
                      </h3>
                      <span className={`
                        text-xs px-2 py-1 rounded-full
                        ${order.paymentStatus === 'unpaid' ? 'bg-red-100 text-red-700' : ''}
                        ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : ''}
                        ${order.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' : ''}
                      `}>
                        {order.paymentStatus === 'unpaid' && 'Non payée'}
                        {order.paymentStatus === 'paid' && (
                        <>
                          Payée ✓
                          {currentUser?.role === 'cashier' && (() => {
                            const oneHourAgo = Date.now() - (60 * 60 * 1000);
                            const orderTime = new Date(order.updatedAt).getTime();
                            if (orderTime > oneHourAgo) {
                              const minutesLeft = Math.ceil((orderTime - oneHourAgo) / 60000);
                              return <span className="ml-1 text-xs">({minutesLeft}min restantes)</span>;
                            }
                            return null;
                          })()}
                        </>
                      )}
                        {order.paymentStatus === 'partial' && 'Partielle'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {order.type === 'dine-in' && `Table ${order.tableNumber}`}
                      {order.type !== 'dine-in' && order.customerName}
                      {' • '}
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')} à {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {order.waiter && (
                      <p className="text-sm text-green-600 mt-1">
                        Serveur: {order.waiter.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-600">{order.total} DH</p>
                    <p className="text-sm text-gray-500">{order.items.length} article(s)</p>
                  </div>
                  
                  {/* Edit button */}
                  {canEditInvoice(order) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditInvoice(order);
                      }}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all"
                      title="Modifier la facture"
                    >
                      <Edit size={20} />
                    </button>
                  )}
                  
                  {order.paymentStatus === 'unpaid' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePayment(order.id);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2"
                    >
                      <CreditCard size={18} />
                      Payer
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Receipt size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-xl">Aucune facture trouvée</p>
          </div>
        )}
      </div>
      
      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">Facture #{selectedOrder.id.slice(-4)}</h2>
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${selectedOrder.paymentStatus === 'unpaid' ? 'bg-red-100 text-red-700' : ''}
                      ${selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : ''}
                    `}>
                      {selectedOrder.paymentStatus === 'paid' ? '✓ Payée' : 'Non payée'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')} à {new Date(selectedOrder.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X size={24} />
                </button>
              </div>
              
              {/* Restaurant Info */}
              <div className="text-center mb-6 pb-6 border-b border-dashed border-gray-300">
                <h3 className="text-xl font-bold text-amber-800 font-serif">Bab Al Fkamah</h3>
                <p className="text-gray-500 text-sm">Cuisine Yéménite & Émiratie</p>
                <p className="text-gray-400 text-xs mt-1">123 Rue Mohammed V, Casablanca</p>
              </div>
              
              {/* Customer Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-500">
                  {selectedOrder.type === 'dine-in' && `Table ${selectedOrder.tableNumber}`}
                  {selectedOrder.type === 'takeaway' && `À emporter - ${selectedOrder.customerName}`}
                  {selectedOrder.type === 'delivery' && `Livraison - ${selectedOrder.customerName}`}
                </p>
                {selectedOrder.waiter && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                      {selectedOrder.waiter.name.charAt(0)}
                    </span>
                    Serveur: {selectedOrder.waiter.name}
                  </p>
                )}
              </div>
              
              {/* Items */}
              <div className="space-y-3 mb-6">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <span className="font-medium text-gray-800">{item.quantity}x </span>
                      <span className="text-gray-600">{item.menuItem.name}</span>
                    </div>
                    <span className="font-medium text-gray-800">{item.price} DH</span>
                  </div>
                ))}
              </div>
              
              {/* Total */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-amber-600">{selectedOrder.total} DH</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                  <Printer size={18} />
                  Imprimer
                </button>
                {canEditInvoice(selectedOrder) && (
                  <button
                    onClick={() => handleEditInvoice(selectedOrder)}
                    className="flex-1 py-3 bg-blue-100 text-blue-600 rounded-xl font-medium hover:bg-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit size={18} />
                    Modifier
                  </button>
                )}
                {selectedOrder.paymentStatus === 'unpaid' && (
                  <button
                    onClick={() => handlePayment(selectedOrder.id)}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Banknote size={18} />
                    Encaisser
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Edit Invoice Modal */}
      <AnimatePresence>
        {editingOrder && (
          <EditInvoiceModal
            order={editingOrder}
            onClose={() => setEditingOrder(null)}
            updateOrder={updateOrder}
            menuItems={menuItems}
            canModifyPrices={canModifyPrices || false}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface EditInvoiceModalProps {
  order: Order;
  onClose: () => void;
  updateOrder: (orderId: string, items: OrderItem[], total: number) => void;
  menuItems: MenuItem[];
  canModifyPrices: boolean;
}

function EditInvoiceModal({ order, onClose, updateOrder, menuItems, canModifyPrices }: EditInvoiceModalProps) {
  const [items, setItems] = useState<OrderItem[]>(order.items);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = ['all', ...new Set(menuItems.map(m => m.category))];
  
  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems.filter(m => m.available)
    : menuItems.filter(m => m.category === selectedCategory && m.available);
  
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
  
  const updateItemPrice = (itemId: string, newPrice: number) => {
    if (!canModifyPrices) return;
    setItems(items.map(i => 
      i.id === itemId ? { ...i, price: newPrice } : i
    ));
  };
  
  const total = items.reduce((sum, i) => sum + i.price, 0);
  
  const handleSave = () => {
    if (items.length === 0) return;
    updateOrder(order.id, items, total);
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
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
          <div>
            <h2 className="text-2xl font-bold">Modifier Facture #{order.id.slice(-4)}</h2>
            <p className="text-blue-100 text-sm mt-1">
              {order.type === 'dine-in' ? `Table ${order.tableNumber}` : order.customerName}
              {order.waiter && ` • Serveur: ${order.waiter.name}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-100px)]">
          {/* Left: Menu */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-gray-100">
            {/* Permission Notice */}
            {!canModifyPrices && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-2">
                <Lock size={18} className="text-yellow-600" />
                <p className="text-sm text-yellow-700">
                  Seuls l'admin et le manager peuvent modifier les prix des articles
                </p>
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
                        ? 'bg-blue-500 text-white' 
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
                      ${cartItem ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                      {cartItem && (
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {cartItem.quantity}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                    <span className="text-blue-600 font-semibold text-sm">{item.price} DH</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Right: Invoice Items */}
          <div className="w-full lg:w-96 p-6 bg-gray-50 flex flex-col">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart size={20} />
              Articles de la facture
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-2">
              {items.map(item => (
                <div key={item.id} className="p-3 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-800 text-sm">{item.menuItem.name}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeItem(item.menuItem.id)}
                        className="w-7 h-7 bg-gray-100 hover:bg-red-100 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                      <button
                        onClick={() => addItem(item.menuItem)}
                        className="w-7 h-7 bg-gray-100 hover:bg-green-100 rounded-lg flex items-center justify-center text-gray-600 hover:text-green-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Price - Editable only for admin/manager */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {item.quantity} x {item.menuItem.price} DH
                    </span>
                    {canModifyPrices ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-right text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                        />
                        <span className="text-sm text-blue-600">DH</span>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-blue-600">{item.price} DH</span>
                    )}
                  </div>
                </div>
              ))}
              
              {items.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun article</p>
                </div>
              )}
            </div>
            
            {/* Total & Submit */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Total</span>
                <span className="text-2xl font-bold text-blue-600">{total} DH</span>
              </div>
              
              {/* Original vs New Total */}
              {total !== order.total && (
                <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-700">Ancien total:</span>
                    <span className="text-yellow-700 line-through">{order.total} DH</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-yellow-800">Différence:</span>
                    <span className={total > order.total ? 'text-red-600' : 'text-green-600'}>
                      {total > order.total ? '+' : ''}{total - order.total} DH
                    </span>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleSave}
                disabled={items.length === 0}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
