import { createClient } from '@/lib/supabase';
import { getUserEmails } from '@/actions/users';
import { hasRole, type Role } from '@/lib/role';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/users/[id]
 * 获取指定用户的详细信息（仅管理员可访问）。
 * 使用与 Server Actions 一致的角色检查模式。
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: currentProfile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', session.user.id)
    .single();

  if (profileError || !currentProfile) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 使用统一的 hasRole 函数，与 Server Actions 保持一致
  if (!hasRole(currentProfile.role as Role, 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const emailMap = await getUserEmails([profile.user_id]);

  return NextResponse.json({
    id: profile.id,
    username: profile.username,
    email: emailMap.get(profile.user_id) || '-',
    bio: profile.bio,
    website: profile.website,
    role: profile.role,
    created_at: profile.created_at,
  });
}