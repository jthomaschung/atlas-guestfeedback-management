import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { feedbackId, assignee } = await req.json()
    
    console.log(`Updating feedback ${feedbackId} to assign to ${assignee}`)
    
    const { data, error } = await supabase
      .from('customer_feedback')
      .update({ 
        assignee: assignee,
        updated_at: new Date().toISOString()
      })
      .eq('id', feedbackId)
      .select('id, assignee, store_number, market, complaint_category')
      .single()

    if (error) {
      console.error('Update error:', error)
      throw error
    }

    console.log('Successfully updated feedback:', data)

    return new Response(
      JSON.stringify({
        success: true,
        data: data
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to update feedback',
        message: (error as Error).message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})