import FadeIn from '@/components/FadeIn';
import { FileText, Shield, Clock, Users, Lock, Database } from 'lucide-react';
import { getSetting } from '@/services/settings';

export default async function PrivacyPage() {
  let email = 'admin@ynpro.top';
  try {
    const settingEmail = await getSetting('social_email');
    if (settingEmail) email = settingEmail;
  } catch {
    // 获取设置失败时使用默认邮箱
  }
  return (
    <FadeIn className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <article className="prose prose-gray max-w-none">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">隐私政策</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            最后更新：2026年6月5日
          </p>
        </header>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              我们的承诺
            </span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            YN Blog 重视您的隐私。我们致力于保护您的个人信息安全，并确保您对自己的数据拥有控制权。
            本隐私政策说明了我们如何收集、使用、存储和保护您的信息。
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            <span className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              我们收集的信息
            </span>
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">个人身份信息</h3>
              <p className="text-sm">
                当您注册账户或登录时，我们可能收集您的电子邮件地址、用户名和密码（加密存储）。
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">使用数据</h3>
              <p className="text-sm">
                我们会自动收集您访问网站的信息，包括您的IP地址、浏览器类型、访问时间和页面浏览记录。
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Cookie数据</h3>
              <p className="text-sm">
                我们使用cookies来记住您的登录状态、偏好设置，并分析网站流量。
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              我们如何使用您的信息
            </span>
          </h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>提供和维护网站服务</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>改进和优化用户体验</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>发送重要通知和更新</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>保护网站安全和防止欺诈</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>分析网站使用情况以进行改进</span>
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            <span className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              信息安全
            </span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            我们采用行业标准的安全措施来保护您的个人信息，包括加密传输（HTTPS）、密码哈希存储和访问控制。
            然而，请注意，没有任何互联网传输或电子存储方法是100%安全的，我们不能保证绝对的安全性。
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Cookie 政策
            </span>
          </h2>
          <div className="bg-muted rounded-lg p-6">
            <h3 className="font-medium text-foreground mb-3">必要 Cookies</h3>
            <p className="text-sm text-muted-foreground mb-4">
              这些 cookies 对于网站的基本功能是必需的，例如用户认证和会话管理。
              它们无法被禁用。
            </p>
            <h3 className="font-medium text-foreground mb-3">分析 Cookies</h3>
            <p className="text-sm text-muted-foreground mb-4">
              这些 cookies 帮助我们了解访客如何与网站互动，收集和报告信息以改善用户体验。
            </p>
            <h3 className="font-medium text-foreground mb-3">您的选择</h3>
            <p className="text-sm text-muted-foreground">
              您可以通过浏览器设置管理或删除 cookies。
              但请注意，禁用某些 cookies 可能会影响网站功能。
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-foreground mb-4">您的权利</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>访问您的个人信息</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>更正或更新您的信息</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>删除您的账户和数据</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>限制或反对数据处理</span>
            </li>
          </ul>
        </section>

        <section className="bg-muted rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">联系我们</h2>
          <p className="text-muted-foreground">
            如果您对本隐私政策有任何疑问或关注，请通过以下方式联系我们：
          </p>
          <a
            href={`mailto:${email}`}
            className="text-muted-foreground mt-2 font-medium hover:text-primary transition-colors"
          >
            电子邮件：{email}
          </a>
        </section>
      </article>
    </FadeIn>
  );
}