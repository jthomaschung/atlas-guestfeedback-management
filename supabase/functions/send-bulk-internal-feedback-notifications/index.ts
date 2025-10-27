import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    console.log('Starting bulk internal feedback notification process...');

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

    // Fetch all resolved internal feedback
    const { data: resolvedFeedback, error: feedbackError } = await supabase
      .from('internal_feedback')
      .select('*')
      .eq('status', 'resolved')
      .eq('archived', false)
      .order('created_at', { ascending: false });

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError);
      throw feedbackError;
    }

    if (!resolvedFeedback || resolvedFeedback.length === 0) {
      console.log('No resolved feedback found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No resolved feedback to notify',
          count: 0
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Found ${resolvedFeedback.length} resolved feedback items`);

    // Get all user profiles
    const userIds = [...new Set(resolvedFeedback.map(f => f.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, email, display_name')
      .in('user_id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Send notifications for each resolved feedback
    const results = {
      total: resolvedFeedback.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      details: [] as any[]
    };

    for (const feedback of resolvedFeedback) {
      const profile = profilesMap.get(feedback.user_id);
      
      if (!profile || !profile.email) {
        console.log(`Skipping feedback ${feedback.id} - no email found`);
        results.skipped++;
        results.details.push({
          feedbackId: feedback.id,
          title: feedback.title,
          status: 'skipped',
          reason: 'No email found'
        });
        continue;
      }

      // Check notification preferences
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('email_on_internal_feedback_update')
        .eq('user_id', feedback.user_id)
        .maybeSingle();

      if (preferences && preferences.email_on_internal_feedback_update === false) {
        console.log(`Skipping feedback ${feedback.id} - user opted out`);
        results.skipped++;
        results.details.push({
          feedbackId: feedback.id,
          title: feedback.title,
          email: profile.email,
          status: 'skipped',
          reason: 'User opted out'
        });
        continue;
      }

      // Get screenshot URL if available
      let screenshotUrl = null;
      if (feedback.screenshot_path) {
        const { data: urlData } = supabase.storage
          .from('feedback-screenshots')
          .getPublicUrl(feedback.screenshot_path);
        screenshotUrl = urlData.publicUrl;
      }

      // Prepare email
      const subject = `Internal Feedback Resolved - ${feedback.title}`;
      const htmlContent = generateEmailHtml(feedback, screenshotUrl, supabaseUrl);

      // Send email via SendGrid
      try {
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
              email: 'noreply@guestfeedback.com',
              name: 'Internal Feedback System',
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
          console.error(`SendGrid error for ${feedback.id}:`, errorText);
          results.failed++;
          results.details.push({
            feedbackId: feedback.id,
            title: feedback.title,
            email: profile.email,
            status: 'failed',
            error: `SendGrid error: ${emailResponse.status}`
          });
          continue;
        }

        // Log notification
        await supabase.from('notification_log').insert({
          user_id: feedback.user_id,
          notification_type: 'internal_feedback_bulk_resolved',
          entity_id: feedback.id,
          sent_at: new Date().toISOString(),
        });

        results.sent++;
        results.details.push({
          feedbackId: feedback.id,
          title: feedback.title,
          email: profile.email,
          status: 'sent'
        });

        console.log(`✓ Sent notification for feedback ${feedback.id} to ${profile.email}`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        console.error(`Error sending email for feedback ${feedback.id}:`, error);
        results.failed++;
        results.details.push({
          feedbackId: feedback.id,
          title: feedback.title,
          email: profile.email,
          status: 'failed',
          error: error.message
        });
      }
    }

    console.log('Bulk notification process complete:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Bulk notifications sent: ${results.sent} sent, ${results.failed} failed, ${results.skipped} skipped`,
        ...results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in bulk notification function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send bulk notifications', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

function generateEmailHtml(feedback: any, screenshotUrl: string | null, supabaseUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Internal Feedback Resolved</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; border-radius: 8px 8px 0 0; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0 0 10px 0; font-size: 24px;">✅ Your Feedback Has Been Resolved!</h1>
          <p style="margin: 0; font-size: 16px; color: #f0f0f0;">Thank you for helping us improve</p>
        </div>
        
        <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0; font-size: 18px;">Feedback Details</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 120px;">Status:</td>
              <td style="padding: 8px 0;">
                <span style="background-color: #16a34a; color: white; padding: 6px 14px; border-radius: 6px; font-weight: bold; font-size: 14px;">
                  ✓ RESOLVED
                </span>
              </td>
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
              <td style="padding: 8px 0;">${new Date(feedback.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin-top: 0; font-size: 16px;">Your Original Feedback</h3>
          <p style="margin: 0; padding: 15px; background-color: #f9fafb; border-left: 4px solid #10b981; border-radius: 4px; white-space: pre-wrap;">
            ${feedback.description}
          </p>
        </div>

        ${screenshotUrl ? `
        <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin-top: 0; font-size: 16px;">Screenshot</h3>
          <img src="${screenshotUrl}" alt="Screenshot" style="max-width: 100%; height: auto; border-radius: 6px; border: 1px solid #e5e7eb;" />
        </div>
        ` : ''}

        <div style="background-color: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #065f46; margin-top: 0; font-size: 16px;">🎉 What's Next?</h3>
          <p style="margin: 0; color: #065f46;">
            Your feedback has been reviewed and addressed by our team. We appreciate you taking the time to help us improve the platform. 
            If you have any questions or additional feedback, please don't hesitate to submit another report.
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${supabaseUrl.replace('https://frmjdxziwwlfpgevszga.supabase.co', 'https://lovable.app')}/internal-feedback" 
             style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            View All Feedback
          </a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">This is an automated notification from the Internal Feedback System.</p>
          <p style="margin: 5px 0 0 0;">Thank you for helping us build a better platform! 🚀</p>
        </div>
      </body>
    </html>
  `;
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
