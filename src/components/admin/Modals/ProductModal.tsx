import React, { useState, useEffect } from "react";
import { Plus, X, Save, Upload, Link, Info } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { Product } from "../../../models";
import { Category } from "../../../models";
import { useToastContext } from "../../../hooks/ToastProvider";

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
          .from("categories")
          .select("*")
          .order("name");

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Vérifier si l'utilisateur est connecté
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Vous devez être connecté pour uploader des images");
      }

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        if (uploadError.message.includes("row-level security policy")) {
          throw new Error(
            "Problème de permissions. Vérifiez les politiques RLS du bucket."
          );
        }
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      onProductChange({ ...product, image_url: publicUrl });
      success("Image téléchargée", "L'image a été téléchargée avec succès");
    } catch (error: unknown) {
      console.error("Error uploading image:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors du téléchargement de l'image";
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
    // if (product.price <= 0) {
    //   toastError("Erreur", "Le prix doit être supérieur à 0");
    //   return;
    // }
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
      console.error(
        `Error ${mode === "add" ? "adding" : "updating"} product:`,
        error
      );
      toastError(
        "Erreur",
        `Erreur lors ${
          mode === "add" ? "de l'ajout" : "de la modification"
        } du produit`
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
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden animate-scale-in">
      {/* Header avec dégradé moderne */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              {mode === "add" ? "Nouveau Produit" : "Modifier le Produit"}
            </h2>
            <p className="text-blue-100 text-sm font-medium">
              {mode === "add"
                ? "Créez un nouveau produit pour votre catalogue"
                : "Mettez à jour les informations du produit"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110 group"
          >
            <X className="h-6 w-6 text-white group-hover:text-blue-100" />
          </button>
        </div>
        
        {/* Indicateur de progression visuel */}
        <div className="flex space-x-1 mt-4">
          <div className="h-1 w-1/4 bg-white/40 rounded-full"></div>
          <div className="h-1 w-1/4 bg-white/20 rounded-full"></div>
          <div className="h-1 w-1/4 bg-white/20 rounded-full"></div>
          <div className="h-1 w-1/4 bg-white/20 rounded-full"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col h-[calc(95vh-140px)]">
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Section Image améliorée */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Image du Produit
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Téléchargez une image attractive pour votre produit
                  </p>
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Optionnel
                </div>
              </div>

              <div className="space-y-6">
                {/* Aperçu de l'image amélioré */}
                {imagePreview && (
                  <div className="relative group">
                    <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 shadow-sm">
                      <img
                        src={imagePreview}
                        alt="Aperçu du produit"
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' /%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        handleInputChange("image_url", "");
                      }}
                      className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 shadow-lg transform hover:scale-110"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Zone de téléchargement améliorée */}
                <div className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  isUploading 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                } group`}>
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
                    className={`cursor-pointer block ${
                      isUploading ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`p-4 rounded-2xl mb-4 transition-colors ${
                        isUploading ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-100'
                      }`}>
                        {isUploading ? (
                          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Upload className="h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">
                          {isUploading ? "Téléchargement en cours..." : "Cliquez pour télécharger"}
                        </p>
                        <p className="text-sm text-gray-500 mb-3">
                          Glissez-déposez ou cliquez pour sélectionner une image
                        </p>
                        <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                          <span>PNG, JPG, WEBP</span>
                          <span>•</span>
                          <span>Max 5MB</span>
                          <span>•</span>
                          <span>Recommandé: 800×800px</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Message d'erreur amélioré */}
                {uploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-500 text-sm font-bold">!</span>
                    </div>
                    <div>
                      <p className="text-red-800 font-medium">Erreur de téléchargement</p>
                      <p className="text-red-600 text-sm mt-1">{uploadError}</p>
                    </div>
                  </div>
                )}

                {/* URL alternative améliorée */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-900 mb-3 items-center">
                    <Link className="h-4 w-4 mr-2 text-gray-400" />
                    Ou utilisez une URL d'image
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="url"
                      value={product.image_url}
                      onChange={(e) => handleInputChange("image_url", e.target.value)}
                      placeholder="https://exemple.com/image-produit.jpg"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(product.image_url)}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      Prévisualiser
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations du produit améliorées */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Informations du Produit
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Renseignez les détails essentiels de votre produit
                  </p>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Requis
                </div>
              </div>

              <div className="space-y-6">
                {/* Grille responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Nom du produit */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-3 items-center">
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">1</span>
                      Nom du produit *
                    </label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg font-medium"
                      required
                      placeholder="Ex: T-shirt Premium Cotton"
                    />
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-3 items-center">
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">2</span>
                      Description *
                    </label>
                    <textarea
                      value={product.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      rows={4}
                      required
                      placeholder="Décrivez votre produit de manière détaillée..."
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Minimum 50 caractères recommandé</span>
                      <span>{product.description.length} caractères</span>
                    </div>
                  </div>

                  {/* Prix et Stock */}
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3 items-center">
                        <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">3</span>
                        Prix (XOF) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 font-medium">FCFA</span>
                        </div>
                        <input
                          type="number"
                          value={product.price || ""}
                          onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                          className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
                          min="0"
                          step="0.01"
                          required
                          placeholder="0.00"
                          disabled={true}
                          title="Utilisez le bouton 'Réapprovisionner' pour modifier le prix"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        Modifiable via réapprovisionnement
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3 items-center">
                        <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">4</span>
                        Stock *
                      </label>
                      <input
                        type="number"
                        value={product.stock_quantity || ""}
                        onChange={(e) => handleInputChange("stock_quantity", parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
                        min="0"
                        required
                        placeholder="0"
                        disabled={true}
                        title="Utilisez le bouton 'Réapprovisionnement' pour modifier le stock"
                      />
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        Modifiable via réapprovisionnement
                      </p>
                    </div>
                  </div>

                  {/* Catégorie */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-3 items-center">
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">5</span>
                      Catégorie *
                    </label>
                    <select
                      value={product.category_id}
                      onChange={(e) => handleInputChange("category_id", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                      required
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <Info className="h-3 w-3 mr-1" />
                      Choisissez la catégorie la plus appropriée pour votre produit
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer amélioré */}
        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Tous les champs marqués * sont obligatoires
            </div>
            <div className="flex space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 sm:flex-none px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading || isUploading}
                className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{mode === "add" ? "Création..." : "Sauvegarde..."}</span>
                  </>
                ) : (
                  <>
                    {mode === "add" ? (
                      <Plus className="h-5 w-5" />
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    <span>{mode === "add" ? "Créer le Produit" : "Sauvegarder"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
);
}
