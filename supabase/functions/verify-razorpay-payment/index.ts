import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const PaymentVerificationSchema = z.object({
  razorpay_order_id: z.string().min(1).max(100).regex(/^order_[a-zA-Z0-9]+$/, 'Invalid order ID format'),
  razorpay_payment_id: z.string().min(1).max(100).regex(/^pay_[a-zA-Z0-9]+$/, 'Invalid payment ID format'),
  razorpay_signature: z.string().min(1).max(200).regex(/^[a-f0-9]+$/, 'Invalid signature format'),
  invoice_id: z.string().uuid('Invalid invoice ID format'),
});

// HMAC SHA256 signature verification
async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const message = `${orderId}|${paymentId}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const expectedSignature = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return expectedSignature === signature;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay secret not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    const rawBody = await req.json();
    
    // Validate input
    const validatedData = PaymentVerificationSchema.parse(rawBody);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoice_id } = validatedData;

    console.log(`Verifying payment for invoice: ${invoice_id}, payment: ${razorpay_payment_id}`);

    // Verify signature
    const isValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      console.error('Invalid payment signature');
      throw new Error('Payment verification failed - invalid signature');
    }

    console.log('Payment signature verified successfully');

    // Update invoice status to paid
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ 
        status: 'paid', 
        paid_date: new Date().toISOString().split('T')[0],
        notes: `Payment received via Razorpay. Payment ID: ${razorpay_payment_id}`
      })
      .eq('id', invoice_id);

    if (updateError) {
      console.error('Error updating invoice:', updateError);
      throw new Error('Failed to update invoice status');
    }

    console.log('Invoice marked as paid:', invoice_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment verified and invoice updated',
        payment_id: razorpay_payment_id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error('Error verifying payment:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid input', details: error.errors }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});