-- migrate:up
ALTER TABLE users
    ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
    ADD CONSTRAINT valid_username CHECK (char_length(trim(username)) >= 3);

ALTER TABLE user_preferences
    ADD CONSTRAINT valid_language CHECK (language IN ('pl', 'en', 'es', 'de')),
    ADD CONSTRAINT valid_style CHECK (style IN ('casual', 'historical', 'formal', 'professional'));

-- migrate:down
ALTER TABLE users
    DROP CONSTRAINT IF EXISTS valid_email,
    DROP CONSTRAINT IF EXISTS valid_username;

ALTER TABLE user_preferences
    DROP CONSTRAINT IF EXISTS valid_language,
    DROP CONSTRAINT IF EXISTS valid_style;