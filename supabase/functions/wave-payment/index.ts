import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

const WAVE_API_URL = "https://api.wave.com/v1/checkout";
const WAVE_SECRET_KEY = Deno.env.get("WAVE_SECRET_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface WavePaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  description: string;
  orderId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency, phoneNumber, description, orderId }: WavePaymentRequest = await req.json();

    // Vérification des paramètres requis
    if (!amount || !phoneNumber || !orderId) {
      throw new Error("Paramètres manquants");
    }

    // Création de la session de paiement Wave
    const response = await fetch(WAVE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency || "XOF",
        phone_number: phoneNumber,
        description: description || `Commande #${orderId}`,
        callback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/wave-webhook`,
        merchant_reference: orderId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de l'initialisation du paiement");
    }

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});