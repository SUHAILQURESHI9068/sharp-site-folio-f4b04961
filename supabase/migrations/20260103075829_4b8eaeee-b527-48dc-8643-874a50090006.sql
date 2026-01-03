-- Create testimonials table for user submissions
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  role TEXT,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  avatar_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can submit testimonials
CREATE POLICY "Anyone can submit testimonials"
ON public.testimonials FOR INSERT
WITH CHECK (true);

-- Anyone can read approved testimonials
CREATE POLICY "Anyone can read approved testimonials"
ON public.testimonials FOR SELECT
USING (is_approved = true);

-- Admin can manage all testimonials
CREATE POLICY "Admin can manage all testimonials"
ON public.testimonials FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-documents', 'client-documents', false);

-- Storage policies for client documents
CREATE POLICY "Admin can upload client documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'client-documents' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can view all client documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-documents' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete client documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'client-documents' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their project documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'client-documents' AND
  EXISTS (
    SELECT 1 FROM public.client_documents cd
    JOIN public.client_projects cp ON cd.project_id = cp.id
    WHERE cd.file_url LIKE '%' || name
    AND cp.client_email = auth.jwt() ->> 'email'
  )
);