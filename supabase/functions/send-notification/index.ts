import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

// Validation schemas for each notification type
const ContactDataSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  message: z.string().min(1).max(5000),
});

const MeetingDataSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  meeting_type: z.string().min(1).max(100),
  date: z.string().min(1).max(50),
  time: z.string().min(1).max(50),
});

const QuoteDataSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  project_type: z.string().min(1).max(100),
  features: z.array(z.string().max(100)).optional(),
  estimated_price: z.number().positive().max(100000000).optional(),
  message: z.string().max(5000).optional(),
});

const NewsletterDataSchema = z.object({
  email: z.string().email().max(255),
});

const PaymentDataSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  amount: z.number().positive().max(100000000),
  project_type: z.string().min(1).max(100),
  payment_id: z.string().min(1).max(100),
});

const NotificationRequestSchema = z.object({
  type: z.enum(["contact", "meeting", "quote", "newsletter", "payment"]),
  data: z.record(z.unknown()),
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate the base structure
    const { type, data } = NotificationRequestSchema.parse(rawBody);
    console.log("Received notification request:", type);

    let subject = "";
    let htmlContent = "";
    const ownerEmail = "suhailqureshi0828@gmail.com";

    switch (type) {
      case "contact": {
        const validatedData = ContactDataSchema.parse(data);
        subject = `New Contact Message from ${escapeHtml(validatedData.name)}`;
        htmlContent = `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(validatedData.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(validatedData.email)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(validatedData.message)}</p>
        `;
        break;
      }

      case "meeting": {
        const validatedData = MeetingDataSchema.parse(data);
        subject = `New Meeting Booked: ${escapeHtml(validatedData.meeting_type)}`;
        htmlContent = `
          <h2>New Meeting Booking</h2>
          <p><strong>Name:</strong> ${escapeHtml(validatedData.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(validatedData.email)}</p>
          <p><strong>Meeting Type:</strong> ${escapeHtml(validatedData.meeting_type)}</p>
          <p><strong>Date:</strong> ${escapeHtml(validatedData.date)}</p>
          <p><strong>Time:</strong> ${escapeHtml(validatedData.time)}</p>
        `;
        break;
      }

      case "quote": {
        const validatedData = QuoteDataSchema.parse(data);
        subject = `New Quote Request: ${escapeHtml(validatedData.project_type)}`;
        htmlContent = `
          <h2>New Quote Request</h2>
          <p><strong>Name:</strong> ${escapeHtml(validatedData.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(validatedData.email)}</p>
          <p><strong>Project Type:</strong> ${escapeHtml(validatedData.project_type)}</p>
          <p><strong>Features:</strong> ${validatedData.features?.map(f => escapeHtml(f)).join(", ") || "None"}</p>
          <p><strong>Estimated Price:</strong> ₹${validatedData.estimated_price?.toLocaleString() || "0"}</p>
          ${validatedData.message ? `<p><strong>Additional Details:</strong> ${escapeHtml(validatedData.message)}</p>` : ""}
        `;
        break;
      }

      case "newsletter": {
        const validatedData = NewsletterDataSchema.parse(data);
        subject = `New Newsletter Subscriber`;
        htmlContent = `
          <h2>New Newsletter Subscription</h2>
          <p><strong>Email:</strong> ${escapeHtml(validatedData.email)}</p>
        `;
        break;
      }

      case "payment": {
        const validatedData = PaymentDataSchema.parse(data);
        subject = `🎉 Payment Received: ${formatCurrency(validatedData.amount)} from ${escapeHtml(validatedData.name)}`;
        htmlContent = `
          <h2 style="color: #22c55e;">🎉 Payment Received!</h2>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 24px; font-weight: bold; color: #16a34a; margin: 0;">
              ${formatCurrency(validatedData.amount)}
            </p>
          </div>
          <p><strong>Client Name:</strong> ${escapeHtml(validatedData.name)}</p>
          <p><strong>Client Email:</strong> ${escapeHtml(validatedData.email)}</p>
          <p><strong>Project Type:</strong> ${escapeHtml(validatedData.project_type)}</p>
          <p><strong>Payment ID:</strong> ${escapeHtml(validatedData.payment_id)}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 14px;">
            Please reach out to the client within 24 hours to start the project.
          </p>
        `;
        break;
      }

      default:
        throw new Error("Invalid notification type");
    }

    const emailResponse = await resend.emails.send({
      from: "Morzen Portfolio <onboarding@resend.dev>",
      to: [ownerEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending notification:", error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid input data", details: error.errors }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);