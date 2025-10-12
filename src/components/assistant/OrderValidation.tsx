import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  User, 
  Package, 
  CreditCard, 
  MapPin,
  ArrowLeft,
  Send,
  Printer
} from 'lucide-react';
import { Order } from '../../types';

// Données mockées pour la démo
const mockOrder: Order = {
  id: 'CMD-2024-001',
  user_id: 'user-12345',
  total_amount: 45900,
  status: 'processing',
  payment_method: 'orange_money',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  order_items: [
    {
      id: 'item-1',
      order_id: 'CMD-2024-001',
      product_id: 'prod-1',
      product: {
        id: 'prod-1',
        name: 'Smartphone Android',
        description: 'Smartphone haut de gamme avec écran 6.7"',
        price: 29900,
        image_url: '/api/placeholder/300/300',
        category: 'Électronique',
        stock: 50,
        created_at: new Date().toISOString()
      },
      quantity: 1,
      price: 29900
    },
    {
      id: 'item-2',
      order_id: 'CMD-2024-001',
      product_id: 'prod-2',
      product: {
        id: 'prod-2',
        name: 'Casque Bluetooth',
        description: 'Casque audio sans fil avec réduction de bruit',
        price: 16000,
        image_url: '/api/placeholder/300/300',
        category: 'Audio',
        stock: 30,
        created_at: new Date().toISOString()
      },
      quantity: 1,
      price: 16000
    }
  ]
};

export default function OrderValidation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<Order['status']>('pending');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Simulation de chargement des données
    setTimeout(() => {
      setOrder(mockOrder);
      setSelectedStatus(mockOrder.status);
      setLoading(false);
    }, 1000);
  }, [orderId]);

  const handleStatusUpdate = async () => {
    // Simulation de mise à jour
    setTimeout(() => {
      if (order) {
        setOrder({ ...order, status: selectedStatus });
        alert('Statut de commande mis à jour avec succès !');
      }
    }, 500);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatXOF = (amount: number): string => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
  };

  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
          iconColor: 'text-green-500',
          label: 'Terminée'
        };
      case 'processing':
        return {
          icon: Truck,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          iconColor: 'text-blue-500',
          label: 'En cours'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800 border-red-200',
          iconColor: 'text-red-500',
          label: 'Annulée'
        };
      default:
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          iconColor: 'text-yellow-500',
          label: 'En attente'
        };
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'orange_money':
        return 'Orange Money';
      case 'wave':
        return 'Wave';
      case 'credit_card':
        return 'Carte de crédit';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Commande non trouvée</h2>
          <p className="text-gray-600 mb-6">La commande demandée n'existe pas ou a été supprimée.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 print:bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Validation de Commande
              </h1>
              <p className="text-lg text-gray-600">
                Gestion et suivi de la commande <span className="font-semibold text-indigo-600">#{order.id}</span>
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 transition-colors print:hidden"
              >
                <Printer className="h-5 w-5" />
                <span>Imprimer</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="xl:col-span-2 space-y-8">
            {/* Carte Statut de la commande */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Statut de la commande</h2>
                <div className="flex items-center space-x-3">
                  <statusConfig.icon className={`h-8 w-8 ${statusConfig.iconColor}`} />
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Modifier le statut
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as Order['status'])}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="pending">En attente</option>
                    <option value="processing">En cours de traitement</option>
                    <option value="completed">Terminée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Notes internes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Ajoutez des notes ou des instructions pour cette commande..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors"
                  />
                </div>

                <button
                  onClick={handleStatusUpdate}
                  className="w-full bg-indigo-600 text-white py-4 px-6 rounded-2xl font-semibold hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
                >
                  <Send className="h-5 w-5" />
                  <span>Mettre à jour la commande</span>
                </button>
              </div>
            </div>

            {/* Carte Articles de la commande */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Articles commandés</h2>
              
              <div className="space-y-6">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-2xl hover:border-indigo-200 transition-colors">
                    <div className="flex-shrink-0 w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                      <Package className="h-8 w-8 text-indigo-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {item.product.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">
                          Quantité: {item.quantity}
                        </span>
                        <span className="text-sm text-gray-500">
                          Prix unitaire: {formatXOF(item.price)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">
                        {formatXOF(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-gray-900">Total général</span>
                  <span className="text-indigo-600">{formatXOF(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-8">
            {/* Carte Informations client */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                <User className="h-6 w-6 text-indigo-600" />
                <span>Informations client</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">ID Client</p>
                  <p className="text-gray-900 font-medium">{order.user_id}</p>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-gray-500">Date de commande</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Carte Paiement */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-indigo-600" />
                <span>Paiement</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Méthode de paiement</p>
                  <p className="text-gray-900 font-medium capitalize">
                    {getPaymentMethodLabel(order.payment_method)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-gray-500">Montant total</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatXOF(order.total_amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Carte Livraison */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                <MapPin className="h-6 w-6 text-indigo-600" />
                <span>Livraison</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Statut</p>
                  <p className="text-gray-900 font-medium">En attente de préparation</p>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-gray-500">Adresse</p>
                  <p className="text-gray-900 font-medium">
                    123 Avenue de la République<br />
                    Dakar, Sénégal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}