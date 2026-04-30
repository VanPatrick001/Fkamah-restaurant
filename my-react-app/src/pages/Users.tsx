import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, X, Users as UsersIcon, Mail, Phone, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { User, UserRole } from '../types';

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  cook: 'Cuisinier',
  waiter: 'Serveur',
  cashier: 'Caissier',
  delivery: 'Livreur',
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-500',
  manager: 'bg-blue-500',
  cook: 'bg-orange-500',
  waiter: 'bg-green-500',
  cashier: 'bg-yellow-500',
  delivery: 'bg-red-500',
};

export default function Users() {
  const { users, addUser, updateUser, deleteUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });
  
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUser(id);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 font-serif">Utilisateurs</h1>
          <p className="text-amber-700 mt-1">Gérez l'équipe du restaurant</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
        >
          <Plus size={20} />
          Ajouter un utilisateur
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {(Object.keys(roleLabels) as UserRole[]).map(role => (
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-lg border border-amber-100"
          >
            <div className={`w-10 h-10 rounded-lg ${roleColors[role]} flex items-center justify-center text-white mb-2`}>
              <Shield size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {users.filter(u => u.role === role).length}
            </p>
            <p className="text-sm text-gray-500">{roleLabels[role]}s</p>
          </motion.div>
        ))}
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedRole('all')}
            className={`
              px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap
              ${selectedRole === 'all' 
                ? 'bg-amber-500 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-200'
              }
            `}
          >
            Tous
          </button>
          {(Object.keys(roleLabels) as UserRole[]).map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`
                px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap
                ${selectedRole === role 
                  ? 'bg-amber-500 text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-200'
                }
              `}
            >
              {roleLabels[role]}
            </button>
          ))}
        </div>
      </div>
      
      {/* Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-5 shadow-lg border border-amber-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${roleColors[user.role]} flex items-center justify-center text-white font-bold text-lg`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{user.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[user.role]} text-white`}>
                      {roleLabels[user.role]}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-all"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-sm truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className={`text-xs px-2 py-1 rounded-full ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {user.active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <UsersIcon size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">Aucun utilisateur trouvé</p>
        </div>
      )}
      
      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <UserModal
            user={editingUser}
            onClose={() => { setShowModal(false); setEditingUser(null); }}
            onSave={(data) => {
              if (editingUser) {
                updateUser(editingUser.id, data);
              } else {
                addUser(data as Omit<User, 'id'>);
              }
              setShowModal(false);
              setEditingUser(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface UserModalProps {
  user: User | null;
  onClose: () => void;
  onSave: (data: Partial<User>) => void;
}

function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [role, setRole] = useState<UserRole>(user?.role || 'waiter');
  const [active, setActive] = useState(user?.active ?? true);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      email,
      phone,
      role,
      active,
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
            {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              {(Object.keys(roleLabels) as UserRole[]).map(r => (
                <option key={r} value={r}>{roleLabels[r]}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">Compte actif</label>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all"
          >
            {user ? 'Enregistrer' : 'Ajouter'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
