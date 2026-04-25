import {
  useState,
  useEffect,
  // JSXElementConstructor,
  // Key,
  // ReactElement,
  // ReactNode,
  // ReactPortal,
} from "react";
import { ExternalLink, User, Code } from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import {
  Save,
  Settings,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Globe,
  Truck,
  CreditCard,
  FileText,
} from "lucide-react";
// Par :
import {
  StoreSettings,
  SocialLinks,
  PaymentMethods,
  ShippingSettings,
  InvoiceSettings,
  DeliveryLocation,
  DeveloperInfo,
} from "../../../../models";
import { useSiteSettings } from "../../../../hooks/useSiteSettings";
import { useToastContext } from "../../../../hooks/ToastProvider";

// Interface pour combiner tous les paramètres (à définir localement)
interface SiteSettingsData {
  deliveryLocations: DeliveryLocation[];
  store: StoreSettings;
  socialLinks: SocialLinks;
  paymentMethods: PaymentMethods;
  shipping: ShippingSettings;
  invoiceSettings: InvoiceSettings;
  developerInfo: DeveloperInfo;
}

export default function SettingsSection() {
  const {
    settings: settingsData,
    loading,
    error,
    saveSettings,
    initializeDefaultSettings,
  } = useSiteSettings();
  const { success, error: toastError } = useToastContext();
  const [isSaving, setIsSaving] = useState(false);
  const [localSettings, setLocalSettings] =
    useState<SiteSettingsData>(settingsData);
  const activeDeliveryLocations = localSettings.deliveryLocations?.filter(
    (location) => location.is_active
  );
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const inactiveDeliveryLocations = localSettings.deliveryLocations?.filter(
    (location) => !location.is_active
  );
  // Ajoutez cet état avec les autres useState
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    delivery_fee: 0,
  });

  // Synchroniser les settings locaux quand les données changent
  useEffect(() => {
    setLocalSettings(settingsData);
  }, [settingsData]);

  const handleSave = async (): Promise<void> => {
    try {
      setIsSaving(true);
      const result = await saveSettings(localSettings);

      if (result) {
        success(
          "Paramètres sauvegardés",
          "Vos paramètres ont été sauvegardés avec succès."
        );
      } else {
        throw new Error("Erreur lors de la sauvegarde");
      }
    } catch {
      toastError(
        "Erreur de sauvegarde",
        "Une erreur est survenue lors de la sauvegarde des paramètres."
      );
    } finally {
      setIsSaving(false);
    }
  };

  //   if (!newSocialNetwork.url.trim()) {
  //     toastError("Erreur", "L'URL est obligatoire");
  //     return;
  //   }

  //   const platform = newSocialNetwork.platform as keyof SocialLinks;

  //   setLocalSettings((prev: SiteSettingsData) => ({
  //     ...prev,
  //     socialLinks: {
  //       ...prev.socialLinks,
  //       [platform]: newSocialNetwork.url.trim(),
  //     },
  //   }));

  //   // Réinitialiser le formulaire et fermer la modal
  //   setNewSocialNetwork({
  //     platform: "facebook",
  //     url: "",
  //   });
  //   setIsAddSocialModalOpen(false);

  //   success("Succès", "Réseau social ajouté avec succès");
  // };

  // const formatSocialUrl = (url: string, platform: string): string => {
  //   if (!url) return "";
  //   if (url.startsWith("http")) return url;
  //   return `https://${platform}.com/${url}`;
  // };

  // Handler pour les paramètres de la boutique
  const handleStoreChange = (
    field: keyof SiteSettingsData["store"],
    value: string
  ): void => {
    setLocalSettings((prev: SiteSettingsData) => ({
      ...prev,
      store: {
        ...prev.store,
        [field]: value,
      },
    }));
  };

  // Handler pour les réseaux sociaux
  const handleSocialLinksChange = (
    field: keyof SiteSettingsData["socialLinks"],
    value: string
  ): void => {
    setLocalSettings((prev: SiteSettingsData) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value,
      },
    }));
  };

  // Handler pour les méthodes de paiement
  const handlePaymentMethodsChange = (
    field: keyof SiteSettingsData["paymentMethods"],
    value: boolean
  ): void => {
    setLocalSettings((prev: SiteSettingsData) => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [field]: value,
      },
    }));
  };

  // Handler pour la livraison
  // const handleShippingChange = (
  //   field: keyof SiteSettingsData["shipping"],
  //   value: boolean | number | string
  // ): void => {
  //   setLocalSettings((prev: SiteSettingsData) => ({
  //     ...prev,
  //     shipping: {
  //       ...prev.shipping,
  //       [field]: value,
  //     },
  //   }));
  // };

  // Handler pour les paramètres de facturation
  const handleInvoiceSettingsChange = (
    field: keyof SiteSettingsData["invoiceSettings"],
    value: string | number
  ): void => {
    setLocalSettings((prev: SiteSettingsData) => ({
      ...prev,
      invoiceSettings: {
        ...prev.invoiceSettings,
        [field]: value,
      },
    }));
  };

  // AJOUTER après handleInvoiceSettingsChange :

  // Handler pour ajouter un lieu de livraison
  // Dans votre composant SettingsSection
  const handleAddDeliveryLocation = (): void => {
    if (!newLocation.name.trim()) {
      toastError("Erreur", "Le nom du lieu est obligatoire");
      return;
    }

    const location: DeliveryLocation = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID temporaire plus unique
      name: newLocation.name.trim(),
      delivery_fee: newLocation.delivery_fee,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setLocalSettings((prev: SiteSettingsData) => ({
      ...prev,
      deliveryLocations: [...prev.deliveryLocations, location],
    }));

    // Réinitialiser le formulaire et fermer la modal
    setNewLocation({
      name: "",
      delivery_fee: 0,
    });
    setIsAddLocationModalOpen(false);

    success("Succès", "Lieu de livraison ajouté avec succès");
  };

  // Handler pour modifier un lieu de livraison
  const handleDeliveryLocationChange = (
    id: string,
    field: keyof DeliveryLocation,
    value: string | number | boolean
  ): void => {
    setLocalSettings((prev: SiteSettingsData) => ({
      ...prev,
      deliveryLocations: prev.deliveryLocations.map((location) =>
        location.id === id ? { ...location, [field]: value } : location
      ),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Chargement des paramètres...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Erreur: {error}</p>
        <div className="mt-4 space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
          <button
            onClick={initializeDefaultSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réinitialiser les paramètres
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      {/* Paramètres de la boutique */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-white" />
            <h3 className="text-lg font-semibold text-white">
              Paramètres de la boutique
            </h3>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nom de la boutique
              </label>
              <input
                type="text"
                value={localSettings.store.name}
                onChange={(e) => handleStoreChange("name", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                placeholder="Nom de votre boutique"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Devise
              </label>
              <input
                type="text"
                value={localSettings.store.currency}
                onChange={(e) => handleStoreChange("currency", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                placeholder="XOF"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={localSettings.store.description}
                onChange={(e) =>
                  handleStoreChange("description", e.target.value)
                }
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                placeholder="Description de votre boutique"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <Mail className="h-4 w-4 inline mr-2 text-gray-500" />
                Email
              </label>
              <input
                type="email"
                value={localSettings.store.email}
                onChange={(e) => handleStoreChange("email", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                placeholder="contact@exemple.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <Phone className="h-4 w-4 inline mr-2 text-gray-500" />
                Téléphone
              </label>
              <input
                type="tel"
                value={localSettings.store.phone}
                onChange={(e) => handleStoreChange("phone", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                placeholder="+221 XX XXX XX XX"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <MapPin className="h-4 w-4 inline mr-2 text-gray-500" />
                Adresse
              </label>
              <input
                type="text"
                value={localSettings.store.address}
                onChange={(e) => handleStoreChange("address", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                placeholder="Adresse complète de votre boutique"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Réseaux sociaux */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="h-6 w-6 text-white" />
              <h3 className="text-lg font-semibold text-white">
                Réseaux sociaux
              </h3>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <span className="flex items-center">
                  <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                  Facebook
                </span>
              </label>
              <input
                type="url"
                value={localSettings.socialLinks.facebook_url}
                onChange={(e) =>
                  handleSocialLinksChange("facebook_url", e.target.value)
                }
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors"
                placeholder="https://facebook.com/votre-page"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <span className="flex items-center">
                  <div className="w-4 h-4 bg-pink-600 rounded mr-2"></div>
                  Instagram
                </span>
              </label>
              <input
                type="url"
                value={localSettings.socialLinks.instagram_url}
                onChange={(e) =>
                  handleSocialLinksChange("instagram_url", e.target.value)
                }
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors"
                placeholder="https://instagram.com/votre-compte"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <span className="flex items-center">
                  <div className="w-4 h-4 bg-blue-400 rounded mr-2"></div>
                  Twitter
                </span>
              </label>
              <input
                type="url"
                value={localSettings.socialLinks.twitter_url}
                onChange={(e) =>
                  handleSocialLinksChange("twitter_url", e.target.value)
                }
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors"
                placeholder="https://twitter.com/votre-compte"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <span className="flex items-center">
                  <div className="w-4 h-4 bg-blue-700 rounded mr-2"></div>
                  LinkedIn
                </span>
              </label>
              <input
                type="url"
                value={localSettings.socialLinks.linkedin_url}
                onChange={(e) =>
                  handleSocialLinksChange("linkedin_url", e.target.value)
                }
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors"
                placeholder="https://linkedin.com/company/votre-entreprise"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <span className="flex items-center">
                  <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
                  YouTube
                </span>
              </label>
              <input
                type="url"
                value={localSettings.socialLinks.youtube_url || ""}
                onChange={(e) =>
                  handleSocialLinksChange("youtube_url", e.target.value)
                }
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors"
                placeholder="https://youtube.com/votre-chaine"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <span className="flex items-center">
                  <div className="w-4 h-4 bg-black rounded mr-2"></div>
                  TikTok
                </span>
              </label>
              <input
                type="url"
                value={localSettings.socialLinks.tiktok_url || ""}
                onChange={(e) =>
                  handleSocialLinksChange("tiktok_url", e.target.value)
                }
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors"
                placeholder="https://tiktok.com/@votre-compte"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Méthodes de paiement */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-white" />
            <h3 className="text-lg font-semibold text-white">
              Méthodes de paiement
            </h3>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Wave</h4>
                <p className="text-sm text-gray-600">
                  Paiement via l'application Wave
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.paymentMethods.wave_enabled}
                  onChange={(e) =>
                    handlePaymentMethodsChange("wave_enabled", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Orange Money</h4>
                <p className="text-sm text-gray-600">
                  Paiement via Orange Money
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.paymentMethods.orange_money_enabled}
                  onChange={(e) =>
                    handlePaymentMethodsChange(
                      "orange_money_enabled",
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Carte de crédit</h4>
                <p className="text-sm text-gray-600">
                  Paiement par carte bancaire
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.paymentMethods.credit_card_enabled}
                  onChange={(e) =>
                    handlePaymentMethodsChange(
                      "credit_card_enabled",
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Mobile Money</h4>
                <p className="text-sm text-gray-600">
                  Autres solutions de paiement mobile
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.paymentMethods.mobile_money_enabled}
                  onChange={(e) =>
                    handlePaymentMethodsChange(
                      "mobile_money_enabled",
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">
                  Paiement à la livraison
                </h4>
                <p className="text-sm text-gray-600">
                  Le client paie à la réception
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    localSettings.paymentMethods.cash_on_delivery_enabled
                  }
                  onChange={(e) =>
                    handlePaymentMethodsChange(
                      "cash_on_delivery_enabled",
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Gestion des lieux de livraison */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Truck className="h-6 w-6 text-white" />
              <h3 className="text-lg font-semibold text-white">
                Lieux de livraison
              </h3>
            </div>
            <button
              onClick={() => setIsAddLocationModalOpen(true)}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              + Ajouter un lieu
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="border-b border-gray-200">
          <div className="px-6 flex space-x-4">
            <button
              onClick={() => setActiveTab("active")}
              className={`py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === "active"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Lieux actifs ({activeDeliveryLocations?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("inactive")}
              className={`py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === "inactive"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Lieux désactivés ({inactiveDeliveryLocations?.length || 0})
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {activeTab === "active" ? (
            <>
              {activeDeliveryLocations?.map((location: DeliveryLocation) => (
                <div
                  key={location.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Nom du lieu
                      </label>
                      <input
                        type="text"
                        value={location.name}
                        onChange={(e) =>
                          handleDeliveryLocationChange(
                            location.id,
                            "name",
                            e.target.value
                          )
                        }
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                        placeholder="Ex: Dakar, Plateau"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Frais de livraison (XOF)
                      </label>
                      <input
                        type="number"
                        value={location.delivery_fee}
                        onChange={(e) =>
                          handleDeliveryLocationChange(
                            location.id,
                            "delivery_fee",
                            Number(e.target.value)
                          )
                        }
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                        placeholder="2000"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() =>
                        handleDeliveryLocationChange(
                          location.id,
                          "is_active",
                          false
                        )
                      }
                      className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors whitespace-nowrap"
                    >
                      Désactiver
                    </button>
                  </div>
                </div>
              ))}
              {activeDeliveryLocations?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun lieu de livraison actif
                </div>
              )}
            </>
          ) : (
            <>
              {inactiveDeliveryLocations?.map((location: DeliveryLocation) => (
                <div
                  key={location.id}
                  className="flex items-center space-x-4 p-4 bg-gray-100 rounded-lg border border-gray-300 opacity-70"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Nom du lieu
                      </label>
                      <input
                        type="text"
                        value={location.name}
                        onChange={(e) =>
                          handleDeliveryLocationChange(
                            location.id,
                            "name",
                            e.target.value
                          )
                        }
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                        placeholder="Ex: Dakar, Plateau"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Frais de livraison (XOF)
                      </label>
                      <input
                        type="number"
                        value={location.delivery_fee}
                        onChange={(e) =>
                          handleDeliveryLocationChange(
                            location.id,
                            "delivery_fee",
                            Number(e.target.value)
                          )
                        }
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                        placeholder="2000"
                        min="0"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() =>
                        handleDeliveryLocationChange(
                          location.id,
                          "is_active",
                          true
                        )
                      }
                      className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors whitespace-nowrap"
                    >
                      Activer
                    </button>
                  </div>
                </div>
              ))}
              {inactiveDeliveryLocations?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun lieu de livraison désactivé
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Paramètres de facturation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-white" />
            <h3 className="text-lg font-semibold text-white">Facturation</h3>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <h4 className="text-md font-semibold text-gray-900">
            Informations de l'entreprise
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nom de l'entreprise
              </label>
              <input
                type="text"
                value={localSettings.invoiceSettings.company_name}
                onChange={(e) =>
                  handleInvoiceSettingsChange("company_name", e.target.value)
                }
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                placeholder="Nom de votre entreprise"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={localSettings.invoiceSettings.company_address}
                onChange={(e) =>
                  handleInvoiceSettingsChange("company_address", e.target.value)
                }
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                placeholder="Adresse de l'entreprise"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Ville
              </label>
              <input
                type="text"
                value={localSettings.invoiceSettings.company_city}
                onChange={(e) =>
                  handleInvoiceSettingsChange("company_city", e.target.value)
                }
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                placeholder="Ville"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Pays
              </label>
              <input
                type="text"
                value={localSettings.invoiceSettings.company_country}
                onChange={(e) =>
                  handleInvoiceSettingsChange("company_country", e.target.value)
                }
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                placeholder="Pays"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={localSettings.invoiceSettings.company_phone}
                onChange={(e) =>
                  handleInvoiceSettingsChange("company_phone", e.target.value)
                }
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                placeholder="+221 XX XXX XX XX"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                value={localSettings.invoiceSettings.company_email}
                onChange={(e) =>
                  handleInvoiceSettingsChange("company_email", e.target.value)
                }
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                placeholder="contact@entreprise.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section Informations Développeurs - NON MODIFIABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-600 to-gray-800 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Code className="h-6 w-6 text-white" />
            <h3 className="text-lg font-semibold text-white">
              Informations Développeur
            </h3>
          </div>
          <p className="text-gray-300 text-sm mt-1">
            Ces informations sont gérées directement en base de données
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <User className="h-4 w-4 inline mr-2 text-gray-500" />
                  Nom du développeur
                </label>
                <input
                  type="text"
                  value={localSettings.developerInfo.developer_name}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 shadow-sm cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <Mail className="h-4 w-4 inline mr-2 text-gray-500" />
                  Email
                </label>
                <input
                  type="email"
                  value={localSettings.developerInfo.developer_email || ""}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 shadow-sm cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <Phone className="h-4 w-4 inline mr-2 text-gray-500" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={localSettings.developerInfo.developer_phone || ""}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 shadow-sm cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <ExternalLink className="h-4 w-4 inline mr-2 text-gray-500" />
                  Site web
                </label>
                <input
                  type="url"
                  value={localSettings.developerInfo.developer_website || ""}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 shadow-sm cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>
            </div>

            {/* Réseaux sociaux du développeur */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Réseaux sociaux du développeur
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {localSettings.developerInfo.github_url && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaGithub className="h-5 w-5 text-gray-700" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        GitHub
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {localSettings.developerInfo.github_url}
                      </p>
                    </div>
                  </div>
                )}
                {localSettings.developerInfo.linkedin_url && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaLinkedin className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        LinkedIn
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {localSettings.developerInfo.linkedin_url}
                      </p>
                    </div>
                  </div>
                )}
                {localSettings.developerInfo.instagram_url && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaInstagram className="h-5 w-5 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Instagram
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {localSettings.developerInfo.instagram_url}
                      </p>
                    </div>
                  </div>
                )}
                {localSettings.developerInfo.portfolio_url && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <ExternalLink className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Portfolio
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {localSettings.developerInfo.portfolio_url}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {localSettings.developerInfo.description && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={localSettings.developerInfo.description}
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 shadow-sm cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>
            )}

            {/* Message d'information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Note : Dans cette section, vous trouverez toutes les
                informations relatives au développeur de l'application. Ces
                champs sont gérés directement en base de données et ne peuvent
                pas être modifiés depuis l'interface. Pour toute modification,
                contactez l'administrateur ou mettez à jour la base de données.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'ajout de lieu de livraison */}
      {isAddLocationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            {/* En-tête de la modal */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-white" />
                  <h3 className="text-lg font-semibold text-white">
                    Nouveau lieu de livraison
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddLocationModalOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Corps de la modal */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nom du lieu *
                </label>
                <input
                  type="text"
                  value={newLocation.name}
                  onChange={(e) =>
                    setNewLocation((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                  placeholder="Ex: Dakar, Plateau"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nom de la zone ou ville de livraison
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Frais de livraison (XOF)
                </label>
                <input
                  type="number"
                  value={newLocation.delivery_fee}
                  onChange={(e) =>
                    setNewLocation((prev) => ({
                      ...prev,
                      delivery_fee: Number(e.target.value),
                    }))
                  }
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                  placeholder="2000"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Montant des frais de livraison pour cette zone
                </p>
              </div>
            </div>

            {/* Pied de la modal */}
            <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setIsAddLocationModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddDeliveryLocation}
                disabled={!newLocation.name.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Ajouter le lieu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder les paramètres
            </>
          )}
        </button>
      </div>
    </div>
  );
}
