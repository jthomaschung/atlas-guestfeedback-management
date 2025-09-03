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

interface FeedbackWebhookData {
  // Channel information
  channel: 'yelp' | 'qualtrics' | 'jimmy_johns'
  
  // Feedback details
  feedback_date: string
  complaint_category: 'praise' | 'service' | 'food_quality' | 'cleanliness' | 'order_accuracy' | 'wait_time' | 'facility_issue' | 'other'
  feedback_text?: string
  rating?: number
  
  // Location information
  store_number: string
  market: string
  
  // Customer information
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  
  // Case tracking
  case_number?: string
  
  // Assignment (optional)
  assignee?: string
  
  // Priority (optional, will default to 'Low' if not provided)
  priority?: 'Praise' | 'Low' | 'High' | 'Critical'
  
  // Additional fields
  ee_action?: string
  period?: string
}

function validateFeedbackData(data: any): FeedbackWebhookData | null {
  console.log('Validating feedback data:', data)
  
  // Required fields validation
  if (!data.channel || !['yelp', 'qualtrics', 'jimmy_johns'].includes(data.channel)) {
    console.error('Invalid or missing channel:', data.channel)
    return null
  }
  
  if (!data.feedback_date) {
    console.error('Missing feedback_date')
    return null
  }
  
  if (!data.complaint_category || !['praise', 'service', 'food_quality', 'cleanliness', 'order_accuracy', 'wait_time', 'facility_issue', 'other'].includes(data.complaint_category)) {
    console.error('Invalid or missing complaint_category:', data.complaint_category)
    return null
  }
  
  if (!data.store_number) {
    console.error('Missing store_number')
    return null
  }
  
  if (!data.market) {
    console.error('Missing market')
    return null
  }
  
  // Generate case number if not provided
  const case_number = data.case_number || `CF-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  
  // Set default priority based on complaint category
  let defaultPriority: 'Praise' | 'Low' | 'High' | 'Critical' = 'Low'
  if (data.complaint_category === 'praise') {
    defaultPriority = 'Praise'
  } else if (['facility_issue', 'cleanliness'].includes(data.complaint_category)) {
    defaultPriority = 'High'
  } else if (data.complaint_category === 'food_quality' && data.rating && data.rating <= 2) {
    defaultPriority = 'Critical'
  }
  
  return {
    channel: data.channel,
    feedback_date: data.feedback_date,
    complaint_category: data.complaint_category,
    feedback_text: data.feedback_text || '',
    rating: data.rating ? parseInt(data.rating) : null,
    store_number: data.store_number,
    market: data.market,
    customer_name: data.customer_name || null,
    customer_email: data.customer_email || null,
    customer_phone: data.customer_phone || null,
    case_number,
    assignee: data.assignee || null,
    priority: data.priority || defaultPriority,
    ee_action: data.ee_action || null,
    period: data.period || null
  }
}

Deno.serve(async (req) => {
  console.log('Feedback ingestion webhook called:', req.method, req.url)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      console.error('Invalid method:', req.method)
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Parse request body
    let requestData
    try {
      requestData = await req.json()
      console.log('Received webhook data:', requestData)
    } catch (error) {
      console.error('Failed to parse JSON:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Handle bulk feedback (array) or single feedback (object)
    const feedbackItems = Array.isArray(requestData) ? requestData : [requestData]
    const results = []
    
    for (const item of feedbackItems) {
      // Validate the feedback data
      const validatedData = validateFeedbackData(item)
      if (!validatedData) {
        console.error('Validation failed for item:', item)
        results.push({
          success: false,
          error: 'Invalid feedback data',
          data: item
        })
        continue
      }
      
      try {
        // Insert feedback into database
        // Note: We need a user_id for RLS, so we'll use a system user or bypass RLS with service role
        const { data: insertedData, error: insertError } = await supabase
          .from('customer_feedback')
          .insert({
            feedback_date: validatedData.feedback_date,
            complaint_category: validatedData.complaint_category,
            channel: validatedData.channel,
            rating: validatedData.rating,
            resolution_status: 'unopened', // Default status for new feedback
            store_number: validatedData.store_number,
            market: validatedData.market,
            case_number: validatedData.case_number,
            customer_name: validatedData.customer_name,
            customer_email: validatedData.customer_email,
            customer_phone: validatedData.customer_phone,
            feedback_text: validatedData.feedback_text,
            ee_action: validatedData.ee_action,
            period: validatedData.period,
            user_id: '00000000-0000-0000-0000-000000000000' // System user ID for webhook ingestion
          })
          .select()
          .single()
        
        if (insertError) {
          console.error('Database insert error:', insertError)
          results.push({
            success: false,
            error: insertError.message,
            data: validatedData
          })
        } else {
          console.log('Successfully inserted feedback:', insertedData.id)
          results.push({
            success: true,
            id: insertedData.id,
            case_number: insertedData.case_number,
            data: validatedData
          })
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError)
        results.push({
          success: false,
          error: 'Database operation failed',
          data: validatedData
        })
      }
    }
    
    // Return results
    const successCount = results.filter(r => r.success).length
    const totalCount = results.length
    
    const response = {
      message: `Processed ${successCount}/${totalCount} feedback items`,
      results,
      timestamp: new Date().toISOString()
    }
    
    console.log('Webhook processing complete:', response)
    
    return new Response(
      JSON.stringify(response),
      { 
        status: successCount > 0 ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})