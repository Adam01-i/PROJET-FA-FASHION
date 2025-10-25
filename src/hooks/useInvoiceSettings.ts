// hooks/useInvoiceSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { InvoiceSettings } from '../models';

// Valeurs par défaut pour les paramètres de facturation
const defaultInvoiceSettings: InvoiceSettings = {
  id: '',
  company_name: 'FAFASHION',
  company_address: 'Adresse à définir',
  company_city: 'Dakar',
  company_country: 'Sénégal',
  company_phone: '+221 XX XXX XX XX',
  company_email: 'contact@fafashion.sn',
  company_website: '',
  company_tax_id: '',
  company_logo_url: '',
  company_account_number: '',
  created_at: '',
  updated_at: ''
};

export function useInvoiceSettings() {
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(defaultInvoiceSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoiceSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('invoice_settings')
        .select('*')
        .limit(1)
        .single();

      if (supabaseError) {
        // Si l'erreur est "No rows found", c'est normal - la table est vide
        if (supabaseError.code === 'PGRST116') {
          console.log('Aucun paramètre de facturation trouvé, utilisation des valeurs par défaut');
          setInvoiceSettings(defaultInvoiceSettings);
        } else {
          throw supabaseError;
        }
      } else if (data) {
        setInvoiceSettings(data);
      } else {
        setInvoiceSettings(defaultInvoiceSettings);
      }
    } catch (err) {
      console.error('Error fetching invoice settings:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des paramètres de facturation');
      // En cas d'erreur, utiliser les valeurs par défaut
      setInvoiceSettings(defaultInvoiceSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveInvoiceSettings = async (newSettings: InvoiceSettings): Promise<boolean> => {
    try {
      setError(null);

      const { error: supabaseError } = await supabase
        .from('invoice_settings')
        .upsert({ 
          ...newSettings, 
          updated_at: new Date().toISOString() 
        });

      if (supabaseError) {
        throw supabaseError;
      }

      await fetchInvoiceSettings();
      return true;
    } catch (err) {
      console.error('Error saving invoice settings:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde des paramètres de facturation');
      return false;
    }
  };

  const initializeDefaultInvoiceSettings = useCallback(async () => {
    try {
      const { error: supabaseError } = await supabase
        .from('invoice_settings')
        .upsert(defaultInvoiceSettings);

      if (supabaseError) {
        throw supabaseError;
      }

      await fetchInvoiceSettings();
    } catch (err) {
      console.error('Error initializing default invoice settings:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'initialisation des paramètres de facturation');
    }
  }, [fetchInvoiceSettings]);

  useEffect(() => {
    fetchInvoiceSettings();
  }, [fetchInvoiceSettings]);

  return {
    invoiceSettings,
    loading,
    error,
    saveInvoiceSettings,
    refetch: fetchInvoiceSettings,
    initializeDefaultInvoiceSettings
  };
}