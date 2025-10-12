import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Home, LogOut, Search, Menu, X, Heart, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export default function NavbarClient() {
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
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
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
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
              <span className={`text-2xl font-bold ${
                isScrolled ? 'text-indigo-600' : 'text-white'
              }`}>
                K-Shop
              </span>
            </Link>

            {/* Barre de recherche - Desktop */}
            <div className="hidden lg:block flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un produit..."
                    className={`w-full h-12 pl-12 pr-6 rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                      isScrolled
                        ? 'bg-gray-50 border-indigo-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-100'
                        : 'bg-white bg-opacity-20 border-white border-opacity-30 text-white placeholder-white placeholder-opacity-80 focus:border-white focus:ring-white focus:ring-opacity-20 backdrop-blur-sm'
                    }`}
                  />
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${
                    isScrolled ? 'text-indigo-400' : 'text-white'
                  }`} />
                </div>
                <button
                  type="submit"
                  className="h-12 px-8 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-indigo-300 shadow-lg"
                >
                  Rechercher
                </button>
              </form>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-3">
              {/* Favoris */}
              <Link 
                to="/wishlist" 
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isScrolled 
                    ? 'hover:bg-indigo-50 text-indigo-600' 
                    : 'hover:bg-white hover:bg-opacity-20 text-white'
                }`}
                onClick={handleNavClick}
              >
                <Heart className="h-6 w-6" />
              </Link>

              {/* Commandes */}
              <Link 
                to="/orders" 
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isScrolled 
                    ? 'hover:bg-indigo-50 text-indigo-600' 
                    : 'hover:bg-white hover:bg-opacity-20 text-white'
                }`}
                onClick={handleNavClick}
              >
                <Package className="h-6 w-6" />
              </Link>

              {/* Panier */}
              <Link 
                to="/cart" 
                className={`relative p-3 rounded-xl transition-all duration-300 ${
                  isScrolled 
                    ? 'hover:bg-indigo-50 text-indigo-600' 
                    : 'hover:bg-white hover:bg-opacity-20 text-white'
                }`}
                onClick={handleNavClick}
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Utilisateur */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium hidden md:block ${
                    isScrolled ? 'text-gray-700' : 'text-white'
                  }`}>
                    {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      isScrolled 
                        ? 'hover:bg-indigo-50 text-indigo-600' 
                        : 'hover:bg-white hover:bg-opacity-20 text-white'
                    }`}
                  >
                    <LogOut className="h-6 w-6" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    isScrolled 
                      ? 'hover:bg-indigo-50 text-indigo-600' 
                      : 'hover:bg-white hover:bg-opacity-20 text-white'
                  }`}
                  onClick={handleNavClick}
                >
                  <User className="h-6 w-6" />
                </Link>
              )}

              {/* Bouton menu mobile */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-3 rounded-xl transition-all duration-300 lg:hidden ${
                  isScrolled 
                    ? 'hover:bg-indigo-50 text-indigo-600' 
                    : 'hover:bg-white hover:bg-opacity-20 text-white'
                }`}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } ${
          isScrolled 
            ? 'bg-white border-t border-gray-200' 
            : 'bg-black bg-opacity-50 backdrop-blur-md border-t border-white border-opacity-20'
        }`}>
          <div className="px-4 py-4">
            {/* Barre de recherche mobile */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className={`w-full h-12 pl-10 pr-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 ${
                    isScrolled
                      ? 'bg-gray-50 border-indigo-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-100'
                      : 'bg-white bg-opacity-20 border-white border-opacity-30 text-white placeholder-white placeholder-opacity-80 focus:border-white focus:ring-white focus:ring-opacity-20'
                  }`}
                />
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${
                  isScrolled ? 'text-indigo-400' : 'text-white'
                }`} />
              </div>
              <button
                type="submit"
                className="w-full h-12 mt-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
              >
                Rechercher
              </button>
            </form>

            {/* Liens mobile pour client */}
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
              <Link
                to="/categories"
                className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-medium transition-colors ${
                  isScrolled
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
                onClick={handleNavClick}
              >
                <Search className="h-5 w-5" />
                <span>Catégories</span>
              </Link>
              <Link
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
              </Link>
              <Link
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
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Espacement pour le contenu */}
      <div className="h-16"></div>
    </>
  );
}