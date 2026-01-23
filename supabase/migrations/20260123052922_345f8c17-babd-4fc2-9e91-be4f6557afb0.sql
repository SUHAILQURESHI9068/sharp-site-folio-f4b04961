-- Add RLS policy to allow public SELECT on the testimonials table for the view
-- The view with security_invoker needs RLS to allow reading
CREATE POLICY "Anyone can read approved testimonials via view"
ON public.testimonials FOR SELECT
USING (is_approved = true);