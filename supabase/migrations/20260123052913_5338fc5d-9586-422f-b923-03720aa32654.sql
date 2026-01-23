-- Fix the view to use SECURITY INVOKER instead of SECURITY DEFINER
DROP VIEW IF EXISTS public.testimonials_public;

CREATE VIEW public.testimonials_public 
WITH (security_invoker = true) AS
SELECT 
  id, 
  name, 
  company, 
  role, 
  content, 
  rating, 
  avatar_url, 
  is_featured, 
  created_at
FROM public.testimonials
WHERE is_approved = true;

-- Grant read access to the view for anonymous and authenticated users
GRANT SELECT ON public.testimonials_public TO anon, authenticated;