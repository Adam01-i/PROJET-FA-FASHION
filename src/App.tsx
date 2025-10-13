import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "./lib/supabase";

// Contextes ou hooks globaux
import { CartProvider } from "./contexts/CartContext";
import { ToastProvider } from "./hooks/ToastProvider";

// Layouts
import Navbar from "./components/home/Navbar";
import Home from "./components/home/Home";
import Cart from "./components/home/Cart";
import Footer from "./components/home/Footer";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import Admin from "./components/admin/AdminLayout";
import Assistant from "./components/assistant/AssistantLayout";

// ========================
// 🧱 Layouts de base
// ========================

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <div className="pt-16">{children}</div>
      <Footer />
    </div>
  );
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      {children}
    </div>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="">
      {children}
    </div>
  );
}

// ========================
// 🔐 AuthHandler global
// ========================

function AuthHandler() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Vérification de la session...");

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        // Aucun utilisateur → rediriger vers login
        if (!user) {
          setStatus("Aucune session trouvée. Redirection...");
          setTimeout(() => navigate("/login", { replace: true }), 1500);
          return;
        }

        // Récupération du rôle depuis la table "profiles"
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error || !profile?.role) {
          console.error("Erreur profil:", error);
          setStatus("Erreur profil. Redirection...");
          setTimeout(() => navigate("/", { replace: true }), 1500);
          return;
        }

        const role = profile.role;
        setStatus(`Redirection vers votre espace ${role}...`);

        switch (role) {
          case "admin":
            navigate("/admin", { replace: true });
            break;
          case "assistant":
            navigate("/assistant", { replace: true });
            break;
          default:
            navigate("/", { replace: true });
            break;
        }
      } catch (err) {
        console.error("Erreur auth:", err);
        setStatus("Erreur interne. Redirection...");
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Authentification
        </h2>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}

// ========================
// 🧭 Routes principales
// ========================

function AppContent() {
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérification session Supabase au chargement
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(data?.role || "client");
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Chargement...</p>
      </div>
    );

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
            {/* Accueil */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              }
            />

            {/* Auth */}
            <Route
              path="/login"
              element={
                user ? <Navigate to="/" replace /> : (
                  <AuthLayout>
                    <Login />
                  </AuthLayout>
                )
              }
            />
            <Route
              path="/register"
              element={
                user ? <Navigate to="/" replace /> : (
                  <AuthLayout>
                    <Register />
                  </AuthLayout>
                )
              }
            />
            <Route
              path="/auth/callback"
              element={
                <AuthLayout>
                  <AuthHandler />
                </AuthLayout>
              }
            />

            {/* Panier (clients uniquement) */}
            <Route
              path="/cart"
              element={
                role === "client" ? (
                  <PublicLayout>
                    <Cart />
                  </PublicLayout>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* ADMIN */}
            <Route
              path="/admin/*"
              element={
                role === "admin" ? (
                  <ProtectedLayout>
                    <Admin />
                  </ProtectedLayout>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* ASSISTANT */}
            <Route
              path="/assistant/*"
              element={
                role === "assistant" ? (
                  <ProtectedLayout>
                    <Assistant />
                  </ProtectedLayout>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* Catch-all */}
            <Route
              path="*"
              element={
                <Navigate
                  to={
                    role === "admin"
                      ? "/admin"
                      : role === "assistant"
                      ? "/assistant"
                      : "/"
                  }
                  replace
                />
              }
            />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </ToastProvider>
  );
}

// ========================
// 🌐 Application racine
// ========================

function App() {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
}

export default App;
