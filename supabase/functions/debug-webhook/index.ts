import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 DEBUG WEBHOOK TRIGGERED:', {
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Capture ALL request information
    const headers = Object.fromEntries(req.headers.entries());
    const contentType = req.headers.get('content-type') || '';
    
    let webhookData: any = {};
    let rawText = '';
    
    try {
      if (contentType.includes('application/json')) {
        const jsonData = await req.json();
        webhookData = jsonData;
        rawText = JSON.stringify(jsonData);
      } else if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        for (const [key, value] of formData.entries()) {
          webhookData[key] = value?.toString();
        }
        rawText = `FormData with ${formData.entries.length} entries`;
      } else {
        rawText = await req.text();
        try {
          webhookData = JSON.parse(rawText);
        } catch {
          // If not JSON, treat as form-encoded
          const params = new URLSearchParams(rawText);
          for (const [key, value] of params.entries()) {
            webhookData[key] = value;
          }
        }
      }
    } catch (error) {
      console.error('Error parsing webhook data:', error);
      webhookData = { error: 'Failed to parse webhook data', errorMessage: (error as Error).message };
    }

    // Store EVERYTHING in debug table
    const debugEntry = {
      raw_data: webhookData,
      content_type: contentType,
      method: req.method,
      headers: headers,
      timestamp: new Date().toISOString()
    };

    console.log('📦 COMPLETE DEBUG DATA:', JSON.stringify(debugEntry, null, 2));

    // Insert into debug table
    const { data: insertData, error: insertError } = await supabase
      .from('debug_webhooks')
      .insert(debugEntry)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to insert debug data:', insertError);
    } else {
      console.log('✅ Debug data stored with ID:', insertData.id);
    }

    // Log key fields for immediate debugging
    console.log('🔎 KEY WEBHOOK FIELDS:', {
      hasFrom: !!webhookData.from,
      hasTo: !!webhookData.to,
      hasSubject: !!webhookData.subject,
      hasText: !!webhookData.text,
      hasHtml: !!webhookData.html,
      hasTextPlain: !!webhookData['text/plain'],
      hasTextHtml: !!webhookData['text/html'],
      textPreview: webhookData.text?.substring(0, 100) || 'No text field',
      htmlPreview: webhookData.html?.substring(0, 100) || 'No html field',
      allKeys: Object.keys(webhookData)
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Debug webhook processed',
        debugId: insertData?.id,
        fieldsFound: Object.keys(webhookData)
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('💥 Debug webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);