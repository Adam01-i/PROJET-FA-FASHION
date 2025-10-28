import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import {
  StoreSettings,
  SocialLinks,
  PaymentMethods,
  ShippingSettings,
  InvoiceSettings,
  DeliveryLocation,
} from "../models";

// Interface pour combiner tous les paramètres (à définir localement)
interface SiteSettingsData {
  store: StoreSettings;
  socialLinks: SocialLinks;
  paymentMethods: PaymentMethods;
  shipping: ShippingSettings;
  invoiceSettings: InvoiceSettings;
  deliveryLocations: DeliveryLocation[]; // Ajouter cette ligne
}

// Valeurs par défaut vides - les données viendront de la base de données
const defaultStoreSettings: StoreSettings = {
  id: "",
  name: "",
  description: "",
  email: "",
  phone: "",
  address: "",
  currency: "XOF",
  logo_url: "",
  favicon_url: "",
  created_at: "",
  updated_at: "",
};

const defaultSocialLinks: SocialLinks = {
  id: "",
  facebook_url: "",
  twitter_url: "",
  instagram_url: "",
  linkedin_url: "",
  youtube_url: "",
  tiktok_url: "",
  created_at: "",
  updated_at: "",
};

const defaultPaymentMethods: PaymentMethods = {
  id: "",
  wave_enabled: false,
  orange_money_enabled: false,
  credit_card_enabled: false,
  mobile_money_enabled: false,
  cash_on_delivery_enabled: false,
  bank_transfer_enabled: false,
  wave_instructions: "",
  orange_money_instructions: "",
  bank_transfer_details: "",
  created_at: "",
  updated_at: "",
};

const defaultShippingSettings: ShippingSettings = {
  id: "",
  enabled: false,
  cost: 0,
  free_shipping_threshold: 0,
  delivery_time: "",
  home_delivery_enabled: false,
  pickup_in_store_enabled: false,
  delivery_fee: 0,
  created_at: "",
  updated_at: "",
};

const defaultInvoiceSettings: InvoiceSettings = {
  id: "",
  company_name: "",
  company_address: "",
  company_city: "",
  company_country: "",
  company_phone: "",
  company_email: "",
  company_website: "",
  company_tax_id: "",
  company_logo_url: "",
  company_account_number: "",
  created_at: "",
  updated_at: "",
};

const defaultSettings: SiteSettingsData = {
  store: defaultStoreSettings,
  socialLinks: defaultSocialLinks,
  paymentMethods: defaultPaymentMethods,
  shipping: defaultShippingSettings,
  invoiceSettings: defaultInvoiceSettings,
  deliveryLocations: [],
};

const defaultDeliveryLocations: DeliveryLocation[] = [];

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer toutes les données des différentes tables depuis la base de données
      const [
        { data: storeData },
        { data: socialData },
        { data: paymentData },
        { data: shippingData },
        { data: invoiceData },
        { data: deliveryLocationsData },
      ] = await Promise.all([
        supabase.from("store_settings").select("*").limit(1).single(),
        supabase.from("social_links").select("*").limit(1).single(),
        supabase.from("payment_methods").select("*").limit(1).single(),
        supabase.from("shipping_settings").select("*").limit(1).single(),
        supabase.from("invoice_settings").select("*").limit(1).single(),
        supabase.from("delivery_locations").select("*"),
      ]);

      // Combiner toutes les données réelles de la base de données
      const combinedSettings: SiteSettingsData = {
        store: storeData || defaultStoreSettings,
        socialLinks: socialData || defaultSocialLinks,
        paymentMethods: paymentData || defaultPaymentMethods,
        shipping: shippingData || defaultShippingSettings,
        invoiceSettings: invoiceData || defaultInvoiceSettings,
        deliveryLocations: deliveryLocationsData || defaultDeliveryLocations,
      };

      setSettings(combinedSettings);
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des paramètres"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (
    newSettings: SiteSettingsData
  ): Promise<boolean> => {
    try {
      setError(null);

      // Séparer les nouveaux lieux des existants
      const newLocations = newSettings.deliveryLocations.filter(loc => loc.id.startsWith('temp-'));
      const existingLocations = newSettings.deliveryLocations.filter(loc => !loc.id.startsWith('temp-'));

      // Mise à jour des lieux existants
      const updatePromises = existingLocations.map(location =>
        supabase
          .from("delivery_locations")
          .update({
            name: location.name,
            delivery_fee: location.delivery_fee,
            is_active: location.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", location.id)
      );

      // Insertion des nouveaux lieux
      const insertPromises = newLocations.map(location =>
        supabase
          .from("delivery_locations")
          .insert([
            {
              name: location.name,
              delivery_fee: location.delivery_fee,
              is_active: location.is_active,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ])
      );

      // Exécuter les opérations sur delivery_locations
      const deliveryResults = await Promise.all([...updatePromises, ...insertPromises]);
      const deliveryHasError = deliveryResults.some(result => result.error);
      if (deliveryHasError) {
        throw new Error("Erreur lors de la sauvegarde des lieux de livraison");
      }

      // Sauvegarder dans les autres tables
      const otherPromises = [
        supabase.from("store_settings").upsert({
          ...newSettings.store,
          updated_at: new Date().toISOString(),
        }),

        supabase.from("social_links").upsert({
          ...newSettings.socialLinks,
          updated_at: new Date().toISOString(),
        }),

        supabase.from("payment_methods").upsert({
          ...newSettings.paymentMethods,
          updated_at: new Date().toISOString(),
        }),

        supabase.from("shipping_settings").upsert({
          ...newSettings.shipping,
          updated_at: new Date().toISOString(),
        }),

        supabase.from("invoice_settings").upsert({
          ...newSettings.invoiceSettings,
          updated_at: new Date().toISOString(),
        }),
      ];

      const otherResults = await Promise.all(otherPromises);

      // Vérifier s'il y a des erreurs dans les autres tables
      const otherHasError = otherResults.some((result) => result.error);
      if (otherHasError) {
        throw new Error("Erreur lors de la sauvegarde des paramètres");
      }

      await fetchSettings();
      return true;
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la sauvegarde des paramètres"
      );
      return false;
    }
  };

  const toggleDeliveryLocation = async (
    id: string,
    isActive: boolean
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("delivery_locations")
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      await fetchSettings();
      return true;
    } catch (err) {
      console.error("Error toggling delivery location:", err);
      return false;
    }
  };

  const deactivateDeliveryLocation = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("delivery_locations")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      await fetchSettings();
      return true;
    } catch (err) {
      console.error("Error deactivating delivery location:", err);
      return false;
    }
  };

  const initializeDefaultSettings = useCallback(async () => {
    try {
      const promises = [
        supabase.from("store_settings").upsert(defaultStoreSettings),
        supabase.from("social_links").upsert(defaultSocialLinks),
        supabase.from("payment_methods").upsert(defaultPaymentMethods),
        supabase.from("shipping_settings").upsert(defaultShippingSettings),
        supabase.from("invoice_settings").upsert(defaultInvoiceSettings),
      ];

      const results = await Promise.all(promises);
      const hasError = results.some((result) => result.error);

      if (hasError) {
        throw new Error("Erreur lors de l'initialisation des paramètres");
      }

      await fetchSettings();
    } catch (err) {
      console.error("Error initializing default settings:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'initialisation des paramètres"
      );
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
    initializeDefaultSettings,
    toggleDeliveryLocation,
    deactivateDeliveryLocation,
  };
}

// Hook pour la compatibilité
export function useParsedSettings() {
  const { settings, loading, error } = useSiteSettings();

  return {
    settings,
    loading,
    error,
    
  };
}