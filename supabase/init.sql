-- ================================================
-- YN Blog - 完整数据库初始化脚本
-- 这个文件包含所有必要的表、函数、触发器和策略
-- 执行顺序：直接运行此文件即可
-- ================================================

-- ================================================
-- 第一步：启用必要的扩展
-- ================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- 检查 pg_cron 扩展
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE NOTICE 'pg_cron extension not found. Please enable it in Supabase Dashboard for scheduled cleanup tasks.';
  END IF;
END $$;

-- ================================================
-- 第二步：创建核心表
-- ================================================

-- 用户资料表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'author', 'user')),
  role_application_status VARCHAR(20) CHECK (role_application_status IN ('pending', 'approved', 'rejected')),
  role_application_notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 文章分类表
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 文章标签表
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 文章表
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 文章标签关联表
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 媒体文件表
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  path TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 站点设置表
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 用户收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  username TEXT,
  role TEXT,
  action TEXT NOT NULL,
  target TEXT,
  check_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 邮箱域名白名单表
CREATE TABLE IF NOT EXISTS email_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户清理日志表
CREATE TABLE IF NOT EXISTS user_cleanup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deleted_count INTEGER NOT NULL,
  deleted_user_ids TEXT[],
  cleanup_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 角色申请表
CREATE TABLE IF NOT EXISTS role_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (length(reason) >= 1 AND length(reason) <= 500),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  review_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 用户留言表
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 2000),
  status VARCHAR(20) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 公告表
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 友链表
CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  description TEXT,
  avatar TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 友链申请表
CREATE TABLE IF NOT EXISTS link_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  description TEXT,
  avatar TEXT,
  applicant_name VARCHAR(100),
  applicant_email VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  review_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ================================================
-- 第三步：创建索引
-- ================================================

-- profiles 索引
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_role_application_status ON profiles(role_application_status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_application_notified ON profiles(role_application_notified);

-- categories 索引
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- tags 索引
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- posts 索引
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status_created_at ON posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_status ON posts(author_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status_view_count ON posts(status, view_count DESC);

-- post_tags 索引
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);

-- comments 索引
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_post_status ON comments(post_id, status);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- site_settings 索引
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- media_files 索引
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_files_type ON media_files(type);

-- favorites 索引
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_post_id ON favorites(post_id);

-- audit_logs 索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- email_whitelist 索引
CREATE INDEX IF NOT EXISTS idx_email_whitelist_domain ON email_whitelist(domain);
CREATE INDEX IF NOT EXISTS idx_email_whitelist_active ON email_whitelist(is_active);

-- user_cleanup_logs 索引
CREATE INDEX IF NOT EXISTS idx_user_cleanup_logs_time ON user_cleanup_logs(cleanup_time DESC);

-- role_applications 索引
CREATE INDEX IF NOT EXISTS idx_role_applications_user_id ON role_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_role_applications_status ON role_applications(status);
CREATE INDEX IF NOT EXISTS idx_role_applications_created_at ON role_applications(created_at DESC);

-- messages 索引
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- announcements 索引
CREATE INDEX IF NOT EXISTS idx_announcements_is_published ON announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned_created ON announcements(is_pinned DESC, created_at DESC);

-- links 索引
CREATE INDEX IF NOT EXISTS idx_links_is_active ON links(is_active);
CREATE INDEX IF NOT EXISTS idx_links_sort_order ON links(sort_order);

-- link_applications 索引
CREATE INDEX IF NOT EXISTS idx_link_applications_status ON link_applications(status);
CREATE INDEX IF NOT EXISTS idx_link_applications_created_at ON link_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_link_applications_url ON link_applications(url);

-- ================================================
-- 第四步：创建触发器和函数
-- ================================================

-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为各表创建更新时间戳触发器
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS set_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS set_tags_updated_at ON tags;
DROP TRIGGER IF EXISTS set_posts_updated_at ON posts;
DROP TRIGGER IF EXISTS set_comments_updated_at ON comments;
DROP TRIGGER IF EXISTS set_site_settings_updated_at ON site_settings;
DROP TRIGGER IF EXISTS set_role_applications_updated_at ON role_applications;
DROP TRIGGER IF EXISTS set_messages_updated_at ON messages;
DROP TRIGGER IF EXISTS set_announcements_updated_at ON announcements;
DROP TRIGGER IF EXISTS set_links_updated_at ON links;
DROP TRIGGER IF EXISTS set_link_applications_updated_at ON link_applications;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_tags_updated_at BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_role_applications_updated_at BEFORE UPDATE ON role_applications FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_links_updated_at BEFORE UPDATE ON links FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_link_applications_updated_at BEFORE UPDATE ON link_applications FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- 用户注册触发器 - 自动创建 profile 并同步角色到 JWT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email, NEW.id::text),
    'user'
  );
  
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"user"'::jsonb
  )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 带日志的清理函数
