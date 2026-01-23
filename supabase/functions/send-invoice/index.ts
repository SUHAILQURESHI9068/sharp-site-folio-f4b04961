import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HTML escape function to prevent XSS
const escapeHtml = (unsafe: string): string => {
  if (typeof unsafe !== 'string') return String(unsafe || '');
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Validation schemas
const InvoiceItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().positive().max(10000),
  rate: z.number().nonnegative().max(100000000),
  amount: z.number().nonnegative().max(100000000),
});

const InvoiceDataSchema = z.object({
  invoice_number: z.string().min(1).max(50),
  client_name: z.string().min(1).max(200),
  client_email: z.string().email().max(255),
  client_phone: z.string().max(20).optional(),
  client_address: z.string().max(500).optional(),
  items: z.array(InvoiceItemSchema).min(1).max(100),
  subtotal: z.number().nonnegative().max(100000000),
  tax_rate: z.number().nonnegative().max(100),
  tax_amount: z.number().nonnegative().max(100000000),
  total: z.number().nonnegative().max(100000000),
  due_date: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
  created_at: z.string().min(1).max(50),
});

const SendInvoiceRequestSchema = z.object({
  invoice: InvoiceDataSchema,
  from_email: z.string().email().max(255).optional(),
  from_name: z.string().max(100).optional(),
});

const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const generateInvoiceHTML = (invoice: z.infer<typeof InvoiceDataSchema>) => {
  const itemsHTML = invoice.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">${escapeHtml(item.description)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right;">${formatCurrency(item.rate)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right;">${formatCurrency(item.amount)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${escapeHtml(invoice.invoice_number)}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #4F46E5; padding-bottom: 20px;">
          <div>
            <h1 style="margin: 0; font-size: 28px; color: #4F46E5;">INVOICE</h1>
            <p style="margin: 5px 0 0; color: #6B7280;">${escapeHtml(invoice.invoice_number)}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; color: #374151;"><strong>Date:</strong> ${formatDate(invoice.created_at)}</p>
            ${invoice.due_date ? `<p style="margin: 5px 0 0; color: #374151;"><strong>Due:</strong> ${formatDate(invoice.due_date)}</p>` : ''}
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="margin: 0 0 10px; color: #374151; font-size: 14px; text-transform: uppercase;">Bill To:</h3>
          <p style="margin: 0; font-weight: bold; font-size: 16px; color: #111827;">${escapeHtml(invoice.client_name)}</p>
          <p style="margin: 5px 0; color: #6B7280;">${escapeHtml(invoice.client_email)}</p>
          ${invoice.client_phone ? `<p style="margin: 5px 0; color: #6B7280;">${escapeHtml(invoice.client_phone)}</p>` : ''}
          ${invoice.client_address ? `<p style="margin: 5px 0; color: #6B7280;">${escapeHtml(invoice.client_address)}</p>` : ''}
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #F3F4F6;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #E5E7EB; color: #374151;">Description</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #E5E7EB; color: #374151; width: 60px;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #E5E7EB; color: #374151; width: 100px;">Rate</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #E5E7EB; color: #374151; width: 100px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <table style="width: 250px; margin-left: auto; margin-bottom: 30px;">
          <tr>
            <td style="padding: 8px 0; color: #6B7280;">Subtotal:</td>
            <td style="padding: 8px 0; text-align: right; color: #374151;">${formatCurrency(invoice.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280;">GST (${invoice.tax_rate}%):</td>
            <td style="padding: 8px 0; text-align: right; color: #374151;">${formatCurrency(invoice.tax_amount)}</td>
          </tr>
          <tr style="font-weight: bold; font-size: 18px; background: #F3F4F6;">
            <td style="padding: 12px 8px; color: #111827;">Total:</td>
            <td style="padding: 12px 8px; text-align: right; color: #4F46E5;">${formatCurrency(invoice.total)}</td>
          </tr>
        </table>

        ${invoice.notes ? `
          <div style="background: #F9FAFB; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0 0 5px; font-weight: bold; color: #374151;">Notes:</p>
            <p style="margin: 0; color: #6B7280;">${escapeHtml(invoice.notes)}</p>
          </div>
        ` : ''}

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #9CA3AF; font-size: 12px;">
          <p>Thank you for your business!</p>
          <p>If you have any questions, please contact us.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawBody = await req.json();
    
    // Validate input
    const validatedData = SendInvoiceRequestSchema.parse(rawBody);
    const { invoice, from_email } = validatedData;

    console.log(`Sending invoice ${invoice.invoice_number} to ${invoice.client_email}`);

    const emailHTML = generateInvoiceHTML(invoice);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from_email || 'invoices@resend.dev',
        to: [invoice.client_email],
        subject: `Invoice ${escapeHtml(invoice.invoice_number)} - ${formatCurrency(invoice.total)}`,
        html: emailHTML,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      return new Response(
        JSON.stringify({ error: result.message || 'Failed to send email' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Invoice email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, message: 'Invoice sent successfully', id: result.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error sending invoice:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input data', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});