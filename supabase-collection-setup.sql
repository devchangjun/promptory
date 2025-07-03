-- ==========================================
-- 프롬프트 컬렉션 데이터베이스 스키마 (Supabase)
-- ==========================================

-- 1. 컬렉션 카테고리 테이블
CREATE TABLE IF NOT EXISTS collection_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_name VARCHAR(50), -- Lucide React 아이콘 이름
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 컬렉션 테이블 (메인)
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  user_id VARCHAR(255) NOT NULL, -- Clerk 사용자 ID
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false, -- 추천 컬렉션 여부
  category_id UUID REFERENCES collection_categories(id) ON DELETE SET NULL,
  thumbnail_url TEXT, -- 컬렉션 썸네일 이미지
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  prompt_count INTEGER DEFAULT 0, -- 포함된 프롬프트 수 (캐시)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 제약 조건
  CONSTRAINT collections_title_check CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
  CONSTRAINT collections_prompt_count_check CHECK (prompt_count >= 0 AND prompt_count <= 100)
);

-- 3. 컬렉션-프롬프트 관계 테이블
CREATE TABLE IF NOT EXISTS collection_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 중복 방지: 하나의 컬렉션에 동일한 프롬프트는 한 번만
  UNIQUE(collection_id, prompt_id)
);

-- 4. 컬렉션 좋아요 테이블
CREATE TABLE IF NOT EXISTS collection_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL, -- Clerk 사용자 ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 중복 방지: 사용자당 컬렉션 하나에 좋아요 한 번만
  UNIQUE(collection_id, user_id)
);

-- ==========================================
-- 인덱스 생성
-- ==========================================

-- 컬렉션 조회 성능 최적화
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_category_id ON collections(category_id);
CREATE INDEX IF NOT EXISTS idx_collections_is_public ON collections(is_public);
CREATE INDEX IF NOT EXISTS idx_collections_is_featured ON collections(is_featured);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collections_view_count ON collections(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_collections_like_count ON collections(like_count DESC);

-- 컬렉션-프롬프트 관계 최적화
CREATE INDEX IF NOT EXISTS idx_collection_prompts_collection_id ON collection_prompts(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_prompts_prompt_id ON collection_prompts(prompt_id);
CREATE INDEX IF NOT EXISTS idx_collection_prompts_order ON collection_prompts(collection_id, order_index);

-- 컬렉션 좋아요 최적화
CREATE INDEX IF NOT EXISTS idx_collection_likes_collection_id ON collection_likes(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_likes_user_id ON collection_likes(user_id);

-- ==========================================
-- Row Level Security (RLS) 정책
-- ==========================================

-- 컬렉션 RLS 활성화
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_likes ENABLE ROW LEVEL SECURITY;

-- 컬렉션 조회 정책 (공개 컬렉션은 모든 사용자, 비공개는 작성자만)
DROP POLICY IF EXISTS "Collections are viewable based on privacy settings" ON collections;
CREATE POLICY "Collections are viewable based on privacy settings" ON collections
    FOR SELECT USING (
        is_public = true OR 
        user_id = auth.jwt() ->> 'sub'
    );

-- 컬렉션 생성 정책 (인증된 사용자만)
DROP POLICY IF EXISTS "Users can create their own collections" ON collections;
CREATE POLICY "Users can create their own collections" ON collections
    FOR INSERT WITH CHECK (
        user_id = auth.jwt() ->> 'sub'
    );

-- 컬렉션 수정 정책 (작성자만)
DROP POLICY IF EXISTS "Users can update their own collections" ON collections;
CREATE POLICY "Users can update their own collections" ON collections
    FOR UPDATE USING (
        user_id = auth.jwt() ->> 'sub'
    );

-- 컬렉션 삭제 정책 (작성자만)
DROP POLICY IF EXISTS "Users can delete their own collections" ON collections;
CREATE POLICY "Users can delete their own collections" ON collections
    FOR DELETE USING (
        user_id = auth.jwt() ->> 'sub'
    );

-- 컬렉션-프롬프트 관계 정책
DROP POLICY IF EXISTS "Collection prompts are viewable if collection is viewable" ON collection_prompts;
CREATE POLICY "Collection prompts are viewable if collection is viewable" ON collection_prompts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM collections 
            WHERE collections.id = collection_prompts.collection_id 
            AND (
                collections.is_public = true OR 
                collections.user_id = auth.jwt() ->> 'sub'
            )
        )
    );

DROP POLICY IF EXISTS "Users can manage prompts in their collections" ON collection_prompts;
CREATE POLICY "Users can manage prompts in their collections" ON collection_prompts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM collections 
            WHERE collections.id = collection_prompts.collection_id 
            AND collections.user_id = auth.jwt() ->> 'sub'
        )
    );

