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
  let normalizedCategory = complaint_category.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '')
  
  // If category is "other" or invalid, also analyze feedback text for better categorization
  if (!['praise', 'service', 'food_quality', 'cleanliness', 'order_accuracy', 'wait_time', 'facility_issue'].includes(normalizedCategory) || normalizedCategory === 'other') {
    console.log('Analyzing category from complaint and feedback text:', complaint_category)
    
    // Combine category and feedback text for analysis
    const feedbackTextToAnalyze = (data.feedback_text || data.complaint_text || '').toLowerCase()
    const categoryText = (complaint_category + ' ' + feedbackTextToAnalyze).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '')
    
    // Comprehensive category mapping based on provided variations
    if (
      // Order accuracy issues
      categoryText.includes('order') && (categoryText.includes('made') || categoryText.includes('wrong') || categoryText.includes('issue')) ||
      categoryText.includes('sandwich') && (categoryText.includes('made') || categoryText.includes('wrong')) ||
      categoryText.includes('sandwish') || categoryText.includes('sanduwich') ||
      categoryText.includes('missing') && (categoryText.includes('item') || categoryText.includes('itrem')) ||
      categoryText.includes('wrap') && (categoryText.includes('wrong') || categoryText.includes('delivery') || categoryText.includes('order')) ||
      categoryText.includes('chicken') && categoryText.includes('wrap') ||
      categoryText.includes('san') && categoryText.includes('wrong') // Handles "San" with wrong
    ) {
      normalizedCategory = 'order_accuracy'
    } else if (
      // Service issues  
      categoryText.includes('rude') && categoryText.includes('service') ||
      categoryText.includes('slow') && categoryText.includes('service') ||
      categoryText.includes('sllow') || categoryText.includes('sloe') || categoryText.includes('saervice') ||
      categoryText.includes('service') ||
      categoryText.includes('no') && categoryText.includes('driver') ||
      categoryText.includes('do') && categoryText.includes('driver') // Typo for "no driver"
    ) {
      normalizedCategory = 'service'
    } else if (
      // Food quality issues
      categoryText.includes('bread') && categoryText.includes('quality') ||
      categoryText.includes('bread') && categoryText.includes('qualtiy') ||
      categoryText.includes('product') && (categoryText.includes('quality') || categoryText.includes('issues')) ||
      categoryText.includes('out') && categoryText.includes('bread')
    ) {
      normalizedCategory = 'food_quality'
    } else if (
      // Wait time / delivery issues
      categoryText.includes('delivery') && (categoryText.includes('issue') || categoryText.includes('fee')) ||
      categoryText.includes('online') && categoryText.includes('ordering') ||
      categoryText.includes('online') && categoryText.includes('ording') // Typo
    ) {
      normalizedCategory = 'wait_time'
    } else if (
      // Facility issues
      categoryText.includes('store') && categoryText.includes('closed') ||
      categoryText.includes('closing') && categoryText.includes('early') ||
      categoryText.includes('closed') && categoryText.includes('earlier')
    ) {
      normalizedCategory = 'facility_issue'
    } else if (
      // Praise variations
      categoryText.includes('praise') || categoryText.includes('prasie')
    ) {
      normalizedCategory = 'praise'
    } else if (
      // Loyalty/Marketing (map to service for now)
      categoryText.includes('loyalty') || categoryText.includes('loyatly') ||
      categoryText.includes('marketing')
    ) {
      normalizedCategory = 'service'
    } else if (
      // Other variations
      categoryText.includes('other') || categoryText.includes('otlher')
    ) {
      normalizedCategory = 'other'
    } else {
      // Default fallback
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