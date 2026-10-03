-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL,
    description VARCHAR(500) NOT NULL,
    story_points INTEGER NOT NULL CHECK (story_points > 0),
    status VARCHAR(20) NOT NULL CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE', 'CLOSED')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    task_order INTEGER NOT NULL DEFAULT 1,
    
    -- Foreign key relationships
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES assignees(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    dependency_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    
    -- Audit fields
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_department_id ON tasks(department_id);
CREATE INDEX idx_tasks_dependency_task_id ON tasks(dependency_task_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_task_order ON tasks(task_order);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Create composite indexes for common queries
CREATE INDEX idx_tasks_project_sprint ON tasks(project_id, sprint_id);
CREATE INDEX idx_tasks_sprint_order ON tasks(sprint_id, task_order);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_assignee_status ON tasks(assignee_id, status);

-- Create unique constraint for task code per project
CREATE UNIQUE INDEX uk_tasks_code_project ON tasks(code, project_id);

-- Create index for dependency chain queries (for circular dependency detection)
CREATE INDEX idx_tasks_dependency_chain ON tasks(dependency_task_id, id);

-- Add check constraint to prevent self-dependency
ALTER TABLE tasks ADD CONSTRAINT chk_tasks_no_self_dependency 
    CHECK (id != dependency_task_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_tasks_updated_at();
