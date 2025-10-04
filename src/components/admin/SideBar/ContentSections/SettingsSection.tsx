import { useState, useEffect } from 'react';
import { Save, Settings, Mail, Phone, MapPin, Share2, CreditCard, Loader2 } from 'lucide-react';
import { SiteSettingsDB, SiteSettingsData } from '../../../../types';
import { useSiteSettings } from '../../../../hooks/useSiteSettings';
import { useToastContext } from '../../../../hooks/ToastProvider';

// Fonction pour convertir les settings DB en objet utilisable
const parseSettings = (settings: SiteSettingsDB[]): SiteSettingsData => {
  const defaultSettings: SiteSettingsData = {
    siteName: '',
    description: '',
    contactEmail: '',
    phoneNumber: '',
    address: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: ''
    },
    paymentMethods: {
      wave: false,
      orangeMoney: false,
      creditCard: false
    }
  };

  if (!settings || !Array.isArray(settings) || settings.length === 0) {
    return defaultSettings;
  }

  try {
    const settingsObj: SiteSettingsData = { ...defaultSettings };
    
    settings.forEach(setting => {
      try {
        const parsedValue = JSON.parse(setting.value);
        switch (setting.key) {
          case 'site_info':
            if (parsedValue.siteName) settingsObj.siteName = parsedValue.siteName;
            if (parsedValue.description) settingsObj.description = parsedValue.description;
            break;
          case 'contact_info':
            if (parsedValue.contactEmail) settingsObj.contactEmail = parsedValue.contactEmail;
            if (parsedValue.phoneNumber) settingsObj.phoneNumber = parsedValue.phoneNumber;
            if (parsedValue.address) settingsObj.address = parsedValue.address;
            break;
          case 'social_links':
            if (parsedValue.facebook !== undefined) settingsObj.socialLinks.facebook = parsedValue.facebook;
            if (parsedValue.twitter !== undefined) settingsObj.socialLinks.twitter = parsedValue.twitter;
            if (parsedValue.instagram !== undefined) settingsObj.socialLinks.instagram = parsedValue.instagram;
            break;
          case 'payment_methods':
            if (typeof parsedValue.wave === 'boolean') settingsObj.paymentMethods.wave = parsedValue.wave;
            if (typeof parsedValue.orangeMoney === 'boolean') settingsObj.paymentMethods.orangeMoney = parsedValue.orangeMoney;
            if (typeof parsedValue.creditCard === 'boolean') settingsObj.paymentMethods.creditCard = parsedValue.creditCard;
            break;
          default:
            break;
        }
      } catch (e) {
        console.error(`Error parsing setting ${setting.key}:`, e);
      }
    });

    return settingsObj;
  } catch (error) {
    console.error('Error parsing settings:', error);
    return defaultSettings;
  }
};

// Fonction pour convertir l'objet en format de base de données
const prepareSettingsForSave = (settingsData: SiteSettingsData, existingSettings: SiteSettingsDB[]): SiteSettingsDB[] => {
  const now = new Date().toISOString();
  
  const settingsMap: Record<string, SiteSettingsDB> = {
    site_info: {
      id: '',
      key: 'site_info',
      value: JSON.stringify({
        siteName: settingsData.siteName || '',
        description: settingsData.description || ''
      }),
      description: 'Informations générales du site',
      created_at: now
    },
    contact_info: {
      id: '',
      key: 'contact_info',
      value: JSON.stringify({
        contactEmail: settingsData.contactEmail || '',
        phoneNumber: settingsData.phoneNumber || '',
        address: settingsData.address || ''
      }),
      description: 'Informations de contact',
      created_at: now
    },
    social_links: {
      id: '',
      key: 'social_links',
      value: JSON.stringify({
        facebook: settingsData.socialLinks.facebook || '',
        twitter: settingsData.socialLinks.twitter || '',
        instagram: settingsData.socialLinks.instagram || ''
      }),
      description: 'Liens vers les réseaux sociaux',
      created_at: now
    },
    payment_methods: {
      id: '',
      key: 'payment_methods',
      value: JSON.stringify({
        wave: settingsData.paymentMethods.wave || false,
        orangeMoney: settingsData.paymentMethods.orangeMoney || false,
        creditCard: settingsData.paymentMethods.creditCard || false
      }),
      description: 'Méthodes de paiement acceptées',
      created_at: now
    }
  };

  // Garder les IDs existants si disponibles
  existingSettings.forEach(setting => {
    if (settingsMap[setting.key]) {
      settingsMap[setting.key].id = setting.id;
      settingsMap[setting.key].created_at = setting.created_at;
    }
  });

  return Object.values(settingsMap);
};