CREATE OR REPLACE FUNCTION cleanup_unverified_users_with_log()
RETURNS VOID AS $$
DECLARE
  deleted_count INTEGER := 0;
  deleted_ids TEXT[];
BEGIN
  WITH deleted_users AS (
    DELETE FROM auth.users
    WHERE 
      email_confirmed_at IS NULL 
      AND created_at < NOW() - INTERVAL '7 days'
      AND NOT EXISTS (
        SELECT 1 FROM auth.identities 
        WHERE identities.user_id = auth.users.id
      )
    RETURNING id::TEXT
  )
  SELECT COUNT(*), array_agg(id) INTO deleted_count, deleted_ids FROM deleted_users;

  IF deleted_count > 0 THEN
    INSERT INTO user_cleanup_logs (deleted_count, deleted_user_ids)
    VALUES (deleted_count, deleted_ids);
  END IF;

  RAISE NOTICE 'Cleaned up % unverified users', deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 原子递增浏览量（避免竞态条件）
CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE posts
  SET view_count = view_count + 1
  WHERE id = post_id
  RETURNING view_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 通用原子递增函数（支持 view_count / like_count，fallback 场景使用）
-- 使用 PostgreSQL 原生 SET col = col + 1 消除 SELECT→UPDATE 竞争窗口
CREATE OR REPLACE FUNCTION increment_count_atomic(p_post_id UUID, p_column TEXT)
RETURNS INTEGER AS $$
DECLARE
  result INTEGER;
BEGIN
  IF p_column = 'view_count' THEN
    UPDATE posts SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = p_post_id
    RETURNING view_count INTO result;
  ELSIF p_column = 'like_count' THEN
    UPDATE posts SET like_count = COALESCE(like_count, 0) + 1
    WHERE id = p_post_id
    RETURNING like_count INTO result;
  ELSE
    RAISE EXCEPTION 'Invalid column: %', p_column;
  END IF;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 原子递增点赞数（避免竞态条件）
CREATE OR REPLACE FUNCTION increment_like_count(post_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE posts
  SET like_count = like_count + 1
  WHERE id = post_id
  RETURNING like_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 清理过期日志函数
CREATE OR REPLACE FUNCTION cleanup_expired_logs()
RETURNS VOID AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  DELETE FROM user_cleanup_logs
  WHERE cleanup_time < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  IF deleted_count > 0 THEN
    RAISE NOTICE 'Cleaned up % expired cleanup logs older than 30 days', deleted_count;
  END IF;
  
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  IF deleted_count > 0 THEN
    RAISE NOTICE 'Cleaned up % expired audit logs older than 30 days', deleted_count;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 定时任务设置
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup_unverified_users') THEN
      PERFORM cron.schedule(
        'cleanup_unverified_users',
        '0 2 * * *',
        'SELECT cleanup_unverified_users_with_log();'
      );
      RAISE NOTICE 'Scheduled cleanup_unverified_users task daily at 2:00 AM';
    END IF;
  END IF;
END $$;

-- 同步角色到 JWT app_metadata
CREATE OR REPLACE FUNCTION sync_role_to_jwt()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(NEW.role)
  )
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_profile_role_updated ON profiles;
CREATE TRIGGER on_profile_role_updated
  AFTER UPDATE OF role ON profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION sync_role_to_jwt();

-- 初始化已有用户的 JWT 角色
DO $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(p.role)
  )
  FROM profiles p
  WHERE auth.users.id = p.user_id
    AND (
      auth.users.raw_app_meta_data IS NULL
      OR auth.users.raw_app_meta_data->>'role' IS NULL
      OR auth.users.raw_app_meta_data->>'role' != p.role
    );

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated JWT role for % existing users', updated_count;
END $$;

-- ================================================
-- 第五步：优化全文搜索
-- ================================================

-- 创建中文分词优化函数
CREATE OR REPLACE FUNCTION zh_tsvector(text) 
RETURNS tsvector 
LANGUAGE sql 
IMMUTABLE 
AS $$
    SELECT setweight(to_tsvector('simple', coalesce($1, '')), 'A') ||
           setweight(to_tsvector('english', coalesce($1, '')), 'B');
