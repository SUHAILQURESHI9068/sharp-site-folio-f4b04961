-- Create project_activities table for activity/communication log
CREATE TABLE public.project_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL DEFAULT 'note',
  title TEXT NOT NULL,
  description TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;

-- Admin can manage all activities
CREATE POLICY "Admin can manage all activities"
ON public.project_activities
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Clients can view activities for their projects
CREATE POLICY "Clients can view their project activities"
ON public.project_activities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM client_projects
    WHERE client_projects.id = project_activities.project_id
    AND client_projects.client_email = (auth.jwt() ->> 'email'::text)
  )
);

-- Create index for faster lookups
CREATE INDEX idx_project_activities_project_id ON public.project_activities(project_id);
CREATE INDEX idx_project_activities_created_at ON public.project_activities(created_at DESC);