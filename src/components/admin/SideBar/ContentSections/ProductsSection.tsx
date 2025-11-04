// components/dashboard/sections/ProductsSection.tsx (version corrigée)
import { useState, useEffect } from "react";
import { Edit, Plus, Package, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useProducts } from "../../../../hooks/useProducts";
import { useInventoryStats } from "../../../../hooks/useInventoryStats";
import { supabase } from "../../../../lib/supabase";
import { Product } from "../../../../models";
import { useToastContext } from "../../../../hooks/ToastProvider";
import ProductModal from "../../Modals/ProductModal";
import RestockModal from "../../Modals/RestockModal";
import StatsDashboard from "../../Stats/StatsDashboard";
import ConfirmationModal from "../../../../ui/ConfirmationModal";

interface ProductsSectionProps {
  searchTerm: string;
  onAddClick: () => void;
}

function formatXOF(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "XOF" });
}

export default function ProductsSection({ searchTerm }: ProductsSectionProps) {
  const {
    products,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
    restockProduct,
    updateProduct,
  } = useProducts();
  const {
    stats,
    lowStockAlerts,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useInventoryStats();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(
    null
  );
  const [currentProduct, setCurrentProduct] = useState({
    name: "",
    description: "",
    price: 0,
    stock_quantity: 0,
    category_id: "",
    image_url: "",
  });
  const { success, error: toastError } = useToastContext();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [productToToggle, setProductToToggle] = useState<Product | null>(null);

  // Fonction pour ouvrir le modal de confirmation
  const openConfirmationModal = (product: Product) => {
    setProductToToggle(product);
    setIsConfirmationModalOpen(true);
  };

  // Fonction pour fermer le modal
  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
    setProductToToggle(null);
  };

  // Fonction de confirmation
  const handleConfirmToggle = async () => {
    if (productToToggle) {
      await handleTogglePublication(productToToggle);
      closeConfirmationModal();
    }
  };

  // Logs de débogage
  useEffect(() => {
    // console.log("🔍 ProductsSection - État actuel:");
    // console.log("📦 Produits:", products);
    // console.log("📊 Stats:", stats);
    // console.log("⚠️ Alertes:", lowStockAlerts);
    // console.log("🔄 Loading produits:", productsLoading);
    // console.log("🔄 Loading stats:", statsLoading);
    // console.log("❌ Erreur produits:", productsError);
    // console.log("❌ Erreur stats:", statsError);
  }, [
    products,
    stats,
    lowStockAlerts,
    productsLoading,
    statsLoading,
    productsError,
    statsError,
  ]);

  const loading = productsLoading || statsLoading;

  // Filtrage simple
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ??
        false)
  );
  const getStockStatus = (quantity: number, isPublic: boolean) => {
    if (!isPublic) {
      return {
        text: "INACTIF",
        color: "bg-gray-100 text-gray-800 border border-gray-300",
        bgColor: "bg-gray-50",
        textColor: "text-gray-600",
      };
    }

    if (quantity === 0) {
      return {
        text: "Rupture",
        color: "bg-red-100 text-red-800 border border-red-200",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
      };
    }

    if (quantity <= 5) {
      return {
        text: "Stock faible",
        color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
      };
    }

    return {
      text: "En stock",
      color: "bg-green-100 text-green-800 border border-green-200",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    };
  };

  // FONCTION RÉTABLIE POUR LA VISIBILITÉ DES PRODUITS
  const handleTogglePublication = async (product: Product) => {
    try {
      const newVisibility = !product.is_public;
      const updates: any = {
        is_public: newVisibility,
        updated_at: new Date().toISOString(),
      };

      if (!newVisibility) {
        updates.stock_quantity = 0;
      }

      await updateProduct(product.id, updates);

      success(
        newVisibility ? "Produit publié" : "Produit masqué",
        newVisibility
          ? "Le produit est maintenant visible par les clients"
          : "Le produit a été retiré de la vue publique et le stock a été mis à zéro"
      );

      await refetchProducts();
      await refetchStats();
    } catch (error) {
      console.error("Error toggling publication:", error);
      toastError(
        "Erreur",
        "Erreur lors de la modification de la visibilité du produit"
      );
    }
  };

  const handleEditClick = (product: Product) => {
    if (!product) {
      console.error("Product is undefined in handleEditClick");
      return;
    }

    setEditingProduct(product);
    setCurrentProduct({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id || "",
      image_url: product.image_url || "",
    });
    setIsEditModalOpen(true);
  };

  const handleRestockClick = (product: Product) => {
    setRestockingProduct(product);
    setIsRestockModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setCurrentProduct({
      name: "",
      description: "",
      price: 0,
      stock_quantity: 0,
      category_id: "",
      image_url: "",
    });
    setIsAddModalOpen(true);
  };

  const handleProductChange = (product: typeof currentProduct) => {
    setCurrentProduct(product);
  };

  const handleSubmitProduct = async (productData: typeof currentProduct) => {
    try {
      if (editingProduct) {
        // Mode édition
        await updateProduct(editingProduct.id, {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock_quantity: productData.stock_quantity,
          category_id: productData.category_id,
          image_url: productData.image_url,
        });
      } else {
        // Mode ajout - utiliser directement Supabase
        const { error } = await supabase.from("products").insert([
          {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stock_quantity: productData.stock_quantity,
            category_id: productData.category_id,
            image_url: productData.image_url,
            is_public: true,
          },
        ]);

        if (error) throw error;
      }

      // Recharger les produits et statistiques
      await refetchProducts();
      await refetchStats();
      success(
        "Succès",
        editingProduct
          ? "Produit modifié avec succès"
          : "Produit ajouté avec succès"
      );
    } catch (error) {
      console.error("Error saving product:", error);
      throw error;
    }
  };

  const handleRestock = async (
    productId: string,
    quantity: number,
    newPrice: number,
    reason: string
  ) => {
    try {
      // Mettre à jour le stock ET le prix
      await restockProduct(productId, quantity, reason);

      // Mettre à jour le prix séparément
      await updateProduct(productId, {
        price: newPrice,
        updated_at: new Date().toISOString(),
      });

      await refetchProducts();
      await refetchStats();
      success(
        "Succès",
        `Stock réapprovisionné de ${quantity} unités et prix mis à jour`
      );
      setIsRestockModalOpen(false);
      setRestockingProduct(null);
    } catch (error) {
      console.error("Error restocking product:", error);
      throw error;
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEditingProduct(null);
  };

  const closeRestockModal = () => {
    setIsRestockModalOpen(false);
    setRestockingProduct(null);
  };

  const getPublicationStatus = (isPublic: boolean) => {
    return isPublic
      ? { text: "Actif", color: "bg-blue-100 text-blue-800", icon: Eye }
      : { text: "Inactif", color: "bg-gray-100 text-gray-800", icon: EyeOff };
  };

  // Affichage temporaire simple pour debug
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des produits...</p>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Erreur: {productsError}</p>
        <button
          onClick={() => refetchProducts()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Interface temporaire simplifiée pour debug */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Produits ({products.length})
            </h1>
            <p className="text-sm text-gray-600 mt-1 sm:hidden">
              {filteredProducts.length} produit(s) filtré(s)
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span className="whitespace-nowrap">Ajouter un produit</span>
          </button>
        </div>
        {/* Statistiques de debug */}
        {stats && (
          <StatsDashboard
            stats={stats}
            lowStockAlerts={lowStockAlerts}
            loading={statsLoading}
          />
        )}
        {/* Liste simple des produits */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Liste des produits</h2>
            <p className="text-sm text-gray-600 hidden sm:block mt-1">
              {filteredProducts.length} produit(s) trouvé(s)
            </p>
          </div>
          <div className="divide-y">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(
                product.stock_quantity,
                product.is_public ?? true
              );
              const publicationStatus = getPublicationStatus(
                product.is_public ?? true
              );
              const PublicationIcon = publicationStatus.icon;

              return (
                <div
                  key={product.id}
                  className={`p-4 transition-all duration-200 ${
                    stockStatus.bgColor
                  } border-l-4 ${
                    stockStatus.textColor === "text-red-700"
                      ? "border-l-red-500"
                      : stockStatus.textColor === "text-yellow-700"
                      ? "border-l-yellow-500"
                      : stockStatus.textColor === "text-gray-600"
                      ? "border-l-gray-500"
                      : "border-l-green-500"
                  }`}
                >
                  {/* Version mobile */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-start space-x-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatXOF(product.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${stockStatus.color}`}
                      >
                        {stockStatus.text} ({product.stock_quantity})
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs flex items-center ${publicationStatus.color}`}
                      >
                        <PublicationIcon className="h-3 w-3 mr-1" />
                        {publicationStatus.text}
                      </span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRestockClick(product)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Réapprovisionner"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openConfirmationModal(product)}
                        className={`p-2 rounded-lg transition-colors ${
                          product.is_public
                            ? "text-orange-600 hover:bg-orange-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={
                          product.is_public ? "Rendre INACTIF" : "Rendre ACTIF"
                        }
                      >
                        {product.is_public ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Version desktop */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <p className="text-sm text-gray-600">
                          {formatXOF(product.price)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${stockStatus.color}`}
                      >
                        {stockStatus.text} ({product.stock_quantity})
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm flex items-center ${publicationStatus.color}`}
                      >
                        <PublicationIcon className="h-4 w-4 mr-1" />
                        {publicationStatus.text}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRestockClick(product)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Réapprovisionner"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openConfirmationModal(product)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.is_public
                              ? "text-orange-600 hover:bg-orange-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={
                            product.is_public
                              ? "Rendre INACTIF"
                              : "Rendre ACTIF"
                          }
                        >
                          {product.is_public ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-8 sm:py-12">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">
              {searchTerm
                ? "Aucun produit ne correspond à votre recherche"
                : "Aucun produit trouvé"}
            </p>
            {searchTerm && (
              <p className="text-gray-500 text-xs sm:text-sm mt-2">
                Essayez de modifier vos termes de recherche
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        product={currentProduct}
        onProductChange={handleProductChange}
        mode="edit"
        existingProduct={editingProduct}
        onSubmit={handleSubmitProduct}
      />

      <ProductModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        product={currentProduct}
        onProductChange={handleProductChange}
        mode="add"
        existingProduct={null}
        onSubmit={handleSubmitProduct}
      />

      {restockingProduct && (
        <RestockModal
          isOpen={isRestockModalOpen}
          onClose={closeRestockModal}
          product={restockingProduct}
          onRestock={handleRestock}
        />
      )}

      {/* MODAL DE CONFIRMATION */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleConfirmToggle}
        title={
          productToToggle?.is_public
            ? "Rendre le produit INACTIF"
            : "Rendre le produit ACTIF"
        }
        message={
          productToToggle && (
            <div className="space-y-3">
              <p>
                Êtes-vous sûr de vouloir{" "}
                <strong>
                  {productToToggle.is_public
                    ? "rendre INACTIF"
                    : "rendre ACTIF"}
                </strong>{" "}
                le produit <strong>"{productToToggle.name}"</strong> ?
              </p>

              {productToToggle.is_public && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ <strong>Attention :</strong> En rendant ce produit
                    INACTIF, le stock sera automatiquement mis à zéro.
                  </p>
                </div>
              )}

              {!productToToggle.is_public && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    ✅ Le produit sera ACTIF par les clients et vous pourrez
                    gérer son stock normalement.
                  </p>
                </div>
              )}
            </div>
          )
        }
        confirmText={
          productToToggle?.is_public ? "Rendre INACTIF" : "Rendre ACTIF"
        }
        cancelText="Annuler"
        variant={productToToggle?.is_public ? "danger" : "primary"}
      />
    </>
  );
}
