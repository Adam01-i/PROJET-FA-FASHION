import { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Package,
  Percent,
  TrendingUp,
  DollarSign,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useWholesaleProducts, WholesaleProduct } from '../../../../hooks/useWholesaleProducts';
import { useProductsForWholesale } from '../../../../hooks/useProductsForWholesale';
import { useWholesaleStats } from '../../../../hooks/useWholesaleStats';
import { useToastContext } from '../../../../hooks/ToastProvider';
import { supabase } from '../../../../lib/supabase';
import WholesaleModal from '../../modals/WholesaleModal';
import ConfirmationModal from '../../../../ui/ConfirmationModal';

interface WholeSaleProductsSectionProps {
  searchTerm: string;
  onAddClick: () => void;
}

function formatXOF(amount: number): string {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
}

function calculateDiscount(regularPrice: number, wholesalePrice: number): number {
  return Math.round(((regularPrice - wholesalePrice) / regularPrice) * 10000) / 100;
}

export default function WholeSaleProductsSection({ searchTerm }: WholeSaleProductsSectionProps) {
  const {
    products: wholesaleProducts,
    loading: wholesaleLoading,
    error: wholesaleError,
    refetch: refetchWholesale,
    // updateWholesaleTier,
    deleteWholesaleTier,
    toggleWholesaleTier,
  } = useWholesaleProducts();

  const {
    products: regularProducts,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
    // searchProducts,
  } = useProductsForWholesale();

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useWholesaleStats();

  const { success, error: toastError } = useToastContext();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<WholesaleProduct | null>(null);
  const [selectedRegularProduct, setSelectedRegularProduct] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<WholesaleProduct | null>(null);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [productToToggle, setProductToToggle] = useState<WholesaleProduct | null>(null);
  
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'discount' | 'quantity' | 'name'>('discount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  // Filtrage et tri
  const filteredProducts = wholesaleProducts.filter(product => {
    // Filtre par recherche
    const matchesSearch = 
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;

    // Filtre par statut
    const matchesStatus = 
      viewMode === 'all' || 
      (viewMode === 'active' && product.is_active) ||
      (viewMode === 'inactive' && !product.is_active);

    return matchesSearch && matchesStatus;
  });

  // Tri des produits
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'discount':
        const discountA = calculateDiscount(a.regular_price || 0, a.wholesale_price);
        const discountB = calculateDiscount(b.regular_price || 0, b.wholesale_price);
        return (discountB - discountA) * multiplier;
      
      case 'quantity':
        return (b.min_quantity - a.min_quantity) * multiplier;
      
      case 'name':
        return (a.product_name || '').localeCompare(b.product_name || '') * multiplier;
      
      default:
        return 0;
    }
  });

  const loading = wholesaleLoading || productsLoading || statsLoading;
  const error = wholesaleError || productsError || statsError;

  // Gestion des modals
  const handleAddClick = () => {
    setSelectedProduct(null);
    setSelectedRegularProduct(null);
    setIsAddModalOpen(true);
  };

  const handleEditClick = (product: WholesaleProduct) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (product: WholesaleProduct) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleToggleClick = (product: WholesaleProduct) => {
    setProductToToggle(product);
    setIsToggleModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const result = await deleteWholesaleTier(productToDelete.id);
      
      if (result.success) {
        success('Supprimé', 'Le prix en gros a été supprimé avec succès');
      } else {
        toastError('Erreur', result.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      toastError('Erreur', 'Erreur lors de la suppression');
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const confirmToggle = async () => {
    if (!productToToggle) return;

    try {
      const result = await toggleWholesaleTier(productToToggle.id, productToToggle.is_active);
      
      if (result.success) {
        success(
          productToToggle.is_active ? 'Désactivé' : 'Activé',
          `Le prix en gros a été ${productToToggle.is_active ? 'désactivé' : 'activé'} avec succès`
        );
      } else {
        toastError('Erreur', result.error || 'Erreur lors de la modification');
      }
    } catch (err) {
      toastError('Erreur', 'Erreur lors de la modification');
    } finally {
      setIsToggleModalOpen(false);
      setProductToToggle(null);
    }
  };

  const handleProductSelect = (product: any) => {
    setSelectedRegularProduct(product);
    setIsAddModalOpen(true);
  };

  const handleWholesaleSave = async (
    productId: string,
    minQuantity: number,
    wholesalePrice: number,
    mode: 'add' | 'edit',
    wholesaleId?: string
  ) => {
    try {
      if (mode === 'add') {
        const { error } = await supabase.from('wholesale_pricing').insert({
          product_id: productId,
          min_quantity: minQuantity,
          wholesale_price: wholesalePrice,
          is_active: true,
        });

        if (error) throw error;
        success('Ajouté', 'Prix en gros ajouté avec succès');
      } else if (mode === 'edit' && wholesaleId) {
        const { error } = await supabase
          .from('wholesale_pricing')
          .update({
            min_quantity: minQuantity,
            wholesale_price: wholesalePrice,
            updated_at: new Date().toISOString(),
          })
          .eq('id', wholesaleId);

        if (error) throw error;
        success('Modifié', 'Prix en gros modifié avec succès');
      }

      // Recharger les données
      await refetchWholesale();
      await refetchProducts();
      await refetchStats();

      // Fermer le modal
      if (mode === 'add') {
        setIsAddModalOpen(false);
      } else {
        setIsEditModalOpen(false);
      }
    } catch (err: any) {
      toastError('Erreur', err.message || 'Erreur lors de la sauvegarde');
    }
  };

  const toggleProductExpand = (productId: string) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  // Rendu des statistiques
// MODIFIEZ la fonction renderStats() pour qu'elle soit responsive :
const renderStats = () => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Produits en gros</p>
            <p className="text-lg sm:text-2xl font-bold mt-1">{stats.total_wholesale_products}</p>
          </div>
          <div className="p-2 sm:p-3 bg-indigo-50 rounded-lg">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Seuils actifs</p>
            <p className="text-lg sm:text-2xl font-bold mt-1">{stats.active_wholesale_tiers}</p>
          </div>
          <div className="p-2 sm:p-3 bg-green-50 rounded-lg">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Remise moyenne</p>
            <p className="text-lg sm:text-2xl font-bold mt-1">{stats.average_discount}%</p>
          </div>
          <div className="p-2 sm:p-3 bg-yellow-50 rounded-lg">
            <Percent className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Économies totales</p>
            <p className="text-lg sm:text-2xl font-bold mt-1">{formatXOF(stats.total_potential_savings)}</p>
          </div>
          <div className="p-2 sm:p-3 bg-purple-50 rounded-lg">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

// MODIFIEZ le rendu du tableau dans renderProductsTable() :
const renderProductsTable = () => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center">
        <p className="text-red-600 mb-2 text-sm sm:text-base">Erreur: {error}</p>
        <button
          onClick={() => {
            refetchWholesale();
            refetchProducts();
            refetchStats();
          }}
          className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm sm:text-base"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (sortedProducts.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
        <p className="text-gray-600 mb-2 text-sm sm:text-base">
          {searchTerm 
            ? "Aucun produit en gros ne correspond à votre recherche" 
            : "Aucun prix en gros configuré"}
        </p>
        <button
          onClick={handleAddClick}
          className="mt-4 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm sm:text-base"
        >
          <Plus className="h-4 w-4 inline mr-1 sm:mr-2" />
          Ajouter un premier prix en gros
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden">
      {/* Vue mobile/tablette - Cartes */}
      <div className="lg:hidden space-y-3 sm:space-y-4 p-3 sm:p-4">
        {sortedProducts.map((product) => {
          const discount = calculateDiscount(product.regular_price || 0, product.wholesale_price);
          const isExpanded = expandedProduct === product.id;
          
          return (
            <div
              key={product.id}
              className={`bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow ${!product.is_active ? 'opacity-60' : ''}`}
            >
              {/* En-tête de la carte */}
              <div 
                className="flex items-start justify-between mb-3 cursor-pointer"
                onClick={() => toggleProductExpand(product.id)}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {product.product_name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {product.category_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleProductExpand(product.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>

              {/* Corps de la carte */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Seuil</p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">
                    {product.min_quantity}+ unités
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Prix</p>
                  <p className="font-semibold text-green-600 text-sm sm:text-base">
                    {formatXOF(product.wholesale_price)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Remise</p>
                  <p className="font-semibold text-red-600 text-sm sm:text-base">
                    -{discount}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Statut</p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    product.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(product);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 p-1"
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleClick(product);
                    }}
                    className={`p-1 ${product.is_active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                    title={product.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {product.is_active ? (
                      <ToggleLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <ToggleRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(product);
                    }}
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Régulier: {formatXOF(product.regular_price || 0)}
                </div>
              </div>

              {/* Section dépliée */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Prix régulier</p>
                        <p className="font-medium text-sm">{formatXOF(product.regular_price || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Économie par unité</p>
                        <p className="font-medium text-green-600 text-sm">
                          {formatXOF((product.regular_price || 0) - product.wholesale_price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Stock disponible</p>
                        <p className="font-medium text-sm">{product.stock_quantity || 0} unités</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Dernière mise à jour</p>
                        <p className="font-medium text-sm">
                          {new Date(product.updated_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Vue desktop - Tableau */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seuil
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix & Remise
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProducts.map((product) => {
              const discount = calculateDiscount(product.regular_price || 0, product.wholesale_price);
              const isExpanded = expandedProduct === product.id;
              
              return (
                <>
                  <tr 
                    key={product.id}
                    className={`hover:bg-gray-50 cursor-pointer ${!product.is_active ? 'opacity-60' : ''}`}
                    onClick={() => toggleProductExpand(product.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.product_name}
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{product.product_name}</div>
                          <div className="text-sm text-gray-500">{product.category_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-gray-900">
                        {product.min_quantity}+
                      </div>
                      <div className="text-sm text-gray-500">unités</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-green-600">
                        {formatXOF(product.wholesale_price)}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="line-through">{formatXOF(product.regular_price || 0)}</span>
                        <span className="ml-2 text-red-600 font-medium">-{discount}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        product.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEditClick(product)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleClick(product)}
                          className={`p-1 ${product.is_active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                          title={product.is_active ? 'Désactiver' : 'Activer'}
                        >
                          {product.is_active ? (
                            <ToggleLeft className="h-4 w-4" />
                          ) : (
                            <ToggleRight className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleProductExpand(product.id)}
                          className="text-gray-600 hover:text-gray-900 p-1"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Prix régulier</p>
                              <p className="font-medium">{formatXOF(product.regular_price || 0)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Économie par unité</p>
                              <p className="font-medium text-green-600">
                                {formatXOF((product.regular_price || 0) - product.wholesale_price)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Stock disponible</p>
                              <p className="font-medium">{product.stock_quantity || 0} unités</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Dernière mise à jour</p>
                              <p className="font-medium">
                                {new Date(product.updated_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

return (
  <div className="space-y-4 sm:space-y-6 -mx-6 px-6"> {/* Ajout de -mx-6 px-6 pour compenser le padding parent */}
    {/* En-tête avec titre et actions */}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        {/* <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
          Gestion des prix en gros
        </h1> */}
        <p className="text-gray-600 mt-1 text-xs xs:text-sm sm:text-base truncate">
          Configurez les prix en gros par seuil de quantité
        </p>
      </div>
      
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 mt-4 lg:mt-0">
        

        <button
          onClick={handleAddClick}
          className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base whitespace-nowrap w-full xs:w-auto"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="truncate">Ajouter un prix en gros</span>
        </button>
      </div>
    </div>

    {/* Statistiques */}
    <div className="mx-0"> {/* Wrapper pour les stats */}
      {renderStats()}
    </div>

    {/* Contrôles de tri et info */}
    <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
  <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-3">

    {/* Filtre principal */}
    <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-auto">
      <Filter className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
      <select
        value={viewMode}
        onChange={(e) => setViewMode(e.target.value as any)}
        className="bg-transparent border-none focus:outline-none text-sm w-full sm:w-auto"
      >
        <option value="all">Tous les prix</option>
        <option value="active">Actifs seulement</option>
        <option value="inactive">Inactifs seulement</option>
      </select>
    </div>

    {/* Trier par */}
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <span className="text-sm text-gray-600 whitespace-nowrap">Trier par:</span>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as any)}
        className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-auto"
      >
        <option value="discount">Remise (%)</option>
        <option value="quantity">Seuil minimum</option>
        <option value="name">Nom du produit</option>
      </select>
    </div>

    {/* Ordre + compteur */}
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <button
        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        className="flex items-center justify-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 w-full sm:w-auto"
      >
        {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
      </button>

      <div className="text-sm text-gray-500 whitespace-nowrap">
        <span className="font-medium">{sortedProducts.length}</span> prix en gros trouvés
      </div>
    </div>

  </div>
</div>


    {/* Tableau des produits */}
    <div className="overflow-hidden -mx-6 px-6"> {/* Ajout pour le tableau */}
      {renderProductsTable()}
    </div>

    {/* Modals */}
    {isAddModalOpen && (
      <WholesaleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        mode="add"
        regularProducts={regularProducts}
        selectedProduct={selectedRegularProduct}
        onProductSelect={handleProductSelect}
        onSave={handleWholesaleSave}
      />
    )}

    {isEditModalOpen && selectedProduct && (
      <WholesaleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        wholesaleProduct={selectedProduct}
        onSave={handleWholesaleSave}
      />
    )}

    {/* Modal de confirmation de suppression */}
    <ConfirmationModal
      isOpen={isDeleteModalOpen}
      onClose={() => {
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      }}
      onConfirm={confirmDelete}
      title="Supprimer le prix en gros"
      message={
        productToDelete && (
          <div className="space-y-3">
            <p className="text-sm sm:text-base">
              Êtes-vous sûr de vouloir supprimer le prix en gros pour le produit{' '}
              <strong className="break-words">"{productToDelete.product_name}"</strong> ?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs sm:text-sm">
              <p className="text-red-800">
                ⚠️ <strong>Attention :</strong> Cette action est irréversible. 
                Les clients ne verront plus ce prix en gros.
              </p>
            </div>
          </div>
        )
      }
      confirmText="Supprimer"
      cancelText="Annuler"
      variant="danger"
    />

    {/* Modal de confirmation d'activation/désactivation */}
    <ConfirmationModal
      isOpen={isToggleModalOpen}
      onClose={() => {
        setIsToggleModalOpen(false);
        setProductToToggle(null);
      }}
      onConfirm={confirmToggle}
      title={productToToggle?.is_active ? "Désactiver le prix en gros" : "Activer le prix en gros"}
      message={
        productToToggle && (
          <div className="space-y-3">
            <p className="text-sm sm:text-base">
              Êtes-vous sûr de vouloir{' '}
              <strong>
                {productToToggle.is_active ? "désactiver" : "activer"}
              </strong>{' '}
              le prix en gros pour le produit{' '}
              <strong className="break-words">"{productToToggle.product_name}"</strong> ?
            </p>
            <div className={`border rounded-lg p-3 text-xs sm:text-sm ${
              productToToggle.is_active 
                ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              <p>
                {productToToggle.is_active 
                  ? "⚠️ Les clients ne verront plus ce prix en gros."
                  : "✅ Les clients pourront bénéficier de ce prix en gros."
                }
              </p>
            </div>
          </div>
        )
      }
      confirmText={productToToggle?.is_active ? "Désactiver" : "Activer"}
      cancelText="Annuler"
      variant={productToToggle?.is_active ? "danger" : "primary"}
    />
  </div>
);
}