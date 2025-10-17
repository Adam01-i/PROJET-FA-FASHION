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

interface ProductsSectionProps {
  searchTerm: string;
  onAddClick: () => void;
}

function formatXOF(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "XOF" });
}

export default function ProductsSection({ searchTerm }: ProductsSectionProps) {
  const { products, loading: productsLoading, error: productsError, refetch: refetchProducts, restockProduct, updateProduct } = useProducts();
  const { stats, lowStockAlerts, loading: statsLoading, error: statsError, refetch: refetchStats } = useInventoryStats();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
  const [currentProduct, setCurrentProduct] = useState({
    name: "",
    description: "",
    price: 0,
    stock_quantity: 0,
    category_id: "",
    image_url: "",
  });
  const { success, error: toastError } = useToastContext();

  // Logs de débogage
  useEffect(() => {
    console.log('🔍 ProductsSection - État actuel:');
    console.log('📦 Produits:', products);
    console.log('📊 Stats:', stats);
    console.log('⚠️ Alertes:', lowStockAlerts);
    console.log('🔄 Loading produits:', productsLoading);
    console.log('🔄 Loading stats:', statsLoading);
    console.log('❌ Erreur produits:', productsError);
    console.log('❌ Erreur stats:', statsError);
  }, [products, stats, lowStockAlerts, productsLoading, statsLoading, productsError, statsError]);

  const loading = productsLoading || statsLoading;

  // Filtrage simple
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  // FONCTION RÉTABLIE POUR LA VISIBILITÉ DES PRODUITS
  const handleTogglePublication = async (product: Product) => {
    try {
      const newVisibility = !product.is_public;
      
      // Utiliser la fonction updateProduct du hook
      await updateProduct(product.id, { 
        is_public: newVisibility,
        updated_at: new Date().toISOString()
      });

      success(
        newVisibility ? "Produit publié" : "Produit masqué",
        newVisibility 
          ? "Le produit est maintenant visible par les clients" 
          : "Le produit a été retiré de la vue publique"
      );
      
      // Recharger les données
      await refetchProducts();
      await refetchStats();
    } catch (error) {
      console.error("Error toggling publication:", error);
      toastError("Erreur", "Erreur lors de la modification de la visibilité du produit");
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
      success("Succès", editingProduct ? "Produit modifié avec succès" : "Produit ajouté avec succès");
    } catch (error) {
      console.error("Error saving product:", error);
      throw error;
    }
  };

  const handleRestock = async (productId: string, quantity: number, reason: string) => {
    try {
      await restockProduct(productId, quantity, reason);
      await refetchProducts();
      await refetchStats();
      success("Succès", `Stock réapprovisionné de ${quantity} unités`);
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

  const getStockStatus = (quantity: number) => {
    if (quantity > 10) return { text: "En stock", color: "bg-green-100 text-green-800" };
    if (quantity > 0) return { text: "Stock faible", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Rupture", color: "bg-red-100 text-red-800" };
  };

  const getPublicationStatus = (isPublic: boolean) => {
    return isPublic 
      ? { text: "Public", color: "bg-blue-100 text-blue-800", icon: Eye }
      : { text: "Privé", color: "bg-gray-100 text-gray-800", icon: EyeOff };
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Produits ({products.length})</h1>
          <button
            onClick={handleAddClick}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter
          </button>
        </div>

        {/* Statistiques de debug */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600">Stock faible</p>
            <p className="text-2xl font-bold text-yellow-600">{stats?.lowStockProducts || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600">Rupture</p>
            <p className="text-2xl font-bold text-red-600">{stats?.outOfStockProducts || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600">Alertes</p>
            <p className="text-2xl font-bold text-orange-600">{lowStockAlerts.length}</p>
          </div>
        </div>

        {/* Liste simple des produits */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Liste des produits</h2>
          </div>
          <div className="divide-y">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock_quantity);
              const publicationStatus = getPublicationStatus(product.is_public ?? true);
              const PublicationIcon = publicationStatus.icon;
              
              return (
                <div key={product.id} className="p-4 flex items-center justify-between">
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
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-600">{formatXOF(product.price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${stockStatus.color}`}>
                      {stockStatus.text} ({product.stock_quantity})
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm flex items-center ${publicationStatus.color}`}>
                      <PublicationIcon className="h-4 w-4 mr-1" />
                      {publicationStatus.text}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRestockClick(product)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      {/* BOUTON POUR MODIFIER LA VISIBILITÉ */}
                      <button
                        onClick={() => handleTogglePublication(product)}
                        className={`p-2 rounded-lg transition-colors ${
                          product.is_public 
                            ? "text-orange-600 hover:bg-orange-50" 
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={product.is_public ? "Rendre privé" : "Rendre public"}
                      >
                        {product.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Aucun produit trouvé</p>
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
    </>
  );
}