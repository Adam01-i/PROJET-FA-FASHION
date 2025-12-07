import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Package, ClipboardList, Shield } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import ConfirmationModal from '../../../ui/ConfirmationModal';

interface NavbarAssistantProps {
  activeTab: string;
  onTabChange: (tab: 'orders' | 'inventory') => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarAssistantProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Déconnexion Supabase
  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      navigate('/login');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const handleSignOutClick = () => setIsLogoutModalOpen(true);
  const handleCancelLogout = () => setIsLogoutModalOpen(false);

  const handleNavClick = (tab: 'orders' | 'inventory') => {
    onTabChange(tab);
    setIsMenuOpen(false);
  };

  const isActive = (tab: string) => activeTab === tab;

  const navItems = [
    { key: 'orders' as const, icon: Package, label: 'Commandes', mobileLabel: 'Gestion Commandes' },
    { key: 'inventory' as const, icon: ClipboardList, label: 'Inventaire', mobileLabel: 'Vérification Inventaire' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white shadow-2xl backdrop-blur-xl bg-opacity-95 border-b border-indigo-100' 
          : 'bg-gradient-to-r from-indigo-600 to-indigo-700'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
            {/* Logo et titre Assistant */}
            <div className="flex items-center space-x-4 group">
              <div className={`p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 ${
                isScrolled 
                  ? 'bg-indigo-100 shadow-lg' 
                  : 'bg-white bg-opacity-20 backdrop-blur-sm'
              }`}>
                <Shield className={`h-7 w-7 transition-colors ${
                  isScrolled ? 'text-indigo-600' : 'text-white'
                }`} />
              </div>
              <div className="flex flex-col">
                <span className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all ${
                  isScrolled 
                    ? 'from-indigo-600 to-indigo-800' 
                    : 'from-white to-indigo-100'
                }`}>
                  Fa-Fashion
                </span>
                <span className={`text-xs font-semibold tracking-wider ${
                  isScrolled ? 'text-indigo-400' : 'text-indigo-200'
                }`}>
                  PANEL ASSISTANT
                </span>
              </div>
            </div>

            {/* Navigation Assistant - Desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key)}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isActive(item.key)
                        ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-200' 
                        : isScrolled
                        ? 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                        : 'text-white hover:bg-white hover:bg-opacity-20 hover:backdrop-blur-sm'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-4">
                  <div className={`hidden xl:flex flex-col items-end ${
                    isScrolled ? 'text-gray-600' : 'text-white'
                  }`}>
                    <span className="text-sm font-semibold">Assistant</span>
                    <span className="text-xs opacity-80 truncate max-w-[180px]">
                      {user.email}
                    </span>
                  </div>
                  
                  <div className="hidden md:block w-px h-8 bg-gray-300 bg-opacity-50"></div>
                  
                  <button
                    onClick={handleSignOutClick}
                    className={`group p-3 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                      isScrolled 
                        ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:shadow-lg' 
                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 hover:backdrop-blur-sm'
                    }`}
                    title="Déconnexion"
                  >
                    <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                  </button>
                </div>
              )}

              {/* Bouton menu mobile */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`lg:hidden p-3 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                  isScrolled 
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:shadow-lg' 
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 hover:backdrop-blur-sm'
                }`}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile Assistant */}
        <div className={`lg:hidden transition-all duration-500 overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } ${
          isScrolled 
            ? 'bg-white border-t border-indigo-100 shadow-lg' 
            : 'bg-indigo-700 border-t border-indigo-500 backdrop-blur-xl'
        }`}>
          <div className="px-6 py-6">
            <div className="space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key)}
                    className={`flex items-center space-x-4 p-4 rounded-2xl font-semibold transition-all duration-300 w-full text-left ${
                      isActive(item.key)
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-300'
                        : isScrolled
                        ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:shadow-md'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-md'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.mobileLabel}</span>
                  </button>
                );
              })}

              {/* Bouton déconnexion mobile */}
              {user && (
                <button
                  onClick={handleSignOutClick}
                  className={`flex items-center space-x-4 p-4 rounded-2xl font-semibold transition-all duration-300 w-full ${
                    isScrolled
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-md'
                      : 'bg-red-600 text-white hover:bg-red-500 hover:shadow-md'
                  }`}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Se déconnecter</span>
                </button>
              )}

              {/* Section utilisateur mobile */}
              {user && (
                <div className={`mt-4 p-4 rounded-2xl border ${
                  isScrolled 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                    : 'bg-indigo-600 border-indigo-500 text-white'
                }`}>
                  <p className="text-sm font-semibold">Connecté en tant que :</p>
                  <p className="text-sm opacity-90 truncate">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Espacement pour le contenu */}
      <div className="h-20"></div>

      {/* Modal de confirmation de déconnexion */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Se déconnecter"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmText="Se déconnecter"
        cancelText="Annuler"
        variant="danger"
        isLoading={isLoggingOut}
      />
    </>
  );
}