-- 컬렉션 좋아요 정책
DROP POLICY IF EXISTS "Collection likes are viewable by everyone" ON collection_likes;
CREATE POLICY "Collection likes are viewable by everyone" ON collection_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own collection likes" ON collection_likes;
CREATE POLICY "Users can manage their own collection likes" ON collection_likes
    FOR ALL USING (
        user_id = auth.jwt() ->> 'sub'
    );

-- ==========================================
-- 트리거 함수 (통계 자동 업데이트)
-- ==========================================

-- 컬렉션 프롬프트 수 업데이트 함수
CREATE OR REPLACE FUNCTION update_collection_prompt_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE collections 
        SET prompt_count = prompt_count + 1,
            updated_at = NOW()
        WHERE id = NEW.collection_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE collections 
        SET prompt_count = prompt_count - 1,
            updated_at = NOW()
        WHERE id = OLD.collection_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 컬렉션 좋아요 수 업데이트 함수
CREATE OR REPLACE FUNCTION update_collection_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE collections 
        SET like_count = like_count + 1,
            updated_at = NOW()
        WHERE id = NEW.collection_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE collections 
        SET like_count = like_count - 1,
            updated_at = NOW()
        WHERE id = OLD.collection_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 트리거 생성
-- ==========================================

-- 프롬프트 수 자동 업데이트
DROP TRIGGER IF EXISTS trigger_update_collection_prompt_count ON collection_prompts;
CREATE TRIGGER trigger_update_collection_prompt_count
    AFTER INSERT OR DELETE ON collection_prompts
    FOR EACH ROW EXECUTE FUNCTION update_collection_prompt_count();

-- 좋아요 수 자동 업데이트
DROP TRIGGER IF EXISTS trigger_update_collection_like_count ON collection_likes;
CREATE TRIGGER trigger_update_collection_like_count
    AFTER INSERT OR DELETE ON collection_likes
    FOR EACH ROW EXECUTE FUNCTION update_collection_like_count();

-- updated_at 자동 업데이트
DROP TRIGGER IF EXISTS trigger_collections_updated_at ON collections;
CREATE TRIGGER trigger_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_collection_categories_updated_at ON collection_categories;
CREATE TRIGGER trigger_collection_categories_updated_at
    BEFORE UPDATE ON collection_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 기본 데이터 삽입
-- ==========================================

-- 컬렉션 카테고리 기본 데이터
INSERT INTO collection_categories (name, description, icon_name, display_order) VALUES
('교육', '교육 및 학습 관련 프롬프트 컬렉션', 'GraduationCap', 1),
('비즈니스', '업무 및 비즈니스 관련 프롬프트 컬렉션', 'Briefcase', 2),
('개발', '프로그래밍 및 개발 관련 프롬프트 컬렉션', 'Code', 3),
('창작', '창작 및 콘텐츠 제작 관련 프롬프트 컬렉션', 'Palette', 4),
('마케팅', '마케팅 및 홍보 관련 프롬프트 컬렉션', 'Megaphone', 5),
('분석', '데이터 분석 및 리서치 관련 프롬프트 컬렉션', 'BarChart3', 6),
('일반', '기타 다양한 용도의 프롬프트 컬렉션', 'Lightbulb', 7)
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 권한 설정 (Supabase 전용)
-- ==========================================

-- 카테고리는 모든 사용자가 읽기 가능
ALTER TABLE collection_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read collection categories" ON collection_categories;
CREATE POLICY "Anyone can read collection categories" ON collection_categories
    FOR SELECT USING (true);

-- ==========================================
-- 실행 완료 확인
-- ==========================================

-- 테이블 생성 확인
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%collection%'
ORDER BY table_name;

-- 생성된 컬렉션 카테고리 확인
SELECT * FROM collection_categories ORDER BY display_order; 