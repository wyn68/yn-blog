# YN Blog - 现代化博客平台

一个基于 **Next.js 15** 和 **Supabase** 构建的功能完整的现代化博客系统，具备完整的前后台功能、评论系统、SEO 优化、深色模式和响应式设计。

---

## 📚 目录

- [项目介绍](#项目介绍)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [详细部署指南](#详细部署指南)
- [常见问题](#常见问题)
- [开发指南](#开发指南)

---

## 🌟 项目介绍

YN Blog 是一个面向小白用户的开箱即用博客系统，你不需要写一行代码就能拥有一个功能完整的个人博客！

### 适合人群

- ✅ 想搭建个人博客的技术爱好者
- ✅ 想学习 Next.js 和 Supabase 的开发者
- ✅ 需要一个轻量级 CMS 的内容创作者

---

## ✨ 功能特性

### 🏠 前台功能（访客使用）

| 功能 | 描述 |
|------|------|
| 首页展示 | 最新文章、热门文章、分类导航、标签云 |
| 文章详情 | Markdown 渲染、阅读进度、目录导航 |
| 评论系统 | 支持嵌套回复、登录后评论、评论审核 |
| 全文搜索 | 快速搜索文章标题和内容 |
| 分类/标签 | 按分类或标签筛选文章 |
| 关于页面 | 站点介绍页面 |
| 作者主页 | 查看作者信息和文章 |
| SEO 优化 | Meta Tags、Open Graph、Twitter Card |
| 响应式设计 | 手机、平板、电脑完美适配 |
| 深色模式 | 支持深色/浅色主题切换 |
| 页面动画 | 平滑的页面过渡效果 |
| 回到顶部 | 快速滚动到页面顶部 |

### 🎛️ 后台管理（管理员/作者使用）

| 功能 | 描述 |
|------|------|
| 仪表盘 | 数据统计和概览 |
| 文章管理 | 新增、编辑、删除、发布/草稿、预览 |
| 分类管理 | 增删改查文章分类 |
| 标签管理 | 增删改查文章标签 |
| 评论管理 | 审核、通过、隐藏、删除评论 |
| 媒体管理 | 图片上传、列表查看、删除 |
| 用户管理 | 用户列表、角色管理 |
| 邮箱白名单 | 限制注册邮箱域名 |
| 站点设置 | 网站信息、SEO 配置、横幅设置 |
| 清理日志 | 查看用户清理记录 |
| 消息管理 | 查看和管理用户留言 |
| 角色申请 | 处理用户的角色升级申请 |
| 公告管理 | 发布和管理站点公告 |

### 👥 用户系统

| 功能 | 描述 |
|------|------|
| 用户注册 | 邮箱验证注册 |
| 用户登录 | 邮箱密码登录 |
| 个人中心 | 查看和编辑个人信息 |
| 用户设置 | 头像、简介、网站链接等 |
| 权限角色 | Admin、Editor、Author、User |

### 🔒 安全特性

| 功能 | 描述 |
|------|------|
| Supabase RLS | 行级安全策略，数据隔离 |
| 中间件验证 | 路由权限保护 |
| XSS 防护 | 输入输出安全过滤 |
| SQL 注入防护 | 参数化查询 |
| 缓存机制 | 合理的数据缓存 |

---

## 🛠️ 技术栈

### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 15 | React 框架，支持服务端渲染 |
| React | 19 | 用户界面库 |
| TypeScript | 5 | 类型安全的 JavaScript |
| Tailwind CSS | 3 | 实用优先的 CSS 框架 |
| Framer Motion | 12 | 动画库 |
| Lucide React | 1 | 图标库 |
| React Markdown | 10 | Markdown 渲染 |

### 后端服务

| 服务 | 用途 |
|------|------|
| Supabase Auth | 用户认证 |
| Supabase Database | PostgreSQL 数据库 |
| Supabase Storage | 文件存储（图片等） |

---

## 🚀 快速开始（5分钟上手）

### 前置条件

在开始之前，你需要准备以下工具：

1. **Node.js** (版本 18.17 或更高)
2. **npm** (通常随 Node.js 一起安装) 或 **pnpm** / **yarn**
3. **Git** (用于代码管理)
4. 一个 **Supabase** 账号（免费注册）

---

### 第一步：获取代码

有两种方式获取代码：

#### 方式一：从 GitHub 克隆（推荐）

```bash
git clone https://github.com/你的用户名/yn-blog.git
cd yn-blog
```

#### 方式二：直接下载 ZIP

1. 访问 GitHub 仓库
2. 点击「Code」→「Download ZIP」
3. 解压到你想要的目录
4. 用命令行进入目录

---

### 第二步：安装依赖

在项目根目录下运行：

```bash
npm install
```

如果安装过程很慢，可以使用国内镜像：

```bash
npm install --registry=https://registry.npmmirror.com
```

---

### 第三步：配置 Supabase

#### 3.1 注册 Supabase

1. 访问 [supabase.com](https://supabase.com)
2. 点击「Start your project」
3. 使用 GitHub 账号或邮箱注册登录

#### 3.2 创建新项目

1. 登录后点击「New Project」
2. 填写项目信息：
   - **Name**: 你的项目名称（例如：My Blog）
   - **Database Password**: 设置一个强密码（请记住它！）
   - **Region**: 选择离你最近的区域（例如：Singapore）
3. 点击「Create new project」
4. 等待项目初始化（约 2 分钟）

#### 3.3 获取项目凭据

项目创建好后：

1. 进入项目 dashboard
2. 点击左侧菜单的「Project Settings」→「API」
3. 你会看到两个重要信息：
   - **Project URL** (类似 `https://xxxxxx.supabase.co`)
   - **anon public** (一串很长的密钥)
   - **service_role secret** (另一个长密钥)

#### 3.4 配置环境变量

1. 在项目根目录找到 `.env.example` 文件
2. 复制一份，重命名为 `.env.local`
3. 打开 `.env.local`，填入你的信息：

```env
# 你的 Supabase 项目 URL
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co

# 你的 Supabase anon key
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥

# 你的 Supabase service role key（不要泄露！）
SUPABASE_SERVICE_ROLE_KEY=你的service密钥

# 你的网站地址（本地开发用 http://localhost:3000）
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

### 第四步：初始化数据库

#### 4.1 执行 SQL 脚本

1. 在 Supabase 项目中，点击左侧「SQL Editor」
2. 点击「New query」
3. 打开项目目录下的 `supabase/init.sql` 文件
4. 复制全部内容，粘贴到 SQL Editor 中
5. 点击「Run」执行（绿色的运行按钮）
6. 等待执行完成，你应该会看到「Database initialization complete!」

#### 4.2 创建存储桶

1. 点击左侧「Storage」
2. 点击「New bucket」
3. 填写信息：
   - **Name**: `media` (必须是这个名字！)
   - **Public bucket**: 打开这个开关（设为公开）
4. 点击「Create bucket」
5. 创建成功后，点击刚创建的「media」桶
6. 点击「Policies」标签页
7. 确保有以下策略（如果没有，点击「New policy」添加）：
   - 允许所有人读取（SELECT）
   - 允许认证用户写入（INSERT）
   - 允许认证用户更新（UPDATE）
   - 允许认证用户删除（DELETE）

#### 4.3 配置认证

1. 点击左侧「Authentication」→「Providers」
2. 找到「Email」，确保它是开启的
3. 点击「Email」展开设置：
   - **Confirm email**: 可以关闭（方便测试），生产环境建议开启
   - **Site URL**: 填入 `http://localhost:3000`
4. 点击「Save」

---

### 第五步：启动项目

现在一切准备就绪！在项目目录运行：

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)，你应该能看到博客首页了！🎉

---

### 第六步：创建管理员账号

#### 6.1 注册用户

1. 访问 [http://localhost:3000/register](http://localhost:3000/register)
2. 填写邮箱和密码注册
3. 登录进入

#### 6.2 升级为管理员

1. 回到 Supabase 项目
2. 点击左侧「Table Editor」
3. 找到 `profiles` 表
4. 找到你刚注册的用户记录
5. 找到 `role` 字段，把值改为 `admin`
6. 刷新博客页面，你现在是管理员了！

现在可以访问 [http://localhost:3000/admin](http://localhost:3000/admin) 进入后台管理。

---

## 📦 详细部署指南

### 推荐部署平台：Vercel（免费且简单）

#### 准备工作

1. 确保你的代码已经推送到 GitHub
2. 注册一个 [Vercel](https://vercel.com) 账号

#### 部署步骤

1. 访问 Vercel Dashboard
2. 点击「Add New」→「Project」
3. 选择你的 GitHub 仓库
4. 点击「Import」
5. 在配置页面：
   - **Project Name**: 起个名字（例如：my-awesome-blog）
   - **Framework Preset**: 应该会自动识别为 Next.js
   - **Root Directory**: 保持默认
   - **Environment Variables**: 点击「Add Environment Variable」
     - 添加 `NEXT_PUBLIC_SUPABASE_URL`
     - 添加 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - 添加 `SUPABASE_SERVICE_ROLE_KEY`
     - 添加 `NEXT_PUBLIC_SITE_URL`（例如：`https://your-blog.vercel.app`）
6. 点击「Deploy」
7. 等待约 2-3 分钟，部署完成！

#### 更新 Supabase 配置

部署成功后：

1. 回到 Supabase 项目
2. 点击「Authentication」→「URL Configuration」
3. 更新「Site URL」为你的 Vercel 域名
4. 在「Redirect URLs」中添加你的 Vercel 域名

---

## 🔐 Supabase RLS 策略详细配置指南

### 为什么需要 RLS 策略？

RLS (Row Level Security) 是 Supabase 提供的行级安全功能，它能确保：
- 用户只能访问和修改自己的数据
- 不同角色拥有不同的权限
- 防止未授权的数据访问

### 策略概述

本项目的 RLS 策略已经包含在 `supabase/init.sql` 文件中，执行该脚本即可自动创建所有策略。

---

### 📋 策略清单

#### 1. profiles 表（用户资料）

| 策略名称 | 权限 | 说明 |
|---------|------|------|
| `Public profiles are viewable by everyone` | SELECT | 所有人可以查看用户资料 |
| `Users can update their own profile` | UPDATE | 用户只能更新自己的资料 |
| `Admin can manage all profiles` | ALL | 管理员可以管理所有用户资料 |

#### 2. posts 表（文章）

| 策略名称 | 权限 | 说明 |
|---------|------|------|
| `Published posts are viewable by everyone` | SELECT | 所有人可以查看已发布的文章 |
| `Users can view their own draft posts` | SELECT | 用户可以查看自己的草稿文章 |
| `Author can create posts` | INSERT | 作者可以创建文章 |
| `Author can update their own posts` | UPDATE | 作者可以更新自己的文章 |
| `Author can delete their own posts` | DELETE | 作者可以删除自己的文章 |
| `Admin can manage all posts` | ALL | 管理员可以管理所有文章 |

#### 3. comments 表（评论）

| 策略名称 | 权限 | 说明 |
|---------|------|------|
| `Approved comments are viewable by everyone` | SELECT | 所有人可以查看已审核的评论 |
| `Users can view their own comments` | SELECT | 用户可以查看自己的所有评论 |
| `Authenticated users can create comments` | INSERT | 认证用户可以创建评论 |
| `Users can update their own comments` | UPDATE | 用户可以更新自己的评论 |
| `Admin can manage all comments` | ALL | 管理员可以管理所有评论 |

#### 4. media_files 表（媒体文件）

| 策略名称 | 权限 | 说明 |
|---------|------|------|
| `Media files are viewable by everyone` | SELECT | 所有人可以查看媒体文件 |
| `Authenticated users can upload media` | INSERT | 认证用户可以上传媒体文件 |
| `User delete own media files` | DELETE | 用户可以删除自己上传的媒体文件 |
| `Admin can manage all media` | ALL | 管理员可以管理所有媒体文件 |

#### 5. categories & tags 表（分类和标签）

| 策略名称 | 权限 | 说明 |
|---------|------|------|
| `Categories are viewable by everyone` | SELECT | 所有人可以查看分类 |
| `Admin and editor can manage categories` | ALL | 管理员和编辑可以管理分类 |
| `Tags are viewable by everyone` | SELECT | 所有人可以查看标签 |
| `Admin and editor can manage tags` | ALL | 管理员和编辑可以管理标签 |

#### 6. Storage 存储策略

##### 重要提示：关于 Storage 安全警告

在 Supabase Dashboard 的 Storage 页面，你可能会看到这样的警告：
> "Clients can list all files in this bucket"

**这个警告可以安全地忽略！** 原因：
- 本项目**不直接**从 Storage 桶读取文件列表
- 文件元数据存储在 `media_files` 数据库表中
- 通过 `media_files` 表的 RLS 策略控制访问
- Storage 桶只用于文件存储和公开访问

**建议操作：**
点击警告右侧的 **"Remove policy"** 按钮移除该策略，提升安全性。

##### Storage 桶配置

1. 创建名为 `media` 的存储桶
2. 设置为 **Public bucket**（公开访问）
3. 配置以下策略（最小化权限）：

| 策略名称 | 操作 | 条件 |
|---------|------|------|
| `Public Access` | SELECT | `true`（允许所有人读取） |
| `Authenticated Upload` | INSERT | `auth.role() = 'authenticated'` |
| `User Delete Own` | DELETE | `auth.uid() IN (SELECT user_id FROM profiles p JOIN media_files mf ON p.id = mf.uploaded_by WHERE mf.id = storage.filename())` |
| `Admin Delete` | DELETE | `auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('admin', 'editor'))` |

---

### 🛠️ 手动配置策略步骤

如果需要手动配置策略（而不是执行完整的 SQL 脚本），按以下步骤操作：

#### 步骤 1：进入 SQL Editor
1. 登录 Supabase Dashboard
2. 选择你的项目
3. 点击左侧菜单 **"SQL Editor"**
4. 点击 **"New query"**

#### 步骤 2：执行策略 SQL
将 `supabase/init.sql` 文件中从 **"第六步：启用 RLS 并创建策略"** 开始的内容复制并执行。

#### 步骤 3：验证策略
1. 点击左侧菜单 **"Authentication"** → **"Policies"**
2. 选择各个表，确认策略已创建
3. 测试权限是否按预期工作

---

### 🔍 验证策略是否生效

#### 方法 1：使用 Supabase Dashboard
1. 进入 **"Table Editor"**
2. 选择一个表
3. 点击 **"Policies"** 标签
4. 查看策略列表

#### 方法 2：使用 SQL 查询
```sql
-- 查看所有策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

#### 方法 3：实际测试
1. 使用普通用户账号登录
2. 尝试访问其他用户的数据
3. 确认被正确阻止

---

### ⚠️ 常见策略问题

#### Q1: 策略已创建但仍然无法访问数据？
**A:** 检查以下几点：
1. 确认 RLS 已启用（`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`）
2. 确认策略使用了正确的 `auth.uid()` 判断
3. 确认用户已登录并拥有有效的 JWT token

#### Q2: 如何临时禁用策略进行测试？
**A:** 使用以下 SQL：
```sql
-- 禁用特定表的 RLS
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- 重新启用
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

#### Q3: Storage 桶的策略和数据库策略有什么区别？
**A:** 
- **数据库策略**：控制对 `media_files` 表的访问（文件元数据）
- **Storage 策略**：控制对实际文件的上传/下载/删除
- 本项目使用 `service_role` 进行 Storage 操作，绕过 Storage 策略限制

---

### 📊 角色权限矩阵

| 功能 | User | Author | Editor | Admin |
|------|------|--------|--------|-------|
| 阅读已发布文章 | ✅ | ✅ | ✅ | ✅ |
| 创建文章 | ❌ | ✅ | ✅ | ✅ |
| 编辑自己的文章 | ❌ | ✅ | ✅ | ✅ |
| 编辑所有文章 | ❌ | ❌ | ✅ | ✅ |
| 删除自己的文章 | ❌ | ✅ | ✅ | ✅ |
| 删除所有文章 | ❌ | ❌ | ✅ | ✅ |
| 管理分类/标签 | ❌ | ❌ | ✅ | ✅ |
| 审核评论 | ❌ | ❌ | ✅ | ✅ |
| 管理用户 | ❌ | ❌ | ❌ | ✅ |
| 站点设置 | ❌ | ❌ | ❌ | ✅ |

---

## ❓ 常见问题

### 1. npm install 失败了怎么办？

**问题**：安装依赖时卡住或报错

**解决方法**：
1. 检查 Node.js 版本是否 >= 18.17
2. 删除 `node_modules` 文件夹和 `package-lock.json`
3. 再次运行 `npm install`
4. 如果还是慢，使用国内镜像：`npm install --registry=https://registry.npmmirror.com`

---

### 2. 数据库连接失败？

**错误信息**：`Failed to connect to Supabase` 或类似错误

**解决方法**：
1. 检查 `.env.local` 中的 URL 和 Key 是否正确
2. 确认没有多余的空格
3. 确认 Supabase 项目状态正常（不是暂停状态）
4. 检查网络连接

---

### 3. 图片上传失败？

**问题**：上传图片后显示不出来，或者报错

**解决方法**：
1. 确认 Storage 中有 `media` 桶
2. 确认桶是「Public」的
3. 检查 RLS 策略是否允许读写
4. 检查 `SUPABASE_SERVICE_ROLE_KEY` 是否正确

---

### 4. 评论无法提交？

**问题**：点击提交评论没反应或报错

**解决方法**：
1. 确认用户已登录
2. 检查数据库中 `comments` 表是否创建成功
3. 检查 RLS 策略是否正确配置
4. 查看浏览器控制台的错误信息

---

### 5. 后台管理页面无权限？

**问题**：访问 /admin 被重定向，或提示无权限

**解决方法**：
1. 确认已登录
2. 确认 `profiles` 表中你的 `role` 是 `admin`
3. 退出重新登录一次（让 JWT 更新）

---

### 6. 部署后图片无法加载？

**解决方法**：
1. 检查 `next.config.mjs` 中的 `images.remotePatterns` 配置
2. 确认 Supabase Storage 的 CORS 设置包含你的域名
3. 检查图片路径是否正确

---

### 7. 登录后跳回 localhost？

**解决方法**：
1. 确认 `NEXT_PUBLIC_SITE_URL` 环境变量设置正确
2. 在 Supabase 认证设置中更新「Site URL」为生产域名

---

## 👨‍💻 开发指南

### 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 运行代码检查 |
| `npm run test` | 运行所有测试 |

### 项目结构说明

```
yn-blog/
├── public/              # 静态资源（favicon等）
├── src/
│   ├── actions/         # Server Actions（服务端操作）
│   ├── app/             # Next.js App Router（页面路由）
│   ├── components/      # React 组件
│   │   ├── admin/       # 后台管理组件
│   │   ├── layout/      # 布局组件
│   │   └── ui/          # 基础 UI 组件
│   ├── constants/       # 常量定义
│   ├── contexts/        # React Context
│   ├── lib/             # 工具库
│   ├── repositories/    # 数据访问层
│   ├── services/        # 业务逻辑层
│   ├── test/            # 测试文件
│   ├── types/           # TypeScript 类型
│   └── middleware.ts    # Next.js 中间件
├── supabase/
│   └── init.sql         # 数据库初始化脚本
└── 配置文件...
```

### 权限角色说明

| 角色 | 权限 |
|------|------|
| **Admin** | 拥有所有权限，可以管理用户、设置等 |
| **Editor** | 可以管理文章、分类、标签、评论、媒体 |
| **Author** | 可以管理自己的文章、评论、媒体 |
| **User** | 普通用户，可以评论、收藏文章 |

---

## 📝 更新日志

### v1.0.0 (2026-06-04)

- ✨ 公告系统（Announcements）
- ✨ 用户留言系统（Messages）
- ✨ 角色申请系统（Role Applications）
- ✨ 清理日志保留策略
- 🚀 数据库初始化脚本合并优化
- 📚 README 文档更新为小白友好版本
- 🧹 项目清理：删除临时文件和旧文档

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 贡献流程

1. Fork 本仓库
2. 创建你的特性分支：`git checkout -b feature/awesome-feature`
3. 提交你的更改：`git commit -m 'Add some awesome feature'`
4. 推送到分支：`git push origin feature/awesome-feature`
5. 创建 Pull Request

---

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

## 💬 有问题？

如果遇到问题，可以：
1. 查看上面的「常见问题」部分
2. 提交 GitHub Issue
3. 联系开发者

---

## 🙏 致谢

感谢以下优秀的开源项目：

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide](https://lucide.dev)

---

## ❤️ 支持与赞助

如果您觉得这个项目对您有帮助，并且希望支持我继续维护和开发新功能，欢迎请我喝杯咖啡！您的每一份支持都是我前进的最大动力。

<div align="center">
    <img src="public/Alipay.jpg" alt="支付宝" width="200" height="200" style="margin-right: 20px;"/>
    <img src="public/WeChat.jpg" alt="微信" width="200" height="200"/>
    <br />
    <span style="color: #999; font-size: 14px;">(左) 支付宝 / (右) 微信</span>
</div>

---

**如果这个项目对你有帮助，请给个 Star ⭐ 支持一下！**

---

*Built with ❤️*
