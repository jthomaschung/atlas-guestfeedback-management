import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  feedbackId: string;
  oldStatus: string;
  newStatus: string;
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
    const { feedbackId, oldStatus, newStatus }: NotificationRequest = await req.json();

    if (!feedbackId || !oldStatus || !newStatus) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing internal feedback notification: ${feedbackId} (${oldStatus} -> ${newStatus})`);

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
      .from('internal_feedback')
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

    // Get submitter profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, display_name')
      .eq('user_id', feedback.user_id)
      .maybeSingle();

    if (profileError || !profile || !profile.email) {
      console.error('Error fetching submitter profile:', profileError);
      return new Response(JSON.stringify({ error: 'Submitter email not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check notification preferences (optional - if user opted out)
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('email_on_internal_feedback_update')
      .eq('user_id', feedback.user_id)
      .maybeSingle();

    if (preferences && preferences.email_on_internal_feedback_update === false) {
      console.log(`User ${profile.email} has opted out of internal feedback notifications`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User opted out of notifications' 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get public URL for screenshot if available
    let screenshotUrl = null;
    if (feedback.screenshot_path) {
      const { data: urlData } = supabase.storage
        .from('feedback-screenshots')
        .getPublicUrl(feedback.screenshot_path);
      screenshotUrl = urlData.publicUrl;
    }

    // Prepare email content
    const subject = `Internal Feedback Status Update - ${feedback.title}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Internal Feedback Status Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; border-radius: 8px 8px 0 0; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0 0 10px 0; font-size: 24px;">Internal Feedback Status Update 🔔</h1>
            <p style="margin: 0; font-size: 16px; color: #f0f0f0;">Your feedback has been updated</p>
          </div>
          
          <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px;">
              <span style="background-color: ${getStatusColor(oldStatus)}; color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 14px;">
                ${formatStatus(oldStatus)}
              </span>
              <span style="color: #6b7280; font-size: 20px;">→</span>
              <span style="background-color: ${getStatusColor(newStatus)}; color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 14px;">
                ${formatStatus(newStatus)}
              </span>
            </div>
          </div>

          <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 18px;">Feedback Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px;">ID:</td>
                <td style="padding: 8px 0; font-family: monospace; font-size: 13px;">${feedbackId.slice(0, 8)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Title:</td>
                <td style="padding: 8px 0;">${feedback.title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Category:</td>
                <td style="padding: 8px 0;">
                  <span style="background-color: ${getCategoryColor(feedback.category)}; color: white; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                    ${feedback.category.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Priority:</td>
                <td style="padding: 8px 0;">
                  <span style="background-color: ${getPriorityColor(feedback.priority)}; color: white; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                    ${feedback.priority.toUpperCase()}
                  </span>
                </td>
              </tr>
              ${feedback.page_context ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Page:</td>
                <td style="padding: 8px 0;">${feedback.page_context}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Submitted:</td>
                <td style="padding: 8px 0;">${new Date(feedback.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0; font-size: 16px;">Description</h3>
            <p style="margin: 0; padding: 15px; background-color: #f9fafb; border-left: 4px solid #667eea; border-radius: 4px; white-space: pre-wrap;">
              ${feedback.description}
            </p>
          </div>

          ${screenshotUrl ? `
          <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0; font-size: 16px;">Screenshot</h3>
            <img src="${screenshotUrl}" alt="Screenshot" style="max-width: 100%; height: auto; border-radius: 6px; border: 1px solid #e5e7eb;" />
          </div>
          ` : ''}

          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${supabaseUrl.replace('https://frmjdxziwwlfpgevszga.supabase.co', 'https://lovable.app')}/internal-feedback" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              View Feedback Details
            </a>
          </div>

          <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⚠️ Note:</strong> Please do not reply to this email. View and respond to feedback directly in the portal.
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">This is an automated notification from the Internal Feedback System.</p>
            <p style="margin: 5px 0 0 0;">Thank you for helping us improve the platform!</p>
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
            to: [{ email: profile.email, name: profile.display_name }],
            subject: subject,
          },
        ],
        from: {
          email: 'guest.feedback@atlaswe.com',
          name: 'Internal Feedback System',
        },
        reply_to: {
          email: 'guestfeedback@feedback.atlaswe.com',
          name: 'Guest Feedback',
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
      throw new Error(`Failed to send email: ${emailResponse.status}`);
    }

    // Log notification
    await supabase.from('notification_log').insert({
      user_id: feedback.user_id,
      notification_type: 'internal_feedback_status_change',
      entity_id: feedbackId,
      sent_at: new Date().toISOString(),
    });

    console.log(`Notification sent successfully to ${profile.email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        recipient: profile.email
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in send-internal-feedback-notification function:', error);
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

// Helper functions
function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'resolved':
      return '#16a34a'; // green-600
    case 'in_progress':
      return '#2563eb'; // blue-600
    case 'open':
      return '#d97706'; // amber-600
    default:
      return '#6b7280'; // gray-500
  }
}

function formatStatus(status: string): string {
  return status.replace('_', ' ').toUpperCase();
}

function getCategoryColor(category: string): string {
  switch (category?.toLowerCase()) {
    case 'bug':
      return '#dc2626'; // red-600
    case 'feature':
      return '#7c3aed'; // violet-600
    case 'feedback':
      return '#0891b2'; // cyan-600
    default:
      return '#6b7280'; // gray-500
  }
}

function getPriorityColor(priority: string): string {
  switch (priority?.toLowerCase()) {
    case 'high':
      return '#dc2626'; // red-600
    case 'medium':
      return '#ea580c'; // orange-600
    case 'low':
      return '#65a30d'; // lime-600
    default:
      return '#6b7280'; // gray-500
  }
}

serve(handler);
