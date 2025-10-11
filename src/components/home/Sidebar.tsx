import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  User, 
  Settings,
  Package,
  BarChart3
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Accueil', path: '/' },
    { icon: Package, label: 'Produits', path: '/products' },
    { icon: ShoppingCart, label: 'Panier', path: '/cart' },
    { icon: User, label: 'Profil', path: '/profile' },
    { icon: BarChart3, label: 'Statistiques', path: '/stats' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 pt-16">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={`menu-${index}`} // Clé unique basée sur l'index
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;