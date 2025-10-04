import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { initiateWavePayment } from '../lib/wave';

interface WavePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderId: string;
  onSuccess: () => void;
  onError: (error: Error) => void;
  phoneNumber: string;
}

export default function WavePaymentModal({
  isOpen,
  onClose,
  amount,
  orderId,
  onSuccess,
  onError,
  phoneNumber,
}: WavePaymentModalProps) {
  const [, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePhoneNumber = (number: string) => {
    // Format attendu: 7X XXX XX XX
    const regex = /^7[0-9]{8}$/;
    return regex.test(number.replace(/\s/g, ''));
  };

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
    return number;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 9) {
      setPhoneNumber(formatPhoneNumber(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanedNumber = phoneNumber.replace(/\s/g, '');
    if (!validatePhoneNumber(cleanedNumber)) {
      setError('Numéro de téléphone invalide. Format attendu: 7X XXX XX XX');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await initiateWavePayment({
        amount,
        phoneNumber: cleanedNumber,
        orderId,
      });

      if (response.payment_url) {
        window.location.href = response.payment_url;
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      onError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Paiement avec Wave
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Numéro de téléphone Wave
            </label>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="7X XXX XX XX"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Format: 7X XXX XX XX (numéro Wave sénégalais)
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600">Montant à payer</p>
            <p className="text-2xl font-bold text-gray-900">{amount.toLocaleString('fr-FR')} FCFA</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {loading ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Traitement en cours...
              </>
            ) : (
              'Payer avec Wave'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <img
            src="https://wave.com/static/wave-logo.png"
            alt="Wave"
            className="h-8 mx-auto"
          />
          <p className="mt-2 text-sm text-gray-500">
            Paiement sécurisé par Wave
          </p>
        </div>
      </div>
    </div>
  );
}