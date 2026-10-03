-- Create user_assignees table to link users with assignees
CREATE TABLE user_assignees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    assignee_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_user_assignees_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_assignees_assignee_id 
        FOREIGN KEY (assignee_id) REFERENCES assignees(id) ON DELETE CASCADE
);

-- Create indexes for efficient queries
CREATE INDEX idx_user_assignees_user_id ON user_assignees(user_id);
CREATE INDEX idx_user_assignees_assignee_id ON user_assignees(assignee_id);
CREATE INDEX idx_user_assignees_created_at ON user_assignees(created_at);

-- Create unique constraints
-- One user can be linked to multiple assignees, but one assignee can only be linked to one user
CREATE UNIQUE INDEX uk_user_assignees_user_assignee ON user_assignees(user_id, assignee_id);
CREATE UNIQUE INDEX uk_user_assignees_assignee_unique ON user_assignees(assignee_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_assignees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_assignees_updated_at
    BEFORE UPDATE ON user_assignees
    FOR EACH ROW
    EXECUTE FUNCTION update_user_assignees_updated_at();