$$;

-- 为 posts 表添加 fts 列
ALTER TABLE posts DROP COLUMN IF EXISTS fts;
ALTER TABLE posts ADD COLUMN fts tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(content, '')), 'C')
) STORED;

-- 创建 GIN 索引
DROP INDEX IF EXISTS idx_posts_fts;
DROP INDEX IF EXISTS idx_posts_fts_gin;
CREATE INDEX idx_posts_fts_gin ON posts USING GIN(fts);

-- 为 comments 表添加 fts 列
ALTER TABLE comments DROP COLUMN IF EXISTS fts;
ALTER TABLE comments ADD COLUMN fts tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(content, '')), 'A')
) STORED;

-- 为评论表创建 GIN 索引
DROP INDEX IF EXISTS idx_comments_fts_gin;
CREATE INDEX idx_comments_fts_gin ON comments USING GIN(fts);

-- 创建搜索函数
CREATE OR REPLACE FUNCTION search_posts(query_text TEXT, max_results INT DEFAULT 50)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    featured_image TEXT,
    author_id UUID,
    category_id UUID,
    status TEXT,
    view_count INT,
    like_count INT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    rank REAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.featured_image,
        p.author_id,
        p.category_id,
        p.status,
        p.view_count,
        p.like_count,
        p.created_at,
        p.updated_at,
        ts_rank(p.fts, plainto_tsquery('simple', query_text)) AS rank
    FROM posts p
    WHERE p.status = 'published'
      AND p.fts @@ plainto_tsquery('simple', query_text)
    ORDER BY rank DESC, p.created_at DESC
    LIMIT max_results;
END;
$$;

-- ================================================
-- 第六步：启用 RLS 并创建策略
-- ================================================

-- 启用所有表的 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cleanup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_applications ENABLE ROW LEVEL SECURITY;

-- profiles 表策略
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all profiles"
  ON profiles FOR ALL USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role = 'admin'
  ));

-- categories 表策略
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Admin and editor can manage categories" ON categories;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Admin and editor can manage categories"
  ON categories FOR ALL USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role IN ('admin', 'editor')
  ));

-- tags 表策略
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON tags;
DROP POLICY IF EXISTS "Admin and editor can manage tags" ON tags;

CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT USING (true);

CREATE POLICY "Admin and editor can manage tags"
  ON tags FOR ALL USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role IN ('admin', 'editor')
  ));

-- posts 表策略
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Users can view their own draft posts" ON posts;
DROP POLICY IF EXISTS "Author can create posts" ON posts;
DROP POLICY IF EXISTS "Author can update their own posts" ON posts;
DROP POLICY IF EXISTS "Author can delete their own posts" ON posts;
DROP POLICY IF EXISTS "Admin can manage all posts" ON posts;

CREATE POLICY "Published posts are viewable by everyone"
  ON posts FOR SELECT USING (status = 'published');

CREATE POLICY "Users can view their own draft posts"
  ON posts FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = author_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Author can create posts"
  ON posts FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = author_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Author can update their own posts"
  ON posts FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = author_id AND p.user_id = auth.uid())
    OR auth.uid() IN (SELECT p.user_id FROM profiles p WHERE p.role IN ('admin', 'editor'))
  );

CREATE POLICY "Author can delete their own posts"
  ON posts FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = author_id AND p.user_id = auth.uid())
    OR auth.uid() IN (SELECT p.user_id FROM profiles p WHERE p.role IN ('admin', 'editor'))
  );

CREATE POLICY "Admin can manage all posts"
  ON posts FOR ALL USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role = 'admin'
  ));

-- post_tags 表策略
DROP POLICY IF EXISTS "Post tags are viewable with posts" ON post_tags;
DROP POLICY IF EXISTS "Author can manage post tags for their posts" ON post_tags;

CREATE POLICY "Post tags are viewable with posts"
  ON post_tags FOR SELECT USING (EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_tags.post_id AND posts.status = 'published'
  ));

CREATE POLICY "Author can manage post tags for their posts"
  ON post_tags FOR ALL USING (
    EXISTS (
      SELECT 1 FROM posts
      JOIN profiles p ON p.id = posts.author_id
      WHERE posts.id = post_tags.post_id AND p.user_id = auth.uid()
    )
    OR auth.uid() IN (SELECT p.user_id FROM profiles p WHERE p.role IN ('admin', 'editor'))
  );

