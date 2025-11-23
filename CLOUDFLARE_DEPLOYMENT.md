# 🚀 Cloudflare Pages 部署指南

本指南将帮助你将 Next.js 作品集项目部署到 Cloudflare Pages。

## 📋 前置要求

- [x] Cloudflare 账户（免费）
- [x] GitHub/GitLab 仓库（推荐）或本地项目
- [x] 项目已在本地测试通过

## 方法一：通过 Git 自动部署（推荐）⭐

### 1. 准备 Git 仓库

```bash
# 如果还没有初始化 Git
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub/GitLab
git remote add origin https://github.com/yourusername/high-end-portfolio.git
git push -u origin main
```

### 2. 连接到 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在左侧导航栏选择 **Workers & Pages**
3. 点击 **Create application** → **Pages** → **Connect to Git**
4. 授权 Cloudflare 访问你的 GitHub/GitLab 账户
5. 选择 `high-end-portfolio` 仓库

### 3. 配置构建设置

在 Cloudflare 设置页面中使用以下配置：

| 设置项 | 值 |
|--------|-----|
| **Production branch** | `main` |
| **Framework preset** | `Next.js` |
| **Build command** | `npm run build` |
| **Build output directory** | `.next` |
| **Root directory** | `/` (留空) |
| **Node version** | `20` 或 `latest` |

### 4. 环境变量设置

点击 **Environment variables** 添加必要的环境变量：

```bash
NEXT_PUBLIC_SITE_URL=https://yourportfolio.pages.dev
NEXT_PUBLIC_SITE_NAME=Akiwayne's Portfolio
NODE_VERSION=20.0.0
```

> 💡 参考 `.env.example` 文件添加其他需要的变量

### 5. 部署

点击 **Save and Deploy**，Cloudflare 将自动：

- 拉取代码
- 安装依赖
- 运行构建
- 部署到全球 CDN

部署通常需要 2-5 分钟。

---

## 方法二：通过命令行部署（Wrangler CLI）

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
# 或
npx wrangler --version
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

这将打开浏览器进行身份验证。

### 3. 构建项目

```bash
npm run build
```

### 4. 部署到 Cloudflare Pages

```bash
npx wrangler pages deploy .next --project-name=high-end-portfolio
```

首次部署会提示创建项目，输入 `y` 确认。

---

## 方法三：通过拖拽部署（适合快速测试）

### 1. 构建项目

```bash
npm run build
```

### 2. 手动上传

1. 访问 [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
2. 点击 **Create a project** → **Upload assets**
3. 将 `.next` 文件夹拖拽到上传区域
4. 输入项目名称并点击 **Deploy site**

> ⚠️ **注意**：Next.js 使用服务器功能时，推荐使用方法一或二。

---

## 🔧 Next.js 特殊配置

### 支持 Next.js 16.x 的高级功能

创建 `wrangler.toml` 文件以支持 Node.js 兼容性：

```toml
name = "high-end-portfolio"
compatibility_date = "2024-11-21"
pages_build_output_dir = ".next"

[env.production]
vars = { NODE_VERSION = "20" }

# 支持 Edge Runtime
compatibility_flags = ["nodejs_compat"]
```

### 优化 next.config.ts

确保 `next.config.ts` 包含以下配置：

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 👈 静态导出（如果不使用服务器功能）
  // 或使用 Edge Runtime
  // experimental: {
  //   runtime: 'edge',
  // },
  images: {
    unoptimized: true, // Cloudflare 有自己的图片优化
  },
};

export default nextConfig;
```

> 💡 **提示**：如果你的项目使用了 API 路由或服务器组件，不要使用 `output: 'export'`

---

## 🌐 自定义域名

### 添加自定义域名

1. 在 Cloudflare Pages 项目中，进入 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入你的域名（例如：`portfolio.com`）
4. Cloudflare 会自动配置 DNS（如果域名已在 Cloudflare）

### 如果域名不在 Cloudflare

1. 在域名注册商处添加 CNAME 记录：

   ```
   www CNAME high-end-portfolio.pages.dev
   ```

2. 等待 DNS 传播（可能需要几分钟到几小时）

---

## 📊 部署后检查清单

- [ ] 访问部署的 URL 确认网站正常运行
- [ ] 检查所有页面导航是否正常
- [ ] 测试响应式设计（移动端、平板、桌面）
- [ ] 验证图片和资源加载
- [ ] 测试表单提交功能（如果有）
- [ ] 检查 SEO 元数据
- [ ] 验证主题切换功能
- [ ] 测试动画和交互效果

---

## 🚨 常见问题

### 问题 1：构建失败 - "Module not found"

**解决方案**：

```bash
# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 问题 2：部署后页面空白

**原因**：Next.js 环境变量未正确配置

**解决方案**：

- 确保所有 `NEXT_PUBLIC_*` 变量在 Cloudflare 中设置
- 重新部署项目

### 问题 3：图片不显示

**解决方案**：
在 `next.config.ts` 中添加：

```typescript
images: {
  unoptimized: true,
}
```

### 问题 4：API 路由返回 404

**原因**：使用了 `output: 'export'` 但有 API 路由

**解决方案**：

- 移除 `output: 'export'` 配置
- 或将 API 路由迁移到 Cloudflare Workers

---

## 🔄 持续集成/部署 (CI/CD)

使用 Git 方法部署后，每次推送到主分支都会自动触发部署：

```bash
git add .
git commit -m "Update portfolio content"
git push origin main
```

Cloudflare 会自动：

1. 检测到代码变更
2. 运行构建
3. 部署新版本
4. 提供预览 URL

---

## 📈 性能优化建议

1. **启用 Cloudflare 图片优化**
   - 在 Cloudflare Dashboard → Speed → Optimization
   - 启用 "Polish" 和 "Mirage"

2. **配置缓存规则**
   - 静态资源（CSS、JS、图片）使用长期缓存
   - HTML 使用短期缓存

3. **使用 Cloudflare 分析**
   - 启用 Web Analytics 追踪访问数据

---

## 📚 相关资源

- [Cloudflare Pages 官方文档](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

---

## 💬 需要帮助？

如果遇到问题：

1. 查看 Cloudflare Pages 部署日志
2. 检查 [Cloudflare Community](https://community.cloudflare.com/)
3. 参考本项目的 `README.md`

---

**祝你部署顺利！🎉**
