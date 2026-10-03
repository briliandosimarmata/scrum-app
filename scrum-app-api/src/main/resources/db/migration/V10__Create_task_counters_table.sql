-- Create task_counters table for atomic counter generation
CREATE TABLE task_counters (
    project_id UUID NOT NULL,
    project_code VARCHAR(4) NOT NULL,
    counter INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (project_id, project_code)
);

-- Create index for faster lookups
CREATE INDEX idx_task_counters_project_id ON task_counters(project_id);

-- Add comment
COMMENT ON TABLE task_counters IS 'Atomic counters for task code generation to prevent race conditions';

