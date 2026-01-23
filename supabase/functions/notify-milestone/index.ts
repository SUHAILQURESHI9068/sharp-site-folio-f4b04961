import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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
const NotifyMilestoneRequestSchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
  milestoneId: z.string().uuid('Invalid milestone ID format').optional(),
  type: z.enum(["milestone_completed", "status_changed"]),
});

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate input
    const validatedData = NotifyMilestoneRequestSchema.parse(rawBody);
    const { projectId, milestoneId, type } = validatedData;
    
    console.log("Notification request:", { projectId, milestoneId, type });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from("client_projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      console.error("Project not found:", projectError);
      return new Response(JSON.stringify({ error: "Project not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let subject = "";
    let htmlContent = "";

    if (type === "milestone_completed" && milestoneId) {
      const { data: milestone } = await supabase
        .from("client_milestones")
        .select("*")
        .eq("id", milestoneId)
        .single();

      const milestoneTitle = milestone?.title || "Milestone";
      const milestoneDescription = milestone?.description || "";
      
      subject = `Milestone Completed: ${escapeHtml(milestoneTitle)} - ${escapeHtml(project.project_name)}`;
      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Milestone Completed!</h2>
          <p>Great news! A milestone has been completed on your project.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">${escapeHtml(milestoneTitle)}</h3>
            <p style="margin: 0; color: #6b7280;">${escapeHtml(milestoneDescription)}</p>
          </div>
          <p><strong>Project:</strong> ${escapeHtml(project.project_name)}</p>
          <p><strong>Progress:</strong> ${project.progress}%</p>
          <p style="margin-top: 30px;">
            <a href="${Deno.env.get("SITE_URL") || "https://your-site.com"}/portal" 
               style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Project
            </a>
          </p>
        </div>
      `;
    } else if (type === "status_changed") {
      subject = `Project Status Update: ${escapeHtml(project.project_name)}`;
      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Project Status Updated</h2>
          <p>The status of your project has been updated.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">${escapeHtml(project.project_name)}</h3>
            <p style="margin: 0;"><strong>New Status:</strong> ${escapeHtml(project.status.replace("_", " "))}</p>
            <p style="margin: 10px 0 0 0;"><strong>Progress:</strong> ${project.progress}%</p>
          </div>
          <p style="margin-top: 30px;">
            <a href="${Deno.env.get("SITE_URL") || "https://your-site.com"}/portal" 
               style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Project
            </a>
          </p>
        </div>
      `;
    } else {
      return new Response(JSON.stringify({ error: "Invalid notification type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email via Resend
    if (RESEND_API_KEY) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Project Updates <onboarding@resend.dev>",
          to: [project.client_email],
          subject,
          html: htmlContent,
        }),
      });

      const emailResult = await emailRes.json();
      console.log("Email sent:", emailResult);

      return new Response(JSON.stringify({ success: true, email: emailResult }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      console.log("RESEND_API_KEY not configured, skipping email");
      return new Response(JSON.stringify({ success: true, message: "Email skipped (no API key)" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error: unknown) {
    console.error("Error in notify-milestone:", error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid input data", details: error.errors }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});