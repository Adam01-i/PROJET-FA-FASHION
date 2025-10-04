export async function initiateWavePayment(params: {
  amount: number;
  phoneNumber: string;
  orderId: string;
  description?: string;
}) {
  const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wave-payment`;

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      amount: params.amount,
      phoneNumber: params.phoneNumber,
      orderId: params.orderId,
      description: params.description,
      currency: 'XOF',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de l\'initialisation du paiement Wave');
  }

  return response.json();
}