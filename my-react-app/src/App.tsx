import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Kitchen from './pages/Kitchen';
import Tables from './pages/Tables';
import Delivery from './pages/Delivery';
import Invoices from './pages/Invoices';
import Menu from './pages/Menu';
import Users from './pages/Users';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
}

function App() {
  const initializeApp = useStore(state => state.initializeApp);
  const currentUser = useStore(state => state.currentUser);
  const loadOrders = useStore(state => state.loadOrders);
  const loadTables = useStore(state => state.loadTables);
  const loadNotifications = useStore(state => state.loadNotifications);

  useEffect(() => {
    void initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    let intervalId: number | undefined;
    if (currentUser) {
      intervalId = window.setInterval(() => {
        void Promise.all([loadOrders(), loadTables(), loadNotifications()]);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [currentUser, loadOrders, loadTables, loadNotifications]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/kitchen" element={<ProtectedRoute><Kitchen /></ProtectedRoute>} />
        <Route path="/tables" element={<ProtectedRoute><Tables /></ProtectedRoute>} />
        <Route path="/delivery" element={<ProtectedRoute><Delivery /></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
        <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