-- comments 表策略
DROP POLICY IF EXISTS "Approved comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Users can view their own comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Admin can manage all comments" ON comments;

CREATE POLICY "Approved comments are viewable by everyone"
  ON comments FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own comments"
  ON comments FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = author_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = author_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = author_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Admin can manage all comments"
  ON comments FOR ALL USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role IN ('admin', 'editor')
  ));

-- media_files 表策略
DROP POLICY IF EXISTS "Media files are viewable by everyone" ON media_files;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON media_files;
DROP POLICY IF EXISTS "Admin can manage all media" ON media_files;

CREATE POLICY "Media files are viewable by everyone"
  ON media_files FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload media"
  ON media_files FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = uploaded_by AND p.user_id = auth.uid()
  ));

CREATE POLICY "Admin can manage all media"
  ON media_files FOR ALL USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role IN ('admin', 'editor')
  ));

DROP POLICY IF EXISTS "User delete own media files" ON media_files;

CREATE POLICY "User delete own media files"
  ON media_files FOR DELETE USING (uploaded_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- site_settings 表策略（修复版）
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON site_settings;
DROP POLICY IF EXISTS "Admin can manage site settings" ON site_settings;
DROP POLICY IF EXISTS "Public can view public settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated users can view extended settings" ON site_settings;
DROP POLICY IF EXISTS "Admin can manage all site settings" ON site_settings;

-- 允许公开访问非敏感配置
CREATE POLICY "Public can view public settings"
  ON site_settings FOR SELECT USING (
    key IN (
      'site_title',
      'site_description',
      'site_logo',
      'footer_text',
      'posts_per_page',
      'enable_comments',
      'enable_rss',
      'hero_banner_enabled',
      'hero_banner_title',
      'hero_banner_subtitle',
      'hero_banner_cta_text',
      'hero_banner_cta_url',
      'announcement_toast_enabled'
    )
  );

-- 允许认证用户查看更多配置
CREATE POLICY "Authenticated users can view extended settings"
  ON site_settings FOR SELECT TO authenticated USING (
    key NOT LIKE '%secret%' 
    AND key NOT LIKE '%password%'
    AND key NOT LIKE '%token%'
    AND key NOT LIKE '%api_key%'
  );

-- Admin 可以管理所有设置
CREATE POLICY "Admin can manage all site settings"
  ON site_settings FOR ALL USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role = 'admin'
  ));

-- favorites 表策略
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can create favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
DROP POLICY IF EXISTS "Admin can manage all favorites" ON favorites;

CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites"
  ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all favorites"
  ON favorites FOR ALL USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role = 'admin'
  ));

-- audit_logs 表策略
DROP POLICY IF EXISTS "Admin can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view their own logs" ON audit_logs;

CREATE POLICY "Admin can view all audit logs"
  ON audit_logs FOR SELECT TO authenticated USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role = 'admin'
  ));

CREATE POLICY "Users can view their own logs"
  ON audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid());

-- email_whitelist 表策略
DROP POLICY IF EXISTS "Admin can manage email whitelist" ON email_whitelist;
DROP POLICY IF EXISTS "Public can view active domains" ON email_whitelist;

CREATE POLICY "Admin can manage email whitelist"
  ON email_whitelist FOR ALL USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role = 'admin'
  ));

CREATE POLICY "Public can view active domains"
  ON email_whitelist FOR SELECT USING (is_active = true);

-- user_cleanup_logs 表策略
DROP POLICY IF EXISTS "Admin can manage cleanup logs" ON user_cleanup_logs;
DROP POLICY IF EXISTS "Public can view cleanup logs" ON user_cleanup_logs;

CREATE POLICY "Admin can manage cleanup logs"
  ON user_cleanup_logs FOR ALL USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role = 'admin'
  ));

CREATE POLICY "Admin can view cleanup logs"
  ON user_cleanup_logs FOR SELECT USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role = 'admin'
  ));

-- role_applications 表策略
DROP POLICY IF EXISTS "Users can view their own applications" ON role_applications;
DROP POLICY IF EXISTS "Authenticated users can create applications" ON role_applications;
DROP POLICY IF EXISTS "Admin can manage all applications" ON role_applications;

CREATE POLICY "Users can view their own applications"
  ON role_applications FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = user_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create applications"
  ON role_applications FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = user_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Admin can manage all applications"
  ON role_applications FOR ALL USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role = 'admin'
  ));

