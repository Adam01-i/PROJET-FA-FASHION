import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

import Navbar from "./components/home/Navbar";
import Home from "./components/home/Home";
import Cart from "./components/home/Cart";
import Footer from "./components/home/Footer"

import { 
  ProtectedRoute, 
  PublicOnlyRoute, 
  PublicRoute, 
  RoleBasedRedirect 
} from "./security";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import Admin from "./components/admin/AdminLayout";
import Assistant from "./components/assistant/AssistantLayout";

import { AnimatePresence, motion } from "framer-motion";
import { ToastProvider } from "./hooks/ToastProvider";

// Layout pour les routes publiques (avec navbar)
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <div className="pt-16">
        {children}
      </div>
      <Footer />
    </div>
  );
}

// Layout pour les routes protégées (sans navbar)
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      {children}
    </div>
  );
}

// Layout pour l'authentification (sans navbar, fond spécial)
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {children}
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  
  return (
    <ToastProvider>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Routes location={location}>
            {/* Route d'accueil - Avec restriction IMMÉDIATE pour admins/assistants */}
            <Route path="/" element={
              <PublicRoute>
                <PublicLayout>
                  <Home />
                </PublicLayout>
              </PublicRoute>
            } />
            
            {/* Routes d'authentification sans navbar - Uniquement non connectés */}
            <Route path="/login" element={
              <PublicOnlyRoute>
                <AuthLayout>
                  <Login />
                </AuthLayout>
              </PublicOnlyRoute>
            } />
            
            <Route path="/register" element={
              <PublicOnlyRoute>
                <AuthLayout>
                  <Register />
                </AuthLayout>
              </PublicOnlyRoute>
            } />
            
            {/* Route panier - Uniquement clients connectés */}
            <Route path="/cart" element={
              <ProtectedRoute requiredRole="client">
                <PublicLayout>
                  <Cart />
                </PublicLayout>
              </ProtectedRoute>
            } />

            {/* Routes ADMIN - Strictement réservées aux admins */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProtectedLayout>
                    <Admin />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Routes ASSISTANT - Strictement réservées aux assistants */}
            <Route
              path="/assistant/*"
              element={
                <ProtectedRoute requiredRole="assistant">
                  <ProtectedLayout>
                    <Assistant />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            {/* Route de fallback - Redirection IMMÉDIATE selon le rôle */}
            <Route path="*" element={<RoleBasedRedirect />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </ToastProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;