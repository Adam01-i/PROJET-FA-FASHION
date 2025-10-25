// templates/invoiceTemplate.tsx
import { Order, InvoiceSettings } from '../models';

function formatXOF(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "XOF" });
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export function generateInvoiceHTML(order: Order, invoiceSettings: InvoiceSettings): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${order.id}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
            padding: 20px;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 3px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .header .invoice-number {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .company-info {
            background: #f8f9fa;
            padding: 25px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .company-details {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        
        .company-address {
            flex: 1;
        }
        
        .company-address h2 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 20px;
        }
        
        .company-address p {
            margin-bottom: 5px;
            color: #555;
        }
        
        .invoice-details {
            background: #fff;
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }
        
        .detail-section h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 16px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 5px;
        }
        
        .detail-item {
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
        }
        
        .detail-label {
            font-weight: 600;
            color: #555;
        }
        
        .detail-value {
            color: #333;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 5px 0;
        }
        
        .items-table th {
            background: #f8f9fa;
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
            color: #2c3e50;
            border-bottom: 2px solid #667eea;
        }
        
        .items-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .items-table tr:hover {
            background: #f8f9fa;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .totals-section {
            background: #f8f9fa;
            padding: 25px;
            border-top: 2px solid #667eea;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding: 4px 0;
        }
        
        .total-label {
            font-weight: 600;
            color: #555;
        }
        
        .total-amount {
            font-weight: 600;
            color: #2c3e50;
        }
        
        .grand-total {
            font-size: 20px;
            font-weight: 700;
            color: #667eea;
            border-top: 2px solid #667eea;
            padding-top: 10px;
            margin-top: 10px;
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            padding: 15px;
            text-align: center;
            margin-top: 20px;
        }
        
        .footer p {
            margin-bottom: 5px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-confirmed {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        .status-paid {
            background: #d4edda;
            color: #155724;
        }
        
        .notes-section {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }
        
        .assistant-info {
            background: #e3f2fd;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            border-left: 4px solid #2196f3;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .invoice-container {
                border: none;
                border-radius: 0;
            }
            
            .footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- En-tête -->
        <div class="header">
            <h1>FACTURE</h1>
            <p class="invoice-number">N° ${order.id}</p>
        </div>
        
        <!-- Informations de l'entreprise -->
        <div class="company-info">
            <div class="company-details">
                <div class="company-address">
                    <h2>${invoiceSettings.company_name}</h2>
                    ${invoiceSettings.company_address ? `<p>${invoiceSettings.company_address}</p>` : 'adresse non spécifiée'}
                    ${invoiceSettings.company_phone ? `<p>Tél: ${invoiceSettings.company_phone}</p>` : ''}
                    ${invoiceSettings.company_email ? `<p>Email: ${invoiceSettings.company_email}</p>` : ''}
                </div>
                <div class="invoice-meta">
                    <p><strong>Date d'émission:</strong> ${formatDate(order.created_at)}</p>
                    <p><strong>Statut:</strong> 
                        <span class="status-badge status-${order.status}">${order.status === 'pending' ? 'En attente' : order.status === 'confirmed' ? 'Confirmée' : 'Annulée'}</span>
                    </p>
                    <p><strong>Paiement:</strong> 
                        <span class="status-badge status-${order.payment_status}">${order.payment_status === 'pending' ? 'En attente' : order.payment_status === 'paid' ? 'Payée' : order.payment_status === 'failed' ? 'Échoué' : 'Remboursée'}</span>
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Informations du client et de la facture -->
        <div class="invoice-details">
            <div class="details-grid">
                <div class="detail-section">
                    <h3>Client</h3>
                    <div class="detail-item">
                        <span class="detail-label">Nom:</span>
                        <span class="detail-value">${order.customer_name || 'Non spécifié'}</span>
                    </div>
                    ${order.customer_phone ? `
                    <div class="detail-item">
                        <span class="detail-label">Téléphone:</span>
                        <span class="detail-value">${order.customer_phone}</span>
                    </div>
                    ` : ''}
                    ${order.customer_email ? `
                    <div class="detail-item">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${order.customer_email}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="detail-section">
                    <h3>Détails de la commande</h3>
                    <div class="detail-item">
                        <span class="detail-label">N° Commande:</span>
                        <span class="detail-value">${order.id}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date commande:</span>
                        <span class="detail-value">${formatDate(order.created_at)}</span>
                    </div>
                    ${order.payment_method ? `
                    <div class="detail-item">
                        <span class="detail-label">Méthode paiement:</span>
                        <span class="detail-value">${order.payment_method === 'wave' ? 'Wave' : order.payment_method === 'orange_money' ? 'Orange Money' : order.payment_method === 'mobile_money' ? 'Mobile Money' : order.payment_method === 'credit_card' ? 'Carte de crédit' : 'Espèces'}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
        
        <!-- Informations assistant si disponible -->
        ${order.assistant_name ? `
        <div class="assistant-info">
            <strong>Commande traitée par:</strong> ${order.assistant_name}
            ${order.assistant_id ? ` (ID: ${order.assistant_id.slice(0, 8)}...)` : ''}
        </div>
        ` : ''}
        
        <!-- Adresse de livraison -->
        ${order.shipping_address ? `
        <div class="invoice-details">
            <div class="detail-section">
                <h3>Adresse de livraison</h3>
                <div class="detail-item">
                    <span class="detail-label">Nom:</span>
                    <span class="detail-value">${order.shipping_address.full_name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Téléphone:</span>
                    <span class="detail-value">${order.shipping_address.phone}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Adresse:</span>
                    <span class="detail-value">${order.shipping_address.address}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Ville:</span>
                    <span class="detail-value">${order.shipping_address.city}</span>
                </div>
                ${order.shipping_address.notes ? `
                <div class="detail-item">
                    <span class="detail-label">Notes:</span>
                    <span class="detail-value">${order.shipping_address.notes}</span>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
        
        <!-- Notes de la commande -->
        ${order.notes ? `
        <div class="notes-section">
            <strong>Notes:</strong> ${order.notes}
        </div>
        ` : ''}
        
        <!-- Articles de la commande -->
        <div class="invoice-details">
            <h3>Articles commandés</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th class="text-right">Prix unitaire</th>
                        <th class="text-center">Quantité</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.order_items ? order.order_items.map(item => `
                    <tr>
                        <td>
                            <strong>${item.product?.name || 'Produit non trouvé'}</strong>
                            ${item.product?.description ? `<br><small>${item.product.description}</small>` : ''}
                        </td>
                        <td class="text-right">${formatXOF(item.price)}</td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-right">${formatXOF(item.price * item.quantity)}</td>
                    </tr>
                    `).join('') : ''}
                </tbody>
            </table>
        </div>
        
        <!-- Totaux -->
        <div class="totals-section">
            <div class="total-row">
                <span class="total-label">Sous-total:</span>
                <span class="total-amount">${formatXOF(order.total_amount)}</span>
            </div>
            <div class="total-row">
                <span class="total-label">Livraison:</span>
                <span class="total-amount">Gratuite</span>
            </div>
            <div class="total-row grand-total">
                <span class="total-label">TOTAL:</span>
                <span class="total-amount">${formatXOF(order.total_amount)}</span>
            </div>
        </div>
        
        <!-- Pied de page -->
        <div class="footer">
            <p>Merci pour votre confiance !</p>
        </div>
    </div>
</body>
</html>
  `;
}