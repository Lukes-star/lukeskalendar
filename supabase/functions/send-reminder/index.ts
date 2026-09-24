import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Find appointments scheduled for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("id, client_name, client_phone, service_name, date, start_time")
      .eq("date", tomorrowStr)
      .eq("status", "scheduled");

    if (error) throw error;

    const results: Array<{ name: string; phone: string; status: string }> = [];

    for (const apt of appointments || []) {
      const message = buildMessage(apt.client_name, apt.service_name, apt.date, apt.start_time);

      // Try WhatsApp first
      const waResult = await sendWhatsApp(apt.client_phone, message);
      if (waResult) {
        results.push({ name: apt.client_name, phone: apt.client_phone, status: "whatsapp_sent" });
        continue;
      }

      // Fallback to Viber
      const viberResult = await sendViber(apt.client_phone, message);
      results.push({ name: apt.client_name, phone: apt.client_phone, status: viberResult ? "viber_sent" : "failed" });
    }

    return new Response(
      JSON.stringify({ sent: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function buildMessage(name: string, service: string, date: string, time: string | null): string {
  const dateLabel = new Date(date + "T00:00").toLocaleDateString("sr-RS", {
    weekday: "long", day: "numeric", month: "long",
  });
  const timeLabel = time ? ` u ${time}` : "";
  return `Poštovani/a ${name}, podsetnik: zakazan je termin za ${service} dana ${dateLabel}${timeLabel}. Servis Farova Čaki. Vidimo se!`;
}

async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  // In production, this would call WhatsApp Business API
  // For now, we log the intent and return true to simulate success
  console.log(`[WhatsApp] To: ${phone} | Message: ${message}`);
  return true;
}

async function sendViber(phone: string, message: string): Promise<boolean> {
  // In production, this would call Viber Bot API
  console.log(`[Viber] To: ${phone} | Message: ${message}`);
  return true;
}
