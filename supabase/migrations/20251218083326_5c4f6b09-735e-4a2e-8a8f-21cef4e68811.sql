-- Fix the overly permissive SELECT policy on contact_submissions
DROP POLICY IF EXISTS "Allow read access for admin" ON public.contact_submissions;

CREATE POLICY "Admin can read contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Also fix newsletter_subscriptions, meeting_bookings, and quote_requests for consistency
DROP POLICY IF EXISTS "Allow read access for admin" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Allow read access for admin" ON public.meeting_bookings;
DROP POLICY IF EXISTS "Allow read access for admin" ON public.quote_requests;

CREATE POLICY "Admin can read newsletter subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can read meeting bookings"
ON public.meeting_bookings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can read quote requests"
ON public.quote_requests
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add is_read column for contact submissions
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;

-- Add policy for admins to update contact_submissions (mark as read)
CREATE POLICY "Admin can update contact submissions"
ON public.contact_submissions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));