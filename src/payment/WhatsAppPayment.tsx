// components/payment/WhatsAppPayment.tsx
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatXOF } from '../lib/currency';
import { CartItem } from '../models';
import { calculateProductPrice } from '../services/pricingService';

interface WhatsAppPaymentProps {
  items: CartItem[];
  customerInfo: {
    phone: string;
    name?: string;
  };
  deliveryInfo?: {
    location: string;
    fee: number;
  };
  onSuccess?: (orderId: string) => void;
  onError?: (error: string) => void;
}

interface OrderItemWithWholesale {
  product_id: string;
  quantity: number;
  price: number; // Prix régulier
  wholesalePrice?: number; // Prix en gros calculé
  savings?: number; // Économies réalisées
}

export default function WhatsAppPayment({
  items,
  customerInfo,
  deliveryInfo,
  onSuccess,
  onError
}: WhatsAppPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const createWhatsAppOrder = async (): Promise<{
    orderId: string;
    subtotal: number;
    deliveryFee: number;
    totalWithDelivery: number;
    itemsWithWholesale: OrderItemWithWholesale[];
    totalSavings: number;
  }> => {
    // 1. Calculer les prix en gros pour chaque article
    const itemsWithWholesale: OrderItemWithWholesale[] = [];
    let subtotal = 0;
    let totalSavings = 0;

    for (const item of items) {
      // Calculer le prix en gros pour cette quantité
      const priceInfo = await calculateProductPrice(item.id, item.quantity);
      const wholesalePrice = priceInfo.finalPrice;
      const regularPrice = item.price;
      const itemTotal = wholesalePrice * item.quantity;
      const regularTotal = regularPrice * item.quantity;
      const savings = priceInfo.priceType === 'wholesale' 
        ? regularTotal - itemTotal 
        : 0;

      itemsWithWholesale.push({
        product_id: item.id,
        quantity: item.quantity,
        price: regularPrice,
        wholesalePrice: wholesalePrice,
        savings: savings
      });

      subtotal += itemTotal;
      totalSavings += savings;
    }

    // 2. Calculer les frais de livraison et total
    const deliveryFee = deliveryInfo?.fee || 0;
    const totalWithDelivery = subtotal + deliveryFee;

    // 3. Préparer les données pour la RPC
    const orderItemsData = itemsWithWholesale.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.wholesalePrice || item.price // Utiliser le prix en gros si disponible
    }));

    // 4. Utiliser RPC pour créer la commande (version avec prix en gros)
    const { data, error } = await supabase.rpc("create_guest_order_with_wholesale", {
      customer_phone: customerInfo.phone,
      customer_name: customerInfo.name?.trim() || null,
      subtotal_amount: subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalWithDelivery,
      delivery_location_id: null,
      delivery_location_name: deliveryInfo?.location || null,
      order_items: orderItemsData,
      payment_method: 'whatsapp'
    });

    if (error) {
      console.error('RPC Error:', error);
      throw error;
    }
    
    if (!data) throw new Error('Aucun ID de commande retourné');

    return {
      orderId: data,
      subtotal,
      deliveryFee,
      totalWithDelivery,
      itemsWithWholesale,
      totalSavings
    };
  };

  const generateWhatsAppMessage = (
    orderId: string,
    subtotal: number,
    deliveryFee: number,
    totalWithDelivery: number,
    itemsWithWholesale: OrderItemWithWholesale[],
    totalSavings: number
  ) => {
    const itemsText = itemsWithWholesale
      .map((item, index) => {
        const regularPrice = items[index].price;
        const wholesalePrice = item.wholesalePrice || regularPrice;
        const itemTotal = wholesalePrice * item.quantity;
        const regularTotal = regularPrice * item.quantity;
        const hasWholesale = item.wholesalePrice && item.wholesalePrice < regularPrice;
        
        let itemLine = `• ${item.quantity}x ${items[index].name} - ${formatXOF(itemTotal)}`;
        
        if (hasWholesale) {
          const savings = regularTotal - itemTotal;
          const discount = Math.round((savings / regularTotal) * 100);
          itemLine += `\n  🏷️  Prix en gros appliqué (${discount}% d'économie)`;
          itemLine += `\n  💰  Économie: ${formatXOF(savings)}`;
        }
        
        return itemLine;
      })
      .join("\n\n");

    const customerText = customerInfo.name
      ? `Nom: ${customerInfo.name}\nTéléphone: ${customerInfo.phone}`
      : `Téléphone: ${customerInfo.phone}`;

    const deliveryText = deliveryInfo
      ? `Lieu de livraison: ${deliveryInfo.location}\nFrais: ${formatXOF(deliveryInfo.fee)}`
      : "Livraison: À préciser";

    const wholesaleSummary = totalSavings > 0
      ? `\n🎉 *Économies totales grâce aux prix en gros: ${formatXOF(totalSavings)}*`
      : "";

    return (
      `Bonjour! Je souhaite passer une commande 🛍️\n\n` +
      `*Informations client:*\n${customerText}\n\n` +
      `*Informations de livraison:*\n${deliveryText}\n\n` +
      `*Détails de la commande:*\n` +
      `Numéro: ${orderId}\n\n` +
      `*Produits commandés:*\n${itemsText}\n\n` +
      `*Récapitulatif:*\n` +
      `Sous-total: ${formatXOF(subtotal)}\n` +
      `Frais de livraison: ${formatXOF(deliveryFee)}\n` +
      `${wholesaleSummary}\n` +
      `*Total à payer: ${formatXOF(totalWithDelivery)}*\n\n` +
      `Je suis prêt(e) à procéder au paiement. Merci!`
    );
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // 1. Créer la commande et récupérer toutes les informations
      const { 
        orderId, 
        subtotal, 
        deliveryFee, 
        totalWithDelivery,
        itemsWithWholesale,
        totalSavings 
      } = await createWhatsAppOrder();

      // 2. Récupérer le numéro WhatsApp du store
      const { data: storeSettings } = await supabase
        .from("store_settings")
        .select("phone")
        .single();

      const whatsappNumber = storeSettings?.phone?.replace(/\D/g, "") || "221782906487";
      const cleanNumber = whatsappNumber.startsWith("221") 
        ? whatsappNumber 
        : `221${whatsappNumber}`;

      // 3. Générer et envoyer le message détaillé
      const message = generateWhatsAppMessage(
        orderId,
        subtotal,
        deliveryFee,
        totalWithDelivery,
        itemsWithWholesale,
        totalSavings
      );
      
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, "_blank");

      // 4. Notifier le succès
      onSuccess?.(orderId);

    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Erreur lors du paiement";
      console.error('Payment error:', error);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isProcessing}
      className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
        isProcessing
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      }`}
    >
      <MessageCircle className="mr-2 h-5 w-5" />
      {isProcessing ? "Traitement..." : "Payer par WhatsApp"}
    </button>
  );
}