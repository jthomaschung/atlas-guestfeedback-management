import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
  
  // Hardcoded priority mapping per user requirements - using case-insensitive matching
  const priorityMapping: Record<string, 'Praise' | 'Low' | 'Medium' | 'High' | 'Critical'> = {
    'sandwich made wrong': 'High',
    'slow service': 'Medium',
    'rude service': 'Critical',
    'product issue': 'Low',
    'closed early': 'High',
    'praise': 'High',
    'missing item': 'High',
    'credit card issue': 'Low',
    'bread quality': 'Medium',
    'out of product': 'Critical',
    'other': 'Low',
    'cleanliness': 'Medium',
    'possible food poisoning': 'Critical',
    'loyalty program issues': 'Low'
  }
  
  // Use case-insensitive category match for priority assignment
  const categoryLower = complaint_category.toLowerCase()
  defaultPriority = priorityMapping[categoryLower] || 'Low'
  
  // Determine assignee based on complaint category
  let defaultAssignee = 'Unassigned'
  
  // Store level assignment - using case-insensitive matching
  const storeLevelCategories = [
    'sandwich made wrong', 
    'praise', 
    'missing item', 
    'cleanliness'
  ]
  
  // DM level assignment - using case-insensitive matching
  const dmLevelCategories = [
    'rude service', 
    'out of product', 
    'possible food poisoning',
    'closed early'
  ]
  
  // Guest feedback manager level assignment - using case-insensitive matching
  const guestFeedbackCategories = [
    'slow service',
    'product issue',
    'credit card issue', 
    'bread quality',
    'other',
    'loyalty program issues'
  ]
  
  if (storeLevelCategories.includes(categoryLower)) {
    // Query for actual store user email from profiles
    try {
      console.log(`Looking for store email: store${store_number}@atlaswe.com`)
      const { data: storeUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', `store${store_number}@atlaswe.com`)
        .maybeSingle()
      
      console.log('Store user found:', storeUser)
      
      defaultAssignee = storeUser?.email || 'Unassigned'
    } catch (error) {
      console.error('Error fetching store user:', error)
      defaultAssignee = 'Unassigned'
    }
  } else if (dmLevelCategories.includes(categoryLower)) {
    // Find district manager who has access to this market
    try {
      const { data: marketDm } = await supabase
        .from('user_hierarchy')
        .select('user_id')
        .eq('role', 'DM')
        .limit(200) // Get all DMs, then filter by permissions
      
      if (marketDm && marketDm.length > 0) {
        // Check each DM's permissions to find who has access to this market
        console.log(`Looking for DM with access to market: ${market}`)
        for (const dm of marketDm) {
          const [{ data: permissions }, { data: profile }] = await Promise.all([
            supabase
              .from('user_permissions')
              .select('markets')
              .eq('user_id', dm.user_id)
              .maybeSingle(),
            supabase
              .from('profiles')
              .select('email')
              .eq('user_id', dm.user_id)
              .maybeSingle(),
          ])

          const dmEmail = profile?.email || 'unknown'
          console.log(`DM ${dmEmail} has markets:`, permissions?.markets)
          if (permissions?.markets?.includes(market)) {
            console.log(`Found exact market match for DM: ${dmEmail}`)
            defaultAssignee = dmEmail
            break
          }
        }
        
        // If no exact match found, try normalized market names
        if (defaultAssignee === 'Unassigned') {
          console.log(`No exact market match found, trying normalized matching for market: ${market}`)
          const normalizedMarket = market.replace(/\s+/g, '').toUpperCase()
          for (const dm of marketDm) {
            const [{ data: permissions }, { data: profile }] = await Promise.all([
              supabase
                .from('user_permissions')
                .select('markets')
                .eq('user_id', dm.user_id)
                .maybeSingle(),
              supabase
                .from('profiles')
                .select('email')
                .eq('user_id', dm.user_id)
                .maybeSingle(),
            ])

            const dmEmail = profile?.email || 'unknown'
            if (permissions?.markets) {
              const hasMatchingMarket = permissions.markets.some((m: string) => {
                const normalizedPermission = m.replace(/\s+/g, '').toUpperCase()
                console.log(`Comparing ${normalizedMarket} with ${normalizedPermission} for DM: ${dmEmail}`)
                return normalizedPermission === normalizedMarket
              })
              
              if (hasMatchingMarket) {
                console.log(`Found normalized market match for DM: ${dmEmail}`)
                defaultAssignee = dmEmail
                break
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching district manager:', error)
      defaultAssignee = 'Unassigned'
    }
  } else if (guestFeedbackCategories.includes(categoryLower)) {
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
  
  return { ...validatedData, rating: validatedData.rating ?? undefined }
}

Deno.serve(async (req) => {
  console.log('=== WEBHOOK CALLED ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  console.log('Headers:', Object.fromEntries(req.headers.entries()))
  console.log('Auth header present:', req.headers.has('authorization'))
  console.log('Function should be public (verify_jwt=false)')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request handled')
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
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
          details: (parseError as Error).message,
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
        message: (error as Error).message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})