-- Create a view that excludes email from public testimonials access
-- This prevents email harvesting while maintaining the public testimonials feature

CREATE VIEW public.testimonials_public AS
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

-- Update RLS policy: Remove public SELECT from main testimonials table
-- First drop the existing permissive policy
DROP POLICY IF EXISTS "Anyone can read approved testimonials" ON public.testimonials;

-- Create a new restrictive policy that only allows admin access for SELECT
CREATE POLICY "Only admins can read all testimonials"
ON public.testimonials FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Keep existing insert policy for public submission (if it exists)
-- The testimonials_public view will be used for public display instead