export default function SettingsSection() {
  const { settings, loading, error, saveSettings, initializeDefaultSettings } = useSiteSettings();
  const { success, error: toastError } = useToastContext();
  const [settingsData, setSettingsData] = useState<SiteSettingsData>(parseSettings(settings));
  const [isSaving, setIsSaving] = useState(false);

  // Mettre à jour settingsData quand les settings changent
  useEffect(() => {
    if (settings.length > 0) {
      setSettingsData(parseSettings(settings));
    }
  }, [settings]);

  // Initialiser les paramètres par défaut si aucun paramètre n'existe
  useEffect(() => {
    if (!loading && settings.length === 0) {
      initializeDefaultSettings();
    }
  }, [loading, settings.length, initializeDefaultSettings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const settingsToSave = prepareSettingsForSave(settingsData, settings);
      await saveSettings(settingsToSave);

      success(
        'Paramètres sauvegardés',
        'Vos paramètres ont été sauvegardés avec succès.'
      );
    } catch {
      toastError(
        'Erreur de sauvegarde',
        'Une erreur est survenue lors de la sauvegarde des paramètres.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof SiteSettingsData, value: string) => {
    setSettingsData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinksChange = (platform: keyof SiteSettingsData['socialLinks'], value: string) => {
    setSettingsData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handlePaymentMethodsChange = (method: keyof SiteSettingsData['paymentMethods'], value: boolean) => {
    setSettingsData(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: value
      }
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
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informations du site */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-white" />
            <h3 className="text-lg font-semibold text-white">Informations du site</h3>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nom du site
              </label>
              <input
                type="text"
                value={settingsData.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                placeholder="Nom de votre boutique"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={settingsData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                placeholder="Description de votre boutique"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-6 w-6 text-white" />
            <h3 className="text-lg font-semibold text-white">Informations de contact</h3>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <Mail className="h-4 w-4 inline mr-2 text-gray-500" />
                Email de contact
              </label>
              <input
                type="email"
                value={settingsData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors"
                placeholder="contact@exemple.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <Phone className="h-4 w-4 inline mr-2 text-gray-500" />
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={settingsData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors"
                placeholder="+221 XX XXX XX XX"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <MapPin className="h-4 w-4 inline mr-2 text-gray-500" />
                Adresse
              </label>
              <input
                type="text"
                value={settingsData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors"
                placeholder="Adresse complète de votre boutique"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Réseaux sociaux */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Share2 className="h-6 w-6 text-white" />
            <h3 className="text-lg font-semibold text-white">Réseaux sociaux</h3>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={settingsData.socialLinks.facebook}
                onChange={(e) => handleSocialLinksChange('facebook', e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                placeholder="https://facebook.com/votre-page"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={settingsData.socialLinks.twitter}
                onChange={(e) => handleSocialLinksChange('twitter', e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                placeholder="https://twitter.com/votre-compte"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={settingsData.socialLinks.instagram}
                onChange={(e) => handleSocialLinksChange('instagram', e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                placeholder="https://instagram.com/votre-compte"
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
            <h3 className="text-lg font-semibold text-white">Méthodes de paiement</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
              <input
                type="checkbox"
                checked={settingsData.paymentMethods.wave}
                onChange={(e) => handlePaymentMethodsChange('wave', e.target.checked)}
                className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label className="ml-3 block text-sm font-semibold text-gray-900">
                Wave
              </label>
            </div>
            <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
              <input
                type="checkbox"
                checked={settingsData.paymentMethods.orangeMoney}
                onChange={(e) => handlePaymentMethodsChange('orangeMoney', e.target.checked)}
                className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label className="ml-3 block text-sm font-semibold text-gray-900">
                Orange Money
              </label>
            </div>
            <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
              <input
                type="checkbox"
                checked={settingsData.paymentMethods.creditCard}
                onChange={(e) => handlePaymentMethodsChange('creditCard', e.target.checked)}
                className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label className="ml-3 block text-sm font-semibold text-gray-900">
                Carte bancaire
              </label>
            </div>
          </div>
        </div>
      </div>

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