-- messages 表策略
DROP POLICY IF EXISTS "Users can submit messages" ON messages;
DROP POLICY IF EXISTS "Admin can view all messages" ON messages;
DROP POLICY IF EXISTS "Admin can update messages" ON messages;
DROP POLICY IF EXISTS "Admin can delete messages" ON messages;

CREATE POLICY "Users can submit messages"
  ON messages FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = user_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Admin can view all messages"
  ON messages FOR SELECT USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role = 'admin'
  ));

CREATE POLICY "Admin can update messages"
  ON messages FOR UPDATE USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role = 'admin'
  ));

CREATE POLICY "Admin can delete messages"
  ON messages FOR DELETE USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role = 'admin'
  ));

-- announcements 表策略
DROP POLICY IF EXISTS "Published announcements are viewable by everyone" ON announcements;
DROP POLICY IF EXISTS "Admin can manage all announcements" ON announcements;

CREATE POLICY "Published announcements are viewable by everyone"
  ON announcements FOR SELECT USING (is_published = true);

CREATE POLICY "Admin can manage all announcements"
  ON announcements FOR ALL USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role = 'admin'
  ));

-- links 表策略
DROP POLICY IF EXISTS "Active links are viewable by everyone" ON links;
DROP POLICY IF EXISTS "Admin can manage all links" ON links;

CREATE POLICY "Active links are viewable by everyone"
  ON links FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage all links"
  ON links FOR ALL USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role IN ('admin', 'editor')
  ));

-- link_applications 表策略
DROP POLICY IF EXISTS "Authenticated users can create link applications" ON link_applications;
DROP POLICY IF EXISTS "Admin can view all link applications" ON link_applications;
DROP POLICY IF EXISTS "Admin can update link applications" ON link_applications;
DROP POLICY IF EXISTS "Admin can delete link applications" ON link_applications;

CREATE POLICY "Authenticated users can create link applications"
  ON link_applications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can view all link applications"
  ON link_applications FOR SELECT USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role IN ('admin', 'editor')
  ));

CREATE POLICY "Admin can update link applications"
  ON link_applications FOR UPDATE USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role IN ('admin', 'editor')
  )) WITH CHECK (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role IN ('admin', 'editor')
  ));

CREATE POLICY "Admin can delete link applications"
  ON link_applications FOR DELETE USING (auth.uid() IN (
    SELECT p.user_id FROM profiles p WHERE p.role IN ('admin', 'editor')
  ));

-- 权限授予
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_cleanup_logs TO anon, authenticated;

-- ================================================
-- 第七步：初始化数据
-- ================================================

-- 初始化站点设置
INSERT INTO site_settings (key, value, description) 
VALUES 
  ('site_title', 'YN Blog', '站点标题'),
  ('site_description', '一个现代化的博客平台', '站点描述'),
  ('site_author', 'YN Team', '站点作者'),
  ('posts_per_page', '10', '每页文章数量')
ON CONFLICT (key) DO NOTHING;

-- 插入初始白名单域名
INSERT INTO email_whitelist (domain, description) 
VALUES 
  ('gmail.com', 'Google邮箱'),
  ('qq.com', '腾讯QQ邮箱'),
  ('163.com', '网易邮箱'),
  ('126.com', '网易126邮箱'),
  ('outlook.com', '微软Outlook邮箱'),
  ('hotmail.com', '微软Hotmail邮箱'),
  ('icloud.com', 'Apple iCloud邮箱')
ON CONFLICT (domain) DO NOTHING;

-- ================================================
-- 第八步：批量评论计数 RPC（优化 N+1 查询）
-- 替代对每篇文章单独查询评论数，使用单次 GROUP BY 查询
-- ================================================
CREATE OR REPLACE FUNCTION get_comment_counts(post_ids UUID[])
  RETURNS TABLE(post_id UUID, count BIGINT)
  LANGUAGE SQL
  SECURITY DEFINER SET search_path = ''
  AS $$
    SELECT c.post_id, COUNT(*)::BIGINT
    FROM public.comments c
    WHERE c.post_id = ANY(post_ids)
      AND c.status = 'approved'
    GROUP BY c.post_id;
  $$;

-- 注意: favorites 表的 UNIQUE(user_id, post_id) 约束已在建表时定义（第 123 行），
--       此处无需重复添加。如需在已有数据库上新增约束，请单独执行迁移脚本。

-- ================================================
-- 完成验证
-- ================================================
SELECT 'Database initialization complete!' AS status,
       'All tables, functions, triggers, and policies are created' AS detail;
