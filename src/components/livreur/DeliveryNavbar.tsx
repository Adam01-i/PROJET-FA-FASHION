import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  PackageCheck,
  Search,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import ConfirmationModal from "../../ui/ConfirmationModal";

interface DeliveryNavbarProps {
  activeTab: "orders" | "delivered" | "myAccount";
  onTabChange: (tab: "orders" | "delivered" | "myAccount") => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function DeliveryNavbar({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
}: DeliveryNavbarProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);

  // Récupération utilisateur avec profil
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", data.user.id)
          .single();

        setUser({
          ...data.user,
          full_name: profile?.full_name || data.user.email,
          avatar_url: profile?.avatar_url || null,
        });
      }
    };
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Déconnexion Supabase
  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      navigate("/login");
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const handleSignOutClick = () => setIsLogoutModalOpen(true);
  const handleCancelLogout = () => setIsLogoutModalOpen(false);

  const handleNavClick = (tab: "orders" | "delivered" | "myAccount") => {
    onTabChange(tab);
    setIsMenuOpen(false);
  };

  const isActive = (tab: string) => activeTab === tab;

  const navItems = [
    {
      key: "orders" as const,
      icon: Truck,
      label: "Commandes à Livrer",
      mobileLabel: "Commandes à Livrer",
    },
    {
      key: "delivered" as const,
      icon: PackageCheck,
      label: "Livrées",
      mobileLabel: "Commandes Livrées",
    },
    {
      key: "myAccount" as const,
      icon: User,
      label: "Mon Compte",
      mobileLabel: "Mon Compte",
    },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white shadow-2xl backdrop-blur-xl bg-opacity-95 border-b border-blue-100"
            : "bg-gradient-to-r from-blue-600 to-indigo-700"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
            {/* Logo et titre Livreur */}
            <div className="flex items-center space-x-4 group">
              {/* Icône Logo */}
              <div
                className={`p-2 sm:p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 ${
                  isScrolled
                    ? "bg-blue-100 shadow-lg"
                    : "bg-white bg-opacity-20 backdrop-blur-sm"
                }`}
              >
                <Truck
                  className={`h-5 sm:h-7 w-5 sm:w-7 transition-colors ${
                    isScrolled ? "text-blue-600" : "text-white"
                  }`}
                />
              </div>

              {/* Texte Logo */}
              <div className="flex flex-col">
                <span
                  className={`text-xl sm:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all ${
                    isScrolled
                      ? "from-blue-600 to-blue-800"
                      : "from-white to-blue-100"
                  }`}
                >
                  Fa-Fashion
                </span>
                <span
                  className={`text-xs sm:text-sm font-semibold tracking-wider ${
                    isScrolled ? "text-blue-400" : "text-blue-200"
                  }`}
                >
                  PANEL LIVREUR
                </span>
              </div>
            </div>

            {/* Barre de recherche - Desktop */}
            <div className="hidden lg:block flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une commande..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Navigation Livreur - Desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key)}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isActive(item.key)
                        ? "bg-white text-blue-600 shadow-lg shadow-blue-200"
                        : isScrolled
                        ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        : "text-white hover:bg-white hover:bg-opacity-20 hover:backdrop-blur-sm"
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
                  {/* Rôle + email */}
                  <div
                    className={`hidden xl:flex flex-col items-end ${
                      isScrolled ? "text-gray-600" : "text-white"
                    }`}
                  >
                    <span className="text-sm font-semibold">Livreur</span>
                    <span className="text-xs opacity-80 truncate max-w-[180px]">
                      {user.email}
                    </span>
                  </div>

                  {/* Avatar */}
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      className="w-10 h-10 rounded-full object-cover border shadow-md"
                      alt="Avatar"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold">
                        {user?.full_name?.charAt(0) || "L"}
                      </span>
                    </div>
                  )}

                  {/* Séparateur */}
                  <div className="hidden md:block w-px h-8 bg-gray-300 bg-opacity-50"></div>

                  {/* Bouton déconnexion */}
                  <button
                    onClick={handleSignOutClick}
                    className={`group p-3 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                      isScrolled
                        ? "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-lg"
                        : "bg-white bg-opacity-20 text-white hover:bg-opacity-30 hover:backdrop-blur-sm"
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
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-lg"
                    : "bg-white bg-opacity-20 text-white hover:bg-opacity-30 hover:backdrop-blur-sm"
                }`}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile Livreur */}
        <div
          className={`lg:hidden transition-all duration-500 overflow-hidden ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          } ${
            isScrolled
              ? "bg-white border-t border-blue-100 shadow-lg"
              : "bg-blue-700 border-t border-blue-500 backdrop-blur-xl"
          }`}
        >
          <div className="px-6 py-6">
            {/* Barre de recherche mobile */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une commande..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key)}
                    className={`flex items-center space-x-4 p-4 rounded-2xl font-semibold transition-all duration-300 w-full text-left ${
                      isActive(item.key)
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-300"
                        : isScrolled
                        ? "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-md"
                        : "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-md"
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
                      ? "bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-md"
                      : "bg-red-600 text-white hover:bg-red-500 hover:shadow-md"
                  }`}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Se déconnecter</span>
                </button>
              )}

              {/* Section utilisateur mobile */}
              {user && (
                <div
                  className={`mt-4 p-4 rounded-2xl border ${
                    isScrolled
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-blue-600 border-blue-500 text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-semibold">
                        Connecté en tant que :
                      </p>
                      <p className="text-sm opacity-90 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
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
