import { Order, SiteSettingsData } from '../types';
import { 
  formatXOF, 
  formatDate, 
  getStatusDisplayName, 
  getPaymentStatusDisplayName, 
  getPaymentMethodDisplayName 
} from '../utils/invoiceUtils';

export function generateInvoiceHTML(order: Order, settings: SiteSettingsData): string {
  const company = settings.invoiceSettings;
  const hasCompanyInfo = company.company_name && company.company_address && company.company_city;
  
  // Générer le numéro de facture
  const invoiceNumber = `FACT-${order.id.slice(0, 8).toUpperCase()}`;
  
  // Calculer la date d'échéance (30 jours après la création)
  const dueDate = new Date(order.created_at);
  dueDate.setDate(dueDate.getDate() + 30);
  
  // Configuration de la facture
  const invoiceConfig = {
    terms: 'Paiement à réception de la facture',
    notes: 'Merci pour votre confiance !'
  };

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${invoiceNumber}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #fff;
            padding: 16px;
        }
        
        .invoice-container {
            max-width: 100%;
            margin: 0 auto;
            background: #fff;
        }
        
        /* Header responsive */
        .header {
            display: flex;
            flex-direction: column;
            gap: 24px;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        @media (min-width: 640px) {
            .header {
                flex-direction: row;
                justify-content: space-between;
                align-items: flex-start;
            }
        }
        
        .company-info h1 {
            color: #111827;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 12px;
            line-height: 1.2;
        }
        
        .company-info p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 6px;
            line-height: 1.4;
        }
        
        .invoice-info {
            text-align: left;
        }
        
        @media (min-width: 640px) {
            .invoice-info {
                text-align: right;
            }
        }
        
        .invoice-info h2 {
            color: #374151;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 12px;
        }
        
        .invoice-info p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 4px;
        }
        
        /* Détails client responsive */
        .invoice-details {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 24px;
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
        }
        
        @media (min-width: 768px) {
            .details-grid {
                grid-template-columns: 1fr 1fr;
            }
        }
        
        .detail-group h3 {
            color: #374151;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .detail-group p {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.5;
        }
        
        /* Table responsive */
        .table-container {
            overflow-x: auto;
            margin-bottom: 24px;
            -webkit-overflow-scrolling: touch;
        }
        
        .products-table {
            width: 100%;
            min-width: 500px;
            border-collapse: collapse;
            font-size: 14px;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .products-table th {
            background: #f8fafc;
            padding: 16px 12px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
            white-space: nowrap;
        }
        
        .products-table td {
            padding: 16px 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .product-name {
            font-weight: 500;
            color: #1f2937;
        }
        
        .product-price, .product-quantity, .product-total {
            text-align: right;
        }
        
        .product-price {
            color: #6b7280;
        }
        
        .product-total {
            font-weight: 600;
            color: #1f2937;
        }
        
        /* Totaux responsive */
        .totals {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
            margin-bottom: 32px;
        }
        
        @media (min-width: 640px) {
            .totals {
                grid-template-columns: 1fr 1fr;
            }
        }
        
        .total-section {
            text-align: left;
        }
        
        @media (min-width: 640px) {
            .total-section {
                text-align: right;
            }
        }
        
        .subtotal, .total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .total {
            border-bottom: none;
            font-size: 18px;
            font-weight: 700;
            color: #111827;
            padding-top: 16px;
        }
        
        /* Badges de statut responsive */
        .status-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 24px;
        }
        
        .status-badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
        }
        
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-confirmed { background: #ffedd5; color: #9a3412; }
        .status-processing { background: #e9d5ff; color: #7e22ce; }
        .status-shipped { background: #dbeafe; color: #1e40af; }
        .status-delivered { background: #d1fae5; color: #065f46; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        
        .payment-paid { background: #d1fae5; color: #065f46; }
        .payment-pending { background: #fef3c7; color: #92400e; }
        .payment-failed { background: #fee2e2; color: #991b1b; }
        .payment-refunded { background: #f3f4f6; color: #374151; }
        
        /* Notes et footer */
        .notes {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-top: 24px;
        }
        
        .notes h3 {
            color: #374151;
            margin-bottom: 12px;
            font-size: 14px;
            font-weight: 600;
        }
        
        .notes p {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .footer {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            line-height: 1.6;
        }
        
        .warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            text-align: center;
            font-size: 14px;
        }
        
        /* Styles d'impression */
        @media print {
            body {
                padding: 0;
                font-size: 12px;
            }
            .invoice-container {
                max-width: 100%;
                margin: 0;
            }
            .warning {
                display: none;
            }
            .status-badges {
                page-break-inside: avoid;
            }
            .table-container {
                overflow-x: visible;
            }
            .products-table {
                min-width: auto;
            }
        }
        
        /* Améliorations mobiles */
        @media (max-width: 640px) {
            body {
                padding: 12px;
            }
            
            .company-info h1 {
                font-size: 20px;
            }
            
            .invoice-info h2 {
                font-size: 18px;
            }
            
            .invoice-details {
                padding: 16px;
            }
            
            .products-table th,
            .products-table td {
                padding: 12px 8px;
                font-size: 13px;
            }
            
            .total {
                font-size: 16px;
            }
        }
        
        @media (max-width: 480px) {
            .status-badges {
                justify-content: center;
            }
            
            .status-badge {
                font-size: 11px;
                padding: 6px 12px;
            }
            
            .products-table {
                font-size: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        ${!hasCompanyInfo ? `
            <div class="warning">
                <strong>Attention:</strong> Les informations de votre entreprise ne sont pas complètement configurées. 
                Veuillez les remplir dans les paramètres pour une facture professionnelle.
            </div>
        ` : ''}
        
        <!-- En-tête -->
        <div class="header">
            <div class="company-info">
                <h1>${company.company_name || 'VOTRE ENTREPRISE'}</h1>
                ${company.company_address ? `<p>${company.company_address}</p>` : ''}
                ${company.company_city && company.company_country ? `<p>${company.company_city}, ${company.company_country}</p>` : ''}
                ${company.company_phone ? `<p>Tél: ${company.company_phone}</p>` : ''}
                ${company.company_email ? `<p>Email: ${company.company_email}</p>` : ''}
            </div>
            <div class="invoice-info">
                <h2>FACTURE</h2>
                <p><strong>N°:</strong> ${invoiceNumber}</p>
                <p><strong>Date:</strong> ${formatDate(order.created_at)}</p>
                <p><strong>Échéance:</strong> ${formatDate(dueDate.toISOString())}</p>
            </div>
        </div>
        
        <!-- Informations client -->
        <div class="invoice-details">
            <div class="details-grid">
                <div class="detail-group">
                    <h3>FACTURÉ À</h3>
                    <p><strong>${order.user?.full_name || 'Non spécifié'}</strong></p>
                    <p>${order.user?.email || ''}</p>
                    <p>${order.user?.phone || ''}</p>
                </div>
                <div class="detail-group">
                    <h3>LIVRAISON</h3>
                    ${order.shipping_address ? `
                        <p><strong>${order.shipping_address.full_name}</strong></p>
                        <p>${order.shipping_address.phone}</p>
                        <p>${order.shipping_address.address}</p>
                        <p>${order.shipping_address.city}</p>
                        ${order.shipping_address.notes ? `<p><em>${order.shipping_address.notes}</em></p>` : ''}
                    ` : '<p>À définir</p>'}
                </div>
            </div>
        </div>
        
        <!-- Statuts -->
        <div class="status-badges">
            <div class="status-badge status-${order.status}">
                Commande: ${getStatusDisplayName(order.status)}
            </div>
            <div class="status-badge payment-${order.payment_status}">
                Paiement: ${getPaymentStatusDisplayName(order.payment_status)}
            </div>
            ${order.payment_method ? `
                <div class="status-badge" style="background: #e0f2fe; color: #0369a1;">
                    Méthode: ${getPaymentMethodDisplayName(order.payment_method)}
                </div>
            ` : ''}
        </div>
        
        <!-- Produits -->
        <div class="table-container">
            <table class="products-table">
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Prix unitaire</th>
                        <th>Quantité</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.order_items?.map(item => `
                        <tr>
                            <td class="product-name">${item.product?.name || 'Produit non trouvé'}</td>
                            <td class="product-price">${formatXOF(item.price)}</td>
                            <td class="product-quantity">${item.quantity}</td>
                            <td class="product-total">${formatXOF(item.price * item.quantity)}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="4" style="text-align: center; color: #6b7280;">Aucun produit</td></tr>'}
                </tbody>
            </table>
        </div>
        
        <!-- Totaux -->
        <div class="totals">
            <div></div>
            <div class="total-section">
                <div class="subtotal">
                    <span>Sous-total:</span>
                    <span>${formatXOF(order.total_amount)}</span>
                </div>
                <div class="subtotal">
                    <span>Frais de livraison:</span>
                    <span>${formatXOF(0)}</span>
                </div>
                <div class="total">
                    <span>TOTAL:</span>
                    <span>${formatXOF(order.total_amount)}</span>
                </div>
            </div>
        </div>
        
        <!-- Notes -->
        ${order.notes ? `
            <div class="notes">
                <h3>Notes de la commande</h3>
                <p>${order.notes}</p>
            </div>
        ` : ''}
        
        <!-- Pied de page -->
        <div class="footer">
            <p><strong>Conditions de paiement:</strong> ${invoiceConfig.terms}</p>
            <p><strong>Modalités de livraison:</strong> Livraison sous 2-5 jours ouvrables</p>
            <p>${invoiceConfig.notes}</p>
            <p style="margin-top: 20px;">Facture générée le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
    </div>
</body>
</html>
  `;
}