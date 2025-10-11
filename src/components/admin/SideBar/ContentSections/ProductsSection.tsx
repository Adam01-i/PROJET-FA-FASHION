import { useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import { useProducts } from "../../../../hooks/useProducts";
import { supabase } from "../../../../lib/supabase";
import { Product } from "../../../../types";
import { useToastContext } from "../../../../hooks/ToastProvider";
import ProductModal from "../Modals/ProductModal"; // Assurez-vous d'importer le modal

interface ProductsSectionProps {
  searchTerm: string;
  onAddClick: () => void;
}

function formatXOF(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "XOF" });
}

export default function ProductsSection({ searchTerm }: ProductsSectionProps) {
  const { products, refetchProducts } = useProducts();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentProduct, setCurrentProduct] = useState({
    name: "",
    description: "",
    price: 0,
    stock_quantity: 0,
    category_id: "",
    image_url: "",
  });
  const { success, error: toastError } = useToastContext();

  // Filtrage simple
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category_id?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      
      success("Produit supprimé", "Le produit a été supprimé avec succès");
      refetchProducts(); // Utiliser refetch au lieu de reload
    } catch (error) {
      console.error("Error:", error);
      toastError("Erreur", "Erreur lors de la suppression du produit");
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
        const { error } = await supabase
          .from("products")
          .update({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stock_quantity: productData.stock_quantity,
            category_id: productData.category_id,
            image_url: productData.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingProduct.id);

        if (error) throw error;
      } else {
        // Mode ajout
        const { error } = await supabase.from("products").insert([
          {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stock_quantity: productData.stock_quantity,
            category_id: productData.category_id,
            image_url: productData.image_url,
          },
        ]);

        if (error) throw error;
      }

      // Recharger les produits
      await refetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
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

  // Statistiques simples
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.stock_quantity > 0).length;
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0).length;

  return (
    <>
    {/* Bouton Ajouter */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleAddClick}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un produit
        </button>
      </div>
      
      {/* Statistiques simplifiées */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Produits</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Stock</p>
              <p className="text-2xl font-bold text-gray-900">{inStockProducts}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="h-6 w-6 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rupture</p>
              <p className="text-2xl font-bold text-gray-900">{outOfStockProducts}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="h-6 w-6 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      

      {/* Tableau simplifié */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900">Aucun produit trouvé</p>
                      <p className="text-gray-600 mt-1">
                        {searchTerm ? "Aucun produit ne correspond à votre recherche" : "Commencez par ajouter votre premier produit"}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={handleAddClick}
                          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Ajouter un produit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 relative">
                          <img
                            className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                            src={product.image_url || "/api/placeholder/48/48"}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' /%3E%3C/svg%3E";
                            }}
                          />
                          {product.stock_quantity === 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                              Rupture
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatXOF(product.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.stock_quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stock_quantity > 10
                            ? "bg-green-100 text-green-800"
                            : product.stock_quantity > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock_quantity > 10
                          ? "En stock"
                          : product.stock_quantity > 0
                          ? "Stock faible"
                          : "Rupture"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-lg hover:bg-indigo-50 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'édition */}
      <ProductModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        product={currentProduct}
        onProductChange={handleProductChange}
        mode="edit"
        existingProduct={editingProduct}
        onSubmit={handleSubmitProduct}
      />

      {/* Modal d'ajout */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        product={currentProduct}
        onProductChange={handleProductChange}
        mode="add"
        existingProduct={null}
        onSubmit={handleSubmitProduct}
      />
    </>
  );
}