import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SiteSettingsDB } from '../types';

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettingsDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les paramètres depuis Supabase
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('key');

      if (error) throw error;
      setSettings(data || []);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder les paramètres dans Supabase
  const saveSettings = async (newSettings: SiteSettingsDB[]) => {
    try {
      setError(null);

      // Utiliser upsert pour créer ou mettre à jour chaque paramètre
      const { error } = await supabase
        .from('site_settings')
        .upsert(newSettings, {
          onConflict: 'key',
          ignoreDuplicates: false
        });

      if (error) throw error;

      // Recharger les paramètres après sauvegarde
      await fetchSettings();
      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde des paramètres');
      throw err;
    }
  };

  // Initialiser les paramètres par défaut si la table est vide
  const initializeDefaultSettings = async () => {
    try {
      const defaultSettings: SiteSettingsDB[] = [
        {
          id: '',
          key: 'site_info',
          value: JSON.stringify({
            siteName: 'E-Shop',
            description: 'Votre boutique en ligne'
          }),
          description: 'Informations générales du site',
          created_at: new Date().toISOString()
        },
        {
          id: '',
          key: 'contact_info',
          value: JSON.stringify({
            contactEmail: 'contact@eshop.com',
            phoneNumber: '+221 XX XXX XX XX',
            address: 'Adresse de votre boutique'
          }),
          description: 'Informations de contact',
          created_at: new Date().toISOString()
        },
        {
          id: '',
          key: 'social_links',
          value: JSON.stringify({
            facebook: '',
            twitter: '',
            instagram: ''
          }),
          description: 'Liens vers les réseaux sociaux',
          created_at: new Date().toISOString()
        },
        {
          id: '',
          key: 'payment_methods',
          value: JSON.stringify({
            wave: true,
            orangeMoney: true,
            creditCard: true
          }),
          description: 'Méthodes de paiement acceptées',
          created_at: new Date().toISOString()
        }
      ];

      const { error } = await supabase
        .from('site_settings')
        .insert(defaultSettings);

      if (error) throw error;
      await fetchSettings();
    } catch (err) {
      console.error('Error initializing default settings:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    saveSettings,
    refetch: fetchSettings,
    initializeDefaultSettings
  };
}