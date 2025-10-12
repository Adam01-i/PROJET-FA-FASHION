import { Order, SiteSettingsData } from '../../../../types';
import { 
  generateInvoicePDF, 
  downloadInvoicePDF, 
  generateAdvancedInvoicePDF 
} from '../utils/InvoiceGenerator';

interface InvoiceGeneratorProps {
  order: Order;
  settings: SiteSettingsData;
}

export function InvoiceGenerator({ order, settings }: InvoiceGeneratorProps) {
  const handlePrint = () => {
    generateInvoicePDF(order, settings);
  };

  const handleDownloadPDF = async () => {
    try {
      await generateAdvancedInvoicePDF(order, settings);
    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error);
      alert('Erreur lors de la génération du PDF');
    }
  };

  const handleDownloadHTML = async () => {
    try {
      await downloadInvoicePDF(order, settings);
    } catch (error) {
      console.error('Erreur lors du téléchargement HTML:', error);
      alert('Erreur lors de la génération du HTML');
    }
  };

  return (
    <div className="flex flex-wrap gap-4 p-4">
      <button
        onClick={handlePrint}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Imprimer la facture
      </button>
      <button
        onClick={handleDownloadPDF}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        Télécharger PDF
      </button>
      <button
        onClick={handleDownloadHTML}
        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
      >
        Télécharger HTML
      </button>
    </div>
  );
}