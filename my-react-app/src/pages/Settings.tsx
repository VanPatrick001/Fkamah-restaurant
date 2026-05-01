import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Clock, Bell, Printer, Save, Globe, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Settings() {
  const { currentUser, changePassword } = useStore();
  const [restaurantName, setRestaurantName] = useState('Bab Al Fkamah');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [address, setAddress] = useState('123 Rue Mohammed V, Casablanca');
  const [phone, setPhone] = useState('+212 5XX-XXXXXX');
  const [openTime, setOpenTime] = useState('11:00');
  const [closeTime, setCloseTime] = useState('23:00');
  const [currency, setCurrency] = useState('DH');
  const [language, setLanguage] = useState('fr');
  const [notifications, setNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoPrint, setAutoPrint] = useState(false);
  
  const handleSave = () => {
    // Save settings logic here
    alert('Paramètres enregistrés avec succès!');
  };

  const handlePasswordChange = async () => {
    if (!currentUser) {
      setPasswordMessage('Vous devez être connecté pour changer votre mot de passe.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    const success = await changePassword(currentUser.id, oldPassword || undefined, newPassword);
    setPasswordMessage(success ? 'Mot de passe mis à jour.' : 'Impossible de mettre à jour le mot de passe.');
    if (success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };
  
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-amber-900 font-serif">Paramètres</h1>
        <p className="text-amber-700 mt-1">Configuration du système</p>
      </div>
      
      {/* Restaurant Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
            <Store size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Informations du restaurant</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom du restaurant</label>
            <input
              type="text"
              value={restaurantName}
              onChange={e => setRestaurantName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>
        </div>
      </motion.div>
      
      {/* Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
            <Clock size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Horaires d'ouverture</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ouverture</label>
            <input
              type="time"
              value={openTime}
              onChange={e => setOpenTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fermeture</label>
            <input
              type="time"
              value={closeTime}
              onChange={e => setCloseTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>
        </div>
      </motion.div>
      
      {/* Regional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
            <Globe size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Régional</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="DH">Dirham (DH)</option>
              <option value="€">Euro (€)</option>
              <option value="$">Dollar ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="fr">Français</option>
              <option value="ar">Arabe</option>
              <option value="en">Anglais</option>
            </select>
          </div>
        </div>
      </motion.div>
      
      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white">
            <Bell size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Notifications push</p>
              <p className="text-sm text-gray-500">Recevoir des alertes pour les nouvelles commandes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={e => setNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Alertes sonores</p>
              <p className="text-sm text-gray-500">Jouer un son pour les nouvelles commandes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={e => setSoundAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      </motion.div>
      
      {/* Printing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white">
            <Printer size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Impression</h2>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium text-gray-900">Impression automatique</p>
            <p className="text-sm text-gray-500">Imprimer automatiquement les tickets de cuisine</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoPrint}
              onChange={e => setAutoPrint(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>
      </motion.div>

      {/* Password update */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Changer le mot de passe</h2>
            <p className="text-sm text-gray-500">Permet à l'utilisateur connecté de mettre à jour son mot de passe.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ancien mot de passe</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>
        </div>

        {passwordMessage && (
          <p className="text-sm text-green-700 mt-4">{passwordMessage}</p>
        )}

        <button
          onClick={handlePasswordChange}
          className="mt-6 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-all"
        >
          Mettre à jour le mot de passe
        </button>
      </motion.div>
      
      {/* Save Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={handleSave}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg flex items-center justify-center gap-2"
      >
        <Save size={20} />
        Enregistrer les paramètres
      </motion.button>
    </div>
  );
}
