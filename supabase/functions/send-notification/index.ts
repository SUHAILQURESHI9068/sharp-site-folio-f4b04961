import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "contact" | "meeting" | "quote" | "newsletter" | "payment";
  data: Record<string, any>;
}

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
    const { type, data }: NotificationRequest = await req.json();
    console.log("Received notification request:", type, data);

    let subject = "";
    let htmlContent = "";
    const ownerEmail = "suhailqureshi0828@gmail.com";

    switch (type) {
      case "contact":
        subject = `New Contact Message from ${data.name}`;
        htmlContent = `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message}</p>
        `;
        break;

      case "meeting":
        subject = `New Meeting Booked: ${data.meeting_type}`;
        htmlContent = `
          <h2>New Meeting Booking</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Meeting Type:</strong> ${data.meeting_type}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.time}</p>
        `;
        break;

      case "quote":
        subject = `New Quote Request: ${data.project_type}`;
        htmlContent = `
          <h2>New Quote Request</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Project Type:</strong> ${data.project_type}</p>
          <p><strong>Features:</strong> ${data.features?.join(", ") || "None"}</p>
          <p><strong>Estimated Price:</strong> ₹${data.estimated_price?.toLocaleString()}</p>
          ${data.message ? `<p><strong>Additional Details:</strong> ${data.message}</p>` : ""}
        `;
        break;

      case "newsletter":
        subject = `New Newsletter Subscriber`;
        htmlContent = `
          <h2>New Newsletter Subscription</h2>
          <p><strong>Email:</strong> ${data.email}</p>
        `;
        break;

      case "payment":
        subject = `🎉 Payment Received: ${formatCurrency(data.amount)} from ${data.name}`;
        htmlContent = `
          <h2 style="color: #22c55e;">🎉 Payment Received!</h2>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 24px; font-weight: bold; color: #16a34a; margin: 0;">
              ${formatCurrency(data.amount)}
            </p>
          </div>
          <p><strong>Client Name:</strong> ${data.name}</p>
          <p><strong>Client Email:</strong> ${data.email}</p>
          <p><strong>Project Type:</strong> ${data.project_type}</p>
          <p><strong>Payment ID:</strong> ${data.payment_id}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 14px;">
            Please reach out to the client within 24 hours to start the project.
          </p>
        `;
        break;

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
  } catch (error: any) {
    console.error("Error sending notification:", error);
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