---
description: 如何部署项目到 Cloudflare Pages
---

# 部署到 Cloudflare Pages

本项目支持两种部署方式：通过 GitHub 自动部署（推荐）和本地手动部署。

## 方案 A：通过 GitHub 自动部署（推荐）

### 1. 在 Cloudflare Dashboard 中配置

1. **登录 Cloudflare Dashboard**
   - 访问 <https://dash.cloudflare.com/>
   - 进入 **Workers & Pages** 部分

2. **找到你的项目**
   - 点击你的项目 `high-end-portfolio`

3. **修改构建设置**
   - 进入 **Settings** → **Builds & deployments**
   - 配置如下：

     ```
     Framework preset: Next.js
     Build command: npm run build:cf
     Build output directory: .open-next/assets
     Root directory: /
     Node.js version: 20
     ```

4. **环境变量（如果需要）**
   - 在 **Settings** → **Environment variables** 中添加
   - 例如：

     ```
     NEXT_PUBLIC_SITE_URL=https://your-site.pages.dev
     NEXT_PUBLIC_SITE_NAME=Your Portfolio
     ```

5. **保存并重新部署**
   - 保存设置
   - 推送新的 commit 到 GitHub 主分支
   - Cloudflare 会自动触发构建和部署

### 2. 推送代码触发部署

```bash
git add .
git commit -m "Fix: Update Cloudflare Pages configuration"
git push origin main
```

部署会自动开始，你可以在 Cloudflare Dashboard 中查看部署日志。

---

## 方案 B：本地手动部署

### 前置要求

1. **安装依赖**

   ```bash
   npm install
   ```

2. **登录 Wrangler**

   ```bash
   npx wrangler login
   ```

   这会打开浏览器进行授权。

### 部署步骤

1. **构建项目**

   ```bash
   npm run build:cf
   ```

   这会使用 OpenNext Cloudflare adapter 构建项目，输出到 `.open-next/assets` 目录。

2. **部署到 Cloudflare Pages**

   ```bash
   npm run deploy
   ```

   或者直接使用：

   ```bash
   npx wrangler pages deploy .open-next/assets --project-name=high-end-portfolio
   ```

3. **查看部署结果**
   部署成功后，命令行会显示你的网站 URL。

---

## 常见问题

### Q1: 部署失败，提示 "Workers-specific command in a Pages project"

**原因**：使用了 `wrangler deploy` 而不是 `wrangler pages deploy`。

**解决方案**：

- 在 Cloudflare Dashboard 中，将部署命令改为 `npm run build:cf` 或 `npm run build`
- 本地部署时使用 `npm run deploy` 而不是 `npx wrangler deploy`

### Q2: 构建成功但页面显示 404

**原因**：构建输出目录配置错误。

**解决方案**：

- 确保 Cloudflare Dashboard 中的 "Build output directory" 设置为 `.open-next/assets`
- 或者如果使用标准 Next.js 构建，设置为 `.next`

### Q3: 图片无法显示

**原因**：Next.js 的图片优化在 Cloudflare Pages 上需要特殊配置。

**解决方案**：

- 已在 `next.config.ts` 中设置 `images.unoptimized = true`
- 或者使用 Cloudflare Images 服务

### Q4: 环境变量未生效

**原因**：环境变量需要在 Cloudflare Dashboard 中配置。

**解决方案**：

- 在 **Settings** → **Environment variables** 中添加所需的环境变量
- 重新部署项目

---

## 验证部署

部署成功后，访问你的网站 URL（通常是 `https://high-end-portfolio.pages.dev`）：

1. **检查首页**：确保首页正常显示
2. **检查路由**：测试 `/articles`、`/contact` 等页面
3. **检查动态路由**：测试文章详情页 `/articles/[slug]`
4. **检查主题切换**：测试深色/浅色模式切换
5. **检查响应式设计**：在不同设备上测试

---

## 性能优化建议

1. **启用 Cloudflare CDN**：自动启用，无需额外配置
2. **启用 Brotli 压缩**：在 Cloudflare Dashboard 的 Speed 设置中启用
3. **配置缓存规则**：为静态资源设置更长的缓存时间
4. **使用 Cloudflare Analytics**：监控网站性能和访问情况

---

## 相关资源

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
