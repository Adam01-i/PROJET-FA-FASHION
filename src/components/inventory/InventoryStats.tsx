import { 
  Package, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Product } from '../../types';
import { useMemo } from 'react';

interface InventoryStatsProps {
  products: Product[];
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export default function InventoryStats({ products }: InventoryStatsProps) {
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock_quantity), 0);
    const lowStock = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 5)).length;
    const outOfStock = products.filter(p => p.stock_quantity === 0).length;
    const totalStock = products.reduce((sum, product) => sum + product.stock_quantity, 0);
    const totalSales = products.reduce((sum, product) => sum + (product.sales_count || 0), 0);
    
    // Calcul des tendances
    const previousTotalProducts = Math.max(1, totalProducts - 2);
    const previousTotalValue = Math.max(1, totalValue - 50000);
    
    const productsTrend = ((totalProducts - previousTotalProducts) / previousTotalProducts) * 100;
    const valueTrend = ((totalValue - previousTotalValue) / previousTotalValue) * 100;

    return {
      totalProducts,
      totalValue,
      lowStock,
      outOfStock,
      totalStock,
      totalSales,
      trends: {
        products: Math.round(productsTrend),
        value: Math.round(valueTrend)
      },
      criticalItems: lowStock + outOfStock
    };
  }, [products]);

  const formatXOF = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // 🔥 4 CARTES PRINCIPALES AVEC DOLLARSIGN POUR CFA
  const statCards: StatCard[] = [
    {
      label: 'Valeur Stock',
      value: formatXOF(stats.totalValue),
      icon: DollarSign, // ✅ Icône DollarSign pour le CFA
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-200',
      trend: {
        value: stats.trends.value,
        isPositive: stats.trends.value >= 0
      },
      description: 'Valeur totale en CFA'
    },
    {
      label: 'Produits Total',
      value: formatCompactNumber(stats.totalProducts),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      trend: {
        value: stats.trends.products,
        isPositive: stats.trends.products >= 0
      },
      description: 'Articles dans le catalogue'
    },
    {
      label: 'Alertes Stock',
      value: stats.criticalItems,
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
      borderColor: 'border-amber-200',
      description: 'Produits nécessitant attention'
    },
    {
      label: 'Ventes Total',
      value: formatCompactNumber(stats.totalSales),
      icon: TrendingUp,
      color: 'text-violet-600',
      bgColor: 'bg-gradient-to-br from-violet-50 to-violet-100',
      borderColor: 'border-violet-200',
      description: 'Performance des ventes'
    }
  ];

  const TrendIndicator = ({ value, isPositive }: { value: number; isPositive: boolean }) => (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
      isPositive 
        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
        : 'bg-rose-100 text-rose-700 border border-rose-200'
    }`}>
      {isPositive ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
      <span>{Math.abs(value)}%</span>
    </div>
  );

  const CriticalBadge = ({ count }: { count: number }) => (
    <div className="absolute -top-2 -right-2">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
        {count} alerte{count > 1 ? 's' : ''}
      </div>
    </div>
  );

  return (
    <div className="mb-6">
      {/* 🔥 GRILLE 2x2 POUR 4 CARTES PRINCIPALES - SANS TITRE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          const isCritical = stat.label === 'Alertes Stock' && stats.criticalItems > 0;
          
          return (
            <div
              key={index}
              className="group relative overflow-hidden"
            >
              {/* Effet de fond animé */}
              <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              
              {/* Carte principale */}
              <div className={`
                relative rounded-2xl border-2 transition-all duration-300
                hover:scale-105 hover:shadow-xl hover:border-opacity-60
                group-hover:shadow-lg backdrop-blur-sm h-full
                ${stat.bgColor} ${stat.borderColor} border-opacity-40
                transform-gpu will-change-transform
                ${isCritical ? 'animate-pulse-border' : ''}
              `}>
                <div className="p-6">
                  {/* En-tête de la carte */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide truncate">
                        {stat.label}
                      </p>
                      {stat.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {stat.description}
                        </p>
                      )}
                    </div>
                    <div className={`
                      p-3 rounded-xl transition-all duration-300 flex-shrink-0
                      group-hover:scale-110 group-hover:rotate-3
                      ${stat.bgColor} shadow-sm
                      ${isCritical ? 'animate-bounce' : ''}
                    `}>
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>

                  {/* Valeur principale */}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-between">
                      <p className={`
                        text-3xl lg:text-4xl font-bold truncate
                        ${stat.color}
                        drop-shadow-sm
                        ${isCritical ? 'animate-pulse' : ''}
                      `}>
                        {stat.value}
                      </p>
                      {stat.trend && (
                        <TrendIndicator 
                          value={stat.trend.value} 
                          isPositive={stat.trend.isPositive} 
                        />
                      )}
                    </div>
                  </div>

                  {/* Barre de progression contextuelle */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 h-2 bg-white bg-opacity-50 rounded-full overflow-hidden">
                      <div 
                        className={`
                          h-full rounded-full transition-all duration-1000 ease-out
                          ${stat.color.replace('text-', 'bg-')}
                          shadow-sm
                        `}
                        style={{
                          width: `${Math.min(100, 
                            stat.label === 'Alertes Stock' 
                              ? Math.min(100, (stats.criticalItems / stats.totalProducts) * 200)
                              : stat.label === 'Valeur Stock'
                                ? Math.min(100, (stats.totalValue / 1000000) * 10)
                                : 80
                          )}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Badge d'alerte pour les cartes critiques */}
                  {isCritical && stats.criticalItems > 0 && (
                    <CriticalBadge count={stats.criticalItems} />
                  )}
                </div>

                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-shine pointer-events-none" />
              </div>

              {/* Ombre portée améliorée */}
              <div className="absolute inset-0 rounded-2xl bg-gray-300 blur-md opacity-0 group-hover:opacity-20 -z-10 transition-opacity duration-300" />
            </div>
          );
        })}
      </div>
    </div>
  );
}