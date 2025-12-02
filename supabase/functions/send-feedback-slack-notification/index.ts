import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SlackNotificationRequest {
  type: 'new_feedback' | 'tagged' | 'sla_warning' | 'sla_exceeded' | 'critical_escalation' | 'customer_response' | 'reassignment' | 'store_alert';
  feedbackId: string;
  taggedDisplayName?: string;
  taggerUserId?: string;
  note?: string;
  hoursRemaining?: number;
}

// Reusable function to send Slack DM
async function sendSlackDM(slackBotToken: string, recipientEmail: string, blocks: any[], fallbackText: string, supabase: any): Promise<boolean> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('slack_user_id')
      .eq('email', recipientEmail)
      .single();
    
    let slackUserId = profile?.slack_user_id;
    
    if (!slackUserId) {
      const lookupResponse = await fetch(`https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(recipientEmail)}`, {
        headers: { 'Authorization': `Bearer ${slackBotToken}` }
      });
      
      const lookupData = await lookupResponse.json();
      if (lookupData.ok && lookupData.user) {
        slackUserId = lookupData.user.id;
        console.log(`📧 Looked up Slack ID for ${recipientEmail}: ${slackUserId}`);
        
        await supabase
          .from('profiles')
          .update({ slack_user_id: slackUserId })
          .eq('email', recipientEmail);
      } else {
        console.log(`⚠️ Could not find Slack user for ${recipientEmail}`);
        return false;
      }
    }
    
    const slackResponse = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${slackBotToken}`
      },
      body: JSON.stringify({
        channel: slackUserId,
        blocks: blocks,
        text: fallbackText
      })
    });
    
    const slackData = await slackResponse.json();
    console.log(`📤 Slack API response for ${recipientEmail}:`, JSON.stringify(slackData, null, 2));
    
    if (!slackData.ok) {
      console.error(`❌ Slack DM failed for ${recipientEmail}:`, slackData.error);
      return false;
    }
    
    console.log(`✅ Slack DM sent to ${recipientEmail} (channel: ${slackUserId}, ts: ${slackData.ts})`);
    return true;
  } catch (error) {
    console.error(`Error sending Slack DM to ${recipientEmail}:`, error);
    return false;
  }
}

// Build Slack blocks for new feedback
function buildNewFeedbackBlocks(feedback: any, frontendUrl: string): any[] {
  const priorityEmoji = feedback.priority === 'Critical' ? '🚨' : 
                        feedback.priority === 'High' ? '⚠️' : 
                        feedback.priority === 'Praise' ? '⭐' : 'ℹ️';
  
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${priorityEmoji} New Customer Feedback`,
        emoji: true
      }
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Store:*\n#${feedback.store_number} (${feedback.market})` },
        { type: "mrkdwn", text: `*Priority:*\n${feedback.priority}` },
        { type: "mrkdwn", text: `*Category:*\n${feedback.complaint_category}` },
        { type: "mrkdwn", text: `*Channel:*\n${feedback.channel}` },
      ]
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Customer:*\n${feedback.customer_name || 'Not provided'}` },
        { type: "mrkdwn", text: `*Email:*\n${feedback.customer_email || 'Not provided'}` },
      ]
    },
    ...(feedback.feedback_text ? [{
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Feedback:*\n_${feedback.feedback_text.substring(0, 300)}${feedback.feedback_text.length > 300 ? '...' : ''}_`
      }
    }] : []),
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View Details", emoji: true },
          url: `${frontendUrl}/customer-feedback`
        }
      ]
    }
  ];
}

