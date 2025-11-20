import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EscalatedFeedback {
  id: string;
  case_number: string;
  market: string;
  store_number: string;
  sla_deadline: string;
  escalated_at: string;
  complaint_category: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();

    // Get all escalated feedback items with SLA deadlines
    const { data: escalatedItems, error: fetchError } = await supabaseClient
      .from('customer_feedback')
      .select('id, case_number, market, store_number, sla_deadline, escalated_at, complaint_category')
      .eq('resolution_status', 'escalated')
      .not('sla_deadline', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch escalated feedback: ${fetchError.message}`);
    }

    if (!escalatedItems || escalatedItems.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No escalated items to monitor' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notifications: { feedbackId: string; type: string }[] = [];

    for (const item of escalatedItems as EscalatedFeedback[]) {
      const deadline = new Date(item.sla_deadline);
      const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Check if we should send notifications
      let notificationType: string | null = null;

      if (hoursRemaining < 0) {
        notificationType = 'violation';
      } else if (hoursRemaining <= 4) {
        notificationType = '44_hour';
      } else if (hoursRemaining <= 12) {
        notificationType = '36_hour';
      }

      if (notificationType) {
        // Check if notification was already sent
        const { data: existingNotif } = await supabaseClient
          .from('sla_notifications')
          .select('id')
          .eq('feedback_id', item.id)
          .eq('notification_type', notificationType)
          .single();

        if (!existingNotif) {
          // Get executives to notify
          const { data: executives } = await supabaseClient.rpc(
            'get_executive_hierarchy',
            {
              feedback_market: item.market,
              feedback_store: item.store_number
            }
          );

          if (executives && executives.length > 0) {
            // Send email notifications
            const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
            if (!sendGridApiKey) {
              console.error('SENDGRID_API_KEY not configured');
              continue;
            }

            const subject = notificationType === 'violation'
              ? `🚨 SLA VIOLATION - Case ${item.case_number}`
              : `⏰ SLA Alert (${Math.floor(hoursRemaining)}h remaining) - Case ${item.case_number}`;

            const emailBody = buildEmailBody(item, hoursRemaining, notificationType);

            for (const exec of executives) {
              try {
                await fetch('https://api.sendgrid.com/v3/mail/send', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${sendGridApiKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    personalizations: [{
                      to: [{ email: exec.email, name: exec.display_name }],
                      subject: subject,
                    }],
                    from: {
                      email: 'noreply@atlaswe.com',
                      name: 'Atlas Customer Feedback System'
                    },
                    content: [{
                      type: 'text/html',
                      value: emailBody
                    }]
                  })
                });
              } catch (emailError) {
                console.error(`Failed to send email to ${exec.email}:`, emailError);
              }
            }

            // Log the notification
            await supabaseClient
              .from('sla_notifications')
              .insert({
                feedback_id: item.id,
                notification_type: notificationType,
              });

            notifications.push({ feedbackId: item.id, type: notificationType });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'SLA monitoring completed',
        notifications_sent: notifications.length,
        notifications
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in monitor-sla function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function buildEmailBody(
  item: EscalatedFeedback,
  hoursRemaining: number,
  notificationType: string
): string {
  const urgencyColor = notificationType === 'violation' ? '#DC2626' : 
                       notificationType === '44_hour' ? '#EA580C' : '#F59E0B';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0; text-align: center;">
        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px; text-align: center; background-color: ${urgencyColor}; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">
                ${notificationType === 'violation' ? '🚨 SLA VIOLATION' : '⏰ SLA Alert'}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #333; margin-top: 0;">Critical Feedback Status</h2>
              <p style="color: #666; line-height: 1.6;">
                ${notificationType === 'violation' 
                  ? 'The 48-hour SLA deadline has been exceeded for the following critical feedback case:'
                  : `The 48-hour SLA deadline is approaching (${Math.floor(hoursRemaining)} hours remaining) for:`
                }
              </p>
              
              <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px; background-color: #f9f9f9; border: 1px solid #e0e0e0; font-weight: bold;">Case Number:</td>
                  <td style="padding: 12px; border: 1px solid #e0e0e0;">${item.case_number}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f9f9f9; border: 1px solid #e0e0e0; font-weight: bold;">Market:</td>
                  <td style="padding: 12px; border: 1px solid #e0e0e0;">${item.market}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f9f9f9; border: 1px solid #e0e0e0; font-weight: bold;">Store:</td>
                  <td style="padding: 12px; border: 1px solid #e0e0e0;">#${item.store_number}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f9f9f9; border: 1px solid #e0e0e0; font-weight: bold;">Category:</td>
                  <td style="padding: 12px; border: 1px solid #e0e0e0;">${item.complaint_category}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f9f9f9; border: 1px solid #e0e0e0; font-weight: bold;">Escalated:</td>
                  <td style="padding: 12px; border: 1px solid #e0e0e0;">${new Date(item.escalated_at).toLocaleString()}</td>
                </tr>
              </table>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://guestfeedback.lovable.app/dashboard?feedbackId=${item.id}" 
                   style="display: inline-block; padding: 14px 32px; background-color: ${urgencyColor}; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  View Case Details
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <strong>Required Actions:</strong><br>
                • Review case immediately<br>
                • Provide executive approval or notes<br>
                • Ensure resolution and customer contact
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
