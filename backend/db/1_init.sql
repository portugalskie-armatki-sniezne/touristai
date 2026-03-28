-- migrate:up

-- extensions initialization
CREATE EXTENSION IF NOT EXISTS postgis;

-- table for users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- google auth columns
    google_id VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    profile_picture_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

-- table for user's preferences
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    -- to select: pl, en
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    -- created by gemma 3 based on user preferences
    system_prompt TEXT NOT NULL DEFAULT '',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- table for user's uniqe visits
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- PostGIS column
    location GEOMETRY(Point, 4326) NOT NULL, 
    
    identified_object_name VARCHAR(255) NOT NULL,
    raw_facts TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX visits_location_idx ON visits USING GIST (location);
CREATE INDEX visits_created_at_idx ON visits (created_at);


-- table for summaries generated based on places visited by user on a given dates
CREATE TABLE summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, summary_date) 
);

-- migrate:down
DROP TABLE IF EXISTS daily_summaries;
DROP TABLE IF EXISTS visits;
DROP TABLE IF EXISTS users;
DROP EXTENSION IF EXISTS postgis;