// Build Slack blocks for tagged notification
function buildTaggedBlocks(feedback: any, taggerName: string, note: string, frontendUrl: string): any[] {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🏷️ You've Been Tagged",
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `in Customer Feedback Case *${feedback.case_number}*`
      }
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Store:*\n#${feedback.store_number} (${feedback.market})` },
        { type: "mrkdwn", text: `*Priority:*\n${feedback.priority}` },
        { type: "mrkdwn", text: `*Category:*\n${feedback.complaint_category}` },
      ]
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*💬 Note from ${taggerName}:*\n_${note}_`
      }
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View Feedback", emoji: true },
          url: `${frontendUrl}/customer-feedback`
        }
      ]
    }
  ];
}

// Build Slack blocks for SLA warning/exceeded
function buildSLABlocks(feedback: any, type: 'warning' | 'exceeded', hoursRemaining: number | undefined, frontendUrl: string): any[] {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: type === 'warning' ? "⏰ SLA Deadline Approaching" : "🚨 SLA DEADLINE EXCEEDED",
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: type === 'warning' 
          ? `Case *${feedback.case_number}* deadline in *${hoursRemaining} hours*`
          : `Case *${feedback.case_number}* is *OVERDUE*`
      }
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Store:*\n#${feedback.store_number} (${feedback.market})` },
        { type: "mrkdwn", text: `*Priority:*\n${feedback.priority}` },
        { type: "mrkdwn", text: `*Category:*\n${feedback.complaint_category}` },
        { type: "mrkdwn", text: `*Deadline:*\n${new Date(feedback.sla_deadline).toLocaleString()}` },
      ]
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Resolve Now", emoji: true },
          url: `${frontendUrl}/executive-oversight`,
          style: "danger"
        }
      ]
    }
  ];
}

// Build Slack blocks for critical escalation
function buildCriticalEscalationBlocks(feedback: any, frontendUrl: string): any[] {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🚨 CRITICAL FEEDBACK AUTO-ESCALATED",
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Case *${feedback.case_number}* has been automatically escalated to Critical priority`
      }
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Store:*\n#${feedback.store_number} (${feedback.market})` },
        { type: "mrkdwn", text: `*Category:*\n${feedback.complaint_category}` },
        { type: "mrkdwn", text: `*SLA Deadline:*\n${new Date(feedback.sla_deadline).toLocaleString()}` },
      ]
    },
    ...(feedback.feedback_text ? [{
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Customer Feedback:*\n_${feedback.feedback_text.substring(0, 200)}_`
      }
    }] : []),
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Review Immediately", emoji: true },
          url: `${frontendUrl}/executive-oversight`,
          style: "danger"
        }
      ]
    }
  ];
}

// Build Slack blocks for customer response
function buildCustomerResponseBlocks(feedback: any, sentiment: string, frontendUrl: string): any[] {
  const sentimentEmoji = sentiment === 'positive' ? '😊' : sentiment === 'negative' ? '😟' : '😐';
  
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${sentimentEmoji} Customer Responded`,
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Customer responded to Case *${feedback.case_number}*\nSentiment: *${sentiment}*`
      }
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Store:*\n#${feedback.store_number} (${feedback.market})` },
        { type: "mrkdwn", text: `*Customer:*\n${feedback.customer_name || 'Not provided'}` },
      ]
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View Conversation", emoji: true },
          url: `${frontendUrl}/customer-feedback`
        }
      ]
    }
  ];
}

