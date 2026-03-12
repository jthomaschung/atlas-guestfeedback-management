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
  time_of_day?: string
  order_number?: string

  // New pipeline fields
  type_of_feedback?: string
  reward?: string
  feedback_source?: string
}

// P1 2026 starts on 2025-12-31 - this is the cutoff for automatic period assignment
const P1_2026_START = '2025-12-31'

/**
 * Look up the fiscal period for a given feedback date from the periods table.
 * Only applies to dates >= P1 2026 start (2025-12-31).
 */
async function lookupPeriodByDate(feedbackDate: string): Promise<string | null> {
  // Only auto-assign for dates >= P1 2026 start
  if (feedbackDate < P1_2026_START) {
    console.log(`Date ${feedbackDate} is before P1 2026 start, skipping auto-period assignment`)
    return null
  }

  try {
    console.log(`Looking up period for date: ${feedbackDate}`)
    
    const { data: periodData, error } = await supabase
      .from('periods')
      .select('name')
      .lte('start_date', feedbackDate)
      .gte('end_date', feedbackDate)
      .maybeSingle()

    if (error) {
      console.error('Error querying periods table:', error)
      return null
    }

    if (periodData?.name) {
      console.log(`Found matching period: ${periodData.name}`)
      return periodData.name
    }

    console.warn(`No matching period found for date: ${feedbackDate}`)
    return null
  } catch (error) {
    console.error('Exception during period lookup:', error)
    return null
  }
}

async function findDmForMarket(market: string): Promise<string> {
  try {
    const { data: marketDm } = await supabase
      .from('user_hierarchy')
      .select('user_id')
      .eq('role', 'DM')
      .limit(200)
    
    if (!marketDm || marketDm.length === 0) return 'Unassigned'

    // Exact match first
    for (const dm of marketDm) {
      const [{ data: permissions }, { data: profile }] = await Promise.all([
        supabase.from('user_permissions').select('markets').eq('user_id', dm.user_id).maybeSingle(),
        supabase.from('profiles').select('email').eq('user_id', dm.user_id).maybeSingle(),
      ])
      const dmEmail = profile?.email || 'unknown'
      if (permissions?.markets?.includes(market)) {
        console.log(`Found DM for market ${market}: ${dmEmail}`)
        return dmEmail
      }
    }

    // Normalized match
    const normalizedMarket = market.replace(/\s+/g, '').toUpperCase()
    for (const dm of marketDm) {
      const [{ data: permissions }, { data: profile }] = await Promise.all([
        supabase.from('user_permissions').select('markets').eq('user_id', dm.user_id).maybeSingle(),
        supabase.from('profiles').select('email').eq('user_id', dm.user_id).maybeSingle(),
      ])
      const dmEmail = profile?.email || 'unknown'
      if (permissions?.markets) {
        const hasMatch = permissions.markets.some((m: string) => 
          m.replace(/\s+/g, '').toUpperCase() === normalizedMarket
        )
        if (hasMatch) {
          console.log(`Found DM (normalized) for market ${market}: ${dmEmail}`)
          return dmEmail
        }
      }
    }
  } catch (error) {
    console.error('Error finding DM for market:', error)
  }
  return 'Unassigned'
}

async function findStoreAssignee(store_number: string): Promise<string> {
  try {
    console.log(`Looking for store email: store${store_number}@atlaswe.com`)
    const { data: storeUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', `store${store_number}@atlaswe.com`)
      .maybeSingle()
    return storeUser?.email || 'Unassigned'
  } catch (error) {
    console.error('Error fetching store user:', error)
    return 'Unassigned'
  }
}

/**
 * Look up the market (region) for a given store_number from the stores table.
 */
async function lookupMarketByStore(store_number: string): Promise<string> {
  try {
    console.log(`Looking up market for store: ${store_number}`)
    const { data, error } = await supabase
      .from('stores')
      .select('region')
      .eq('store_number', store_number)
      .maybeSingle()

    if (error) {
      console.error('Error querying stores table for market:', error)
      return 'Unknown'
    }

    if (data?.region) {
      console.log(`Found market for store ${store_number}: ${data.region}`)
      return data.region
    }

    console.warn(`No market found for store ${store_number}`)
    return 'Unknown'
  } catch (error) {
    console.error('Exception during market lookup:', error)
    return 'Unknown'
  }
}

/**
 * Normalize a date string to YYYY-MM-DD format.
 * Handles: YYYY-MM-DD, MM-DD-YYYY, MM/DD/YYYY, M/D/YYYY, etc.
 */
function normalizeDateFormat(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0]
  
  const trimmed = dateStr.trim()
  
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  
  // MM-DD-YYYY or MM/DD/YYYY
  const mdyMatch = trimmed.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/)
  if (mdyMatch) {
    const [, month, day, year] = mdyMatch
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  // Fallback: try Date parsing
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]
  }
  
  console.warn(`Could not parse date: "${dateStr}", using today`)
  return new Date().toISOString().split('T')[0]
}

