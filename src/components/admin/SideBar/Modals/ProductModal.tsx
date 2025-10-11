import React, { useState, useEffect } from "react";
import { Plus, X, Save, Upload } from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import { Product } from "../../../../types";
import { Category } from "../../../../types";
import { useToastContext } from "../../../../hooks/ToastProvider";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    category_id: string;
    image_url: string;
  };
  onProductChange: (product: {
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    category_id: string;
    image_url: string;
  }) => void;
  
  mode: "add" | "edit";
  existingProduct?: Product | null;
  
  onSubmit: (productData: {
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    category_id: string;
    image_url: string;
  }) => void | Promise<void>;
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
  onProductChange,
  mode,
  existingProduct,
  onSubmit,
}: ProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadError, setUploadError] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const { success, error: toastError } = useToastContext();

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toastError("Erreur", "Impossible de charger les catégories");
      }
    };
    
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, toastError]);

  // Reset form when modal opens - CORRECTION ICI
  useEffect(() => {
    if (isOpen && !isInitialized) {
      if (mode === "add") {
        onProductChange({
          name: "",
          description: "",
          price: 0,
          stock_quantity: 0,
          category_id: "",
          image_url: "",
        });
        setImagePreview("");
        setUploadError("");
      } else if (mode === "edit" && existingProduct) {
        onProductChange({
          name: existingProduct.name,
          description: existingProduct.description || "",
          price: existingProduct.price,
          stock_quantity: existingProduct.stock_quantity,
          category_id: existingProduct.category_id || "",
          image_url: existingProduct.image_url || "",
        });
        setImagePreview(existingProduct.image_url || "");
        setUploadError("");
      }
      setIsInitialized(true);
    }
    
    // Reset initialization when modal closes
    if (!isOpen) {
      setIsInitialized(false);
    }
  }, [isOpen, mode, existingProduct, onProductChange, isInitialized]);

  // Generate image preview when image_url changes - CORRECTION ICI
  useEffect(() => {
    if (product.image_url) {
      setImagePreview(product.image_url);
    } else {
      setImagePreview("");
    }
  }, [product.image_url]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");

    if (!file.type.startsWith("image/")) {
      setUploadError("Veuillez sélectionner un fichier image valide");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("L'image ne doit pas dépasser 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Vous devez être connecté pour uploader des images");
      }

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message.includes('row-level security policy')) {
          throw new Error("Problème de permissions. Vérifiez les politiques RLS du bucket.");
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      onProductChange({ ...product, image_url: publicUrl });
      success("Image téléchargée", "L'image a été téléchargée avec succès");
      
    } catch (error: unknown) {
      console.error("Error uploading image:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du téléchargement de l'image";
      setUploadError(errorMessage);
      toastError("Erreur d'upload", errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!product.name.trim()) {
      toastError("Erreur", "Le nom du produit est requis");
      return;
    }
    if (!product.description.trim()) {
      toastError("Erreur", "La description du produit est requise");
      return;
    }
    if (product.price <= 0) {
      toastError("Erreur", "Le prix doit être supérieur à 0");
      return;
    }
    if (product.stock_quantity < 0) {
      toastError("Erreur", "Le stock ne peut pas être négatif");
      return;
    }
    if (!product.category_id) {
      toastError("Erreur", "Veuillez sélectionner une catégorie");
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(product);
      success(
        mode === "add" ? "Produit ajouté" : "Produit modifié",
        mode === "add" 
          ? "Le produit a été ajouté avec succès" 
          : "Le produit a été modifié avec succès"
      );
      onClose();
    } catch (error) {
      console.error(`Error ${mode === "add" ? "adding" : "updating"} product:`, error);
      toastError(
        "Erreur",
        `Erreur lors ${mode === "add" ? "de l'ajout" : "de la modification"} du produit`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    onProductChange({ ...product, [field]: value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header avec dégradé */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">
              {mode === "add" ? "Ajouter un produit" : "Modifier le produit"}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {mode === "add" 
                ? "Remplissez les informations du nouveau produit" 
                : "Modifiez les informations du produit"
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Section Image avec carte */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Image du produit
              </label>

              <div className="space-y-4">
                {/* Aperçu de l'image */}
                {imagePreview && (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Aperçu du produit"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' /%3E%3C/svg%3E";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        handleInputChange("image_url", "");
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Zone de téléchargement */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-all duration-200 bg-white group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="product-image-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="product-image-upload"
                    className={`cursor-pointer block ${isUploading ? 'opacity-50' : ''}`}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {isUploading ? "Téléchargement..." : "Cliquez pour télécharger"}
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WEBP - Max 5MB
                    </p>
                  </label>
                </div>

                {/* Message d'erreur */}
                {uploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{uploadError}</p>
                  </div>
                )}

                {/* URL alternative */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Ou entrez une URL
                  </label>
                  <input
                    type="url"
                    value={product.image_url}
                    onChange={(e) => handleInputChange("image_url", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="block w-full rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Informations du produit */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  required
                  placeholder="Nom du produit"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description *
                </label>
                <textarea
                  value={product.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  rows={3}
                  required
                  placeholder="Description détaillée du produit"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Prix (XOF) *
                  </label>
                  <input
                    type="number"
                    value={product.price || ""}
                    onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={product.stock_quantity || ""}
                    onChange={(e) => handleInputChange("stock_quantity", parseInt(e.target.value) || 0)}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    min="0"
                    required
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Catégorie *
                </label>
                <select
                  value={product.category_id}
                  onChange={(e) => handleInputChange("category_id", e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer avec boutons */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 shadow-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || isUploading}
              className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {mode === "add" ? "Ajout..." : "Modification..."}
                </>
              ) : (
                <>
                  {mode === "add" ? (
                    <Plus className="h-4 w-4 mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {mode === "add" ? "Ajouter le produit" : "Enregistrer"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}