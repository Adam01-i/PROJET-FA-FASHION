import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, 
  User, 
  Home, 
  LogOut, 
  Search, 
  Menu, 
  X,
  Shield,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, userRole, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="h-8 w-8 text-white group-hover:text-indigo-200 transition-colors" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
              K-Shop
            </span>
          </Link>

          {/* Barre de recherche - Desktop */}
          <div className="hidden lg:block flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full h-12 pl-12 pr-4 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm placeholder-white/70 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
            </form>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Panier */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/cart" 
                className="relative p-2 hover:bg-white/20 rounded-full transition-all duration-300 group"
              >
                <ShoppingCart className="h-6 w-6 text-white group-hover:text-indigo-200 transition-colors" />
                {itemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* Navigation selon le rôle */}
            {userRole === 'admin' && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/admin"
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isActiveRoute('/admin') 
                      ? 'bg-white/30 text-white' 
                      : 'hover:bg-white/20 text-white/90'
                  }`}
                >
                  <Shield className="h-6 w-6" />
                </Link>
              </motion.div>
            )}

            {userRole === 'assistant' && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/assistant"
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isActiveRoute('/assistant') 
                      ? 'bg-white/30 text-white' 
                      : 'hover:bg-white/20 text-white/90'
                  }`}
                >
                  <Users className="h-6 w-6" />
                </Link>
              </motion.div>
            )}

            {/* Utilisateur connecté */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-white font-medium">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="p-2 hover:bg-white/20 rounded-full transition-all duration-300 group"
                  title="Déconnexion"
                >
                  <LogOut className="h-6 w-6 text-white group-hover:text-red-200 transition-colors" />
                </motion.button>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/login"
                  className="p-2 hover:bg-white/20 rounded-full transition-all duration-300 group"
                >
                  <User className="h-6 w-6 text-white group-hover:text-indigo-200 transition-colors" />
                </Link>
              </motion.div>
            )}

            {/* Menu mobile */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-white/20 rounded-full transition-all duration-300 lg:hidden"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X className="h-6 w-6 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Menu className="h-6 w-6 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Menu mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/20 bg-indigo-700/95 backdrop-blur-sm"
            >
              <div className="px-4 py-4 space-y-4">
                {/* Barre de recherche mobile */}
                <form onSubmit={handleSearch} className="flex space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher..."
                      className="w-full h-10 pl-10 pr-4 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm placeholder-white/70 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                  </div>
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-full bg-white/20 text-white font-medium hover:bg-white/30 transition-colors"
                  >
                    OK
                  </button>
                </form>

                {/* Liens de navigation mobile */}
                <div className="flex flex-col space-y-2">
                  {user && (
                    <div className="px-3 py-2 text-white/80 text-sm">
                      Connecté en tant que: {user.email}
                    </div>
                  )}
                  
                  {userRole === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Shield className="h-5 w-5" />
                      <span>Administration</span>
                    </Link>
                  )}
                  
                  {userRole === 'assistant' && (
                    <Link
                      to="/assistant"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Users className="h-5 w-5" />
                      <span>Assistant</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}