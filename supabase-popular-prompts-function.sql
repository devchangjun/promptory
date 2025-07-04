-- Description: Supabase RPC function to get popular prompts based on like count.
-- This function is required by the `getPopularPrompts` tRPC procedure.
--
-- How to apply:
-- 1. Go to your Supabase project's SQL Editor.
-- 2. Create a new query.
-- 3. Paste the content of this file and run the query.

CREATE OR REPLACE FUNCTION get_popular_prompt_ids(p_limit INT)
RETURNS TABLE(prompt_id TEXT, total_likes BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.prompt_id,
        count(l.id) as total_likes
    FROM
        likes l
    GROUP BY
        l.prompt_id
    ORDER BY
        total_likes DESC
    LIMIT
        p_limit;
END;
$$ LANGUAGE plpgsql; 