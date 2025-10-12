import { Search, Bell, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useState } from 'react';
import ConfirmationModal from '../../../ui/ConfirmationModal';   

interface NavBarProps {
  onToggleSidebar: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showSearch?: boolean;
  showAddButton?: boolean;
  onAddClick?: () => void;
  addButtonLabel?: string;
  title: string;
}

export default function NavBar({
  onToggleSidebar,
  searchTerm,
  onSearchChange,
  showSearch = true,
  showAddButton = false,
  onAddClick,
  addButtonLabel = "Ajouter",
  title
}: NavBarProps) {
  const { signOut } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              
              <h1 className="text-2xl font-bold text-gray-900 font-display">
                {title}
              </h1>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              {showSearch && (
                <div className="relative hidden md:block">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all duration-200 w-64"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              )}

              {/* Add Button */}
              {showAddButton && onAddClick && (
                <button
                  onClick={onAddClick}
                  className="flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span className="font-medium">{addButtonLabel}</span>
                </button>
              )}

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group">
                <Bell className="h-5 w-5 text-gray-600 group-hover:text-indigo-600" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">Administrateur</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </div>

              {/* Logout */}
              <button 
                onClick={handleLogoutClick}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                title="Se déconnecter"
              >
                <LogOut className="h-5 w-5 text-gray-600 group-hover:text-red-600" />
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {showSearch && (
            <div className="mt-4 md:hidden">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}
        </div>
      </nav>

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