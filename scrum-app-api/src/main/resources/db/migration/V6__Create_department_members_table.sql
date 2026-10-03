-- Create department_members table for many-to-many relationship between departments and assignees
CREATE TABLE department_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL,
    assignee_id UUID NOT NULL,
    is_priority BOOLEAN NOT NULL DEFAULT false,
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_department_members_department_id 
        FOREIGN KEY (department_id) 
        REFERENCES departments(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_department_members_assignee_id 
        FOREIGN KEY (assignee_id) 
        REFERENCES assignees(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint: one assignee can only be a member of a department once
    CONSTRAINT uk_department_members_department_assignee 
        UNIQUE (department_id, assignee_id)
);

-- Create indexes for performance
CREATE INDEX idx_department_members_department_id ON department_members(department_id);
CREATE INDEX idx_department_members_assignee_id ON department_members(assignee_id);
CREATE INDEX idx_department_members_is_priority ON department_members(is_priority);
CREATE INDEX idx_department_members_created_at ON department_members(created_at);

-- Create unique index to ensure only one priority department per assignee
-- This ensures that an assignee can only have one priority department across all their memberships
CREATE UNIQUE INDEX uk_assignee_priority_department 
ON department_members (assignee_id) 
WHERE is_priority = true;

