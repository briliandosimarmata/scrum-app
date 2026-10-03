-- Create departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    project_id UUID NOT NULL,
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_departments_project_id 
        FOREIGN KEY (project_id) 
        REFERENCES projects(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint for code per project
    CONSTRAINT uk_departments_code_project 
        UNIQUE (code, project_id)
);

-- Create indexes for performance
CREATE INDEX idx_departments_project_id ON departments(project_id);
CREATE INDEX idx_departments_code ON departments(code);
CREATE INDEX idx_departments_created_at ON departments(created_at);

-- Create index on project_id and created_at for efficient project department queries
CREATE INDEX idx_departments_project_created ON departments(project_id, created_at ASC);

-- Create index on code pattern for efficient counter queries
CREATE INDEX idx_departments_code_pattern ON departments(project_id, code);
