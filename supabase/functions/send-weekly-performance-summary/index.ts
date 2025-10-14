import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    if (!slackData.ok) {
      console.error(`❌ Slack DM failed for ${recipientEmail}:`, slackData.error);
      return false;
    }
    
    console.log(`✅ Slack DM sent to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error(`Error sending Slack DM to ${recipientEmail}:`, error);
    return false;
  }
}

function buildWeeklySummaryBlocks(summary: any, directorName: string, weekStart: Date, weekEnd: Date): any[] {
  const blocks: any[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `📊 Weekly Performance Summary`,
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${directorName}*\nWeek of ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`
      }
    },
    {
      type: "divider"
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Total Feedback:*\n${summary.total_feedback}` },
        { type: "mrkdwn", text: `*Critical Issues:*\n${summary.critical_count}` },
        { type: "mrkdwn", text: `*Praise Received:*\n${summary.praise_count}` },
        { type: "mrkdwn", text: `*Resolved:*\n${summary.resolved_count}/${summary.total_feedback}` },
      ]
    }
  ];

  // Add resolution rate
  if (summary.total_feedback > 0) {
    const resolutionRate = Math.round((summary.resolved_count / summary.total_feedback) * 100);
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Resolution Rate:* ${resolutionRate}%`
      }
    });
  }

  // Add top categories if available
  if (summary.top_categories && summary.top_categories.length > 0) {
    const categoriesText = summary.top_categories
      .map((cat: any, idx: number) => `${idx + 1}. ${cat.category} (${cat.count})`)
      .join('\n');
    
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Top Issue Categories:*\n${categoriesText}`
      }
    });
  }

  // Add store performance if available
  if (summary.store_breakdown && summary.store_breakdown.length > 0) {
    const storesText = summary.store_breakdown
      .slice(0, 5)
      .map((store: any) => `• #${store.store_number}: ${store.critical_count} critical, ${store.praise_count} praise`)
      .join('\n');
    
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Store Performance:*\n${storesText}`
      }
    });
  }

  blocks.push(
    {
      type: "divider"
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View Full Dashboard", emoji: true },
          url: `https://59a1a4a4-5107-4cbe-87fb-e1dcf4b1823a.lovableproject.com/customer-feedback`
        }
      ]
    }
  );

  return blocks;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Weekly performance summary function called');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const slackBotToken = Deno.env.get("SLACK_BOT_TOKEN");
    
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

    // Calculate last week's date range
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - today.getDay() - 6); // Last Monday
    lastMonday.setHours(0, 0, 0, 0);

    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6); // Last Sunday
    lastSunday.setHours(23, 59, 59, 999);

    console.log('Generating weekly summary for:', lastMonday.toDateString(), '-', lastSunday.toDateString());

    // Get all directors and DMs
    const { data: managers, error: managersError } = await supabase
      .from('user_hierarchy')
      .select('user_id, role')
      .in('role', ['DIRECTOR', 'DM']);

    if (managersError) {
      console.error('Error fetching managers:', managersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch managers' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${managers?.length || 0} managers`);

    // Get profiles with emails
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, email, display_name')
      .in('user_id', (managers || []).map((m: any) => m.user_id));

    // Merge managers with profiles
    const managersWithProfiles = (managers || []).map((manager: any) => {
      const profile = profiles?.find((p: any) => p.user_id === manager.user_id);
      return {
        ...manager,
        email: profile?.email,
        display_name: profile?.display_name
      };
    }).filter((m: any) => m.email); // Only include those with emails

    console.log(`Sending summaries to ${managersWithProfiles.length} managers`);

    // For each manager, generate and send their summary
    for (const manager of managersWithProfiles) {
      try {
        // Get their assigned markets
        const { data: permissions } = await supabase
          .from('user_permissions')
          .select('markets')
          .eq('user_id', manager.user_id)
          .single();

        const markets = permissions?.markets || [];
        
        if (markets.length === 0) {
          console.log(`No markets assigned to ${manager.display_name}, skipping`);
          continue;
        }

        // Get feedback for their markets for the week
        const { data: feedback } = await supabase
          .from('customer_feedback')
          .select('*')
          .in('market', markets)
          .gte('feedback_date', lastMonday.toISOString().split('T')[0])
          .lte('feedback_date', lastSunday.toISOString().split('T')[0]);

        if (!feedback || feedback.length === 0) {
          console.log(`No feedback for ${manager.display_name}, skipping`);
          continue;
        }

        // Generate summary
        const summary = {
          total_feedback: feedback.length,
          critical_count: feedback.filter((f: any) => f.priority === 'Critical').length,
          praise_count: feedback.filter((f: any) => f.priority === 'Praise').length,
          resolved_count: feedback.filter((f: any) => f.resolution_status === 'resolved').length,
          top_categories: Object.entries(
            feedback.reduce((acc: any, f: any) => {
              acc[f.complaint_category] = (acc[f.complaint_category] || 0) + 1;
              return acc;
            }, {})
          )
            .map(([category, count]) => ({ category, count }))
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 3),
          store_breakdown: Object.entries(
            feedback.reduce((acc: any, f: any) => {
              if (!acc[f.store_number]) {
                acc[f.store_number] = { store_number: f.store_number, critical_count: 0, praise_count: 0 };
              }
              if (f.priority === 'Critical') acc[f.store_number].critical_count++;
              if (f.priority === 'Praise') acc[f.store_number].praise_count++;
              return acc;
            }, {})
          )
            .map(([_, data]) => data)
            .sort((a: any, b: any) => b.critical_count - a.critical_count)
        };

        const blocks = buildWeeklySummaryBlocks(
          summary, 
          manager.display_name || manager.email, 
          lastMonday, 
          lastSunday
        );

        await sendSlackDM(
          slackBotToken,
          manager.email,
          blocks,
          `Weekly Performance Summary: ${summary.total_feedback} total feedback, ${summary.critical_count} critical`,
          supabase
        );

        console.log(`✅ Sent weekly summary to ${manager.display_name}`);

      } catch (error) {
        console.error(`Error generating summary for ${manager.display_name}:`, error);
      }
    }

    // Log to database
    await supabase
      .from('daily_summary_log')
      .insert({
        summary_date: lastSunday.toISOString().split('T')[0],
        summary_type: 'weekly_performance',
        recipient_email: 'system',
        metrics: { managers_notified: managersWithProfiles.length }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Weekly summaries sent to ${managersWithProfiles.length} managers` 
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error("Error in send-weekly-performance-summary function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
