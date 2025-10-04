// src/components/admin/SideBar/SideBarItems/Dashboard.tsx
import { LayoutDashboard, Users, ShoppingCart, Package, DollarSign } from 'lucide-react';

interface DashboardItemProps {
  active: boolean;
  onClick: () => void;
  stats?: {
    totalSales: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
  };
}

export default function DashboardItem({ active, onClick, stats }: DashboardItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center w-full px-4 py-3 text-sm rounded-xl transition-all duration-300 group
        ${active
          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-2xl shadow-blue-500/30 transform scale-[1.02]'
          : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-gray-900 hover:shadow-lg'
        }
        overflow-hidden
      `}
    >
      {/* Background shimmer effect */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      )}
      
      <div className="relative flex items-center w-full">
        <LayoutDashboard className={`
          h-5 w-5 mr-3 transition-all duration-300 flex-shrink-0
          ${active 
            ? 'text-white transform scale-110' 
            : 'text-gray-400 group-hover:text-blue-600 group-hover:transform group-hover:scale-110'
          }
        `} />
        
        <span className="font-medium transition-all duration-300">
          Tableau de bord
        </span>
        
        {/* Active indicator */}
        {active && (
          <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-80 animate-pulse" />
        )}
      </div>

      {/* Mini stats preview - only show on hover if not active */}
      {!active && stats && (
        <div className="absolute left-full ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 min-w-[200px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-3 w-3 mr-1 text-green-500" />
                  Ventes
                </div>
                <span className="font-semibold text-gray-900">
                  {stats.totalSales.toLocaleString()} XOF
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center text-gray-600">
                  <ShoppingCart className="h-3 w-3 mr-1 text-blue-500" />
                  Commandes
                </div>
                <span className="font-semibold text-gray-900">
                  {stats.totalOrders}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center text-gray-600">
                  <Users className="h-3 w-3 mr-1 text-purple-500" />
                  Utilisateurs
                </div>
                <span className="font-semibold text-gray-900">
                  {stats.totalUsers}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center text-gray-600">
                  <Package className="h-3 w-3 mr-1 text-orange-500" />
                  Produits
                </div>
                <span className="font-semibold text-gray-900">
                  {stats.totalProducts}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </button>
  );
}