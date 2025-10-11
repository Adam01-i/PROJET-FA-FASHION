import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Home, LogOut, Menu, X, Settings, Users, Package, BarChart3, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function NavbarAdmin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
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
            {/* Logo et titre Admin */}
            <Link 
              to="/admin" 
              className="flex items-center space-x-3"
              onClick={handleNavClick}
            >
              <div className={`p-2 rounded-lg transition-colors ${
                isScrolled ? 'bg-indigo-100' : 'bg-indigo-500'
              }`}>
                <Shield className={`h-6 w-6 ${
                  isScrolled ? 'text-indigo-600' : 'text-white'
                }`} />
              </div>
              <div className="flex flex-col">
                <span className={`text-2xl font-bold ${
                  isScrolled ? 'text-indigo-600' : 'text-white'
                }`}>
                  K-Shop
                </span>
                <span className={`text-xs font-medium ${
                  isScrolled ? 'text-indigo-400' : 'text-indigo-200'
                }`}>
                  ADMIN
                </span>
              </div>
            </Link>

            {/* Navigation Admin - Desktop */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link
                to="/admin/dashboard"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                  isScrolled 
                    ? 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600' 
                    : 'text-white hover:bg-indigo-500'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/products"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                  isScrolled 
                    ? 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600' 
                    : 'text-white hover:bg-indigo-500'
                }`}
              >
                <Package className="h-5 w-5" />
                <span>Produits</span>
              </Link>
              <Link
                to="/admin/users"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                  isScrolled 
                    ? 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600' 
                    : 'text-white hover:bg-indigo-500'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Utilisateurs</span>
              </Link>
              <Link
                to="/admin/orders"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                  isScrolled 
                    ? 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600' 
                    : 'text-white hover:bg-indigo-500'
                }`}
              >
                <Package className="h-5 w-5" />
                <span>Commandes</span>
              </Link>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium hidden md:block ${
                    isScrolled ? 'text-gray-700' : 'text-white'
                  }`}>
                    Admin: {user.email}
                  </span>
                  <Link
                    to="/admin/settings"
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      isScrolled 
                        ? 'hover:bg-indigo-50 text-indigo-600' 
                        : 'hover:bg-indigo-500 text-white'
                    }`}
                  >
                    <Settings className="h-6 w-6" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      isScrolled 
                        ? 'hover:bg-indigo-50 text-indigo-600' 
                        : 'hover:bg-indigo-500 text-white'
                    }`}
                  >
                    <LogOut className="h-6 w-6" />
                  </button>
                </div>
              )}

              {/* Bouton menu mobile */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-3 rounded-xl transition-all duration-300 lg:hidden ${
                  isScrolled 
                    ? 'hover:bg-indigo-50 text-indigo-600' 
                    : 'hover:bg-indigo-500 text-white'
                }`}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile Admin */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } ${
          isScrolled 
            ? 'bg-white border-t border-gray-200' 
            : 'bg-indigo-700 border-t border-indigo-500'
        }`}>
          <div className="px-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Link
                to="/admin/dashboard"
                className={`flex items-center space-x-3 py-3 px-4 rounded-xl font-medium transition-colors ${
                  isScrolled
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
                onClick={handleNavClick}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/products"
                className={`flex items-center space-x-3 py-3 px-4 rounded-xl font-medium transition-colors ${
                  isScrolled
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
                onClick={handleNavClick}
              >
                <Package className="h-5 w-5" />
                <span>Gestion Produits</span>
              </Link>
              <Link
                to="/admin/users"
                className={`flex items-center space-x-3 py-3 px-4 rounded-xl font-medium transition-colors ${
                  isScrolled
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
                onClick={handleNavClick}
              >
                <Users className="h-5 w-5" />
                <span>Gestion Utilisateurs</span>
              </Link>
              <Link
                to="/admin/orders"
                className={`flex items-center space-x-3 py-3 px-4 rounded-xl font-medium transition-colors ${
                  isScrolled
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
                onClick={handleNavClick}
              >
                <Package className="h-5 w-5" />
                <span>Commandes</span>
              </Link>
              <Link
                to="/admin/settings"
                className={`flex items-center space-x-3 py-3 px-4 rounded-xl font-medium transition-colors ${
                  isScrolled
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
                onClick={handleNavClick}
              >
                <Settings className="h-5 w-5" />
                <span>Paramètres</span>
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