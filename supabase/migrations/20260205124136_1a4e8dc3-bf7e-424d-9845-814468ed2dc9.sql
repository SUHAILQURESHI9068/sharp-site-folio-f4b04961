-- Create portfolio_projects table for showcasing projects with advanced tracking
CREATE TABLE public.portfolio_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT NOT NULL DEFAULT 'web',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  live_url TEXT,
  github_url TEXT,
  revenue NUMERIC DEFAULT 0,
  loss NUMERIC DEFAULT 0,
  profit NUMERIC GENERATED ALWAYS AS (revenue - loss) STORED,
  status TEXT NOT NULL DEFAULT 'in_progress',
  priority TEXT DEFAULT 'medium',
  client_name TEXT,
  start_date DATE,
  end_date DATE,
  tech_stack TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Admin can manage all projects
CREATE POLICY "Admin can manage all portfolio projects"
ON public.portfolio_projects
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Anyone can read published projects
CREATE POLICY "Anyone can read published portfolio projects"
ON public.portfolio_projects
FOR SELECT
USING (is_published = true);

-- Add trigger for updated_at
CREATE TRIGGER update_portfolio_projects_updated_at
BEFORE UPDATE ON public.portfolio_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();