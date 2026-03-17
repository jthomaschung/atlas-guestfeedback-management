import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { refundRequestId, recipientEmails, receiptUrl } = await req.json()

    if (!refundRequestId || !recipientEmails?.length) {
      throw new Error('Missing required fields: refundRequestId, recipientEmails')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get refund request details
    const { data: refund, error: refundError } = await supabase
      .from('refund_requests')
      .select('*')
      .eq('id', refundRequestId)
      .single()

    if (refundError || !refund) throw new Error('Refund request not found')

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
    if (!SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY not configured')

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a2e; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">Refund Receipt</h1>
        </div>
        <div style="padding: 24px; background: #fff; border: 1px solid #e5e7eb;">
          <p>Hello,</p>
          <p>A refund has been processed for the following case:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Case #</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${refund.case_number || 'N/A'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Customer</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${refund.customer_name || 'N/A'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Store</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">#${refund.store_number || 'N/A'} (${refund.market || ''})</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Amount</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">$${Number(refund.refund_amount).toFixed(2)}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Method</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${refund.refund_method}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Reason</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${refund.refund_reason}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Status</td><td style="padding: 8px;">${refund.status}</td></tr>
          </table>
          ${receiptUrl ? `<p><strong>Refund Receipt:</strong></p><p><a href="${receiptUrl}" style="color: #2563eb;">View Receipt Image</a></p>` : ''}
          ${refund.notes ? `<p><strong>Notes:</strong> ${refund.notes}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">This is an automated notification from the Atlas Guest Feedback system.</p>
        </div>
      </div>
    `

    const results = []
    for (const email of recipientEmails) {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: 'guest.feedback@atlaswe.com', name: 'Atlas Guest Feedback' },
          subject: `Refund Receipt — Case #${refund.case_number || refundRequestId.slice(0, 8)} — $${Number(refund.refund_amount).toFixed(2)}`,
          content: [{ type: 'text/html', value: emailContent }],
        }),
      })
      results.push({ email, status: res.status, ok: res.ok })
      console.log(`Email to ${email}: ${res.status}`)
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
