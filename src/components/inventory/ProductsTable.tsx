import { useState, useMemo } from 'react';
import { 
  Edit3, 
  Package, 
  ArrowUp, 
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import { Product } from '../../types';

type SortField = 'name' | 'stock' | 'price' | 'sales' | 'updated';
type SortDirection = 'asc' | 'desc';

interface StockStatus {
  level: 'low' | 'out' | 'normal';
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ProductsTableProps {
  products: Product[];
  onSort: (field: SortField) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onEditStock: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  getStockStatus: (product: Product) => StockStatus;
}

// Interface pour les catégories qui peuvent être des objets
interface CategoryObject {
  name: string;
  id?: string;
}

export default function ProductsTable({
  products,
  onSort,
  sortField,
  sortDirection,
  onEditStock,
  onEditProduct,
  getStockStatus
}: ProductsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');

  const formatXOF = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fonction pour formater l'affichage de la catégorie
  const formatCategory = (category: Product['category']): string => {
    if (typeof category === 'object' && category !== null && 'name' in category) {
      return (category as CategoryObject).name || '';
    }
    return category as string || '';
  };

  // Filtrer les produits basé sur la recherche
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatCategory(product.category).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Calcul de la pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Gestion de la pagination
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const SortableHeader = ({ 
    field, 
    children 
  }: { 
    field: SortField; 
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center space-x-2 font-semibold text-gray-700 hover:text-indigo-600 transition-all duration-200 group"
    >
      <span>{children}</span>
      <div className="flex flex-col">
        <ArrowUp className={`h-3 w-3 transition-all ${
          sortField === field && sortDirection === 'asc' 
            ? 'text-indigo-600' 
            : 'text-gray-300 group-hover:text-gray-400'
        }`} />
        <ArrowDown className={`h-3 w-3 -mt-1 transition-all ${
          sortField === field && sortDirection === 'desc' 
            ? 'text-indigo-600' 
            : 'text-gray-300 group-hover:text-gray-400'
        }`} />
      </div>
    </button>
  );

  // Génération des numéros de page
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (filteredProducts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
        <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-500 mb-2">Aucun produit trouvé</h3>
        <p className="text-gray-400 mb-6">Aucun produit ne correspond à vos critères de recherche</p>
        <button
          onClick={() => setSearchQuery('')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          Réinitialiser la recherche
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barre de contrôle */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        {/* Recherche en temps réel */}
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher dans le tableau..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
          />
        </div>

        {/* Contrôles de pagination et affichage */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Afficher</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={50}>50</option>
            </select>
            <span className="text-gray-600">par page</span>
          </div>

          <div className="text-gray-600">
            {filteredProducts.length > 0 ? (
              <>
                Affichage de <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
                <span className="font-semibold">
                  {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                </span>{' '}
                sur <span className="font-semibold">{filteredProducts.length}</span> produits
              </>
            ) : (
              'Aucun produit'
            )}
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left">
                  <SortableHeader field="name">
                    Produit
                  </SortableHeader>
                </th>
                <th className="px-6 py-4 text-left">
                  <SortableHeader field="stock">
                    Stock
                  </SortableHeader>
                </th>
                <th className="px-6 py-4 text-left">
                  <SortableHeader field="price">
                    Prix
                  </SortableHeader>
                </th>
                <th className="px-6 py-4 text-left">
                  <SortableHeader field="sales">
                    Ventes
                  </SortableHeader>
                </th>
                <th className="px-6 py-4 text-left">
                  Statut
                </th>
                <th className="px-6 py-4 text-left">
                  <SortableHeader field="updated">
                    Dernière MAJ
                  </SortableHeader>
                </th>
                <th className="px-6 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                const StatusIcon = stockStatus.icon;

                return (
                  <tr 
                    key={product.id} 
                    className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-12 w-12 rounded-xl object-cover bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {product.sku && `SKU: ${product.sku}`}
                            {product.category && product.sku && ` • `}
                            {product.category && formatCategory(product.category)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-gray-900">
                        {product.stock_quantity}
                      </div>
                      {product.low_stock_threshold && (
                        <div className="text-xs text-gray-500">
                          Seuil: {product.low_stock_threshold}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        {formatXOF(product.price)}
                      </div>
                      {product.compare_price && product.compare_price > product.price && (
                        <div className="text-xs text-gray-500 line-through">
                          {formatXOF(product.compare_price)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        {product.sales_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${stockStatus.color} group-hover:scale-105`}>
                        <StatusIcon className="h-3 w-3" />
                        <span>{stockStatus.label}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 font-medium">
                        {new Date(product.updated_at || product.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onEditStock(product)}
                          className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-xl transition-all duration-200 transform hover:scale-110 group/tooltip relative"
                          title="Modifier le stock"
                        >
                          <Package className="h-4 w-4" />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap">
                            Modifier stock
                          </div>
                        </button>
                        <button
                          onClick={() => onEditProduct(product)}
                          className="p-2 text-gray-600 hover:text-white hover:bg-gray-600 rounded-xl transition-all duration-200 transform hover:scale-110 group/tooltip relative"
                          title="Modifier le produit"
                        >
                          <Edit3 className="h-4 w-4" />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap">
                            Modifier produit
                          </div>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600 mb-4 sm:mb-0">
              Page {currentPage} sur {totalPages}
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Bouton précédent */}
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-white hover:shadow-md hover:text-indigo-600'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Numéros de page */}
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`min-w-[40px] h-10 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-white hover:shadow-md hover:text-indigo-600'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Points de suspension si nécessaire */}
              {totalPages > getPageNumbers()[getPageNumbers().length - 1] && (
                <span className="px-2 text-gray-400">...</span>
              )}

              {/* Bouton suivant */}
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-white hover:shadow-md hover:text-indigo-600'
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}