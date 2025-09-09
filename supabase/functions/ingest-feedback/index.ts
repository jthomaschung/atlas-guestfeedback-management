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
  channel: string
  
  // Feedback details
  feedback_date: string
  complaint_category: string // Accept any string value from the webhook
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

async function validateFeedbackData(data: any): Promise<FeedbackWebhookData | null> {
  console.log('=== VALIDATION START ===')
  console.log('Input data keys:', Object.keys(data))
  console.log('Input data:', JSON.stringify(data, null, 2))
  console.log('Raw complaint_category field:', data.complaint_category)
  console.log('Raw feedback_text field:', data.feedback_text)
  console.log('Raw complaint_text field:', data.complaint_text)
  
  // Basic data check
  if (!data || typeof data !== 'object') {
    console.error('No data or invalid data type')
    return null
  }

  // Handle missing required fields with reasonable defaults
  const channel = data.channel || data.Source || 'qualtrics' // Map Source to channel
  const feedback_date = data.feedback_date || data.Date || new Date().toISOString().split('T')[0] // Map Date to feedback_date
  const complaint_category = data.complaint_category || data['Type of Complaint'] || 'Other' // Map field names
  const store_number = data.store_number || data.Store || '000' // Map Store to store_number
  const market = data.market || data.Market || 'Unknown' // Map Market to market

  // Generate case number if not provided
  const case_number = data.case_number || `CF-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  
  // Set priority based on exact complaint category mapping
  let defaultPriority: 'Praise' | 'Low' | 'Medium' | 'High' | 'Critical' = 'Low'
  
  // Hardcoded priority mapping per user requirements
  const priorityMapping: Record<string, 'Praise' | 'Low' | 'Medium' | 'High' | 'Critical'> = {
    'Sandwich Made wrong': 'High',
    'Slow Service': 'Medium',
    'Rude Service': 'Critical',
    'Product issue': 'Low',
    'Closed Early': 'High',
    'Praise': 'High',
    'Missing Item': 'High',
    'Credit Card Issue': 'Low',
    'Bread Quality': 'Medium',
    'Out of product': 'High',
    'Other': 'Low',
    'Cleanliness': 'Medium',
    'Possible Food Poisoning': 'Critical',
    'Loyalty Program Issues': 'Low'
  }
  
  // Use exact category match for priority assignment
  defaultPriority = priorityMapping[complaint_category] || 'Low'
  
  // Determine assignee based on complaint category
  let defaultAssignee = 'Unassigned'
  
  // Store level assignment
  const storeLevelCategories = [
    'Sandwich Made wrong', 
    'Closed Early', 
    'Praise', 
    'Missing Item', 
    'Cleanliness'
  ]
  
  // DM and Dir and VP level assignment
  const dmLevelCategories = [
    'Rude Service', 
    'Out of product', 
    'Possible Food Poisoning'
  ]
  
  // Guest feedback manager level assignment
  const guestFeedbackCategories = [
    'Slow Service',
    'Product issue',
    'Credit Card Issue', 
    'Bread Quality',
    'Other',
    'Loyalty Program Issues'
  ]
  
  if (storeLevelCategories.includes(complaint_category)) {
    // Query for actual store user email from profiles
    try {
      const { data: storeUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', `store${store_number}@atlawe.com`)
        .maybeSingle()
      
      defaultAssignee = storeUser?.email || 'Unassigned'
    } catch (error) {
      console.error('Error fetching store user:', error)
      defaultAssignee = 'Unassigned'
    }
  } else if (dmLevelCategories.includes(complaint_category)) {
    // Query for actual district manager/director overseeing this store
    try {
      const { data: districtManager } = await supabase
        .from('user_hierarchy')
        .select(`
          user_id,
          profiles!inner(email)
        `)
        .eq('role', 'admin')
        .limit(1)
        .maybeSingle()
      
      defaultAssignee = districtManager?.profiles?.email || 'Unassigned'
    } catch (error) {
      console.error('Error fetching district manager:', error)
      defaultAssignee = 'Unassigned'
    }
  } else if (guestFeedbackCategories.includes(complaint_category)) {
    // Assign to guest feedback manager
    defaultAssignee = 'guestfeedback@atlaswe.com'
  } else {
    // Default fallback for any other categories
    defaultAssignee = 'guestfeedback@atlaswe.com'
  }
  
  const validatedData = {
    channel: channel, // Keep original channel value
    feedback_date,
    complaint_category: complaint_category, // Keep original category exactly as received
    feedback_text: data.feedback_text || data.Feedback || data.complaint_text || '',
    rating: data.rating ? parseInt(data.rating) : null,
    store_number,
    market,
    customer_name: data.customer_name || data.Name || null,
    customer_email: data.customer_email || data.Email || null,
    customer_phone: data.customer_phone || data.Phone || data.ustomer_phone || null, // Handle field mapping
    case_number,
    assignee: data.assignee || defaultAssignee,
    priority: data.priority || defaultPriority,
    ee_action: data.ee_action || data.Action || null,
    period: data.period || data.Period || null
  }
  
  console.log('=== VALIDATION SUCCESS ===')
  console.log('Final complaint category:', complaint_category)
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
      if (contentType.includes('multipart/form-data')) {
        console.log('Parsing as multipart form data...')
        // Parse multipart form data
        const formData = new FormData()
        const request = new Request('http://dummy', {
          method: 'POST',
          headers: { 'content-type': contentType },
          body: rawBody
        })
        const parsedFormData = await request.formData()
        const formObject: any = {}
        
        for (const [key, value] of parsedFormData.entries()) {
          console.log(`Multipart field: ${key} = ${typeof value === 'string' ? value : '[File]'}`)
          if (typeof value === 'string') {
            formObject[key] = value
          }
        }
        
        console.log('Parsed multipart form object:', JSON.stringify(formObject, null, 2))
        
        // Extract actual feedback data from nested URL-encoded data
        if (formObject.data && typeof formObject.data === 'string') {
          console.log('Parsing nested URL-encoded data...')
          const nestedFormData = new URLSearchParams(formObject.data)
          const nestedObject: any = {}
          
          for (const [key, value] of nestedFormData.entries()) {
            console.log(`Nested form field: ${key} = ${value}`)
            nestedObject[key] = value
          }
          
          console.log('Parsed nested form data:', JSON.stringify(nestedObject, null, 2))
          requestData = nestedObject
        } else {
          requestData = formObject
        }
        
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
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
    const validatedData = await validateFeedbackData(requestData)
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
        priority: validatedData.priority,
        assignee: validatedData.assignee,
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