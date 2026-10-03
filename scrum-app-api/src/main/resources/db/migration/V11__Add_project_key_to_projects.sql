-- Add project_key column to projects table
ALTER TABLE projects ADD COLUMN project_key TEXT;

-- Create index for efficient project key lookups
CREATE INDEX idx_projects_project_key ON projects(project_key);
