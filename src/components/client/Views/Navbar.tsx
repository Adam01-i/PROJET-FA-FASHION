// components/client/Navbar.tsx
import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  User, 
  Home, 
  LogOut, 
  Search, 
  Menu, 
  X,
  // Heart,
  Package
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import ConfirmationModal from '../../../ui/ConfirmationModal';

export default function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [itemCount, setItemCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ✅ Récupérer l'utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    };
    fetchUser();

    // Écouter les changements d'authentification
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // ✅ Récupérer le nombre d'articles dans le panier depuis localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const count = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);
          setItemCount(count);
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
          setItemCount(0);
        }
      } else {
        setItemCount(0);
      }
    };

    // Mettre à jour initialement
    updateCartCount();

    // Écouter les changements de localStorage
    const handleStorageChange = () => {
      updateCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier régulièrement pour les changements dans le même onglet
    const interval = setInterval(updateCartCount, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Déconnexion Supabase
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setShowLogoutModal(false);
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSignOutClick = () => {
    setShowLogoutModal(true);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg backdrop-blur-md bg-opacity-95' 
          : 'bg-indigo-600'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Logo et menu mobile */}
            <div className="flex items-center space-x-4">
              {/* Bouton menu mobile */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg transition-all duration-300 lg:hidden ${
                  isScrolled 
                    ? 'hover:bg-indigo-50 text-indigo-600' 
                    : 'hover:bg-white hover:bg-opacity-20 text-white'
                }`}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {/* Logo */}
              <Link 
                to="/" 
                className="flex items-center space-x-3"
                onClick={handleNavClick}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  isScrolled ? 'bg-indigo-100' : 'bg-white bg-opacity-20'
                }`}>
                  <Home className={`h-6 w-6 ${
                    isScrolled ? 'text-indigo-600' : 'text-white'
                  }`} />
                </div>
                <span className={`text-xl sm:text-2xl font-bold ${
                  isScrolled ? 'text-indigo-600' : 'text-white'
                }`}>
                  Fa-Fashion
                </span>
              </Link>
            </div>

            {/* Barre de recherche - Desktop */}
            <div className="hidden lg:block flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un produit..."
                    className={`w-full h-10 pl-10 pr-4 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 ${
                      isScrolled
                        ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-200'
                        : 'bg-white bg-opacity-20 border-white border-opacity-30 text-white placeholder-white placeholder-opacity-80 focus:border-white focus:ring-white focus:ring-opacity-20 backdrop-blur-sm'
                    }`}
                  />
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                    isScrolled ? 'text-gray-400' : 'text-white'
                  }`} />
                </div>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-indigo-300 shadow-md"
                >
                  Rechercher
                </button>
              </form>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Barre de recherche - Mobile */}
              <div className="lg:hidden">
                <button
                  onClick={() => document.getElementById('mobile-search')?.focus()}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isScrolled 
                      ? 'hover:bg-indigo-50 text-indigo-600' 
                      : 'hover:bg-white hover:bg-opacity-20 text-white'
                  }`}
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {/* Favoris */}
              {/* <Link 
                to="/wishlist" 
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isScrolled 
                    ? 'hover:bg-indigo-50 text-indigo-600' 
                    : 'hover:bg-white hover:bg-opacity-20 text-white'
                }`}
                onClick={handleNavClick}
                title="Favoris"
              >
                <Heart className="h-5 w-5" />
              </Link> */}

              {/* Commandes */}
              <Link 
                to="/orders" 
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isScrolled 
                    ? 'hover:bg-indigo-50 text-indigo-600' 
                    : 'hover:bg-white hover:bg-opacity-20 text-white'
                }`}
                onClick={handleNavClick}
                title="Mes commandes"
              >
                <Package className="h-5 w-5" />
              </Link>

              {/* Panier */}
              <Link 
                to="/cart" 
                className={`relative p-2 rounded-lg transition-all duration-300 ${
                  isScrolled 
                    ? 'hover:bg-indigo-50 text-indigo-600' 
                    : 'hover:bg-white hover:bg-opacity-20 text-white'
                }`}
                onClick={handleNavClick}
                title="Panier"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>

              {/* Utilisateur */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:flex items-center space-x-2 bg-white bg-opacity-10 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className={`text-sm font-medium ${
                      isScrolled ? 'text-gray-700' : 'text-white'
                    }`}>
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOutClick}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      isScrolled 
                        ? 'hover:bg-indigo-50 text-indigo-600' 
                        : 'hover:bg-white hover:bg-opacity-20 text-white'
                    }`}
                    title="Déconnexion"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isScrolled 
                      ? 'hover:bg-indigo-50 text-indigo-600' 
                      : 'hover:bg-white hover:bg-opacity-20 text-white'
                  }`}
                  onClick={handleNavClick}
                  title="Connexion"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Menu mobile étendu */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        } ${
          isScrolled 
            ? 'bg-white border-t border-gray-200' 
            : 'bg-indigo-700 border-t border-indigo-600'
        }`}>
          <div className="px-4 py-4 space-y-4">
            {/* Barre de recherche mobile */}
            <form onSubmit={handleSearch} className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  id="mobile-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className={`w-full h-12 pl-10 pr-4 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                    isScrolled
                      ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-200'
                      : 'bg-white bg-opacity-20 border-white border-opacity-30 text-white placeholder-white placeholder-opacity-80 focus:border-white focus:ring-white focus:ring-opacity-20'
                  }`}
                />
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${
                  isScrolled ? 'text-gray-400' : 'text-white'
                }`} />
              </div>
              <button
                type="submit"
                className="h-12 px-4 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors shadow-md"
              >
                Go
              </button>
            </form>

            {/* Navigation utilisateur mobile */}
            {user && (
              <div className={`px-3 py-2 rounded-lg ${
                isScrolled ? 'bg-gray-100' : 'bg-white bg-opacity-10'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className={`text-sm font-medium ${
                    isScrolled ? 'text-gray-700' : 'text-white'
                  }`}>
                    Connecté en tant que: {user.email}
                  </span>
                </div>
              </div>
            )}

            {/* Liens de navigation mobile */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/products"
                className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-medium transition-colors ${
                  isScrolled
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
                onClick={handleNavClick}
              >
                <Package className="h-5 w-5" />
                <span>Produits</span>
              </Link>
              {/* <Link
                to="/wishlist"
                className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-medium transition-colors ${
                  isScrolled
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
                onClick={handleNavClick}
              >
                <Heart className="h-5 w-5" />
                <span>Favoris</span>
              </Link> */}
              {/* <Link
                to="/orders"
                className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-medium transition-colors ${
                  isScrolled
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
                onClick={handleNavClick}
              >
                <Package className="h-5 w-5" />
                <span>Commandes</span>
              </Link> */}
              
              {/* Lien de déconnexion */}
              {user && (
                <button
                  onClick={handleSignOutClick}
                  className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-medium transition-colors ${
                    isScrolled
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-red-500 bg-opacity-20 text-red-200 hover:bg-opacity-30'
                  }`}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Deconexion</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modal de confirmation de déconnexion */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleSignOut}
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmText="Se déconnecter"
        cancelText="Annuler"
        variant="danger"
      />

      {/* Espacement pour le contenu */}
      <div className="h-16"></div>
    </>
  );
}