import { useState, useEffect } from 'react';
import { Save, Settings, Mail, Phone, MapPin, Loader2, Globe, Truck, CreditCard, FileText } from 'lucide-react';
import { SiteSettingsData } from '../../../../types';
import { useSiteSettings } from '../../../../hooks/useSiteSettings';
import { useToastContext } from '../../../../hooks/ToastProvider';

export default function SettingsSection() {
  const { settings: settingsData, loading, error, saveSettings, initializeDefaultSettings } = useSiteSettings();
  const { success, error: toastError } = useToastContext();
  const [isSaving, setIsSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<SiteSettingsData>(settingsData);

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
          'Paramètres sauvegardés',
          'Vos paramètres ont été sauvegardés avec succès.'
        );
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch {
      toastError(
        'Erreur de sauvegarde',
        'Une erreur est survenue lors de la sauvegarde des paramètres.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handler pour les paramètres de la boutique
  const handleStoreChange = (field: keyof SiteSettingsData['store'], value: string): void => {
    setLocalSettings(prev => ({
      ...prev,
      store: {
        ...prev.store,
        [field]: value
      }
    }));
  };

  // Handler pour les réseaux sociaux
  const handleSocialLinksChange = (field: keyof SiteSettingsData['socialLinks'], value: string): void => {
    setLocalSettings(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value
      }
    }));
  };

  // Handler pour les méthodes de paiement
  const handlePaymentMethodsChange = (field: keyof SiteSettingsData['paymentMethods'], value: boolean): void => {
    setLocalSettings(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [field]: value
      }
    }));
  };

  // Handler pour la livraison
  const handleShippingChange = (field: keyof SiteSettingsData['shipping'], value: boolean | number | string): void => {
    setLocalSettings(prev => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        [field]: value
      }
    }));
  };

  // Handler pour les paramètres de facturation
  const handleInvoiceSettingsChange = (field: keyof SiteSettingsData['invoiceSettings'], value: string | number): void => {
    setLocalSettings(prev => ({
      ...prev,
      invoiceSettings: {
        ...prev.invoiceSettings,
        [field]: value
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
            <h3 className="text-lg font-semibold text-white">Paramètres de la boutique</h3>
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
                onChange={(e) => handleStoreChange('name', e.target.value)}
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
                onChange={(e) => handleStoreChange('currency', e.target.value)}
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
                onChange={(e) => handleStoreChange('description', e.target.value)}
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
                onChange={(e) => handleStoreChange('email', e.target.value)}
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
                onChange={(e) => handleStoreChange('phone', e.target.value)}
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
                onChange={(e) => handleStoreChange('address', e.target.value)}
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
          <div className="flex items-center space-x-3">
            <Globe className="h-6 w-6 text-white" />
            <h3 className="text-lg font-semibold text-white">Réseaux sociaux</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={localSettings.socialLinks.facebook_url}
                onChange={(e) => handleSocialLinksChange('facebook_url', e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors"
                placeholder="https://facebook.com/votre-page"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={localSettings.socialLinks.instagram_url}
                onChange={(e) => handleSocialLinksChange('instagram_url', e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors"
                placeholder="https://instagram.com/votre-compte"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={localSettings.socialLinks.twitter_url}
                onChange={(e) => handleSocialLinksChange('twitter_url', e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors"
                placeholder="https://twitter.com/votre-compte"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={localSettings.socialLinks.linkedin_url}
                onChange={(e) => handleSocialLinksChange('linkedin_url', e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors"
                placeholder="https://linkedin.com/company/votre-entreprise"
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
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Wave</h4>
                <p className="text-sm text-gray-600">Paiement via l'application Wave</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.paymentMethods.wave_enabled}
                  onChange={(e) => handlePaymentMethodsChange('wave_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Orange Money</h4>
                <p className="text-sm text-gray-600">Paiement via Orange Money</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.paymentMethods.orange_money_enabled}
                  onChange={(e) => handlePaymentMethodsChange('orange_money_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Carte de crédit</h4>
                <p className="text-sm text-gray-600">Paiement par carte bancaire</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.paymentMethods.credit_card_enabled}
                  onChange={(e) => handlePaymentMethodsChange('credit_card_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Mobile Money</h4>
                <p className="text-sm text-gray-600">Autres solutions de paiement mobile</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.paymentMethods.mobile_money_enabled}
                  onChange={(e) => handlePaymentMethodsChange('mobile_money_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Paiement à la livraison</h4>
                <p className="text-sm text-gray-600">Le client paie à la réception</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.paymentMethods.cash_on_delivery_enabled}
                  onChange={(e) => handlePaymentMethodsChange('cash_on_delivery_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Paramètres de livraison */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Truck className="h-6 w-6 text-white" />
            <h3 className="text-lg font-semibold text-white">Livraison</h3>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-900">Livraison activée</h4>
              <p className="text-sm text-gray-600">Proposer la livraison à domicile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.shipping.enabled}
                onChange={(e) => handleShippingChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
          
          {localSettings.shipping.enabled && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Frais de livraison (XOF)
                  </label>
                  <input
                    type="number"
                    value={localSettings.shipping.cost}
                    onChange={(e) => handleShippingChange('cost', Number(e.target.value))}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                    placeholder="2000"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Seuil livraison gratuite (XOF)
                  </label>
                  <input
                    type="number"
                    value={localSettings.shipping.free_shipping_threshold}
                    onChange={(e) => handleShippingChange('free_shipping_threshold', Number(e.target.value))}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                    placeholder="50000"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Délai de livraison
                </label>
                <input
                  type="text"
                  value={localSettings.shipping.delivery_time}
                  onChange={(e) => handleShippingChange('delivery_time', e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-colors"
                  placeholder="2-5 jours ouvrables"
                />
              </div>
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
          <h4 className="text-md font-semibold text-gray-900">Informations de l'entreprise</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nom de l'entreprise
              </label>
              <input
                type="text"
                value={localSettings.invoiceSettings.company_name}
                onChange={(e) => handleInvoiceSettingsChange('company_name', e.target.value)}
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
                onChange={(e) => handleInvoiceSettingsChange('company_address', e.target.value)}
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
                onChange={(e) => handleInvoiceSettingsChange('company_city', e.target.value)}
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
                onChange={(e) => handleInvoiceSettingsChange('company_country', e.target.value)}
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
                onChange={(e) => handleInvoiceSettingsChange('company_phone', e.target.value)}
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
                onChange={(e) => handleInvoiceSettingsChange('company_email', e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                placeholder="contact@entreprise.com"
              />
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