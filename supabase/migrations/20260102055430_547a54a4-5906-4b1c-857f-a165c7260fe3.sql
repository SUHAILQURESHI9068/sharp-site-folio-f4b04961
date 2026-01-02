-- Create client_projects table for client portal
CREATE TABLE public.client_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_email TEXT NOT NULL,
  project_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress',
  progress INTEGER NOT NULL DEFAULT 0,
  start_date DATE,
  estimated_completion DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_documents table
CREATE TABLE public.client_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_milestones table
CREATE TABLE public.client_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_milestones ENABLE ROW LEVEL SECURITY;

-- Client projects policies
CREATE POLICY "Admin can manage all client projects"
ON public.client_projects FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their own projects"
ON public.client_projects FOR SELECT
USING (auth.jwt() ->> 'email' = client_email);

-- Client documents policies
CREATE POLICY "Admin can manage all documents"
ON public.client_documents FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their project documents"
ON public.client_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_projects
    WHERE id = project_id
    AND client_email = auth.jwt() ->> 'email'
  )
);

-- Client milestones policies
CREATE POLICY "Admin can manage all milestones"
ON public.client_milestones FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their project milestones"
ON public.client_milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_projects
    WHERE id = project_id
    AND client_email = auth.jwt() ->> 'email'
  )
);

-- Add trigger for updated_at on client_projects
CREATE TRIGGER update_client_projects_updated_at
BEFORE UPDATE ON public.client_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();