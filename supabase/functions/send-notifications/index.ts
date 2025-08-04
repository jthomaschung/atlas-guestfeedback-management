import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'completion' | 'note_tagged';
  workOrderId: string;
  taggedUserId?: string;
  note?: string;
}

const handler = async (req: Request): Promise<Response> => {
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

    const { type, workOrderId, taggedUserId, note }: NotificationRequest = await req.json();

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
        await resend.emails.send({
          from: "Work Orders <notifications@resend.dev>",
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

        // Log notification
        await supabase.from('notification_log').insert({
          recipient_email: email,
          notification_type: 'completion',
          work_order_id: workOrderId,
          status: 'sent'
        });
      }

    } else if (type === 'note_tagged' && taggedUserId) {
      // Get tagged user profile
      const { data: taggedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', taggedUserId)
        .single();

      if (taggedProfile?.email) {
        await resend.emails.send({
          from: "Work Orders <notifications@resend.dev>",
          to: [taggedProfile.email],
          subject: `You've Been Tagged - Store ${workOrder.store_number} - ${workOrder.repair_type}`,
          html: `
            <h2>You've Been Tagged in a Work Order Note</h2>
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
            <p><strong>Created by:</strong> ${creatorProfile?.first_name} ${creatorProfile?.last_name} (${creatorProfile?.email})</p>
            ${workOrder.image_url ? `<p><strong>Image:</strong> <a href="${workOrder.image_url}">View Image</a></p>` : ''}
            ${workOrder.notes && workOrder.notes.length > 0 ? `<p><strong>Previous Notes:</strong><br>${workOrder.notes.join('<br>')}</p>` : ''}
            <br>
            <p><strong>New Note:</strong> ${note}</p>
            <br>
            <p>Tagged by: ${creatorProfile?.first_name} ${creatorProfile?.last_name} (${creatorProfile?.email})</p>
          `,
        });

        // Log notification
        await supabase.from('notification_log').insert({
          recipient_email: taggedProfile.email,
          notification_type: 'note_tagged',
          work_order_id: workOrderId,
          status: 'sent'
        });
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