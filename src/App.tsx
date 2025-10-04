import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedAssistantRoute from './components/ProtectedAssistantRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Assistant from './pages/Assistant';
import { AnimatePresence, motion } from 'framer-motion';
import OrderValidation from './pages/OrderValidation';
import OrderValidationList from './pages/OrderValidationList'; // Import manquant
import Inventory from './pages/Inventory';

function AppContent() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="pt-0"
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* Routes de validation des commandes */}
            <Route path="/orders/validate" element={<OrderValidationList />} /> {/* Route manquante */}
            <Route path="/orders/:orderId/validate" element={<OrderValidation />} />
            <Route path="/assistant/inventory" element={<Inventory />} />

            <Route path="/admin" element={
              // <ProtectedAdminRoute>
                <Admin />
              // </ProtectedAdminRoute>
            } />
            
            <Route path="/assistant" element={
              // <ProtectedAssistantRoute>
                <Assistant />
              // </ProtectedAssistantRoute>
            } />
            
            {/* Route manquante pour /assistant/orders */}
            <Route path="/assistant/orders" element={
              // <ProtectedAssistantRoute>
                <Assistant />
              // </ProtectedAssistantRoute>
            } />
          </Routes>
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;