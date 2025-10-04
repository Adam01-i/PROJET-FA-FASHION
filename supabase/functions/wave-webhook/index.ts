import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const waveSignature = req.headers.get("X-Wave-Signature");
    
    // Vérifier la signature Wave (à implémenter selon la documentation Wave)
    if (!waveSignature) {
      throw new Error("Signature Wave manquante");
    }

    const payload = await req.json();
    const { status, merchant_reference: orderId } = payload;

    // Mettre à jour le statut de la commande
    if (status === "successful") {
      const { error } = await supabase
        .from("orders")
        .update({ status: "completed", payment_method: "wave" })
        .eq("id", orderId);

      if (error) throw error;
    } else if (status === "failed") {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled", payment_method: "wave" })
        .eq("id", orderId);

      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
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