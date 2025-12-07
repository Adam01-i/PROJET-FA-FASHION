// components/Modals/RestockModal.tsx
import { useState, useEffect } from "react";
import { X, Package, DollarSign, Info } from "lucide-react";
import { Product } from "../../../models";

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onRestock: (productId: string, quantity: number, newPrice: number, reason: string) => Promise<void>;
}

export default function RestockModal({ isOpen, onClose, product, onRestock }: RestockModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [newPrice, setNewPrice] = useState(product.price);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Réinitialiser les valeurs quand le produit change
  useEffect(() => {
    if (product) {
      setNewPrice(product.price);
      setQuantity(1);
      setReason("");
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    setLoading(true);
    try {
      await onRestock(product.id, quantity, newPrice, reason || "Réapprovisionnement manuel");
      setQuantity(1);
      setReason("");
      onClose();
    } catch (error) {
      console.error("Error restocking:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalValue = () => {
    return quantity * newPrice;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Package className="h-5 w-5 mr-2 text-green-600" />
            Réapprovisionner le stock
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Informations du produit */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900 text-lg">{product.name}</p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div>
              <span className="text-gray-600">Stock actuel:</span>
              <span className={`ml-2 font-semibold ${
                product.stock_quantity === 0 ? 'text-red-600' : 
                product.stock_quantity <= 5 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {product.stock_quantity} unités
              </span>
            </div>
            <div>
              <span className="text-gray-600">Prix actuel:</span>
              <span className="ml-2 font-semibold text-blue-600">
                {formatXOF(product.price)}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité à ajouter *
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          {/* Nouveau prix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau prix (XOF) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <Info className="h-3 w-3 mr-1" />
              Ancien prix: {formatXOF(product.price)}
            </p>
          </div>

          {/* Raison */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raison du réapprovisionnement (optionnel)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Commande fournisseur, Ajustement stock, Nouveau prix..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Résumé */}
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Nouveau stock:</span>
                <span className="ml-2 font-semibold text-green-700">
                  {product.stock_quantity + quantity} unités
                </span>
              </div>
              <div>
                <span className="text-gray-600">Valeur totale:</span>
                <span className="ml-2 font-semibold text-green-700">
                  {formatXOF(calculateTotalValue())}
                </span>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || quantity <= 0 || newPrice <= 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  En cours...
                </>
              ) : (
                `Réapprovisionner ${quantity} unités`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Fonction utilitaire pour formater les prix
function formatXOF(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "XOF" });
}