async function validateFeedbackData(data: any): Promise<FeedbackWebhookData | null> {
  console.log('=== VALIDATION START ===')
  console.log('Input data keys:', Object.keys(data))
  console.log('Input data:', JSON.stringify(data, null, 2))
  
  // Basic data check
  if (!data || typeof data !== 'object') {
    console.error('No data or invalid data type')
    return null
  }

  // Handle missing required fields with reasonable defaults
  const channel = data.channel || data.Source || 'RAP'
  const rawDateStr = data.feedback_date || data.Date || new Date().toISOString().split('T')[0]
  const feedback_date = normalizeDateFormat(rawDateStr)
  console.log(`Date normalization: "${rawDateStr}" → "${feedback_date}"`)
  const rawCategory = data.complaint_category || data['Type of Complaint'] || 'Other'
  
  // Normalize category names to standard values
  const categoryNormalization: Record<string, string> = {
    'order accuracy': 'Sandwich Made Wrong',
    'hours': 'Closed Early',
    'team member friendliness': 'Rude Service',
    'sandwich issue': 'Sandwich Made Wrong',
    'missing items': 'Missing Item',
    'order issue': 'Sandwich Made Wrong',
    'oop': 'Out of Product',
    'delivery timing': 'Slow Service',
  }
  const complaint_category = categoryNormalization[rawCategory.toLowerCase()] || rawCategory
  const store_number = data.store_number || data.Store || '000'
  
  // Look up market from stores table instead of trusting webhook data
  const market = await lookupMarketByStore(store_number)

  // New pipeline fields
  const type_of_feedback = data.type_of_feedback || data['Type of Feedback'] || data['Type of feedback'] || null
  const reward = data.reward || data.Reward || null
  const feedback_source = data.feedback_source || data['Feedback Source'] || data.Source || channel

  // Generate case number if not provided
  const case_number = data.case_number || `CF-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  
  // Set priority based on exact complaint category mapping
  const priorityMapping: Record<string, 'Praise' | 'Low' | 'Medium' | 'High' | 'Critical'> = {
    'sandwich made wrong': 'High',
    'slow service': 'Medium',
    'rude service': 'Critical',
    'product issue': 'Low',
    'closed early': 'High',
    'praise': 'High',
    'rockstar service': 'High',
    'missing item': 'High',
    'credit card issue': 'Low',
    'bread quality': 'Medium',
    'out of product': 'Critical',
    'other': 'Low',
    'cleanliness': 'Medium',
    'possible food poisoning': 'Critical',
    'loyalty program issues': 'Low',
    'unauthorized tip': 'Low'
  }
  
  const categoryLower = complaint_category.toLowerCase()
  let defaultPriority: 'Praise' | 'Low' | 'Medium' | 'High' | 'Critical' = priorityMapping[categoryLower] || 'Low'
  
  // Check feedback text for critical keywords
  const feedbackTextLower = (data.feedback_text || data.Feedback || data.complaint_text || '').toLowerCase()
  if (feedbackTextLower.includes('food poisoning')) {
    console.log('🚨 CRITICAL: Food poisoning detected in feedback text')
    defaultPriority = 'Critical'
  }
  
  // === NEW: type_of_feedback-driven routing ===
  let defaultAssignee = 'Unassigned'

  if (type_of_feedback) {
    const typeNormalized = type_of_feedback.trim().toLowerCase()
    console.log(`🔀 ROUTING: type_of_feedback = "${type_of_feedback}" (normalized: "${typeNormalized}")`)

    if (typeNormalized === 'fyi') {
      // FYI: acknowledge-only, assign to guest feedback manager
      defaultAssignee = 'guestfeedback@atlaswe.com'
      console.log('📋 ROUTING: FYI type → guestfeedback@atlaswe.com')
    } else if (typeNormalized === 'guest support') {
      // Guest Support: route by category
      // Order Issue = composite: sandwich made wrong, missing item, sandwich issue, order issue
      const storeFollowUpCategories = ['order issue', 'sandwich made wrong', 'missing item', 'missing items', 'sandwich issue', 'cleanliness', 'closed early']
      const autoEscalateCategories = ['out of product', 'rude service', 'possible food poisoning', 'rude', 'oop']

      if (storeFollowUpCategories.includes(categoryLower)) {
        defaultAssignee = await findStoreAssignee(store_number)
        console.log(`🏪 ROUTING: Guest Support + Store category → ${defaultAssignee}`)
      } else if (autoEscalateCategories.includes(categoryLower)) {
        defaultAssignee = await findDmForMarket(market)
        console.log(`🚨 ROUTING: Guest Support + Escalate category → ${defaultAssignee}`)
      } else {
        defaultAssignee = 'guestfeedback@atlaswe.com'
        console.log(`📬 ROUTING: Guest Support + GFM category → guestfeedback@atlaswe.com`)
      }
    } else {
      // Unknown type_of_feedback value, fallback to GFM
      defaultAssignee = 'guestfeedback@atlaswe.com'
      console.log(`⚠️ ROUTING: Unknown type "${type_of_feedback}" → guestfeedback@atlaswe.com`)
    }
  } else {
    // === LEGACY: No type_of_feedback, use old category-based routing ===
    console.log('🔀 ROUTING: No type_of_feedback, using legacy category routing')
    
    const storeLevelCategories = ['sandwich made wrong', 'praise', 'missing item', 'cleanliness']
    const dmLevelCategories = ['rude service', 'out of product', 'possible food poisoning', 'closed early']
    const guestFeedbackCategories = ['slow service', 'product issue', 'credit card issue', 'bread quality', 'other', 'loyalty program issues']
    
    if (storeLevelCategories.includes(categoryLower)) {
      defaultAssignee = await findStoreAssignee(store_number)
    } else if (dmLevelCategories.includes(categoryLower)) {
      defaultAssignee = await findDmForMarket(market)
    } else if (guestFeedbackCategories.includes(categoryLower)) {
      defaultAssignee = 'guestfeedback@atlaswe.com'
    } else {
      defaultAssignee = 'guestfeedback@atlaswe.com'
    }
    
    // Override for food poisoning in text
    if (feedbackTextLower.includes('food poisoning')) {
      console.log('🚨 Food poisoning detected - assigning to DM')
      defaultAssignee = await findDmForMarket(market)
    }
  }
  
  // Determine period
  let finalPeriod: string | null = null
  if (feedback_date >= P1_2026_START) {
    finalPeriod = await lookupPeriodByDate(feedback_date)
    console.log(`Auto-assigned period: ${finalPeriod}`)
  } else {
    finalPeriod = data.period || data.Period || null
  }
  
  const validatedData = {
    channel: 'RAP', // Always normalize channel to RAP
    feedback_date,
    complaint_category: complaint_category,
    feedback_text: data.feedback_text || data.Feedback || data.complaint_text || '',
    rating: data.rating ? parseInt(data.rating) : null,
    store_number,
    market,
    customer_name: data.customer_name || data.Name || null,
    customer_email: data.customer_email || data.Email || null,
    customer_phone: data.customer_phone || data.Phone || data.ustomer_phone || null,
    case_number,
    assignee: data.assignee || defaultAssignee,
    priority: data.priority || defaultPriority,
    ee_action: data.ee_action || data.Action || data['Action Item'] || null,
    period: finalPeriod,
    time_of_day: data.time_of_day || data['Time of Day'] || data.time || null,
    order_number: data.order_number || data['Order Number'] || data.order || null,
    type_of_feedback: type_of_feedback,
    reward: reward,
    feedback_source: feedback_source,
  }
  
  console.log('=== VALIDATION SUCCESS ===')
  console.log('Validated data:', JSON.stringify(validatedData, null, 2))
  
  return { ...validatedData, rating: validatedData.rating ?? undefined }
}

Deno.serve(async (req) => {
  const timestamp = new Date().toISOString()
  console.log('=== WEBHOOK RECEIVED ===', timestamp)
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  console.log('Headers:', Object.fromEntries(req.headers.entries()))
  console.log('Auth header present:', req.headers.has('authorization'))
  console.log('Function configured as PUBLIC (verify_jwt=false)')
  console.log('Request timestamp:', timestamp)
  
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
    
    // Auto-escalate: Critical priority OR Guest Support with escalate categories
    const typeNorm = (validatedData.type_of_feedback || '').trim().toLowerCase()
    const catNorm = validatedData.complaint_category.toLowerCase()
    const autoEscalateCategories = ['out of product', 'rude service', 'possible food poisoning', 'rude']
    const shouldEscalate = validatedData.priority === 'Critical' || 
      (typeNorm === 'guest support' && autoEscalateCategories.includes(catNorm))
    
    const initialStatus = shouldEscalate ? 'escalated' : 'unopened'
    const escalatedAt = shouldEscalate ? new Date().toISOString() : null
    const slaDeadline = shouldEscalate 
      ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      : null
    
    console.log(`Priority: ${validatedData.priority}, Status: ${initialStatus}, Auto-escalated: ${shouldEscalate}`)
    
    const { data: insertedData, error: insertError } = await supabase
      .from('customer_feedback')
      .insert({
        feedback_date: validatedData.feedback_date,
        complaint_category: validatedData.complaint_category,
        channel: validatedData.channel,
        rating: validatedData.rating,
        resolution_status: initialStatus,
        store_number: validatedData.store_number,
        market: validatedData.market,
        case_number: validatedData.case_number,
        customer_name: validatedData.customer_name,
        customer_email: validatedData.customer_email,
        customer_phone: validatedData.customer_phone,
        feedback_text: validatedData.feedback_text,
        priority: validatedData.priority,
        assignee: validatedData.assignee,
        user_id: '00000000-0000-0000-0000-000000000000',
        escalated_at: escalatedAt,
        sla_deadline: slaDeadline,
        auto_escalated: shouldEscalate,
        ee_action: validatedData.ee_action,
        period: validatedData.period,
        time_of_day: validatedData.time_of_day,
        order_number: validatedData.order_number,
        type_of_feedback: validatedData.type_of_feedback,
        reward: validatedData.reward,
        feedback_source: validatedData.feedback_source,
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