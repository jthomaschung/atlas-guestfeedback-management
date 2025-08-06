import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const workOrderId = url.searchParams.get('id');
    
    if (!workOrderId) {
      return new Response("Work order ID is required", { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Redirect to the dashboard with the work order ID as a query parameter
    // This will allow the frontend to automatically open the work order details modal
    const redirectUrl = `https://59a1a4a4-5107-4cbe-87fb-e1dcf4b1823a.lovableproject.com/dashboard?workOrderId=${workOrderId}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": redirectUrl
      }
    });

  } catch (error: any) {
    console.error("Error in redirect-to-work-order function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);