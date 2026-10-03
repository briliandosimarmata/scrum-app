-- Add key_expires_at field to projects table for hybrid expiration approach
ALTER TABLE projects ADD COLUMN key_expires_at TIMESTAMP;

-- Create index for efficient expiration queries
CREATE INDEX idx_projects_key_expires_at ON projects(key_expires_at);

-- Update existing projects with project_key to have expiration 30 days from now
UPDATE projects 
SET key_expires_at = NOW() + INTERVAL '30 days' 
WHERE project_key IS NOT NULL;
