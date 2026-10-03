-- Create sprints table
CREATE TABLE sprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    story_points_per_day INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    specific_holidays JSONB NOT NULL DEFAULT '[]'::jsonb,
    project_id UUID NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_sprints_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT chk_sprints_date_range CHECK (end_date > start_date),
    CONSTRAINT chk_sprints_story_points_positive CHECK (story_points_per_day > 0)
);

-- Create indexes for performance
CREATE INDEX idx_sprints_project_id ON sprints(project_id);
CREATE INDEX idx_sprints_start_date ON sprints(start_date);
CREATE INDEX idx_sprints_end_date ON sprints(end_date);
CREATE INDEX idx_sprints_specific_holidays ON sprints USING GIN (specific_holidays);

-- Create index on project_id and created_at for efficient project sprint queries
CREATE INDEX idx_sprints_project_created ON sprints(project_id, created_at ASC);

-- Create index on date range for efficient date-based queries
CREATE INDEX idx_sprints_date_range ON sprints(start_date, end_date);
