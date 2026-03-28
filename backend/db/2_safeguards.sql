-- migrate:up
ALTER TABLE users
    ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
    ADD CONSTRAINT valid_username CHECK (char_length(trim(username)) >= 3);

-- migrate:down
ALTER TABLE users
    DROP CONSTRAINT IF EXISTS valid_email,
    DROP CONSTRAINT IF EXISTS valid_username;