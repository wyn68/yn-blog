'use client';

import { useState } from 'react';
import { updateSettings } from '@/actions/settings';
import { useSettings } from '@/hooks/admin';
import { useToast } from '@/components/ui/Toast';
import { SettingsField, SettingsCard } from '@/components/admin/settings/SettingsField';
import { SETTINGS_KEYS } from '@/lib/settings';
import { Settings as SettingsIcon } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading, getSetting } = useSettings();
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const newSettings: Record<string, string> = {};

    formData.forEach((value, key) => {
      newSettings[key] = String(value);
    });

    try {
      await updateSettings(formData);
      success('设置保存成功', '站点设置已更新');
    } catch {
      error('保存失败', '设置更新失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="加载设置中..." />;
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-6 h-6" />
          <h1 className="text-2xl font-bold">站点设置</h1>
        </div>
        <p className="text-muted-foreground">配置博客站点信息</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <SettingsCard title="基本信息">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField
              label="站点名称"
              name={SETTINGS_KEYS.SITE_TITLE}
              defaultValue={getSetting(SETTINGS_KEYS.SITE_TITLE, 'YN Blog')}
            />
            <SettingsField
              label="站点作者"
              name={SETTINGS_KEYS.SITE_AUTHOR}
              defaultValue={getSetting(SETTINGS_KEYS.SITE_AUTHOR, 'YN Team')}
            />
            <SettingsField
              label="站点描述"
              name={SETTINGS_KEYS.SITE_DESCRIPTION}
              type="textarea"
              defaultValue={getSetting(SETTINGS_KEYS.SITE_DESCRIPTION, '')}
              className="md:col-span-2"
            />
          </div>
        </SettingsCard>

        <SettingsCard title="首页 Banner 设置">
          <div className="space-y-4">
            <SettingsField
              label="Banner 标题"
              name={SETTINGS_KEYS.BANNER_TITLE}
              defaultValue={getSetting(SETTINGS_KEYS.BANNER_TITLE, 'YN Blog')}
            />
            <SettingsField
              label="Banner 副标题"
              name={SETTINGS_KEYS.BANNER_SUBTITLE}
              defaultValue={getSetting(SETTINGS_KEYS.BANNER_SUBTITLE, '记录技术、设计与灵感')}
            />
            <SettingsField
              label="Banner 标签"
              name={SETTINGS_KEYS.BANNER_TAG}
              defaultValue={getSetting(SETTINGS_KEYS.BANNER_TAG, 'Personal Blog')}
            />
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-sm text-muted-foreground mb-4">封面图配置（支持最多 3 张轮播图）</p>
              <div className="space-y-4">
                <SettingsField
                  label="封面图 1 URL"
                  name={SETTINGS_KEYS.BANNER_IMAGE_1}
                  defaultValue={getSetting(SETTINGS_KEYS.BANNER_IMAGE_1, '')}
                  placeholder="https://example.com/banner1.jpg"
                />
                <SettingsField
                  label="封面图 2 URL"
                  name={SETTINGS_KEYS.BANNER_IMAGE_2}
                  defaultValue={getSetting(SETTINGS_KEYS.BANNER_IMAGE_2, '')}
                  placeholder="https://example.com/banner2.jpg"
                />
                <SettingsField
                  label="封面图 3 URL"
                  name={SETTINGS_KEYS.BANNER_IMAGE_3}
                  defaultValue={getSetting(SETTINGS_KEYS.BANNER_IMAGE_3, '')}
                  placeholder="https://example.com/banner3.jpg"
                />
              </div>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="SEO 设置">
          <div className="space-y-4">
            <SettingsField
              label="SEO 标题"
              name={SETTINGS_KEYS.SEO_TITLE}
              defaultValue={getSetting(SETTINGS_KEYS.SEO_TITLE, '')}
            />
            <SettingsField
              label="SEO 描述"
              name={SETTINGS_KEYS.SEO_DESCRIPTION}
              type="textarea"
              defaultValue={getSetting(SETTINGS_KEYS.SEO_DESCRIPTION, '')}
            />
            <SettingsField
              label="每页文章数"
              name={SETTINGS_KEYS.POSTS_PER_PAGE}
              type="number"
              defaultValue={getSetting(SETTINGS_KEYS.POSTS_PER_PAGE, '10')}
              min="1"
              max="50"
            />
          </div>
        </SettingsCard>

        <SettingsCard title="社交链接">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField
              label="Twitter"
              name={SETTINGS_KEYS.SOCIAL_TWITTER}
              defaultValue={getSetting(SETTINGS_KEYS.SOCIAL_TWITTER, '')}
              placeholder="https://twitter.com/..."
            />
            <SettingsField
              label="GitHub"
              name={SETTINGS_KEYS.SOCIAL_GITHUB}
              defaultValue={getSetting(SETTINGS_KEYS.SOCIAL_GITHUB, '')}
              placeholder="https://github.com/..."
            />
            <SettingsField
              label="邮箱联系"
              name={SETTINGS_KEYS.SOCIAL_EMAIL}
              defaultValue={getSetting(SETTINGS_KEYS.SOCIAL_EMAIL, 'admin@ynpro.top')}
              placeholder="admin@example.com"
            />
          </div>
        </SettingsCard>

        <SettingsCard title="媒体管理">
          <div className="space-y-4">
            <SettingsField
              label="启用媒体上传"
              name={SETTINGS_KEYS.MEDIA_UPLOAD_ENABLED}
              type="checkbox"
              defaultValue={getSetting(SETTINGS_KEYS.MEDIA_UPLOAD_ENABLED, 'true')}
              description="开启后，管理员和编辑可以在媒体管理页面上传新文件"
            />
          </div>
        </SettingsCard>

        <SettingsCard title="公告设置">
          <div className="space-y-4">
            <SettingsField
              label="启用公告弹窗提醒"
              name={SETTINGS_KEYS.ANNOUNCEMENT_TOAST_ENABLED}
              type="checkbox"
              defaultValue={getSetting(SETTINGS_KEYS.ANNOUNCEMENT_TOAST_ENABLED, 'true')}
              description="开启后，前台右上角会弹出最新公告的弹窗提醒"
            />
          </div>
        </SettingsCard>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '保存中...' : '保存设置'}
        </button>
      </form>
    </div>
  );
}