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

// Input validation schema
const WelcomeEmailRequestSchema = z.object({
  type: z.enum(["client_signup", "project_created"]),
  clientEmail: z.string().email().max(255),
  clientName: z.string().max(200).optional(),
  projectName: z.string().max(200).optional(),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate input
    const validatedData = WelcomeEmailRequestSchema.parse(rawBody);
    const { type, clientEmail, clientName, projectName } = validatedData;
    
    console.log("Received welcome email request:", type, clientEmail);

    let subject = "";
    let htmlContent = "";

    switch (type) {
      case "client_signup":
        subject = "Welcome to Morzen Portfolio!";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8b5cf6;">Welcome${clientName ? `, ${escapeHtml(clientName)}` : ""}!</h1>
            <p>Thank you for signing up. We're excited to have you on board!</p>
            <p>You can now:</p>
            <ul>
              <li>Track your project progress in real-time</li>
              <li>View milestones and deliverables</li>
              <li>Access project documents</li>
              <li>Stay updated on all developments</li>
            </ul>
            <p>If you have any questions, feel free to reach out to us.</p>
            <p style="margin-top: 30px;">Best regards,<br>The Morzen Team</p>
          </div>
        `;
        break;

      case "project_created":
        subject = `Your Project "${projectName ? escapeHtml(projectName) : 'New Project'}" Has Been Created!`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8b5cf6;">Project Created!</h1>
            <p>Great news! Your project <strong>"${projectName ? escapeHtml(projectName) : 'New Project'}"</strong> has been set up.</p>
            <p>Here's what happens next:</p>
            <ol>
              <li>Our team will begin the initial planning phase</li>
              <li>You'll receive milestone updates as we progress</li>
              <li>Documents and deliverables will be shared via your portal</li>
            </ol>
            <p>You can track your project's progress anytime by logging into the client portal.</p>
            <p style="margin-top: 30px;">Best regards,<br>The Morzen Team</p>
          </div>
        `;
        break;

      default:
        throw new Error("Invalid email type");
    }

    const emailResponse = await resend.emails.send({
      from: "Morzen Portfolio <onboarding@resend.dev>",
      to: [clientEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Welcome email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending welcome email:", error);
    
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