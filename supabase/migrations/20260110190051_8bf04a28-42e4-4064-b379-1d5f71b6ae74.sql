-- Add new columns to client_projects table for detailed project management
ALTER TABLE client_projects ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE client_projects ADD COLUMN IF NOT EXISTS client_phone TEXT;
ALTER TABLE client_projects ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'custom';
ALTER TABLE client_projects ADD COLUMN IF NOT EXISTS budget NUMERIC DEFAULT 0;
ALTER TABLE client_projects ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE client_projects ADD COLUMN IF NOT EXISTS tech_stack TEXT[] DEFAULT '{}';
ALTER TABLE client_projects ADD COLUMN IF NOT EXISTS notes TEXT;