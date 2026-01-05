import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  type: "client_signup" | "project_created";
  clientEmail: string;
  clientName?: string;
  projectName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, clientEmail, clientName, projectName }: WelcomeEmailRequest = await req.json();
    console.log("Received welcome email request:", type, clientEmail);

    let subject = "";
    let htmlContent = "";

    switch (type) {
      case "client_signup":
        subject = "Welcome to Morzen Portfolio!";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8b5cf6;">Welcome${clientName ? `, ${clientName}` : ""}!</h1>
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
        subject = `Your Project "${projectName}" Has Been Created!`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8b5cf6;">Project Created!</h1>
            <p>Great news! Your project <strong>"${projectName}"</strong> has been set up.</p>
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
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
