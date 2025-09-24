import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  feedbackId: string;
  assigneeEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { feedbackId, assigneeEmail }: NotificationRequest = await req.json();

    if (!feedbackId || !assigneeEmail) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get environment variables
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!sendGridApiKey || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch feedback details
    const { data: feedback, error: feedbackError } = await supabase
      .from('customer_feedback')
      .select('*')
      .eq('id', feedbackId)
      .maybeSingle();

    if (feedbackError || !feedback) {
      console.error('Error fetching feedback:', feedbackError);
      return new Response(JSON.stringify({ error: 'Feedback not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare email content
    const subject = `New Guest Feedback Assignment - Case #${feedback.case_number}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Guest Feedback Assignment</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin: 0 0 10px 0;">New Guest Feedback Assignment</h1>
            <p style="margin: 0; font-size: 16px;">You have been assigned a new guest feedback case.</p>
          </div>
          
          <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Case Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 140px;">Case Number:</td>
                <td style="padding: 8px 0;">${feedback.case_number}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Store:</td>
                <td style="padding: 8px 0;">#${feedback.store_number} (${feedback.market})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Category:</td>
                <td style="padding: 8px 0;">${feedback.complaint_category}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Priority:</td>
                <td style="padding: 8px 0;">
                  <span style="background-color: ${getPriorityColor(feedback.priority)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                    ${feedback.priority}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Channel:</td>
                <td style="padding: 8px 0;">${feedback.channel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                <td style="padding: 8px 0;">${new Date(feedback.feedback_date).toLocaleDateString()}</td>
              </tr>
              ${feedback.customer_name ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Customer:</td>
                <td style="padding: 8px 0;">${feedback.customer_name}</td>
              </tr>
              ` : ''}
              ${feedback.customer_email ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0;">${feedback.customer_email}</td>
              </tr>
              ` : ''}
              ${feedback.customer_phone ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                <td style="padding: 8px 0;">${feedback.customer_phone}</td>
              </tr>
              ` : ''}
              ${feedback.rating ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Rating:</td>
                <td style="padding: 8px 0;">${feedback.rating}/5 stars</td>
              </tr>
              ` : ''}
            </table>
          </div>

          ${feedback.feedback_text ? `
          <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0;">Feedback Details</h3>
            <p style="margin: 0; padding: 15px; background-color: #f9fafb; border-left: 4px solid #6b7280; border-radius: 4px;">
              ${feedback.feedback_text}
            </p>
          </div>
          ` : ''}

          <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px;">
            <h3 style="color: #0c4a6e; margin-top: 0;">Next Steps</h3>
            <p style="margin: 0 0 10px 0;">Please review this feedback case and take appropriate action:</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Log into the Guest Feedback Management system</li>
              <li>Review the case details thoroughly</li>
              <li>Respond to the customer if required</li>
              <li>Update the case status as you progress</li>
            </ul>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">This is an automated notification from the Guest Feedback Management System.</p>
          </div>
        </body>
      </html>
    `;

    // Send email via SendGrid
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: assigneeEmail }],
            subject: subject,
          },
        ],
        from: {
          email: 'noreply@guestfeedback.com',
          name: 'Guest Feedback System',
        },
        content: [
          {
            type: 'text/html',
            value: htmlContent,
          },
        ],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('SendGrid error:', errorText);
      throw new Error(`SendGrid API error: ${emailResponse.status}`);
    }

    console.log(`Notification email sent to ${assigneeEmail} for feedback ${feedbackId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification email sent successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in send-feedback-notification function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send notification', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

// Helper function to get priority color
function getPriorityColor(priority: string): string {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return '#dc2626'; // red-600
    case 'high':
      return '#ea580c'; // orange-600
    case 'medium':
      return '#d97706'; // amber-600
    case 'low':
      return '#65a30d'; // lime-600
    case 'praise':
      return '#16a34a'; // green-600
    default:
      return '#6b7280'; // gray-500
  }
}

serve(handler);