-- Add SELECT policies for admin dashboard to read submissions
CREATE POLICY "Allow read access for admin"
ON public.contact_submissions
FOR SELECT
USING (true);

CREATE POLICY "Allow read access for admin"
ON public.meeting_bookings
FOR SELECT
USING (true);

CREATE POLICY "Allow read access for admin"
ON public.quote_requests
FOR SELECT
USING (true);

CREATE POLICY "Allow read access for admin"
ON public.newsletter_subscriptions
FOR SELECT
USING (true);