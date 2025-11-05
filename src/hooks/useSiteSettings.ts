import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import {
  StoreSettings,
  SocialLinks,
  PaymentMethods,
  ShippingSettings,
  InvoiceSettings,
  DeliveryLocation,
  DeveloperInfo,
} from "../models";

// Interface pour combiner tous les paramètres (à définir localement)
interface SiteSettingsData {
  store: StoreSettings;
  socialLinks: SocialLinks;
  paymentMethods: PaymentMethods;
  shipping: ShippingSettings;
  invoiceSettings: InvoiceSettings;
  deliveryLocations: DeliveryLocation[];
  developerInfo: DeveloperInfo; // Nouveau
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

const defaultDeveloperInfo: DeveloperInfo = {
  id: "",
  developer_name: "",
  developer_email: "",
  developer_phone: "",
  developer_website: "",
  github_url: "",
  linkedin_url: "",
  instagram_url: "",
  portfolio_url: "",
  description: "",
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
  developerInfo: defaultDeveloperInfo,
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
        { data: developerData }, // Nouveau
      ] = await Promise.all([
        supabase.from("store_settings").select("*").limit(1).single(),
        supabase.from("social_links").select("*").limit(1).single(),
        supabase.from("payment_methods").select("*").limit(1).single(),
        supabase.from("shipping_settings").select("*").limit(1).single(),
        supabase.from("invoice_settings").select("*").limit(1).single(),
        supabase.from("delivery_locations").select("*"),
        supabase.from("developer_info").select("*").limit(1).single(), // Nouveau
      ]);

      // Combiner toutes les données réelles de la base de données
      const combinedSettings: SiteSettingsData = {
        store: storeData || defaultStoreSettings,
        socialLinks: socialData || defaultSocialLinks,
        paymentMethods: paymentData || defaultPaymentMethods,
        shipping: shippingData || defaultShippingSettings,
        invoiceSettings: invoiceData || defaultInvoiceSettings,
        deliveryLocations: deliveryLocationsData || defaultDeliveryLocations,
        developerInfo: developerData || defaultDeveloperInfo,
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

      console.log("Données à sauvegarder:", newSettings);

      // 1. Gestion des delivery_locations
      const newLocations = newSettings.deliveryLocations.filter(
        (loc) => !loc.id || loc.id.startsWith("temp-")
      );
      const existingLocations = newSettings.deliveryLocations.filter(
        (loc) => loc.id && !loc.id.startsWith("temp-")
      );

      const updatePromises = existingLocations.map((location) =>
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

      const insertPromises = newLocations.map((location) =>
        supabase.from("delivery_locations").insert([
          {
            name: location.name,
            delivery_fee: location.delivery_fee,
            is_active: location.is_active,
          },
        ])
      );

      const deliveryResults = await Promise.all([
        ...updatePromises,
        ...insertPromises,
      ]);
      const deliveryErrors = deliveryResults.filter((result) => result.error);
      if (deliveryErrors.length > 0) {
        console.error("Delivery location errors:", deliveryErrors);
        throw new Error("Erreur lors de la sauvegarde des lieux de livraison");
      }

      // 2. Fonction pour nettoyer les données avant upsert
      const cleanDataForUpsert = <
        T extends { created_at?: string; updated_at?: string; id?: string }
      >(
        data: T
      ): any => {
        const { created_at, updated_at, id, ...rest } = data;

        // Ne pas inclure l'ID s'il est vide
        const cleanedData: any = { ...rest };
        if (id && id !== "") {
          cleanedData.id = id;
        }

        // Toujours utiliser la date actuelle pour updated_at
        cleanedData.updated_at = new Date().toISOString();

        // Ne pas inclure created_at s'il est vide, laisser la base de données gérer la valeur par défaut
        if (created_at && created_at !== "") {
          cleanedData.created_at = created_at;
        }

        return cleanedData;
      };

      // 3. Sauvegarde des autres tables avec données nettoyées
      const otherPromises = [
        supabase
          .from("store_settings")
          .upsert(cleanDataForUpsert(newSettings.store)),
        supabase
          .from("social_links")
          .upsert(cleanDataForUpsert(newSettings.socialLinks)),
        supabase
          .from("payment_methods")
          .upsert(cleanDataForUpsert(newSettings.paymentMethods)),
        supabase
          .from("shipping_settings")
          .upsert(cleanDataForUpsert(newSettings.shipping)),
        supabase
          .from("invoice_settings")
          .upsert(cleanDataForUpsert(newSettings.invoiceSettings)),
      ];

      const otherResults = await Promise.all(otherPromises);
      const otherErrors = otherResults.filter((result) => result.error);

      if (otherErrors.length > 0) {
        console.error("Other settings errors:", otherErrors);
        throw new Error("Erreur lors de la sauvegarde des paramètres");
      }

      // Recharger les données
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
