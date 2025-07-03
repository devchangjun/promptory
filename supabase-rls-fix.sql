-- ==========================================
-- Collection RLS Policy Fix
-- ==========================================
-- This file contains the fixes applied to resolve the collection query error
-- "컬렉션을 불러오는데 실패했습니다."

-- Problem: Conflicting RLS policies causing query failures
-- Solution: Clean up policies and create unified access patterns

-- 1. Clean up conflicting RLS policies on collections table
DROP POLICY IF EXISTS "Collections are viewable based on privacy settings" ON collections;
DROP POLICY IF EXISTS "Public collections are viewable by everyone" ON collections;
DROP POLICY IF EXISTS "User can view their own collections" ON collections;
DROP POLICY IF EXISTS "Users can view their own collections" ON collections;
DROP POLICY IF EXISTS "Users can view own collections" ON collections;

-- 2. Create unified RLS policies that work properly
-- Policy 1: Public collections are viewable by everyone (including anonymous users)
CREATE POLICY "Allow public collection access" ON collections
    FOR SELECT USING (is_public = true);

-- Policy 2: Users can view their own collections (authenticated only)  
CREATE POLICY "Allow user own collection access" ON collections
    FOR SELECT USING (
        auth.jwt() ->> 'sub' = user_id
    );

-- 3. Ensure collection_categories is accessible by everyone
DROP POLICY IF EXISTS "Allow public read access to collection categories" ON collection_categories;
CREATE POLICY "Allow public read access to collection categories" 
ON collection_categories FOR SELECT USING (true);

-- 4. Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, cmd, qual
FROM pg_policies 
WHERE tablename IN ('collections', 'collection_categories', 'collection_prompts')
ORDER BY tablename, policyname;

-- ==========================================
-- Test Queries
-- ==========================================

-- Test 1: Public collections query (should work for anonymous users)
SELECT id, name, description, user_id, is_public, category_id, view_count, like_count, prompt_count, created_at 
FROM collections 
WHERE is_public = true 
ORDER BY created_at DESC 
LIMIT 5;

-- Test 2: Collection categories query (should work for anonymous users)
SELECT id, name FROM collection_categories ORDER BY display_order;

-- Test 3: Combined query with categories (used in TRPC procedure)
SELECT 
    c.id, c.name, c.description, c.user_id, c.is_public, 
    c.category_id, c.view_count, c.like_count, c.prompt_count, c.created_at,
    cat.name as category_name
FROM collections c
LEFT JOIN collection_categories cat ON c.category_id = cat.id
WHERE c.is_public = true 
ORDER BY c.created_at DESC 
LIMIT 5;

-- ==========================================
-- Clerk + Supabase RLS 정책 수정
-- ==========================================

-- 기존 RLS 정책 제거
DROP POLICY IF EXISTS "Collections are viewable based on privacy settings" ON collections;
DROP POLICY IF EXISTS "Users can create their own collections" ON collections;
DROP POLICY IF EXISTS "Users can update their own collections" ON collections;
DROP POLICY IF EXISTS "Users can delete their own collections" ON collections;

-- 수정된 RLS 정책 생성 (Clerk JWT 토큰 호환)
-- 컬렉션 조회 정책 (공개 컬렉션은 모든 사용자, 비공개는 작성자만)
CREATE POLICY "Collections are viewable based on privacy settings" ON collections
    FOR SELECT USING (
        is_public = true OR 
        user_id = coalesce(
            auth.jwt() ->> 'sub',
            current_setting('request.jwt.claims', true)::json ->> 'sub'
        )
    );

-- 컬렉션 생성 정책 (인증된 사용자만)
CREATE POLICY "Users can create their own collections" ON collections
    FOR INSERT WITH CHECK (
        user_id = coalesce(
            auth.jwt() ->> 'sub',
            current_setting('request.jwt.claims', true)::json ->> 'sub'
        )
    );

-- 컬렉션 수정 정책 (작성자만)
CREATE POLICY "Users can update their own collections" ON collections
    FOR UPDATE USING (
        user_id = coalesce(
            auth.jwt() ->> 'sub',
            current_setting('request.jwt.claims', true)::json ->> 'sub'
        )
    );

-- 컬렉션 삭제 정책 (작성자만)
CREATE POLICY "Users can delete their own collections" ON collections
    FOR DELETE USING (
        user_id = coalesce(
            auth.jwt() ->> 'sub',
            current_setting('request.jwt.claims', true)::json ->> 'sub'
        )
    );

-- 대안: RLS를 일시적으로 비활성화 (빠른 해결책)
-- ALTER TABLE collections DISABLE ROW LEVEL SECURITY;

-- 컬렉션-프롬프트 관계 정책도 수정
DROP POLICY IF EXISTS "Collection prompts are viewable if collection is viewable" ON collection_prompts;
CREATE POLICY "Collection prompts are viewable if collection is viewable" ON collection_prompts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM collections 
            WHERE collections.id = collection_prompts.collection_id 
            AND (
                collections.is_public = true OR 
                collections.user_id = coalesce(
                    auth.jwt() ->> 'sub',
                    current_setting('request.jwt.claims', true)::json ->> 'sub'
                )
            )
        )
    );

DROP POLICY IF EXISTS "Users can manage prompts in their collections" ON collection_prompts;
CREATE POLICY "Users can manage prompts in their collections" ON collection_prompts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM collections 
            WHERE collections.id = collection_prompts.collection_id 
            AND collections.user_id = coalesce(
                auth.jwt() ->> 'sub',
                current_setting('request.jwt.claims', true)::json ->> 'sub'
            )
        )
    );

-- 컬렉션 좋아요 정책도 수정
DROP POLICY IF EXISTS "Users can manage their own collection likes" ON collection_likes;
CREATE POLICY "Users can manage their own collection likes" ON collection_likes
    FOR ALL USING (
        user_id = coalesce(
            auth.jwt() ->> 'sub',
            current_setting('request.jwt.claims', true)::json ->> 'sub'
        )
    ); 