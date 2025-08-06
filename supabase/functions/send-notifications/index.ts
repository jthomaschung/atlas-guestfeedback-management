import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'completion' | 'note_tagged' | 'critical_creation';
  workOrderId: string;
  taggedUserId?: string;
  taggedDisplayName?: string;
  note?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Send notifications function called with method:', req.method);
  
  // Check if Resend API key is configured
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  console.log('Resend API key configured:', !!resendApiKey);
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured');
    return new Response(
      JSON.stringify({ error: 'Email service not configured' }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { type, workOrderId, taggedUserId, taggedDisplayName, note }: NotificationRequest = await req.json();
    console.log('Notification request:', { type, workOrderId, taggedUserId, taggedDisplayName });

    // Get work order details
    const { data: workOrder, error: woError } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', workOrderId)
      .single();

    if (woError || !workOrder) {
      console.error('Error fetching work order:', woError);
      return new Response(
        JSON.stringify({ error: 'Work order not found' }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get creator profile
    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', workOrder.user_id)
      .single();

    let recipients: string[] = [];

    if (type === 'completion') {
      // Get hierarchy for completion notifications
      const { data: hierarchy } = await supabase
        .from('user_hierarchy')
        .select(`
          *,
          manager:profiles!user_hierarchy_manager_id_fkey(email, first_name, last_name)
        `)
        .eq('user_id', workOrder.user_id);

      // Add creator to recipients
      if (creatorProfile?.email) {
        recipients.push(creatorProfile.email);
      }

      // Add manager chain to recipients
      if (hierarchy && hierarchy.length > 0) {
        let currentManagerId = hierarchy[0].manager_id;
        while (currentManagerId) {
          const { data: manager } = await supabase
            .from('profiles')
            .select('email, user_id')
            .eq('user_id', currentManagerId)
            .single();

          if (manager?.email) {
            recipients.push(manager.email);
            
            // Get next level manager
            const { data: nextLevel } = await supabase
              .from('user_hierarchy')
              .select('manager_id')
              .eq('user_id', currentManagerId)
              .single();
            
            currentManagerId = nextLevel?.manager_id || null;
          } else {
            break;
          }
        }
      }

      // Send completion notification emails
      for (const email of recipients) {
        try {
          const emailResult = await resend.emails.send({
            from: "Work Orders <workorders@atlasfacilities.co>",
            to: [email],
            subject: `Work Order Completed - Store ${workOrder.store_number} - ${workOrder.description}`,
            html: `
            <h2>Work Order Completed</h2>
            <p><strong>Work Order ID:</strong> ${workOrder.id.slice(0, 8)}</p>
            <p><strong>Store Number:</strong> ${workOrder.store_number}</p>
            <p><strong>Market:</strong> ${workOrder.market}</p>
            <p><strong>Repair Type:</strong> ${workOrder.repair_type}</p>
            <p><strong>Priority:</strong> ${workOrder.priority}</p>
            <p><strong>EcoSure Level:</strong> ${workOrder.ecosure}</p>
            <p><strong>Status:</strong> ${workOrder.status}</p>
            <p><strong>Description:</strong> ${workOrder.description}</p>
            <p><strong>Assignee:</strong> ${workOrder.assignee || 'Not assigned'}</p>
            <p><strong>Created Date:</strong> ${new Date(workOrder.created_at).toLocaleDateString()}</p>
            <p><strong>Completed Date:</strong> ${workOrder.completed_at ? new Date(workOrder.completed_at).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Created by:</strong> ${creatorProfile?.first_name} ${creatorProfile?.last_name} (${creatorProfile?.email})</p>
            ${workOrder.image_url ? `<p><strong>Image:</strong> <a href="${workOrder.image_url}">View Image</a></p>` : ''}
            ${workOrder.notes && workOrder.notes.length > 0 ? `<p><strong>Notes:</strong><br>${workOrder.notes.join('<br>')}</p>` : ''}
            <br>
            <p>This work order has been marked as completed.</p>
            `,
          });

          console.log('Completion email sent successfully:', { email, emailResult });

          // Log notification
          await supabase.from('notification_log').insert({
            recipient_email: email,
            notification_type: 'completion',
            work_order_id: workOrderId,
            status: 'sent'
          });
        } catch (emailError) {
          console.error('Failed to send completion email:', { email, error: emailError });
          
          // Log failed notification
          await supabase.from('notification_log').insert({
            recipient_email: email,
            notification_type: 'completion',
            work_order_id: workOrderId,
            status: 'failed'
          });
        }
      }

    } else if (type === 'note_tagged') {
      let taggedProfile = null;
      
      console.log('Looking up tagged user:', { taggedDisplayName, taggedUserId });
      
      // If we have a display name, look up the user by display name
      if (taggedDisplayName) {
        console.log('Searching by display name:', taggedDisplayName);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('display_name', taggedDisplayName)
          .single();
        
        console.log('Display name lookup result:', { data, error });
        taggedProfile = data;
      }
      // Fallback to taggedUserId if no display name provided
      else if (taggedUserId) {
        console.log('Searching by user ID:', taggedUserId);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', taggedUserId)
          .single();
        
        console.log('User ID lookup result:', { data, error });
        taggedProfile = data;
      }

      console.log('Tagged profile lookup completed:', { taggedDisplayName, taggedUserId, found: !!taggedProfile });

      if (taggedProfile?.email) {
        console.log('Tagged profile found with email:', taggedProfile.email);
        
        // Check if user wants to receive tagged notifications
        const { data: notificationPrefs, error: prefsError } = await supabase
          .from('notification_preferences')
          .select('email_on_tagged')
          .eq('user_id', taggedProfile.user_id)
          .maybeSingle();

        console.log('Notification preferences lookup:', { notificationPrefs, prefsError });

        // Send notification if user has no preferences (default) or has opted in
        const shouldSendEmail = !notificationPrefs || notificationPrefs.email_on_tagged;
        console.log('Should send email decision:', { shouldSendEmail, hasPrefs: !!notificationPrefs, emailOnTagged: notificationPrefs?.email_on_tagged });
        
        if (shouldSendEmail) {
          console.log('Sending tagged notification to:', taggedProfile.email);
          recipients.push(taggedProfile.email);
          
          try {
            console.log('About to send email via Resend...');
            const emailResult = await resend.emails.send({
              from: "Work Orders <workorders@atlasfacilities.co>",
              to: [taggedProfile.email],
              subject: `You've Been Tagged - Store ${workOrder.store_number} - ${workOrder.repair_type}`,
              html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: hsl(0, 0%, 98%); padding: 20px;">
                <div style="background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <div style="background: linear-gradient(135deg, hsl(0, 85%, 45%), hsl(210, 15%, 12%)); color: white; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: bold;">🏷️ You've Been Tagged</h2>
                    <p style="margin: 8px 0 0 0; opacity: 0.9;">in a Work Order Note</p>
                  </div>
                  
                  <div style="background-color: hsl(210, 10%, 95%); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; color: hsl(210, 15%, 12%); font-size: 18px;">Work Order Details</h3>
                    <div style="display: grid; gap: 8px;">
                      <div><strong style="color: hsl(210, 10%, 45%);">Store Number:</strong> <span style="color: hsl(210, 15%, 12%);">${workOrder.store_number}</span></div>
                      <div><strong style="color: hsl(210, 10%, 45%);">Market:</strong> <span style="color: hsl(210, 15%, 12%);">${workOrder.market}</span></div>
                      <div><strong style="color: hsl(210, 10%, 45%);">Repair Type:</strong> <span style="color: hsl(210, 15%, 12%);">${workOrder.repair_type}</span></div>
                      <div><strong style="color: hsl(210, 10%, 45%);">Priority:</strong> <span style="background-color: ${workOrder.priority === 'Critical' ? 'hsl(0, 84%, 60%)' : workOrder.priority === 'High' ? 'hsl(25, 95%, 53%)' : workOrder.priority === 'Medium' ? 'hsl(38, 92%, 50%)' : 'hsl(210, 100%, 56%)'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${workOrder.priority}</span></div>
                      <div><strong style="color: hsl(210, 10%, 45%);">Status:</strong> <span style="color: hsl(210, 15%, 12%);">${workOrder.status}</span></div>
                      <div><strong style="color: hsl(210, 10%, 45%);">Description:</strong> <span style="color: hsl(210, 15%, 12%);">${workOrder.description}</span></div>
                      <div><strong style="color: hsl(210, 10%, 45%);">Assignee:</strong> <span style="color: hsl(210, 15%, 12%);">${workOrder.assignee || 'Not assigned'}</span></div>
                      <div><strong style="color: hsl(210, 10%, 45%);">Created Date:</strong> <span style="color: hsl(210, 15%, 12%);">${new Date(workOrder.created_at).toLocaleDateString()}</span></div>
                      ${workOrder.image_url ? `<div><strong style="color: hsl(210, 10%, 45%);">Image:</strong> <a href="${workOrder.image_url}" style="color: hsl(0, 85%, 45%); text-decoration: underline;">View Image</a></div>` : ''}
                    </div>
                  </div>
                  
                  ${workOrder.notes && workOrder.notes.length > 0 ? `
                  <div style="background-color: hsl(0, 0%, 98%); border-left: 4px solid hsl(0, 85%, 45%); padding: 15px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
                    <strong style="color: hsl(210, 10%, 45%);">Previous Notes:</strong>
                    <div style="margin-top: 8px; color: hsl(210, 10%, 45%); font-style: italic;">${workOrder.notes.join('<br>')}</div>
                  </div>
                  ` : ''}
                  
                  <div style="background: linear-gradient(135deg, hsl(0, 85%, 45%), hsl(210, 15%, 20%)); color: white; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <strong style="font-size: 16px;">📝 New Note:</strong>
                    <div style="margin-top: 8px; background-color: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 6px; font-size: 15px;">${note}</div>
                  </div>
                  
                  <div style="border-top: 2px solid hsl(210, 10%, 88%); padding-top: 20px; text-align: center;">
                    <div style="background-color: hsl(38, 92%, 50%); border: 1px solid hsl(38, 92%, 50%); color: white; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
                      <strong>⚠️ Please don't reply to this email</strong><br>
                      <span style="font-size: 14px;">Respond back on the Facilities Management Portal</span>
                    </div>
                    <p style="color: hsl(210, 10%, 45%); font-size: 12px; margin: 0;">This is an automated notification from the Facilities Management System</p>
                  </div>
                </div>
              </div>
            `,
            });

            console.log('Resend API response:', emailResult);

            if (emailResult.error) {
              console.error('Resend API returned error:', emailResult.error);
              throw emailResult.error;
            }

            console.log('Tagged email sent successfully:', { email: taggedProfile.email, emailResult });

            // Log notification
            await supabase.from('notification_log').insert({
              recipient_email: taggedProfile.email,
              notification_type: 'note_tagged',
              work_order_id: workOrderId,
              status: 'sent'
            });
            
            console.log('Tagged notification logged successfully');
          } catch (emailError) {
            console.error('Failed to send tagged email:', { email: taggedProfile.email, error: emailError, errorMessage: emailError?.message, errorStack: emailError?.stack });
            
            // Log failed notification
            await supabase.from('notification_log').insert({
              recipient_email: taggedProfile.email,
              notification_type: 'note_tagged',
              work_order_id: workOrderId,
              status: 'failed'
            });
          }
        } else {
          console.log('User has opted out of tagged notifications');
        }
      } else {
        console.log('No tagged profile or email found:', { taggedProfile });
      }
    
    } else if (type === 'critical_creation') {
      // Check if this is a critical ticket in NE markets for Grant Gelecki
      const criticalMarkets = ['NE1', 'NE2', 'NE3', 'NE4'];
      const grantEmail = 'grant.gelecki@atlaswe.com';
      
      console.log('Checking critical creation conditions:', {
        market: workOrder.market,
        priority: workOrder.priority,
        isCriticalMarket: criticalMarkets.includes(workOrder.market),
        isCriticalPriority: workOrder.priority === 'Critical'
      });
      
      if (workOrder.priority === 'Critical' && criticalMarkets.includes(workOrder.market)) {
        console.log('Sending critical notification to Grant Gelecki:', grantEmail);
        
        try {
          const emailResult = await resend.emails.send({
            from: "Critical Work Orders <workorders@atlasfacilities.co>",
            to: [grantEmail],
            subject: `🚨 CRITICAL WORK ORDER - ${workOrder.market} Store ${workOrder.store_number} - ${workOrder.repair_type}`,
            html: `
            <div style="background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; font-family: Arial, sans-serif;">
              <h2 style="color: #dc2626; margin-top: 0;">🚨 CRITICAL WORK ORDER ALERT</h2>
              <p style="color: #dc2626; font-weight: bold; font-size: 16px;">A critical priority work order has been submitted in your NE region and requires immediate attention.</p>
              
              <div style="background-color: white; border-radius: 6px; padding: 15px; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #1f2937;">Work Order Details</h3>
                <p><strong>Work Order ID:</strong> ${workOrder.id.slice(0, 8)}</p>
                <p><strong>Store Number:</strong> ${workOrder.store_number}</p>
                <p><strong>Market:</strong> <span style="background-color: #dc2626; color: white; padding: 2px 8px; border-radius: 4px;">${workOrder.market}</span></p>
                <p><strong>Repair Type:</strong> ${workOrder.repair_type}</p>
                <p><strong>Priority:</strong> <span style="background-color: #dc2626; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;">CRITICAL</span></p>
                <p><strong>EcoSure Level:</strong> ${workOrder.ecosure}</p>
                <p><strong>Status:</strong> ${workOrder.status}</p>
                <p><strong>Description:</strong> ${workOrder.description}</p>
                <p><strong>Assignee:</strong> ${workOrder.assignee || 'Not assigned'}</p>
                <p><strong>Created Date:</strong> ${new Date(workOrder.created_at).toLocaleDateString()} at ${new Date(workOrder.created_at).toLocaleTimeString()}</p>
                <p><strong>Created by:</strong> ${creatorProfile?.first_name} ${creatorProfile?.last_name} (${creatorProfile?.email})</p>
                ${workOrder.image_url ? `<p><strong>Image:</strong> <a href="${workOrder.image_url}" style="color: #dc2626;">View Image</a></p>` : ''}
              </div>
              
              <div style="background-color: #fef9c3; border: 1px solid #f59e0b; border-radius: 6px; padding: 10px; margin: 15px 0;">
                <p style="margin: 0; color: #92400e;"><strong>⚠️ Action Required:</strong> This critical work order requires immediate review and assignment.</p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">This is an automated notification for critical work orders in NE1, NE2, NE3, and NE4 markets.</p>
            </div>
          `,
          });

          console.log('Critical email sent successfully:', { email: grantEmail, emailResult });

          // Log notification
          await supabase.from('notification_log').insert({
            recipient_email: grantEmail,
            notification_type: 'critical_creation',
            work_order_id: workOrderId,
            status: 'sent'
          });
          
          recipients.push(grantEmail);
          console.log('Critical notification sent successfully to Grant Gelecki');
        } catch (emailError) {
          console.error('Failed to send critical email:', { email: grantEmail, error: emailError });
          
          // Log failed notification
          await supabase.from('notification_log').insert({
            recipient_email: grantEmail,
            notification_type: 'critical_creation',
            work_order_id: workOrderId,
            status: 'failed'
          });
        }
      } else {
        console.log('Work order does not meet critical NE market criteria');
      }
    }

    console.log(`Sent ${type} notifications for work order ${workOrderId}`);

    return new Response(
      JSON.stringify({ success: true, recipients: recipients.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-notifications function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);