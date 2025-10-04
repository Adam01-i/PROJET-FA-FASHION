import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
// import ProtectedAdminRoute from './components/ProtectedAdminRoute';
// import ProtectedAssistantRoute from './components/ProtectedAssistantRoute';
// import Navbar from './components/home/Navbar';
import Home from './components/home/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Cart from './components/home/Cart';
import Admin from './components/admin/AdminContent';
import Assistant from './pages/Assistant';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider } from './hooks/ToastProvider';
// import ProtectedAdminRoute from './components/security/ProtectedAdminRoute';
// import ProtectedAssistantRoute from './components/security/ProtectedAssistantRoute';


function AppContent() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastProvider>
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
            <Route path="/admin" element={
              // <ProtectedAdminRoute>
                <Admin />
              // </ProtectedAdminRoute> 
              }/>
            <Route path="/assistant" element={
              //  <ProtectedAssistantRoute>
                <Assistant />
              //  </ProtectedAssistantRoute>
            } />
          </Routes>
        </motion.main>
      </AnimatePresence>
      </ToastProvider>
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