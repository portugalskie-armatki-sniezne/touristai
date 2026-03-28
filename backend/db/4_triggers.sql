-- migrate:up
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_modtime
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- migrate:down
DROP TRIGGER IF EXISTS update_user_preferences_modtime ON user_preferences;
DROP FUNCTION IF EXISTS update_modified_column();