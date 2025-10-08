import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

// Slack formatting helper functions
function buildSlackCompanySummary(summary: FeedbackSummary, date: Date): any {
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `📊 Daily Feedback Summary - ${dateStr}`,
        emoji: true
      }
    },
    {
      type: "divider"
    }
  ];

  // Critical alert if needed
  if (summary.critical > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `🚨 *Critical Alerts*\n*${summary.critical}* critical issues require immediate attention${summary.slaViolations > 0 ? `\n⚠️ *${summary.slaViolations}* SLA violations detected` : ''}`
      }
    });
  }

  // Key metrics
  blocks.push({
    type: "section",
    fields: [
      {
        type: "mrkdwn",
        text: `*Total Feedback:*\n${summary.totalNew}`
      },
      {
        type: "mrkdwn",
        text: `*Critical:*\n${summary.critical}`
      },
      {
        type: "mrkdwn",
        text: `*Praise:*\n${summary.praise}`
      },
      {
        type: "mrkdwn",
        text: `*Accuracy Issues:*\n${summary.accuracy.total}`
      }
    ]
  });

  // Accuracy breakdown
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*🎯 Accuracy Breakdown*\n• Missing Items: ${summary.accuracy.missingItems}\n• Sandwich Made Wrong: ${summary.accuracy.sandwichMadeWrong}`
    }
  });

  // Top complaints
  if (summary.topComplaints.length > 0) {
    const complaintsText = summary.topComplaints.map(c => `• ${c.category}: ${c.count}`).join('\n');
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*📈 Top Complaint Categories*\n${complaintsText}`
      }
    });
  }

  // Top performing stores
  if (summary.topStores.length > 0) {
    const storesText = summary.topStores.map(s => `• ${s.store}: ${s.praiseCount} ⭐`).join('\n');
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*🏆 Top Performing Stores (Praise)*\n${storesText}`
      }
    });
  }

  // Critical stores
  if (summary.criticalStores.length > 0) {
    const criticalText = summary.criticalStores.map(s => `• ${s.store}: ${s.criticalCount} 🚨`).join('\n');
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*⚠️ Stores Needing Attention*\n${criticalText}`
      }
    });
  }

  // Resolution status
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*📊 Resolution Status*\n• Open: ${summary.openCount}\n• Resolved: ${summary.resolvedCount}`
    }
  });

  return { blocks };
}

async function sendSlackSummary(summary: FeedbackSummary, date: Date): Promise<void> {
  const webhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
  if (!webhookUrl) {
    console.log("Slack webhook URL not configured, skipping Slack notification");
    return;
  }

  try {
    const payload = buildSlackCompanySummary(summary, date);
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.status} ${response.statusText}`);
    }

    console.log("Successfully sent summary to Slack");
  } catch (error) {
    console.error("Error sending to Slack:", error);
    throw error;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedbackSummary {
  totalNew: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  praise: number;
  accuracy: {
    missingItems: number;
    sandwichMadeWrong: number;
    total: number;
  };
  topComplaints: Array<{ category: string; count: number }>;
  slaViolations: number;
  openCount: number;
  resolvedCount: number;
  avgResponseTime: number;
  topStores: Array<{ store: string; praiseCount: number }>;
  criticalStores: Array<{ store: string; criticalCount: number }>;
}

interface RegionalSummary extends FeedbackSummary {
  region: string;
  director: string;
  storeBreakdown: Array<{
    storeNumber: string;
    storeName: string;
    critical: number;
    high: number;
    praise: number;
    accuracy: number;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Calculate yesterday's date range
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    console.log(`Generating summary for ${yesterday.toISOString().split('T')[0]}`);

    // Get all feedback from yesterday
    const { data: yesterdayFeedback, error: feedbackError } = await supabase
      .from("customer_feedback")
      .select("*")
      .gte("created_at", yesterday.toISOString())
      .lte("created_at", yesterdayEnd.toISOString());

    if (feedbackError) {
      throw new Error(`Failed to fetch feedback: ${feedbackError.message}`);
    }

    console.log(`Found ${yesterdayFeedback?.length || 0} feedback items`);

    // Get CEO and VP for company-wide summary
    const { data: executives, error: execError } = await supabase
      .from("user_hierarchy")
      .select("user_id, role")
      .in("role", ["ceo", "vp"]);

    if (execError) {
      console.error("Error fetching executives:", execError);
    }

    // Fetch profiles separately for executives
    let executivesWithProfiles = [];
    if (executives && executives.length > 0) {
      const execIds = executives.map(e => e.user_id);
      const { data: execProfiles } = await supabase
        .from("profiles")
        .select("user_id, email, display_name")
        .in("user_id", execIds);
      
      executivesWithProfiles = executives.map(exec => ({
        ...exec,
        profiles: execProfiles?.find(p => p.user_id === exec.user_id)
      }));
      console.log(`Found ${executivesWithProfiles.length} executives with profiles`);
    }

    // Get Directors with their markets
    const { data: directors, error: dirError } = await supabase
      .from("user_hierarchy")
      .select("user_id, role")
      .eq("role", "director");

    if (dirError) {
      console.error("Error fetching directors:", dirError);
    }

    // Fetch profiles separately for directors
    let directorsWithProfiles = [];
    if (directors && directors.length > 0) {
      const dirIds = directors.map(d => d.user_id);
      const { data: dirProfiles } = await supabase
        .from("profiles")
        .select("user_id, email, display_name")
        .in("user_id", dirIds);
      
      directorsWithProfiles = directors.map(dir => ({
        ...dir,
        profiles: dirProfiles?.find(p => p.user_id === dir.user_id)
      }));
      console.log(`Found ${directorsWithProfiles.length} directors with profiles`);
    }

    // Send company-wide summary
    if (executivesWithProfiles && executivesWithProfiles.length > 0) {
      const companySummary = await generateCompanySummary(yesterdayFeedback || [], supabase);
      
      // Send to Slack first
      try {
        await sendSlackSummary(companySummary, yesterday);
      } catch (slackError) {
        console.error("Failed to send Slack summary, continuing with emails:", slackError);
      }
      
      // Send emails to executives
      for (const exec of executivesWithProfiles) {
        const profile = exec.profiles as any;
        const html = buildCompanyEmail(companySummary, profile.display_name, yesterday);
        
        await resend.emails.send({
          from: "Atlas Daily Summary <noreply@atlaswe.com>",
          to: [profile.email],
          subject: `Daily Feedback Summary - ${yesterday.toISOString().split('T')[0]}`,
          html,
        });

        // Log the sent summary
        await supabase.from("daily_summary_log").insert({
          summary_date: yesterday.toISOString().split('T')[0],
          recipient_email: profile.email,
          summary_type: "company",
          metrics: companySummary,
        });

        console.log(`Sent company summary to ${profile.email}`);
      }
    }

    // Send regional summaries to directors
    if (directorsWithProfiles && directorsWithProfiles.length > 0) {
      for (const director of directorsWithProfiles) {
        const profile = director.profiles as any;

        // Get director's markets
        const { data: marketPerms } = await supabase
          .from("user_market_permissions")
          .select("market_id, markets!inner(name, display_name)")
          .eq("user_id", director.user_id);

        if (!marketPerms || marketPerms.length === 0) continue;

        const directorMarkets = marketPerms.map((m: any) => m.markets.name);
        const regionalSummary = await generateRegionalSummary(
          yesterdayFeedback || [],
          directorMarkets,
          profile.display_name,
          supabase
        );

        const html = buildRegionalEmail(regionalSummary, profile.display_name, yesterday);

        await resend.emails.send({
          from: "Atlas Daily Summary <noreply@atlaswe.com>",
          to: [profile.email],
          subject: `Regional Daily Summary - ${yesterday.toISOString().split('T')[0]}`,
          html,
        });

        // Log the sent summary
        await supabase.from("daily_summary_log").insert({
          summary_date: yesterday.toISOString().split('T')[0],
          recipient_email: profile.email,
          summary_type: "regional",
          region: directorMarkets.join(", "),
          metrics: regionalSummary,
        });

        console.log(`Sent regional summary to ${profile.email}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Daily summaries sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-daily-summary:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function generateCompanySummary(
  feedback: any[],
  supabase: any
): Promise<FeedbackSummary> {
  const critical = feedback.filter((f) => f.priority === "Critical").length;
  const high = feedback.filter((f) => f.priority === "High").length;
  const medium = feedback.filter((f) => f.priority === "Medium").length;
  const low = feedback.filter((f) => f.priority === "Low").length;
  const praise = feedback.filter((f) => f.priority === "Praise").length;

  const missingItems = feedback.filter((f) => f.complaint_category === "Missing item").length;
  const sandwichMadeWrong = feedback.filter((f) => f.complaint_category === "Sandwich Made Wrong").length;

  // Get top complaints
  const categoryCount: Record<string, number> = {};
  feedback.forEach((f) => {
    if (f.complaint_category && f.complaint_category !== "Praise") {
      categoryCount[f.complaint_category] = (categoryCount[f.complaint_category] || 0) + 1;
    }
  });
  const topComplaints = Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // SLA violations
  const slaViolations = feedback.filter(
    (f) => f.resolution_status === "escalated" && f.sla_deadline && new Date(f.sla_deadline) < new Date()
  ).length;

  // Open vs resolved
  const openCount = feedback.filter((f) => f.resolution_status !== "resolved").length;
  const resolvedCount = feedback.filter((f) => f.resolution_status === "resolved").length;

  // Top praise stores
  const storePraise: Record<string, number> = {};
  feedback.filter((f) => f.priority === "Praise").forEach((f) => {
    storePraise[f.store_number] = (storePraise[f.store_number] || 0) + 1;
  });

  // Get store names
  const { data: stores } = await supabase.from("stores").select("store_number, store_name");
  const storeMap: Record<string, string> = {};
  (stores || []).forEach((s: any) => {
    storeMap[s.store_number] = s.store_name;
  });

  const topStores = Object.entries(storePraise)
    .map(([store, count]) => ({ store: `${store} - ${storeMap[store] || "Unknown"}`, praiseCount: count }))
    .sort((a, b) => b.praiseCount - a.praiseCount)
    .slice(0, 5);

  // Critical stores
  const storeCritical: Record<string, number> = {};
  feedback.filter((f) => f.priority === "Critical").forEach((f) => {
    storeCritical[f.store_number] = (storeCritical[f.store_number] || 0) + 1;
  });

  const criticalStores = Object.entries(storeCritical)
    .map(([store, count]) => ({ store: `${store} - ${storeMap[store] || "Unknown"}`, criticalCount: count }))
    .sort((a, b) => b.criticalCount - a.criticalCount)
    .slice(0, 5);

  return {
    totalNew: feedback.length,
    critical,
    high,
    medium,
    low,
    praise,
    accuracy: {
      missingItems,
      sandwichMadeWrong,
      total: missingItems + sandwichMadeWrong,
    },
    topComplaints,
    slaViolations,
    openCount,
    resolvedCount,
    avgResponseTime: 0, // Can calculate if needed
    topStores,
    criticalStores,
  };
}

async function generateRegionalSummary(
  feedback: any[],
  markets: string[],
  directorName: string,
  supabase: any
): Promise<RegionalSummary> {
  // Filter feedback for director's markets
  const regionalFeedback = feedback.filter((f) => markets.includes(f.market));

  const baseSummary = await generateCompanySummary(regionalFeedback, supabase);

  // Get stores in this region
  const { data: stores } = await supabase
    .from("stores")
    .select("store_number, store_name")
    .in("region", markets);

  const storeBreakdown = (stores || []).map((store: any) => {
    const storeFeedback = regionalFeedback.filter((f) => f.store_number === store.store_number);
    return {
      storeNumber: store.store_number,
      storeName: store.store_name,
      critical: storeFeedback.filter((f) => f.priority === "Critical").length,
      high: storeFeedback.filter((f) => f.priority === "High").length,
      praise: storeFeedback.filter((f) => f.priority === "Praise").length,
      accuracy: storeFeedback.filter(
        (f) => f.complaint_category === "Missing item" || f.complaint_category === "Sandwich Made Wrong"
      ).length,
    };
  });

  return {
    ...baseSummary,
    region: markets.join(", "),
    director: directorName,
    storeBreakdown: storeBreakdown.filter((s) => s.critical > 0 || s.high > 0 || s.praise > 0 || s.accuracy > 0),
  };
}

function buildCompanyEmail(summary: FeedbackSummary, recipientName: string, date: Date): string {
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily Feedback Summary</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h1 style="margin: 0 0 10px 0;">📊 Company-Wide Daily Summary</h1>
        <p style="margin: 0; opacity: 0.9;">${dateStr}</p>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Hello ${recipientName},</p>
      </div>

      ${summary.critical > 0 ? `
        <div style="background: #fee; border-left: 4px solid #d00; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #d00;">🚨 Critical Alerts</h3>
          <p style="margin: 0;"><strong>${summary.critical}</strong> critical issues require immediate attention</p>
          ${summary.slaViolations > 0 ? `<p style="margin: 5px 0 0 0; color: #d00;"><strong>${summary.slaViolations}</strong> SLA violations detected</p>` : ''}
        </div>
      ` : ''}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #667eea;">${summary.totalNew}</div>
          <div style="color: #666; margin-top: 5px;">Total Feedback</div>
        </div>
        <div style="background: #fff4e6; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #ff9800;">${summary.critical}</div>
          <div style="color: #666; margin-top: 5px;">Critical</div>
        </div>
        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #4caf50;">${summary.praise}</div>
          <div style="color: #666; margin-top: 5px;">Praise</div>
        </div>
        <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #9c27b0;">${summary.accuracy.total}</div>
          <div style="color: #666; margin-top: 5px;">Accuracy Issues</div>
        </div>
      </div>

      <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #667eea;">🎯 Accuracy Breakdown</h3>
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Missing Items:</span>
            <strong>${summary.accuracy.missingItems}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Sandwich Made Wrong:</span>
            <strong>${summary.accuracy.sandwichMadeWrong}</strong>
          </div>
        </div>
      </div>

      ${summary.topComplaints.length > 0 ? `
        <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #667eea;">📈 Top Complaint Categories</h3>
          ${summary.topComplaints.map(c => `
            <div style="margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>${c.category}</span>
                <strong>${c.count}</strong>
              </div>
              <div style="background: #e0e0e0; height: 6px; border-radius: 3px;">
                <div style="background: #667eea; height: 6px; border-radius: 3px; width: ${Math.min(100, (c.count / summary.totalNew) * 100)}%;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${summary.topStores.length > 0 ? `
        <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #4caf50;">🏆 Top Performing Stores (Praise)</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${summary.topStores.map(s => `
              <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                <span>${s.store}</span>
                <strong style="float: right; color: #4caf50;">${s.praiseCount} ⭐</strong>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      ${summary.criticalStores.length > 0 ? `
        <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #d00;">⚠️ Stores Needing Attention (Critical Issues)</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${summary.criticalStores.map(s => `
              <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                <span>${s.store}</span>
                <strong style="float: right; color: #d00;">${s.criticalCount} 🚨</strong>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0;">📊 Resolution Status</h3>
        <div style="display: flex; justify-content: space-around;">
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #ff9800;">${summary.openCount}</div>
            <div style="color: #666;">Open</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #4caf50;">${summary.resolvedCount}</div>
            <div style="color: #666;">Resolved</div>
          </div>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #666; border-top: 1px solid #e0e0e0;">
        <p>View the full dashboard: <a href="https://your-app-url.com/executive-oversight" style="color: #667eea; text-decoration: none;">Executive Dashboard</a></p>
        <p style="font-size: 12px; margin-top: 10px;">This is an automated daily summary from your Atlas Feedback Management System</p>
      </div>
    </body>
    </html>
  `;
}

function buildRegionalEmail(summary: RegionalSummary, recipientName: string, date: Date): string {
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Regional Daily Summary</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h1 style="margin: 0 0 10px 0;">📍 Regional Daily Summary</h1>
        <p style="margin: 0; opacity: 0.9;">${summary.region}</p>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">${dateStr}</p>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Hello ${recipientName},</p>
      </div>

      ${summary.critical > 0 ? `
        <div style="background: #fee; border-left: 4px solid #d00; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #d00;">🚨 Critical Alerts in Your Region</h3>
          <p style="margin: 0;"><strong>${summary.critical}</strong> critical issues require immediate attention</p>
        </div>
      ` : ''}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #11998e;">${summary.totalNew}</div>
          <div style="color: #666; margin-top: 5px;">Total Feedback</div>
        </div>
        <div style="background: #fff4e6; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #ff9800;">${summary.critical}</div>
          <div style="color: #666; margin-top: 5px;">Critical</div>
        </div>
        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #4caf50;">${summary.praise}</div>
          <div style="color: #666; margin-top: 5px;">Praise</div>
        </div>
        <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #9c27b0;">${summary.accuracy.total}</div>
          <div style="color: #666; margin-top: 5px;">Accuracy Issues</div>
        </div>
      </div>

      ${summary.storeBreakdown.length > 0 ? `
        <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #11998e;">🏪 Store-by-Store Breakdown</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">
                <th style="padding: 10px; text-align: left;">Store</th>
                <th style="padding: 10px; text-align: center;">Critical</th>
                <th style="padding: 10px; text-align: center;">High</th>
                <th style="padding: 10px; text-align: center;">Praise</th>
                <th style="padding: 10px; text-align: center;">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              ${summary.storeBreakdown.map(store => `
                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px;">${store.storeNumber} - ${store.storeName}</td>
                  <td style="padding: 10px; text-align: center; color: ${store.critical > 0 ? '#d00' : '#666'};">
                    <strong>${store.critical}</strong>
                  </td>
                  <td style="padding: 10px; text-align: center; color: ${store.high > 0 ? '#ff9800' : '#666'};">
                    ${store.high}
                  </td>
                  <td style="padding: 10px; text-align: center; color: ${store.praise > 0 ? '#4caf50' : '#666'};">
                    ${store.praise}
                  </td>
                  <td style="padding: 10px; text-align: center; color: ${store.accuracy > 0 ? '#9c27b0' : '#666'};">
                    ${store.accuracy}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0;">🎯 Regional Accuracy Focus</h3>
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Missing Items:</span>
            <strong>${summary.accuracy.missingItems}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Sandwich Made Wrong:</span>
            <strong>${summary.accuracy.sandwichMadeWrong}</strong>
          </div>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #666; border-top: 1px solid #e0e0e0;">
        <p>View the full dashboard: <a href="https://your-app-url.com/executive-oversight" style="color: #11998e; text-decoration: none;">Executive Dashboard</a></p>
        <p style="font-size: 12px; margin-top: 10px;">This is an automated daily summary from your Atlas Feedback Management System</p>
      </div>
    </body>
    </html>
  `;
}
