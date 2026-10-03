-- Create assignee counters table for atomic counter generation
-- This eliminates race conditions in assignee code generation

CREATE TABLE assignee_counters (
    project_id UUID NOT NULL,
    prefix VARCHAR(10) NOT NULL,
    counter INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Primary key: project_id + prefix combination
    PRIMARY KEY (project_id, prefix),
    
    -- Foreign key constraint
    CONSTRAINT fk_assignee_counters_project_id 
        FOREIGN KEY (project_id) 
        REFERENCES projects(id) 
        ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_assignee_counters_project_id ON assignee_counters(project_id);
CREATE INDEX idx_assignee_counters_prefix ON assignee_counters(prefix);
