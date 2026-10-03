-- Create projects table
-- Projects belong to users (one-to-many relationship)

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description VARCHAR(500),
    thumbnail_url VARCHAR(500),
    user_id UUID NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_projects_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint: project code must be unique per user
    CONSTRAINT uk_projects_code_user_id UNIQUE (code, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_code ON projects(code);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- Create index on user_id and created_at for efficient user project queries
CREATE INDEX idx_projects_user_created ON projects(user_id, created_at DESC);
