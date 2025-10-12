import { useState } from 'react';
import { X, Package, AlertTriangle } from 'lucide-react';
import { Product } from '../../../types';

interface StockModalProps {
  product: Product;
  onClose: () => void;
  onSave: (productId: string, newStock: number) => Promise<void>;
}

export default function StockModal({ product, onClose, onSave }: StockModalProps) {
  const [stockQuantity, setStockQuantity] = useState(product.stock_quantity);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(product.id, stockQuantity);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = () => {
    if (stockQuantity === 0) {
      return { color: 'text-red-600', label: 'Rupture de stock', icon: AlertTriangle };
    }
    if (stockQuantity <= (product.low_stock_threshold || 5)) {
      return { color: 'text-yellow-600', label: 'Stock faible', icon: AlertTriangle };
    }
    return { color: 'text-green-600', label: 'Stock suffisant', icon: Package };
  };

  const stockStatus = getStockStatus();
  const StatusIcon = stockStatus.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Package className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gestion du Stock</h2>
              <p className="text-sm text-gray-600">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Statut actuel */}
          <div className={`flex items-center space-x-2 p-4 rounded-xl border ${stockStatus.color.replace('text', 'bg').replace('600', '50')} ${stockStatus.color.replace('600', '200')}`}>
            <StatusIcon className={`h-5 w-5 ${stockStatus.color}`} />
            <span className={`font-medium ${stockStatus.color}`}>
              {stockStatus.label}
            </span>
          </div>

          {/* Quantité en stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité en stock
            </label>
            <input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              required
            />
            {product.low_stock_threshold && (
              <p className="text-sm text-gray-500 mt-2">
                Seuil d'alerte: {product.low_stock_threshold} unités
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}