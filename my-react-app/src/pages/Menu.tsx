import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, X, UtensilsCrossed, Check, XCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { MenuItem } from '../types';

export default function Menu() {
  const { menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const categoryNames = ['all', ...categories.map(cat => cat.name)];
  
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowModal(true);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      deleteMenuItem(id);
    }
  };
  
  const handleToggleAvailability = (item: MenuItem) => {
    updateMenuItem(item.id, { available: !item.available });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 font-serif">Menu</h1>
          <p className="text-amber-700 mt-1">Gérez les plats et boissons du restaurant</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
        >
          <Plus size={20} />
          Ajouter un plat
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un plat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categoryNames.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap
                ${selectedCategory === cat 
                  ? 'bg-amber-500 text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-200'
                }
              `}
            >
              {cat === 'all' ? 'Tous' : cat}
            </button>
          ))}
        </div>
      </div>
      
      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl p-5 shadow-lg border border-amber-100 ${!item.available ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                  {item.category}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className={`p-2 rounded-lg transition-all ${item.available ? 'hover:bg-red-100 text-green-600' : 'hover:bg-green-100 text-red-600'}`}
                  >
                    {item.available ? <Check size={16} /> : <XCircle size={16} />}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-all"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-amber-600">{item.price} DH</span>
                <span className={`text-xs px-2 py-1 rounded-full ${item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.available ? 'Disponible' : 'Indisponible'}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <UtensilsCrossed size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">Aucun plat trouvé</p>
        </div>
      )}
      
      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <MenuItemModal
            item={editingItem}
            categories={categoryNames.filter(name => name !== 'all')}
            onClose={() => { setShowModal(false); setEditingItem(null); }}
            onSave={(data) => {
              if (editingItem) {
                updateMenuItem(editingItem.id, data);
              } else {
                addMenuItem(data as Omit<MenuItem, 'id'>);
              }
              setShowModal(false);
              setEditingItem(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface MenuItemModalProps {
  item: MenuItem | null;
  categories: string[];
  onClose: () => void;
  onSave: (data: Partial<MenuItem>) => void;
}

function MenuItemModal({ item, categories, onClose, onSave }: MenuItemModalProps) {
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [price, setPrice] = useState(item?.price?.toString() || '');
  const [category, setCategory] = useState(item?.category || categories[0] || 'Plats');
  const [available, setAvailable] = useState(item?.available ?? true);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      price: parseFloat(price),
      category,
      available,
    });
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
        className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {item ? 'Modifier le plat' : 'Nouveau plat'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              rows={3}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix (DH)</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="available"
              checked={available}
              onChange={e => setAvailable(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
            />
            <label htmlFor="available" className="text-sm font-medium text-gray-700">Disponible</label>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all"
          >
            {item ? 'Enregistrer' : 'Ajouter'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
