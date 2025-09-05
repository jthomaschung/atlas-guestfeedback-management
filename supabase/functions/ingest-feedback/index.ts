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
  console.log('=== VALIDATION START ===')
  console.log('Input data keys:', Object.keys(data))
  console.log('Input data:', JSON.stringify(data, null, 2))
  
  // Basic data check
  if (!data || typeof data !== 'object') {
    console.error('No data or invalid data type')
    return null
  }

  // Handle missing required fields with reasonable defaults
  const channel = data.channel || 'qualtrics' // Default to qualtrics based on your example
  const feedback_date = data.feedback_date || new Date().toISOString().split('T')[0] // Today's date
  const complaint_category = data.complaint_category || 'other' // Default category
  const store_number = data.store_number || '000' // Default store
  const market = data.market || 'Unknown' // Default market

  // Normalize channel value
  let normalizedChannel = channel.toLowerCase()
  if (!['yelp', 'qualtrics', 'jimmy_johns'].includes(normalizedChannel)) {
    console.log('Normalizing channel from:', channel)
    if (normalizedChannel.includes('jimmy') || normalizedChannel.includes('johns')) {
      normalizedChannel = 'jimmy_johns'
    } else {
      normalizedChannel = 'qualtrics' // Default fallback
    }
  }
  
  // Normalize complaint category
  let normalizedCategory = complaint_category.toLowerCase().replace(/\s+/g, '_')
  if (!['praise', 'service', 'food_quality', 'cleanliness', 'order_accuracy', 'wait_time', 'facility_issue', 'other'].includes(normalizedCategory)) {
    console.log('Normalizing category from:', complaint_category)
    // Try to map common variations - check more specific patterns first
    if (normalizedCategory.includes('sandwich') || normalizedCategory.includes('burger') || normalizedCategory.includes('made') || normalizedCategory.includes('wrong') || normalizedCategory.includes('incorrect')) {
      normalizedCategory = 'order_accuracy'
    } else if (normalizedCategory.includes('food') || normalizedCategory.includes('quality') || normalizedCategory.includes('taste') || normalizedCategory.includes('fresh')) {
      normalizedCategory = 'food_quality'
    } else if (normalizedCategory.includes('service') || normalizedCategory.includes('staff') || normalizedCategory.includes('employee') || normalizedCategory.includes('rude')) {
      normalizedCategory = 'service'
    } else if (normalizedCategory.includes('clean') || normalizedCategory.includes('dirty') || normalizedCategory.includes('sanit')) {
      normalizedCategory = 'cleanliness'
    } else if (normalizedCategory.includes('wait') || normalizedCategory.includes('time') || normalizedCategory.includes('slow') || normalizedCategory.includes('delay')) {
      normalizedCategory = 'wait_time'
    } else if (normalizedCategory.includes('order') || normalizedCategory.includes('missing') || normalizedCategory.includes('forgot')) {
      normalizedCategory = 'order_accuracy'
    } else if (normalizedCategory.includes('praise') || normalizedCategory.includes('good') || normalizedCategory.includes('great') || normalizedCategory.includes('excellent')) {
      normalizedCategory = 'praise'
    } else if (normalizedCategory.includes('facility') || normalizedCategory.includes('building') || normalizedCategory.includes('location')) {
      normalizedCategory = 'facility_issue'
    } else {
      normalizedCategory = 'other'
    }
  }
  
  // Generate case number if not provided
  const case_number = data.case_number || `CF-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  
  // Set default priority based on complaint category
  let defaultPriority: 'Praise' | 'Low' | 'High' | 'Critical' = 'Low'
  if (normalizedCategory === 'praise') {
    defaultPriority = 'Praise'
  } else if (['facility_issue', 'cleanliness'].includes(normalizedCategory)) {
    defaultPriority = 'High'
  } else if (normalizedCategory === 'food_quality' && data.rating && parseInt(data.rating) <= 2) {
    defaultPriority = 'Critical'
  }
  
  const validatedData = {
    channel: normalizedChannel as 'yelp' | 'qualtrics' | 'jimmy_johns',
    feedback_date,
    complaint_category: normalizedCategory as any,
    feedback_text: data.feedback_text || data.complaint_text || '',
    rating: data.rating ? parseInt(data.rating) : null,
    store_number,
    market,
    customer_name: data.customer_name || null,
    customer_email: data.customer_email || null,
    customer_phone: data.customer_phone || data.ustomer_phone || null, // Handle typo in form
    case_number,
    assignee: data.assignee || null,
    priority: data.priority || defaultPriority,
    ee_action: data.ee_action || null,
    period: data.period || null
  }
  
  console.log('=== VALIDATION SUCCESS ===')
  console.log('Validated data:', JSON.stringify(validatedData, null, 2))
  
  return validatedData
}

Deno.serve(async (req) => {
  console.log('=== WEBHOOK CALLED ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  console.log('Headers:', Object.fromEntries(req.headers.entries()))
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request')
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

    // Get content type
    const contentType = req.headers.get('content-type') || ''
    console.log('Content-Type:', contentType)
    
    // Read raw body first
    const rawBody = await req.text()
    console.log('Raw body length:', rawBody.length)
    console.log('Raw body (first 500 chars):', rawBody.substring(0, 500))
    
    let requestData
    
    try {
      if (contentType.includes('application/x-www-form-urlencoded')) {
        console.log('Parsing as form data...')
        // Parse form data manually from raw body
        const formData = new URLSearchParams(rawBody)
        const formObject: any = {}
        
        for (const [key, value] of formData.entries()) {
          console.log(`Form field: ${key} = ${value}`)
          // Handle nested data structure from Zapier
          if (key.startsWith('data[') && key.endsWith(']')) {
            const fieldName = key.slice(5, -1)
            if (!formObject.data) formObject.data = {}
            formObject.data[fieldName] = value
          } else {
            formObject[key] = value
          }
        }
        
        console.log('Parsed form object:', JSON.stringify(formObject, null, 2))
        
        // Extract actual feedback data
        requestData = formObject.data || formObject
        console.log('Final request data:', JSON.stringify(requestData, null, 2))
        
      } else if (contentType.includes('application/json') || rawBody.trim().startsWith('{')) {
        console.log('Parsing as JSON...')
        const parsed = JSON.parse(rawBody)
        console.log('Parsed JSON:', JSON.stringify(parsed, null, 2))
        
        // Extract nested data if present
        requestData = parsed.data || parsed
        console.log('Final request data:', JSON.stringify(requestData, null, 2))
      } else {
        console.log('Unknown content type, treating as form data...')
        // Fallback: try form data parsing
        const formData = new URLSearchParams(rawBody)
        const formObject: any = {}
        
        for (const [key, value] of formData.entries()) {
          console.log(`Form field: ${key} = ${value}`)
          formObject[key] = value
        }
        
        requestData = formObject
        console.log('Fallback form data:', JSON.stringify(requestData, null, 2))
      }
    } catch (parseError) {
      console.error('Parse error:', parseError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse request body',
          details: parseError.message,
          contentType,
          bodyLength: rawBody.length
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate data
    const validatedData = validateFeedbackData(requestData)
    if (!validatedData) {
      console.error('Validation failed for data:', JSON.stringify(requestData, null, 2))
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          receivedData: requestData
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Try to insert into database
    console.log('Inserting into database...')
    const { data: insertedData, error: insertError } = await supabase
      .from('customer_feedback')
      .insert({
        feedback_date: validatedData.feedback_date,
        complaint_category: validatedData.complaint_category,
        channel: validatedData.channel,
        rating: validatedData.rating,
        resolution_status: 'unopened',
        store_number: validatedData.store_number,
        market: validatedData.market,
        case_number: validatedData.case_number,
        customer_name: validatedData.customer_name,
        customer_email: validatedData.customer_email,
        customer_phone: validatedData.customer_phone,
        feedback_text: validatedData.feedback_text,
        user_id: '00000000-0000-0000-0000-000000000000' // System user
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return new Response(
        JSON.stringify({ 
          error: 'Database insert failed',
          details: insertError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Success! Inserted feedback:', insertedData.id)
    
    return new Response(
      JSON.stringify({
        success: true,
        id: insertedData.id,
        case_number: insertedData.case_number,
        message: 'Feedback ingested successfully'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})