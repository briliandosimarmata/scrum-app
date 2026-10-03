-- Create department_counters table for atomic counter management
CREATE TABLE department_counters (
    project_id UUID NOT NULL,
    prefix VARCHAR(10) NOT NULL,
    counter INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Primary key constraint
    CONSTRAINT pk_department_counters PRIMARY KEY (project_id, prefix),

    -- Foreign key constraint
    CONSTRAINT fk_department_counters_project_id
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_department_counters_project_id ON department_counters(project_id);
CREATE INDEX idx_department_counters_prefix ON department_counters(prefix);

