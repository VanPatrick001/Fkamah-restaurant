import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Check, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Table } from '../types';

export default function Tables() {
  const { tables, orders, updateTableStatus } = useStore();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  
  const getTableOrder = (tableNumber: number) => {
    return orders.find(o => 
      o.type === 'dine-in' && 
      o.tableNumber === tableNumber && 
      !['completed', 'cancelled'].includes(o.status)
    );
  };
  
  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'from-green-400 to-green-500';
      case 'occupied': return 'from-red-400 to-red-500';
      case 'reserved': return 'from-yellow-400 to-yellow-500';
    }
  };
  
  const getStatusLabel = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'occupied': return 'Occupée';
      case 'reserved': return 'Réservée';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 font-serif">Tables</h1>
          <p className="text-amber-700 mt-1">Gestion des tables du restaurant</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-xl">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="font-medium text-green-700">
              {tables.filter(t => t.status === 'available').length} libres
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-xl">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="font-medium text-red-700">
              {tables.filter(t => t.status === 'occupied').length} occupées
            </span>
          </div>
        </div>
      </div>
      
      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map((table, index) => {
          const order = getTableOrder(table.number);
          const isOccupied = !!order;
          
          return (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedTable(table)}
              className="cursor-pointer"
            >
              <div className={`
                relative p-6 rounded-2xl bg-gradient-to-br ${getStatusColor(isOccupied ? 'occupied' : table.status)}
                shadow-lg hover:shadow-xl transition-all hover:scale-105
              `}>
                {/* Table Number */}
                <div className="text-center">
                  <span className="text-4xl font-bold text-white">{table.number}</span>
                  <div className="flex items-center justify-center gap-1 mt-2 text-white/80">
                    <Users size={16} />
                    <span className="text-sm">{table.seats} places</span>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="absolute -top-2 -right-2 px-2 py-1 bg-white rounded-full shadow-md">
                  <span className={`
                    text-xs font-medium
                    ${isOccupied ? 'text-red-600' : ''}
                    ${!isOccupied && table.status === 'available' ? 'text-green-600' : ''}
                    ${!isOccupied && table.status === 'reserved' ? 'text-yellow-600' : ''}
                  `}>
                    {isOccupied ? 'Occupée' : getStatusLabel(table.status)}
                  </span>
                </div>
                
                {/* Order Info */}
                {order && (
                  <div className="mt-4 p-2 bg-white/20 rounded-xl">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm font-medium">{order.total} DH</span>
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full
                        ${order.status === 'pending' ? 'bg-yellow-400 text-yellow-900' : ''}
                        ${order.status === 'preparing' ? 'bg-blue-400 text-blue-900' : ''}
                        ${order.status === 'ready' ? 'bg-green-400 text-green-900' : ''}
                        ${order.status === 'served' ? 'bg-purple-400 text-purple-900' : ''}
                      `}>
                        {order.status === 'pending' && 'Attente'}
                        {order.status === 'preparing' && 'Cuisine'}
                        {order.status === 'ready' && 'Prêt'}
                        {order.status === 'served' && 'Servi'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Table Detail Modal */}
      {selectedTable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedTable(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Table {selectedTable.number}</h2>
              <button onClick={() => setSelectedTable(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <Users size={24} className="text-amber-600" />
                <div>
                  <p className="font-medium text-gray-900">{selectedTable.seats} places</p>
                  <p className="text-sm text-gray-500">Capacité de la table</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className={`w-4 h-4 rounded-full ${selectedTable.status === 'available' ? 'bg-green-500' : selectedTable.status === 'occupied' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <div>
                  <p className="font-medium text-gray-900">{getStatusLabel(selectedTable.status)}</p>
                  <p className="text-sm text-gray-500">État actuel</p>
                </div>
              </div>
              
              {getTableOrder(selectedTable.number) && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="font-medium text-amber-800 mb-2">Commande en cours</p>
                  <div className="space-y-1">
                    {getTableOrder(selectedTable.number)?.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.quantity}x {item.menuItem.name}</span>
                        <span className="text-amber-600 font-medium">{item.price} DH</span>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-amber-200 flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-amber-600">{getTableOrder(selectedTable.number)?.total} DH</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {selectedTable.status !== 'occupied' && (
                  <>
                    <button
                      onClick={() => {
                        updateTableStatus(selectedTable.id, 'available');
                        setSelectedTable({ ...selectedTable, status: 'available' });
                      }}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${selectedTable.status === 'available' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-100'}`}
                    >
                      <Check size={18} />
                      Libre
                    </button>
                    <button
                      onClick={() => {
                        updateTableStatus(selectedTable.id, 'reserved');
                        setSelectedTable({ ...selectedTable, status: 'reserved' });
                      }}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${selectedTable.status === 'reserved' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-yellow-100'}`}
                    >
                      <Clock size={18} />
                      Réserver
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
