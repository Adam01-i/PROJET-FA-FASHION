import { useState, useEffect } from "react";
import { X, Package, Percent, Hash, AlertCircle } from "lucide-react";
import { formatXOF } from "../../../lib/currency"; 

interface WholesaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  regularProducts?: any[];
  selectedProduct?: any;
  onProductSelect?: (product: any) => void;
  wholesaleProduct?: any;
  onSave: (
    productId: string,
    minQuantity: number,
    wholesalePrice: number,
    mode: "add" | "edit",
    wholesaleId?: string
  ) => void;
}

export default function WholesaleModal({
  isOpen,
  onClose,
  mode,
  regularProducts = [],
  selectedProduct,
  onProductSelect,
  wholesaleProduct,
  onSave,
}: WholesaleModalProps) {
  const [step, setStep] = useState<"select" | "configure">("select");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [minQuantity, setMinQuantity] = useState<number>(1);
  const [wholesalePrice, setWholesalePrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Initialiser avec les données existantes en mode édition
  useEffect(() => {
    if (mode === "edit" && wholesaleProduct) {
      setSelectedProductId(wholesaleProduct.product_id);
      setMinQuantity(wholesaleProduct.min_quantity);
      setWholesalePrice(wholesaleProduct.wholesale_price);
      setStep("configure");
    } else if (mode === "add" && selectedProduct) {
      setSelectedProductId(selectedProduct.id);
      setStep("configure");
      setWholesalePrice(selectedProduct.price * 0.9); // 10% de remise par défaut
    }
  }, [mode, wholesaleProduct, selectedProduct]);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedProductId("");
    setMinQuantity(1);
    setWholesalePrice(0);
    setStep("select");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleProductSelection = (product: any) => {
    setSelectedProductId(product.id);
    if (onProductSelect) {
      onProductSelect(product);
    }
    setWholesalePrice(product.price * 0.9); // 10% de remise par défaut
    setStep("configure");
  };

  const calculateDiscount = (regularPrice: number, wholesalePrice: number) => {
    if (!regularPrice) return 0;
    return (
      Math.round(((regularPrice - wholesalePrice) / regularPrice) * 10000) / 100
    );
  };

  const getSelectedProduct = () => {
    if (mode === "edit") return wholesaleProduct;
    if (selectedProductId) {
      return regularProducts.find((p) => p.id === selectedProductId);
    }
    return null;
  };

  const validateForm = () => {
    const product = getSelectedProduct();
    if (!product) {
      setError("Veuillez sélectionner un produit");
      return false;
    }

    if (minQuantity < 1) {
      setError("Le seuil minimum doit être d'au moins 1 unité");
      return false;
    }

    if (wholesalePrice <= 0) {
      setError("Le prix en gros doit être supérieur à 0");
      return false;
    }

    if (wholesalePrice >= product.price) {
      setError("Le prix en gros doit être inférieur au prix régulier");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const product = getSelectedProduct();
      if (!product) throw new Error("Produit non trouvé");

      await onSave(
        product.id,
        minQuantity,
        wholesalePrice,
        mode,
        wholesaleProduct?.id
      );

      handleClose();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const product = getSelectedProduct();
  const discount = product
    ? calculateDiscount(product.price, wholesalePrice)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {mode === "add"
                  ? "Ajouter un prix en gros"
                  : "Modifier le prix en gros"}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === "add"
                  ? "Configurez un nouveau prix pour les commandes en gros"
                  : "Modifiez le prix en gros existant"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {step === "select" && mode === "add" && (
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">
                Sélectionnez un produit
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regularProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelection(product)}
                    className={`p-4 border rounded-xl text-left transition-all hover:shadow-md ${
                      selectedProductId === product.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
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
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{product.name}</h4>
                        <p className="text-sm text-gray-600">
                          {product.category_name}
                        </p>
                        <p className="text-lg font-semibold mt-1">
                          {formatXOF(product?.price || 0)}
                        </p>
                      </div>
                    </div>
                    {product.has_wholesale && (
                      <div className="mt-2 text-sm text-yellow-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Déjà des prix en gros configurés
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {regularProducts.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-600">Aucun produit disponible</p>
                </div>
              )}
            </div>
          )}

          {step === "configure" && (
            <div className="p-6">
              {/* Infos du produit */}
              {product && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.product_name || product.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-white flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold">
                        {product.product_name || product.name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div>
                          <p className="text-sm text-gray-600">Prix régulier</p>
                          <p className="text-lg font-semibold">
                            {formatXOF(product?.price || 0)}{" "}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Stock disponible
                          </p>
                          <p className="text-lg font-semibold">
                            {product.stock_quantity} unités
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulaire */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      Seuil minimum
                    </div>
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="1"
                      value={minQuantity}
                      onChange={(e) =>
                        setMinQuantity(parseInt(e.target.value) || 1)
                      }
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ex: 10"
                    />
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">+ {minQuantity}</span>{" "}
                      unités minimum
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Le prix en gros s'appliquera pour les commandes de{" "}
                    {minQuantity} unités ou plus
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-2" />
                      Prix en gros
                    </div>
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={wholesalePrice}
                        onChange={(e) =>
                          setWholesalePrice(parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Ex: 4500"
                      />
                      <div className="absolute right-3 top-3 text-gray-500">
                        FCFA
                      </div>
                    </div>
                    {product && (
                      <div className="text-sm">
                        <div
                          className={`font-medium ${
                            discount > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {discount > 0 ? "-" : ""}
                          {discount}%
                        </div>
                        <div className="text-gray-600">de remise</div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          Économie par unité
                        </p>
                        <p className="font-semibold text-green-600">
                          {product
                            ? (product.price - wholesalePrice).toLocaleString(
                                "fr-FR",
                                { style: "currency", currency: "XOF" }
                              )
                            : "0 FCFA"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Économie totale</p>
                        <p className="font-semibold text-green-600">
                          {product
                            ? (
                                (product.price - wholesalePrice) *
                                minQuantity
                              ).toLocaleString("fr-FR", {
                                style: "currency",
                                currency: "XOF",
                              })
                            : "0 FCFA"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <p className="text-red-800">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div>
            {step === "configure" && mode === "add" && (
              <button
                onClick={() => setStep("select")}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Retour au choix du produit
              </button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || (step === "configure" && !product)}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading
                ? "Enregistrement..."
                : mode === "add"
                ? "Ajouter"
                : "Modifier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
