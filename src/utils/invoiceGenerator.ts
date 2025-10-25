import { Order, InvoiceSettings } from '../models';
import { generateInvoiceHTML } from '../templates/invoiceTemplate';
import { Html2PdfOptions } from './invoiceUtils';

export function generateInvoicePDF(order: Order, invoiceSettings: InvoiceSettings): void {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const content = generateInvoiceHTML(order, invoiceSettings);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(content);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  }
}

export async function downloadInvoicePDF(order: Order, invoiceSettings: InvoiceSettings): Promise<void> {
  try {
    const content = generateInvoiceHTML(order, invoiceSettings);
    
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facture-${order.id}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur lors de la génération de la facture:', error);
    throw error;
  }
}

export async function generateAdvancedInvoicePDF(order: Order, invoiceSettings: InvoiceSettings): Promise<void> {
  const element = document.createElement('div');
  element.innerHTML = generateInvoiceHTML(order, invoiceSettings);
  
  const opt: Html2PdfOptions = {
    margin: 10,
    filename: `facture-${order.id}-${new Date().toISOString().split('T')[0]}.pdf`,
    image: { 
      type: 'jpeg', 
      quality: 0.98 
    },
    html2canvas: { 
      scale: 2, 
      useCORS: true 
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    }
  };

  try {
    const html2pdf = await import('html2pdf.js');
    const html2pdfInstance = html2pdf.default();
    const pdfGenerator = html2pdfInstance.set(opt).from(element);
    await pdfGenerator.save();
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
}