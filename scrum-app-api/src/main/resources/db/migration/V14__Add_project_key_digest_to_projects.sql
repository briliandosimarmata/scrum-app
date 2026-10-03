-- Add deterministic digest column for project key lookups

-- 1) Add column (nullable for now to allow backfill)
ALTER TABLE projects
ADD COLUMN project_key_digest VARCHAR(64);

-- 2) Add unique index for fast lookup and to prevent duplicates
CREATE UNIQUE INDEX ux_projects_project_key_digest ON projects (project_key_digest);

-- After backfill, consider enforcing NOT NULL if business rules require it:
-- ALTER TABLE projects ALTER COLUMN project_key_digest SET NOT NULL;
