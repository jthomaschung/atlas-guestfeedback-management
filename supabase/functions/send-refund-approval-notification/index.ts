import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  refundRequestId: string;
  notificationType: "new_refund" | "dm_approved" | "director_needed" | "catering_needed" | "custom_email";
  approverName?: string;
  customEmail?: {
    to: string;
    subject: string;
    body: string;
  };
}

const CATERING_EMAILS = [
  "mgabriel@atlaswe.com",
  "atambunan@atlaswe.com",
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { refundRequestId, notificationType, approverName }: NotificationRequest =
      await req.json();

    if (!refundRequestId || !notificationType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!sendGridApiKey || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch refund request
    const { data: refund, error: refundError } = await supabase
      .from("refund_requests")
      .select("*")
      .eq("id", refundRequestId)
      .single();

    if (refundError || !refund) {
      console.error("Refund not found:", refundError);
      return new Response(
        JSON.stringify({ error: "Refund request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine recipients based on notification type
    const recipients: { email: string; role: string }[] = [];

    if (notificationType === "new_refund") {
      // Find DM for this market
      const dmEmail = await findDmEmailForMarket(supabase, refund.market);
      if (dmEmail) {
        recipients.push({ email: dmEmail, role: "DM" });
      }
    } else if (notificationType === "director_needed") {
      // Find Director for this market via user_hierarchy
      const directorEmail = await findDirectorEmailForMarket(supabase, refund.market);
      if (directorEmail) {
        recipients.push({ email: directorEmail, role: "Director" });
      }
    } else if (notificationType === "catering_needed") {
      // Notify fixed catering approvers + market director
      for (const email of CATERING_EMAILS) {
        recipients.push({ email, role: "Catering" });
      }
      const directorEmail = await findDirectorEmailForMarket(supabase, refund.market);
      if (directorEmail) {
        recipients.push({ email: directorEmail, role: "Director" });
      }
    }

    if (recipients.length === 0) {
      console.warn("No recipients found for notification type:", notificationType);
      return new Response(
        JSON.stringify({ success: true, message: "No recipients found", recipients: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build email content
    const actionLabel =
      notificationType === "new_refund"
        ? "A new refund request needs your DM approval."
        : notificationType === "director_needed"
        ? `A refund over $25 has been DM-approved${approverName ? ` by ${approverName}` : ""} and requires your Director approval.`
        : `A catering refund has been submitted and requires your approval.`;

    const subject = `Refund Approval Required — Case #${refund.case_number || "N/A"} — $${Number(refund.refund_amount).toFixed(2)}`;

    const htmlContent = buildEmailHtml(refund, actionLabel);

    // Send emails
    const results = await Promise.allSettled(
      recipients.map((r) =>
        fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sendGridApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [
              { to: [{ email: r.email }], subject: `${subject} (${r.role})` },
            ],
            from: {
              email: "guest.feedback@atlaswe.com",
              name: "Guest Feedback System",
            },
            content: [{ type: "text/html", value: htmlContent }],
          }),
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(
      `Refund approval notifications sent: ${sent} succeeded, ${failed} failed. Recipients: ${recipients.map((r) => `${r.email} (${r.role})`).join(", ")}`
    );

    return new Response(
      JSON.stringify({ success: true, sent, failed, recipients }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-refund-approval-notification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send notification", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Find DM email by looking up user_permissions for users assigned to this market
async function findDmEmailForMarket(
  supabase: any,
  market: string | null
): Promise<string | null> {
  if (!market) return null;
  try {
    const normalizedMarket = market.replace(/\s+/g, "").toUpperCase();

    const { data: permissionRows } = await supabase
      .from("user_permissions")
      .select("user_id, markets")
      .not("markets", "is", null);

    if (!permissionRows?.length) return null;

    const matchingUserIds = permissionRows
      .filter(
        (row: any) =>
          Array.isArray(row.markets) &&
          row.markets.some(
            (v: string) =>
              typeof v === "string" &&
              v.replace(/\s+/g, "").toUpperCase() === normalizedMarket
          )
      )
      .map((row: any) => row.user_id)
      .filter((id: any) => typeof id === "string");

    if (!matchingUserIds.length) return null;

    // Find the DM role user among those with market permission
    const { data: hierarchyRows } = await supabase
      .from("user_hierarchy")
      .select("user_id, role")
      .in("user_id", matchingUserIds)
      .eq("role", "dm");

    const dmUserId = hierarchyRows?.[0]?.user_id;

    if (dmUserId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("user_id", dmUserId)
        .maybeSingle();
      if (profile?.email) return profile.email;
    }

    // Fallback: just get the first user with market permission
    const { data: profiles } = await supabase
      .from("profiles")
      .select("email")
      .in("user_id", matchingUserIds)
      .not("email", "is", null)
      .limit(1);

    return profiles?.[0]?.email || null;
  } catch (error) {
    console.error("Error finding DM email:", error);
    return null;
  }
}

// Find Director email by looking up user_hierarchy for director role in the market
async function findDirectorEmailForMarket(
  supabase: any,
  market: string | null
): Promise<string | null> {
  if (!market) return null;
  try {
    const normalizedMarket = market.replace(/\s+/g, "").toUpperCase();

    // Get users with market permission
    const { data: permissionRows } = await supabase
      .from("user_permissions")
      .select("user_id, markets")
      .not("markets", "is", null);

    if (!permissionRows?.length) return null;

    const matchingUserIds = permissionRows
      .filter(
        (row: any) =>
          Array.isArray(row.markets) &&
          row.markets.some(
            (v: string) =>
              typeof v === "string" &&
              v.replace(/\s+/g, "").toUpperCase() === normalizedMarket
          )
      )
      .map((row: any) => row.user_id)
      .filter((id: any) => typeof id === "string");

    if (!matchingUserIds.length) return null;

    // Find users with director_id set — get the director
    const { data: hierarchyRows } = await supabase
      .from("user_hierarchy")
      .select("director_id")
      .in("user_id", matchingUserIds)
      .not("director_id", "is", null)
      .limit(1);

    const directorId = hierarchyRows?.[0]?.director_id;
    if (!directorId) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("user_id", directorId)
      .maybeSingle();

    return profile?.email || null;
  } catch (error) {
    console.error("Error finding Director email:", error);
    return null;
  }
}

function buildEmailHtml(refund: any, actionLabel: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
          <h1 style="color: #92400e; margin: 0 0 8px 0; font-size: 20px;">⚠️ Refund Approval Required</h1>
          <p style="margin: 0; color: #78350f; font-size: 15px;">${actionLabel}</p>
        </div>

        <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0; font-size: 16px;">Refund Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; font-weight: bold; width: 130px;">Case #:</td><td>${refund.case_number || "N/A"}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Amount:</td><td style="font-size: 18px; font-weight: bold; color: #dc2626;">$${Number(refund.refund_amount).toFixed(2)}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Store:</td><td>#${refund.store_number || "N/A"} ${refund.market ? `(${refund.market})` : ""}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Customer:</td><td>${refund.customer_name || "N/A"}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Reason:</td><td>${refund.refund_reason || "N/A"}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">Method:</td><td>${refund.refund_method || "N/A"}</td></tr>
            ${refund.notes ? `<tr><td style="padding: 6px 0; font-weight: bold;">Notes:</td><td>${refund.notes}</td></tr>` : ""}
          </table>
        </div>

        <div style="background-color: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 16px;">
          <p style="margin: 0; font-size: 14px;">
            <strong>Action Required:</strong> Please log in to the
            <a href="https://guestfeedback.lovable.app" style="color: #2563eb;">Guest Feedback Management</a>
            system and navigate to <strong>Refund Processing</strong> to review and approve or deny this request.
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
          <p>This is an automated notification from the Guest Feedback Management System.</p>
        </div>
      </body>
    </html>
  `;
}
