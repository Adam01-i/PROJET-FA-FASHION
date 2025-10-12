import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  StoreSettings,
  SocialLinks,
  PaymentMethods,
  ShippingSettings,
  InvoiceSettings,
  SiteSettingsData
} from '../models';

// Valeurs par défaut cohérentes avec les nouvelles tables
const defaultStoreSettings: StoreSettings = {
  id: '',
  name: 'E-Shop',
  description: 'Votre boutique en ligne',
  email: 'contact@eshop.com',
  phone: '+221 33 123 45 67',
  address: '123 Avenue du Commerce, Dakar, Sénégal',
  currency: 'XOF',
  logo_url: '',
  favicon_url: '',
  created_at: '',
  updated_at: ''
};

const defaultSocialLinks: SocialLinks = {
  id: '',
  facebook_url: '',
  twitter_url: '',
  instagram_url: '',
  linkedin_url: '',
  created_at: '',
  updated_at: ''
};

const defaultPaymentMethods: PaymentMethods = {
  id: '',
  wave_enabled: true,
  orange_money_enabled: true,
  credit_card_enabled: false,
  mobile_money_enabled: true,
  cash_on_delivery_enabled: true,
  bank_transfer_enabled: false,
  wave_instructions: '',
  orange_money_instructions: '',
  bank_transfer_details: '',
  created_at: '',
  updated_at: ''
};

const defaultShippingSettings: ShippingSettings = {
  id: '',
  enabled: true,
  cost: 2000,
  free_shipping_threshold: 50000,
  delivery_time: '2-5 jours ouvrables',
  home_delivery_enabled: true,
  pickup_in_store_enabled: true,
  delivery_fee: 2000,
  created_at: '',
  updated_at: ''
};

const defaultInvoiceSettings: InvoiceSettings = {
  id: '',
  company_name: 'VOTRE BOUTIQUE',
  company_address: '123 Avenue du Commerce',
  company_city: 'Dakar',
  company_country: 'Sénégal',
  company_phone: '+221 33 123 45 67',
  company_email: 'contact@votreboutique.sn',
  company_website: '',
  company_tax_id: '',
  company_logo_url: '',
  // company_rccm: '',
  // company_id_nat: '',
  company_account_number: '',
  // invoice_prefix: 'FACT',
  // invoice_next_number: 1,
  // invoice_due_days: 30,
  // invoice_terms: 'Paiement à réception de la facture',
  // invoice_notes: 'Merci pour votre confiance !',
  // invoice_payment_terms: 'Paiement à 30 jours',
  // invoice_legal_notice: '',
  created_at: '',
  updated_at: ''
};

const defaultSettings: SiteSettingsData = {
  store: defaultStoreSettings,
  socialLinks: defaultSocialLinks,
  paymentMethods: defaultPaymentMethods,
  shipping: defaultShippingSettings,
  invoiceSettings: defaultInvoiceSettings
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer toutes les données des différentes tables
      const [
        { data: storeData, error: storeError },
        { data: socialData, error: socialError },
        { data: paymentData, error: paymentError },
        { data: shippingData, error: shippingError },
        { data: invoiceData, error: invoiceError }
      ] = await Promise.all([
        supabase.from('store_settings').select('*').limit(1).single(),
        supabase.from('social_links').select('*').limit(1).single(),
        supabase.from('payment_methods').select('*').limit(1).single(),
        supabase.from('shipping_settings').select('*').limit(1).single(),
        supabase.from('invoice_settings').select('*').limit(1).single()
      ]);

      // Gérer les erreurs
      if (storeError) console.error('Store settings error:', storeError);
      if (socialError) console.error('Social links error:', socialError);
      if (paymentError) console.error('Payment methods error:', paymentError);
      if (shippingError) console.error('Shipping settings error:', shippingError);
      if (invoiceError) console.error('Invoice settings error:', invoiceError);

      // Combiner toutes les données
      const combinedSettings: SiteSettingsData = {
        store: storeData || defaultStoreSettings,
        socialLinks: socialData || defaultSocialLinks,
        paymentMethods: paymentData || defaultPaymentMethods,
        shipping: shippingData || defaultShippingSettings,
        invoiceSettings: invoiceData || defaultInvoiceSettings
      };

      setSettings(combinedSettings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (newSettings: SiteSettingsData): Promise<boolean> => {
    try {
      setError(null);

      // Sauvegarder dans chaque table
      const promises = [
        supabase
          .from('store_settings')
          .upsert({ ...newSettings.store, updated_at: new Date().toISOString() }),
        
        supabase
          .from('social_links')
          .upsert({ ...newSettings.socialLinks, updated_at: new Date().toISOString() }),
        
        supabase
          .from('payment_methods')
          .upsert({ ...newSettings.paymentMethods, updated_at: new Date().toISOString() }),
        
        supabase
          .from('shipping_settings')
          .upsert({ ...newSettings.shipping, updated_at: new Date().toISOString() }),
        
        supabase
          .from('invoice_settings')
          .upsert({ ...newSettings.invoiceSettings, updated_at: new Date().toISOString() })
      ];

      const results = await Promise.all(promises);
      
      // Vérifier s'il y a des erreurs
      const hasError = results.some(result => result.error);
      if (hasError) {
        throw new Error('Erreur lors de la sauvegarde des paramètres');
      }

      await fetchSettings();
      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde des paramètres');
      return false;
    }
  };

  const initializeDefaultSettings = useCallback(async () => {
    try {
      const promises = [
        supabase.from('store_settings').upsert(defaultStoreSettings),
        supabase.from('social_links').upsert(defaultSocialLinks),
        supabase.from('payment_methods').upsert(defaultPaymentMethods),
        supabase.from('shipping_settings').upsert(defaultShippingSettings),
        supabase.from('invoice_settings').upsert(defaultInvoiceSettings)
      ];

      const results = await Promise.all(promises);
      const hasError = results.some(result => result.error);
      
      if (hasError) {
        throw new Error('Erreur lors de l\'initialisation des paramètres');
      }

      await fetchSettings();
    } catch (err) {
      console.error('Error initializing default settings:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'initialisation des paramètres');
    }
  }, [fetchSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    saveSettings,
    refetch: fetchSettings,
    initializeDefaultSettings
  };
}

// Hook pour la compatibilité (peut être supprimé plus tard)
export function useParsedSettings() {
  const { settings, loading, error } = useSiteSettings();
  
  return {
    settings,
    loading,
    error
  };
}