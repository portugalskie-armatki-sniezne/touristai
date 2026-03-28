-- migrate:up
/* example usage:
SELECT * FROM get_user_visits_in_interval(
    'some-user-uuid', 
    '2024-01-01T00:00:00Z'::timestamptz, 
    '2024-12-31T23:59:59Z'::timestamptz
);
*/

CREATE OR REPLACE FUNCTION get_user_visits_in_interval(
    p_user_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
    visit_id UUID,
    latitude DOUBLE PRECISION,  -- Szerokość geograficzna (Y)
    longitude DOUBLE PRECISION, -- Długość geograficzna (X)
    identified_object_name VARCHAR(255),
    raw_facts TEXT,
    visited_at TIMESTAMPTZ
) AS $$
    SELECT 
        v.id,
        ST_Y(v.location) AS latitude,
        ST_X(v.location) AS longitude,
        v.identified_object_name,
        v.raw_facts,
        v.created_at
    FROM 
        visits v
    WHERE 
        v.user_id = p_user_id
        AND v.created_at >= p_start_date
        AND v.created_at <= p_end_date
    ORDER BY
        v.created_at DESC;
$$ LANGUAGE sql STABLE;

-- migrate:down

DROP FUNCTION IF EXISTS get_user_visits_in_interval(UUID, TIMESTAMPTZ, TIMESTAMPTZ);