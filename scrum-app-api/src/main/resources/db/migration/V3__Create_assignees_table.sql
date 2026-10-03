-- Create assignees table
CREATE TABLE assignees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    project_id UUID NOT NULL,
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_assignees_project_id 
        FOREIGN KEY (project_id) 
        REFERENCES projects(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint for code per project
    CONSTRAINT uk_assignees_code_project 
        UNIQUE (code, project_id)
);

-- Create indexes for performance
CREATE INDEX idx_assignees_project_id ON assignees(project_id);
CREATE INDEX idx_assignees_code ON assignees(code);
CREATE INDEX idx_assignees_created_at ON assignees(created_at);

-- Create index on project_id and created_at for efficient project assignee queries
CREATE INDEX idx_assignees_project_created ON assignees(project_id, created_at ASC);

-- Create index on code pattern for efficient counter queries
CREATE INDEX idx_assignees_code_pattern ON assignees(project_id, code);
