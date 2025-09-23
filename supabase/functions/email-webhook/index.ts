import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IncomingEmail {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  messageId?: string;
  inReplyTo?: string;
  references?: string[];
  timestamp: string;
  headers?: Record<string, string>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    console.log('🔥 EMAIL WEBHOOK TRIGGERED:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      timestamp: new Date().toISOString()
    });
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the incoming data - handle both JSON and form data
    const contentType = req.headers.get('content-type') || '';
    let webhookData: any;
    
    if (contentType.includes('application/json')) {
      // Handle JSON data (test webhooks, SendGrid event webhooks)
      webhookData = await req.json();
    } else if (contentType.includes('multipart/form-data')) {
      // Handle SendGrid Parse webhook (multipart form data)
      const formData = await req.formData();
      webhookData = {};
      for (const [key, value] of formData.entries()) {
        webhookData[key] = value;
      }
    } else {
      // Fallback for other content types
      const text = await req.text();
      try {
        webhookData = JSON.parse(text);
      } catch {
        // If not JSON, treat as form-encoded
        const params = new URLSearchParams(text);
        webhookData = {};
        for (const [key, value] of params.entries()) {
          webhookData[key] = value;
        }
      }
    }
    
    // SIMPLE DEBUG: Write raw webhook data to database for analysis
    try {
      await supabase
        .from('customer_outreach_log')
        .insert({
          feedback_id: '00000000-0000-0000-0000-000000000000', // Dummy ID for debugging
          direction: 'inbound',
          outreach_method: 'email',
          message_content: `DEBUG_RAW_WEBHOOK: ${JSON.stringify(webhookData)}`,
          from_email: 'webhook-debug@system.local',
          to_email: 'debug@system.local',
          subject: 'WEBHOOK_DEBUG_DATA',
          delivery_status: 'delivered'
        });
      console.log('✅ DEBUG DATA WRITTEN TO DATABASE');
    } catch (debugError) {
      console.error('❌ DEBUG WRITE FAILED:', debugError);
    }
    
    // COMPREHENSIVE LOGGING - Log ALL webhook data to identify correct field names
    console.log('🔍 COMPLETE WEBHOOK ANALYSIS:');
    console.log('📧 WEBHOOK RAW DATA:', JSON.stringify(webhookData, null, 2));
    console.log('📧 WEBHOOK DATA TYPE:', typeof webhookData, 'IS_ARRAY:', Array.isArray(webhookData));
    console.log('📧 TOP-LEVEL FIELDS:', Object.keys(webhookData));

    // Check if this is a SendGrid event webhook (array of events) or inbound parse
    if (Array.isArray(webhookData) && webhookData[0]?.event) {
      // This is a SendGrid event webhook (delivery status updates)
      console.log('Processing SendGrid event webhook');
      
      for (const event of webhookData) {
        const { event: eventType, sg_message_id, feedback_id } = event;
        console.log('Processing event:', eventType, 'for feedback:', feedback_id);
        
        // Update delivery status in outreach log using feedback_id from custom args
        if (feedback_id) {
          await supabase
            .from('customer_outreach_log')
            .update({
              delivery_status: eventType
            })
            .eq('feedback_id', feedback_id)
            .eq('direction', 'outbound');
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, message: 'Event webhook processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle actual incoming email responses from SendGrid Parse
    console.log('📨 PROCESSING INBOUND EMAIL FROM SENDGRID PARSE');
    
    // SendGrid Parse sends fields with various possible names
    const emailData = {
      from: webhookData.from || webhookData.sender || webhookData.envelope?.from,
      to: webhookData.to || webhookData.recipient || webhookData.envelope?.to,
      subject: webhookData.subject,
      text: webhookData.text || webhookData['text/plain'] || webhookData.text_body || webhookData.body_text,
      html: webhookData.html || webhookData['text/html'] || webhookData.html_body || webhookData.body_html,
      timestamp: new Date().toISOString()
    };
    
    console.log('📨 PARSED EMAIL DATA:', {
      from: emailData.from,
      to: emailData.to, 
      subject: emailData.subject,
      hasText: !!emailData.text,
      hasHtml: !!emailData.html,
      textLength: emailData.text?.length || 0
    });
    
    // Validate required fields for incoming email
    if (!emailData.from || !emailData.subject) {
      console.log('❌ MISSING REQUIRED EMAIL FIELDS - FROM:', !!emailData.from, 'SUBJECT:', !!emailData.subject);
      return new Response(
        JSON.stringify({ success: true, message: 'Webhook processed - missing fields' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract customer email and try to match with existing feedback
    const customerEmail = emailData.from;
    
    // Try all possible field names for email content from SendGrid Parse
    const replyContent = 
      emailData.text || 
      emailData.html || 
      webhookData.text || 
      webhookData.html || 
      webhookData['text/plain'] || 
      webhookData['text/html'] || 
      webhookData.text_body || 
      webhookData.html_body || 
      webhookData.body_text || 
      webhookData.body_html || 
      webhookData.body || 
      webhookData.content ||
      webhookData.message ||
      webhookData.raw_text ||
      webhookData.email_body ||
      '';
    
    console.log('📧 EMAIL CONTENT EXTRACTION:', {
      hasEmailDataText: !!emailData.text,
      hasEmailDataHtml: !!emailData.html,
      hasWebhookText: !!webhookData.text,
      hasWebhookHtml: !!webhookData.html,
      hasWebhookTextPlain: !!webhookData['text/plain'],
      hasWebhookTextHtml: !!webhookData['text/html'],
      hasTextBody: !!webhookData.text_body,
      hasHtmlBody: !!webhookData.html_body,
      hasBodyText: !!webhookData.body_text,
      hasBodyHtml: !!webhookData.body_html,
      hasBody: !!webhookData.body,
      hasContent: !!webhookData.content,
      hasMessage: !!webhookData.message,
      hasRawText: !!webhookData.raw_text,
      hasEmailBody: !!webhookData.email_body,
      finalContentLength: replyContent.length,
      contentPreview: replyContent.substring(0, 100)
    });
    
    // Try to extract case number from subject line
    const caseNumberMatch = emailData.subject?.match(/Case #([A-Z0-9-]+)/i);
    const caseNumber = caseNumberMatch ? caseNumberMatch[1] : null;

    let feedbackId: string | null = null;

    // First, try to find feedback by case number if extracted
    if (caseNumber) {
      console.log('🔍 SEARCHING BY CASE NUMBER:', caseNumber, 'FOR EMAIL:', customerEmail);
      const { data: feedbackByCase } = await supabase
        .from('customer_feedback')
        .select('id')
        .eq('case_number', caseNumber)
        .maybeSingle();
      
      if (feedbackByCase) {
        feedbackId = feedbackByCase.id;
        console.log('✅ FOUND FEEDBACK BY CASE NUMBER:', feedbackId);
      } else {
        console.log('❌ NO FEEDBACK FOUND BY CASE NUMBER');
      }
    } else {
      console.log('❌ NO CASE NUMBER EXTRACTED FROM SUBJECT:', emailData.subject);
    }

    // If not found by case number, try to find most recent feedback from this customer
    // Try multiple email formats to match
    if (!feedbackId) {
      const emailsToTry = [
        customerEmail,
        customerEmail.replace(/.*<(.+)>.*/, '$1'), // Extract email from "Name <email>" format
        customerEmail.split('<')[0].trim() // Try just the name part
      ].filter(Boolean);

      for (const emailToTry of emailsToTry) {
        const { data: recentFeedback } = await supabase
          .from('customer_feedback')
          .select('id')
          .eq('customer_email', emailToTry)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (recentFeedback) {
          feedbackId = recentFeedback.id;
          console.log('Found feedback by customer email:', emailToTry, 'ID:', feedbackId);
          break;
        }
      }
    }

    // If still no feedback found, create a general inquiry record
    if (!feedbackId) {
      console.log('No matching feedback found, creating new inquiry record');
      
      const { data: newFeedback, error: createError } = await supabase
        .from('customer_feedback')
        .insert({
          customer_email: customerEmail,
          customer_name: extractNameFromEmail(customerEmail),
          case_number: `INQ-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          complaint_category: 'Other',
          channel: 'email',
          feedback_date: new Date().toISOString().split('T')[0],
          feedback_text: replyContent.substring(0, 1000), // Limit length
          store_number: '000', // Default for inquiries
          market: 'Unknown',
          priority: 'Low',
          resolution_status: 'unopened',
          user_id: '00000000-0000-0000-0000-000000000000' // System user
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating new inquiry:', createError);
        throw createError;
      }

      feedbackId = newFeedback.id;
    }

    // Perform sentiment analysis on the reply
    const sentiment = analyzeSentiment(replyContent);
    console.log('Detected sentiment:', sentiment);

    // Create an outreach log entry for the inbound message
    console.log('📝 CREATING OUTREACH LOG FOR FEEDBACK:', feedbackId);
    const { data: outreachLog, error: logError } = await supabase
      .from('customer_outreach_log')
      .insert({
        feedback_id: feedbackId,
        direction: 'inbound',
        outreach_method: 'email',
        message_content: replyContent,
        from_email: customerEmail,
        to_email: 'guest.feedback@atlaswe.com',
        subject: emailData.subject,
        email_message_id: emailData.messageId,
        email_thread_id: emailData.inReplyTo || emailData.messageId,
        response_received: true,
        response_sentiment: sentiment,
        delivery_status: 'delivered'
      })
      .select()
      .single();
    
    console.log('📝 OUTREACH LOG RESULT:', { data: outreachLog, error: logError });

    if (logError) {
      console.error('Error creating inbound outreach log:', logError);
      throw logError;
    }

    // Update the original feedback with customer response info
    const updateData: any = {
      customer_responded_at: new Date().toISOString(),
      customer_response_sentiment: sentiment,
      updated_at: new Date().toISOString()
    };

    // If sentiment is negative, escalate the feedback
    if (sentiment === 'negative') {
      updateData.priority = 'High';
      updateData.resolution_status = 'escalated';
    }

    await supabase
      .from('customer_feedback')
      .update(updateData)
      .eq('id', feedbackId);

    // Route the message to appropriate team members based on sentiment and content
    await routeInboundMessage(supabase, feedbackId, sentiment, replyContent);

    console.log('Successfully processed inbound email');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Inbound email processed successfully',
        feedbackId,
        sentiment 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in email-webhook function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

// Simple sentiment analysis function
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lowerText = text.toLowerCase();
  
  const positiveWords = [
    'thank', 'thanks', 'appreciate', 'great', 'excellent', 'good', 'satisfied',
    'happy', 'pleased', 'wonderful', 'amazing', 'fantastic', 'love', 'perfect',
    'helpful', 'friendly', 'polite', 'quick', 'fast', 'clean', 'fresh'
  ];
  
  const negativeWords = [
    'disappointed', 'angry', 'frustrated', 'terrible', 'awful', 'horrible', 'bad',
    'worst', 'hate', 'disgusting', 'unacceptable', 'poor', 'slow', 'rude', 'dirty',
    'cold', 'old', 'stale', 'wrong', 'missing', 'broken', 'sick', 'complaint',
    'refund', 'manager', 'corporate', 'never', 'again'
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveScore++;
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeScore++;
  });

  if (negativeScore > positiveScore) return 'negative';
  if (positiveScore > negativeScore) return 'positive';
  return 'neutral';
}

// Extract name from email address
function extractNameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  // Replace dots and underscores with spaces, then title case
  return localPart
    .replace(/[._]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Route inbound messages to appropriate team members
async function routeInboundMessage(
  supabase: any, 
  feedbackId: string, 
  sentiment: string, 
  content: string
): Promise<void> {
  try {
    // Get the feedback details for routing decisions
    const { data: feedback } = await supabase
      .from('customer_feedback')
      .select('*')
      .eq('id', feedbackId)
      .single();

    if (!feedback) return;

    // Determine if this needs immediate escalation
    const needsEscalation = 
      sentiment === 'negative' || 
      content.toLowerCase().includes('manager') ||
      content.toLowerCase().includes('corporate') ||
      content.toLowerCase().includes('lawsuit') ||
      content.toLowerCase().includes('media') ||
      feedback.priority === 'Critical';

    if (needsEscalation) {
      console.log('Message needs escalation, routing to management');
      
      // Find district managers or admins to notify
      const { data: managers } = await supabase
        .from('user_hierarchy')
        .select('user_id')
        .in('role', ['DM', 'ADMIN'])
        .limit(5);

      // In a real implementation, you would send notifications to these managers
      // For now, we just log the routing decision
      console.log('Would notify managers:', managers?.map(m => m.user_id));
    }

    // Log the routing decision
    console.log(`Routed message for feedback ${feedbackId} - Escalation needed: ${needsEscalation}`);
    
  } catch (error) {
    console.error('Error routing inbound message:', error);
  }
}

serve(handler);