import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Contextes et hooks globaux
import { CartProvider } from "./contexts/CartContext";
import { ToastProvider } from "./hooks/ToastProvider";
import { FavoritesProvider } from "./hooks/FavoritesContext";

// Auth
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import RoleGuard from "./components/auth/RoleGuard";

// Layouts
import ClientLayout from "./components/client/ClientLayout";
import AdminLayout from "./components/admin/AdminLayout";
import AssistantLayout from "./components/assistant/AssistantLayout";
// import LivreurLayout from "./components/livreur/LivreurLayout";


// Pages Client
import ClientHome from "./components/client/Views/ClientHome";
import ClientCart from "./components/client/Cart/ClientCart";
import ClientOrders from "./components/client/Orders/ClientOrders";
import ClientWishlist from "./components/client/Wishlist/ClientWishlist";
import DeliveryLayout from "./components/livreur/DeliveryLayout";

// ========================
// 🧱 Layouts de base
// ========================

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="">{children}</div>;
}

// ========================
// 🧭 Routes principales
// ========================

function AppContent() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Routes location={location}>
          {/* 🔐 Auth publique */}
          <Route
            path="/login"
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            }
          />
          <Route
            path="/register"
            element={
              <AuthLayout>
                <Register />
              </AuthLayout>
            }
          />

          {/* 👤 Interface Client (publique + clients connectés) */}
          <Route
            path="/"
            element={
              <RoleGuard allowedRole="client">
                <ClientLayout />
              </RoleGuard>
            }
          >
            <Route index element={<ClientHome />} />
            <Route path="cart" element={<ClientCart />} />
          </Route>

          <Route
            path="/orders"
            element={
              <RoleGuard allowedRole="client">
                <ClientLayout />
              </RoleGuard>
            }
          >
            <Route index element={<ClientOrders />} />
          </Route>

          <Route
            path="/wishlist"
            element={
              <RoleGuard allowedRole="client">
                <ClientLayout />
              </RoleGuard>
            }
          >
            <Route index element={<ClientWishlist />} />
          </Route>

          {/* 🛠️ Interface Assistant */}
          <Route
            path="/assistant/*"
            element={
              <RoleGuard allowedRole="assistant">
                <AssistantLayout />
              </RoleGuard>
            }
          >
            {/* Les routes assistant seront définies dans AssistantLayout */}
          </Route>

          {/* 🚚 Interface Livreur */}
          <Route
            path="/delivery/*"
            element={
              <RoleGuard allowedRole="livreur">
                <DeliveryLayout />
              </RoleGuard>
            }
          >
            {/* Les routes livreur seront définies dans LivreurLayout */}
          </Route>

          {/* ⚡ Interface Admin */}
          <Route
            path="/admin/*"
            element={
              <RoleGuard allowedRole="admin">
                <AdminLayout />
              </RoleGuard>
            }
          >
            {/* Les routes admin seront définies dans AdminLayout */}
          </Route>

          {/* Catch-all - Redirection vers la page d'accueil */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

// ========================
// 🌐 Application racine
// ========================

function App() {
  return (
    <ToastProvider>
      <FavoritesProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </FavoritesProvider>
    </ToastProvider>
  );
}

export default App;