import { Order } from '../models';

export interface Html2PdfOptions {
  margin: number;
  filename: string;
  image: { 
    type: 'jpeg'; 
    quality: number;
  };
  html2canvas: { 
    scale: 2; 
    useCORS: true;
  };
  jsPDF: { 
    unit: 'mm'; 
    format: 'a4'; 
    orientation: 'portrait';
  };
}

// Fonctions utilitaires pour le formatage
export function formatXOF(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getStatusDisplayName(status: Order['status']): string {
  const statusMap: Record<Order['status'], string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    // processing: 'En traitement',
    // shipped: 'Expédiée',
    // delivered: 'Livrée',
    cancelled: 'Annulée'
  };
  return statusMap[status] || status;
}

export function getPaymentStatusDisplayName(status: Order['payment_status']): string {
  const statusMap: Record<Order['payment_status'], string> = {
    pending: 'En attente',
    paid: 'Payée',
    failed: 'Échouée',
    refunded: 'Remboursée'
  };
  return statusMap[status] || status;
}

export function getPaymentMethodDisplayName(method?: Order['payment_method']): string {
  const methodMap: Record<NonNullable<Order['payment_method']>, string> = {
    wave: 'Wave',
    orange_money: 'Orange Money',
    mobile_money: 'Mobile Money',
    credit_card: 'Carte de crédit',
    cash: 'Espèces'
  };
  return method ? methodMap[method] : 'Non spécifié';
}