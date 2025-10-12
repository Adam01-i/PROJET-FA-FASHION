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
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Cart from "./components/home/Cart";
import Admin from "./components/admin/AdminLayout";
import Assistant from "./components/assistant/Assistant";
import { AnimatePresence, motion } from "framer-motion";
import { ToastProvider } from "./hooks/ToastProvider";
import { ProtectedRoute, PublicOnlyRoute } from "./components/security/AuthRoutes";

// Layout pour les routes publiques (avec navbar)
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <div className="pt-16">
        {children}
      </div>
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
            {/* Routes publiques avec navbar */}
            <Route path="/" element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            } />
            
            {/* Routes d'authentification sans navbar */}
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
            
            {/* Route panier protégée avec navbar */}
            <Route path="/cart" element={
              <ProtectedRoute>
                <PublicLayout>
                  <Cart />
                </PublicLayout>
              </ProtectedRoute>
            } />

            {/* Routes protégées sans navbar */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProtectedLayout>
                    <Admin />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/assistant"
              element={
                <ProtectedRoute requiredRole="assistant">
                  <ProtectedLayout>
                    <Assistant />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            {/* Route de fallback */}
            <Route path="*" element={
              <PublicLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-lg text-gray-600">Page non trouvée</p>
                  </div>
                </div>
              </PublicLayout>
            } />
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