// Build Slack blocks for store alert (3+ critical in a day)
function buildStoreAlertBlocks(storeNumber: string, market: string, criticalCount: number, frontendUrl: string): any[] {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🚨 STORE PERFORMANCE ALERT",
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Store #${storeNumber} (${market}) has received *${criticalCount} critical feedback* items today`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Immediate Action Required:*\n• Review all critical cases\n• Contact store manager\n• Identify root causes\n• Implement corrective actions"
      }
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Review All Cases", emoji: true },
          url: `${frontendUrl}/customer-feedback`,
          style: "danger"
        }
      ]
    }
  ];
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Feedback Slack notification function called');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const slackBotToken = Deno.env.get("SLACK_BOT_TOKEN");
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://guestfeedback.lovable.app';
    
    if (!slackBotToken) {
      console.error('SLACK_BOT_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Slack not configured' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
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

    const { type, feedbackId, taggedDisplayName, taggerUserId, note, hoursRemaining }: SlackNotificationRequest = await req.json();
    console.log('📨 Notification request:', { type, feedbackId, taggedDisplayName, taggerUserId, noteLength: note?.length });

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

    let recipients: any[] = [];
    let blocks: any[] = [];
    let fallbackText = '';

    // Determine recipients and build blocks based on notification type
    switch (type) {
      case 'new_feedback':
        // Get all stakeholders based on role and region
        const { data: hierarchyData } = await supabase
          .rpc('get_executive_hierarchy', {
            p_market: feedback.market,
            p_store_number: feedback.store_number
          });

        if (hierarchyData && hierarchyData.length > 0) {
          // Get profiles with email
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, email, display_name')
            .in('user_id', hierarchyData.map((e: any) => e.user_id));
          
          recipients = profiles || [];
        }

        blocks = buildNewFeedbackBlocks(feedback, frontendUrl);
        fallbackText = `New ${feedback.priority} feedback for Store #${feedback.store_number}`;
        break;

      case 'tagged':
        console.log(`🏷️ Processing tagged notification for: "${taggedDisplayName}"`);
        
        // Find user by display name - try exact match first, then partial
        let taggedUser = null;
        
        // Try exact match first
        const { data: exactMatch, error: exactError } = await supabase
          .from('profiles')
          .select('user_id, email, display_name')
          .eq('display_name', taggedDisplayName)
          .limit(1);
        
        if (exactMatch && exactMatch.length > 0) {
          taggedUser = exactMatch[0];
          console.log(`✅ Found exact match: ${taggedUser.display_name} (${taggedUser.email})`);
        } else {
          // Try partial match
          const { data: partialMatch, error: partialError } = await supabase
            .from('profiles')
            .select('user_id, email, display_name')
            .ilike('display_name', `%${taggedDisplayName}%`)
            .limit(1);
          
          if (partialMatch && partialMatch.length > 0) {
            taggedUser = partialMatch[0];
            console.log(`✅ Found partial match: ${taggedUser.display_name} (${taggedUser.email})`);
          } else {
            console.warn(`⚠️ No user found matching display_name: "${taggedDisplayName}"`);
            console.log(`📝 Exact error: ${exactError?.message}, Partial error: ${partialError?.message}`);
          }
        }

        if (taggedUser) {
          recipients = [taggedUser];
          
          // Get tagger name - use taggerUserId if provided, otherwise fall back to feedback creator
          const taggerId = taggerUserId || feedback.user_id;
          const { data: taggerData } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', taggerId)
            .single();
          
          const taggerName = taggerData?.display_name || 'Someone';
          console.log(`🔨 Building blocks - tagger: ${taggerName}, note preview: "${(note || '').substring(0, 50)}..."`);
          blocks = buildTaggedBlocks(feedback, taggerName, note || '', frontendUrl);
          fallbackText = `You've been tagged in case ${feedback.case_number}`;
          console.log(`✅ Ready to send notification to ${taggedUser.email}`);
          
          // Create in-app notification
          const { error: notificationError } = await supabase
            .from('notification_log')
            .insert({
              recipient_email: taggedUser.email,
              notification_type: 'feedback_mention',
              feedback_id: feedbackId,
              message: note || '',
              tagger_name: taggerName,
              status: 'sent',
              sent_at: new Date().toISOString()
            });
          
          if (notificationError) {
            console.error('❌ Error creating in-app notification:', notificationError);
          } else {
            console.log(`✅ In-app notification created for ${taggedUser.email}`);
          }
          
          // Send email notification via SendGrid
          const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
          if (sendgridApiKey && taggedUser.email) {
            try {
              console.log(`📧 Sending tag notification email to ${taggedUser.email}`);
              const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${sendgridApiKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  personalizations: [{
                    to: [{ email: taggedUser.email }]
                  }],
                  from: { email: 'guest.feedback@atlaswe.com', name: 'Guest Feedback' },
                  subject: `You've been tagged in Case ${feedback.case_number}`,
                  content: [{
                    type: 'text/html',
                    value: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #dc2626; padding: 20px; text-align: center;">
                          <h1 style="color: white; margin: 0;">🏷️ You've Been Tagged</h1>
                        </div>
                        <div style="padding: 30px; background: #f9fafb;">
                          <p style="font-size: 16px; color: #374151;">
                            <strong>${taggerName}</strong> tagged you in a customer feedback note.
                          </p>
                          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #dc2626;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                              <strong>Case:</strong> ${feedback.case_number}
                            </p>
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                              <strong>Store:</strong> #${feedback.store_number} (${feedback.market})
                            </p>
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                              <strong>Category:</strong> ${feedback.complaint_category}
                            </p>
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                              <strong>Priority:</strong> ${feedback.priority}
                            </p>
                          </div>
                          <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; color: #92400e;">
                              <strong>💬 Note:</strong><br/>
                              ${note || 'No additional note provided.'}
                            </p>
                          </div>
                          <div style="text-align: center; margin-top: 30px;">
                            <a href="${frontendUrl}/customer-feedback" 
                               style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                              View Feedback
                            </a>
                          </div>
                        </div>
                        <div style="background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
                          Guest Feedback Management System
                        </div>
                      </div>
                    `
                  }]
                })
              });
              
              if (emailResponse.ok) {
                console.log(`✅ Tag notification email sent to ${taggedUser.email}`);
              } else {
                const errorText = await emailResponse.text();
                console.error(`❌ SendGrid error: ${emailResponse.status} - ${errorText}`);
              }
            } catch (emailError) {
              console.error('❌ Error sending tag notification email:', emailError);
            }
          } else {
            console.log('⚠️ SendGrid not configured or no email - skipping email notification');
          }
        }
        break;

      case 'sla_warning':
      case 'sla_exceeded':
        // Send to assigned user, their manager, and directors
        const { data: slaHierarchy } = await supabase
          .rpc('get_executive_hierarchy', {
            p_market: feedback.market,
            p_store_number: feedback.store_number
          });

        if (slaHierarchy) {
          const { data: slaProfiles } = await supabase
            .from('profiles')
            .select('user_id, email, display_name')
            .in('user_id', slaHierarchy.map((e: any) => e.user_id));
          
          recipients = slaProfiles || [];
        }

        blocks = buildSLABlocks(feedback, type === 'sla_exceeded' ? 'exceeded' : 'warning', hoursRemaining, frontendUrl);
        fallbackText = type === 'sla_exceeded' 
          ? `SLA EXCEEDED for case ${feedback.case_number}`
          : `SLA warning: ${hoursRemaining}h remaining for case ${feedback.case_number}`;
        break;

      case 'critical_escalation':
        // Send to CEO, VP, Director, and DM
        const { data: execHierarchy } = await supabase
          .rpc('get_executive_hierarchy', {
            p_market: feedback.market,
            p_store_number: feedback.store_number
          });

        if (execHierarchy) {
          const { data: execProfiles } = await supabase
            .from('profiles')
            .select('user_id, email, display_name')
            .in('user_id', execHierarchy.map((e: any) => e.user_id));
          
          recipients = execProfiles || [];
        }

        blocks = buildCriticalEscalationBlocks(feedback, frontendUrl);
        fallbackText = `CRITICAL: Case ${feedback.case_number} auto-escalated`;
        break;

      case 'customer_response':
        // Send to assigned user
        const { data: assignedUser } = await supabase
          .from('profiles')
          .select('user_id, email, display_name')
          .ilike('display_name', feedback.assignee)
          .single();

        if (assignedUser) {
          recipients = [assignedUser];
        }

        blocks = buildCustomerResponseBlocks(feedback, feedback.customer_response_sentiment || 'neutral', frontendUrl);
        fallbackText = `Customer responded to case ${feedback.case_number}`;
        break;

      case 'store_alert':
        // Count critical feedback for this store today
        const today = new Date().toISOString().split('T')[0];
        const { count } = await supabase
          .from('customer_feedback')
          .select('*', { count: 'exact', head: true })
          .eq('store_number', feedback.store_number)
          .eq('priority', 'Critical')
          .gte('feedback_date', today);

        if (count && count >= 3) {
          // Send to DM and Director for this market
          const { data: storeHierarchy } = await supabase
            .rpc('get_executive_hierarchy', {
              p_market: feedback.market,
              p_store_number: feedback.store_number
            });

          if (storeHierarchy) {
            const dmsAndDirectors = storeHierarchy.filter((e: any) => 
              e.role === 'DM' || e.role === 'DIRECTOR'
            );
            
            const { data: alertProfiles } = await supabase
              .from('profiles')
              .select('user_id, email, display_name')
              .in('user_id', dmsAndDirectors.map((e: any) => e.user_id));
            
            recipients = alertProfiles || [];
          }

          blocks = buildStoreAlertBlocks(feedback.store_number, feedback.market, count, frontendUrl);
          fallbackText = `ALERT: Store #${feedback.store_number} has ${count} critical issues today`;
        }
        break;
    }

    console.log(`Sending ${type} notifications to ${recipients.length} recipients`);

    // Send Slack DMs to all recipients
    for (const recipient of recipients) {
      await sendSlackDM(slackBotToken, recipient.email, blocks, fallbackText, supabase);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notifications sent to ${recipients.length} recipients`,
        type 
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error("Error in send-feedback-slack-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
