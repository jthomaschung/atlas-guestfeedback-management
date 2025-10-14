import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalNotificationRequest {
  feedbackId: string;
  approverRole: string;
  approverName: string;
  approverUserId: string;
  approverEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Executive approval notification function called');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if SendGrid API key is configured
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    const slackBotToken = Deno.env.get("SLACK_BOT_TOKEN");
    
    if (!sendGridApiKey) {
      console.error('SENDGRID_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    if (!slackBotToken) {
      console.warn('⚠️ SLACK_BOT_TOKEN not configured - Slack notifications will be skipped');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { feedbackId, approverRole, approverName, approverUserId, approverEmail }: ApprovalNotificationRequest = await req.json();
    console.log('Approval notification request:', { feedbackId, approverRole, approverName, approverUserId, approverEmail });

    // Get feedback details
    const { data: feedback, error: feedbackError } = await supabase
      .from('customer_feedback')
      .select('*')
      .eq('id', feedbackId)
      .single();

    if (feedbackError || !feedback) {
      console.error('Error fetching feedback:', feedbackError);
      return new Response(
        JSON.stringify({ error: 'Feedback not found' }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get the executive hierarchy for this feedback (CEO, VP, Director for region, DM)
    const { data: hierarchyData, error: execError } = await supabase
      .rpc('get_executive_hierarchy', {
        p_market: feedback.market,
        p_store_number: feedback.store_number
      });

    if (execError) {
      console.error('Error fetching executive hierarchy:', execError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch executive hierarchy' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch profiles with Slack user IDs
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, email, display_name, slack_user_id')
      .in('user_id', (hierarchyData || []).map((e: any) => e.user_id));
    
    if (profileError) {
      console.error('Error fetching profiles:', profileError);
    }

    // Merge hierarchy data with profile data
    const executives = (hierarchyData || []).map((exec: any) => {
      const profile = profiles?.find((p: any) => p.user_id === exec.user_id);
      return {
        ...exec,
        slack_user_id: profile?.slack_user_id,
      };
    });

    console.log('Found executives to notify:', executives?.length);

    // Use the executive hierarchy - everyone should be notified
    let executivesList = executives || [];
    console.log('Executives to notify:', executivesList.length);

    // Get approval status to show in email
    const { data: approvals } = await supabase
      .from('critical_feedback_approvals')
      .select('approver_role')
      .eq('feedback_id', feedbackId);

    const approvedRoles = new Set(approvals?.map(a => a.approver_role.toLowerCase()) || []);
    const ceoApproved = approvedRoles.has('ceo');
    const vpApproved = approvedRoles.has('vp');
    const directorApproved = approvedRoles.has('director');
    const dmApproved = approvedRoles.has('dm');

    // Send notifications to each executive (both email and Slack)
    for (const exec of executivesList) {
      try {
        // Send email notification
        const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendGridApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email: exec.email }],
                subject: `Critical Feedback Approved by ${approverRole.toUpperCase()} - Case ${feedback.case_number}`,
              },
            ],
            from: {
              email: 'guestfeedback@atlaswe.com',
              name: 'Guest Feedback Management',
            },
            content: [
              {
                type: 'text/html',
                value: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
                <div style="background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <div style="background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: bold;">✓ Critical Feedback Approval</h2>
                    <p style="margin: 8px 0 0 0; opacity: 0.9;">Executive Review Update</p>
                  </div>
                  
                  <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #991b1b; font-weight: bold;">
                      ${approverName} (${approverRole.toUpperCase()}) has approved critical feedback case ${feedback.case_number}
                    </p>
                  </div>
                  
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Feedback Details</h3>
                    <div style="display: grid; gap: 8px;">
                      <div><strong style="color: #6b7280;">Case Number:</strong> <span style="color: #1f2937;">${feedback.case_number}</span></div>
                      <div><strong style="color: #6b7280;">Store:</strong> <span style="color: #1f2937;">#${feedback.store_number} (${feedback.market})</span></div>
                      <div><strong style="color: #6b7280;">Category:</strong> <span style="color: #1f2937;">${feedback.complaint_category}</span></div>
                      <div><strong style="color: #6b7280;">Priority:</strong> <span style="background-color: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${feedback.priority}</span></div>
                      <div><strong style="color: #6b7280;">Customer:</strong> <span style="color: #1f2937;">${feedback.customer_name || 'Not provided'}</span></div>
                      <div><strong style="color: #6b7280;">Feedback Date:</strong> <span style="color: #1f2937;">${new Date(feedback.feedback_date).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                  
                  ${feedback.feedback_text ? `
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <strong style="color: #6b7280;">Customer Feedback:</strong>
                    <div style="margin-top: 8px; color: #1f2937; font-style: italic;">${feedback.feedback_text}</div>
                  </div>
                  ` : ''}
                  
                  <div style="background-color: #eff6ff; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <strong style="color: #1e40af; display: block; margin-bottom: 10px;">Approval Status:</strong>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                      <span style="background-color: ${ceoApproved ? '#16a34a' : '#d1d5db'}; color: white; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: bold;">
                        CEO ${ceoApproved ? '✓' : '⏳'}
                      </span>
                      <span style="background-color: ${vpApproved ? '#16a34a' : '#d1d5db'}; color: white; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: bold;">
                        VP ${vpApproved ? '✓' : '⏳'}
                      </span>
                      <span style="background-color: ${directorApproved ? '#16a34a' : '#d1d5db'}; color: white; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: bold;">
                        DIR ${directorApproved ? '✓' : '⏳'}
                      </span>
                      <span style="background-color: ${dmApproved ? '#16a34a' : '#d1d5db'}; color: white; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: bold;">
                        DM ${dmApproved ? '✓' : '⏳'}
                      </span>
                    </div>
                  </div>

                  ${feedback.sla_deadline ? `
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
                    <strong style="color: #92400e;">SLA Deadline:</strong>
                    <div style="margin-top: 4px; color: #92400e;">${new Date(feedback.sla_deadline).toLocaleString()}</div>
                  </div>
                  ` : ''}
                  
                  <div style="text-align: center; margin-bottom: 25px;">
                    <a href="https://59a1a4a4-5107-4cbe-87fb-e1dcf4b1823a.lovableproject.com/executive-oversight" style="background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">View Executive Dashboard</a>
                  </div>
                  
                  <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; text-align: center;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">This is an automated notification from the Guest Feedback Management System</p>
                    <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0 0;">All 4 approvals (CEO, VP, Director, DM) are required before this case can be archived.</p>
                  </div>
                </div>
              </div>
            `,
              },
            ],
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('SendGrid error for', exec.email, ':', errorText);
        } else {
          console.log('✅ Email notification sent to:', exec.email);
        }
        
        // Send Slack DM if token is configured
        if (slackBotToken) {
          try {
            let slackUserId = exec.slack_user_id;
            
            // If no Slack user ID is stored, look it up by email
            if (!slackUserId && exec.email) {
              try {
                const lookupResponse = await fetch(`https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(exec.email)}`, {
                  headers: {
                    'Authorization': `Bearer ${slackBotToken}`,
                  },
                });
                
                const lookupData = await lookupResponse.json();
                if (lookupData.ok && lookupData.user) {
                  slackUserId = lookupData.user.id;
                  console.log(`📧 Looked up Slack ID for ${exec.email}: ${slackUserId}`);
                } else {
                  console.log(`⚠️ Could not find Slack user for ${exec.email}: ${lookupData.error || 'User not found'}`);
                }
              } catch (lookupError) {
                console.error(`Error looking up Slack user for ${exec.email}:`, lookupError);
              }
            }
            
            // Send Slack DM if we have a user ID
            if (slackUserId) {
              const slackMessage = `🚨 *Critical Feedback Approval*\n\n` +
                `*${approverName} (${approverRole.toUpperCase()})* has approved case *${feedback.case_number}*\n\n` +
                `*Case Details:*\n` +
                `• Store: #${feedback.store_number} (${feedback.market})\n` +
                `• Category: ${feedback.complaint_category}\n` +
                `• Priority: ${feedback.priority}\n` +
                `• Customer: ${feedback.customer_name || 'Not provided'}\n` +
                `• Date: ${new Date(feedback.feedback_date).toLocaleDateString()}\n\n` +
                `*Approval Status:*\n` +
                `${ceoApproved ? '✅' : '⏳'} CEO\n` +
                `${vpApproved ? '✅' : '⏳'} VP\n` +
                `${directorApproved ? '✅' : '⏳'} Director\n` +
                `${dmApproved ? '✅' : '⏳'} DM`;

              const slackResponse = await fetch('https://slack.com/api/chat.postMessage', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${slackBotToken}`,
                },
                body: JSON.stringify({
                  channel: slackUserId,
                  text: slackMessage,
                }),
              });

              const slackData = await slackResponse.json();
              if (!slackData.ok) {
                console.error(`❌ Failed to send Slack DM to ${exec.display_name || exec.email}:`, slackData.error);
              } else {
                console.log(`✅ Slack DM sent to ${exec.display_name || exec.email}`);
              }
            }
          } catch (slackError) {
            console.error(`Error sending Slack DM to ${exec.display_name || exec.email}:`, slackError);
          }
        }

      } catch (emailError) {
        console.error('Failed to send notifications to', exec.email, ':', emailError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notifications sent to ${executivesList.length} executives` 
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error("Error in send-executive-approval-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
