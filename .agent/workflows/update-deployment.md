---
description: 如何更新已部署的网站
---

# 更新已部署的网站

本指南介绍如何更新你在 Cloudflare Workers 上已部署的网站。

## 🚀 快速更新流程

### 标准更新（推荐）

```bash
# 1. 修改代码后，重新部署
npm run deploy
```

这个命令会：

1. 自动构建最新代码
2. 部署到 Cloudflare Workers
3. 替换当前运行的版本

### 完整更新流程

```bash
# 1. 本地开发和测试
npm run dev
# 在浏览器中访问 http://localhost:3000 测试

# 2. 提交代码（推荐）
git add .
git commit -m "feat: 描述你的更新"
git push

# 3. 重新部署
npm run deploy
```

## 📝 常见更新场景

### 场景 1：修改页面内容

**示例**：更新首页文案

```bash
# 1. 编辑文件
# 修改 src/app/page.tsx 或其他组件

# 2. 本地测试
npm run dev

# 3. 确认无误后部署
npm run deploy
```

**预计时间**：2-3 分钟

---

### 场景 2：添加新页面

**示例**：添加 `/about` 页面

```bash
# 1. 创建新页面
# 创建 src/app/about/page.tsx

# 2. 本地测试
npm run dev
# 访问 http://localhost:3000/about

# 3. 部署
npm run deploy
```

**预计时间**：2-3 分钟

---

### 场景 3：修改样式

**示例**：更新 CSS 样式

```bash
# 1. 编辑样式文件
# 修改 src/app/globals.css 或组件样式

# 2. 本地测试（支持热重载）
npm run dev

# 3. 部署
npm run deploy
```

**预计时间**：2-3 分钟

---

### 场景 4：更新依赖包

**示例**：升级 Next.js 或其他包

```bash
# 1. 更新依赖
npm update
# 或更新特定包
npm install next@latest

# 2. 测试
npm run dev

# 3. 重新构建和部署
npm run deploy
```

**预计时间**：3-5 分钟

---

### 场景 5：修改配置

**示例**：更新 `next.config.ts` 或 `wrangler.toml`

```bash
# 1. 编辑配置文件
# 修改 next.config.ts 或 wrangler.toml

# 2. 重新构建和部署
npm run deploy
```

**预计时间**：2-3 分钟

---

### 场景 6：添加环境变量

**方法 A：在 wrangler.toml 中添加**

```toml
[vars]
NEXT_PUBLIC_API_URL = "https://api.example.com"
NEXT_PUBLIC_SITE_NAME = "My Portfolio"
```

然后部署：

```bash
npm run deploy
```

**方法 B：在 Cloudflare Dashboard 中添加**

1. 访问 <https://dash.cloudflare.com/>
2. 进入 **Workers & Pages** → `high-end-portfolio`
3. **Settings** → **Variables**
4. 添加环境变量
5. 重新部署：`npm run deploy`

---

## 🔍 部署前检查清单

在每次部署前，建议检查以下项目：

- [ ] **本地测试通过**

  ```bash
  npm run dev
  # 在浏览器中测试所有修改的功能
  ```

- [ ] **构建成功**

  ```bash
  npm run build:cf
  # 确保没有构建错误
  ```

- [ ] **代码已提交**（可选但推荐）

  ```bash
  git status
  git add .
  git commit -m "描述更新内容"
  ```

- [ ] **检查 TypeScript 错误**

  ```bash
  npm run lint
  ```

## 📊 部署后验证

### 1. 检查部署状态

部署成功后，你会看到：

```bash
✨ Success! Uploaded XX files
Deployed high-end-portfolio triggers
  https://high-end-portfolio.1229773363.workers.dev
Current Version ID: [新的版本ID]
```

### 2. 访问网站验证

```bash
# 在浏览器中打开
open https://high-end-portfolio.1229773363.workers.dev
```

或使用 curl 测试：

```bash
curl -I https://high-end-portfolio.1229773363.workers.dev
```

### 3. 查看实时日志

```bash
npx wrangler tail
```

这会显示网站的实时请求日志，帮助你发现问题。

### 4. 测试关键功能

- ✅ 首页加载正常
- ✅ 导航链接工作
- ✅ 动态路由正常（如 `/articles/[slug]`）
- ✅ 图片和静态资源加载
- ✅ 主题切换功能（如果有）

## 🔄 版本管理

### 查看部署历史

在 Cloudflare Dashboard 中：

1. 访问 <https://dash.cloudflare.com/>
2. 进入 **Workers & Pages** → `high-end-portfolio`
3. 查看 **Deployments** 标签

### 回滚到之前的版本

如果新版本有问题，可以快速回滚：

**方法 1：使用 Git 回滚**

```bash
# 1. 回滚到之前的 commit
git log --oneline  # 查看历史
git checkout <commit-hash>

# 2. 重新部署
npm run deploy

# 3. 回到最新版本（如果需要）
git checkout main
```

**方法 2：在 Dashboard 中回滚**

1. 进入 **Workers & Pages** → `high-end-portfolio` → **Deployments**
2. 找到之前的成功部署
3. 点击 **Rollback to this deployment**

## ⚡ 快速更新技巧

### 1. 使用别名简化命令

在 `~/.zshrc` 或 `~/.bashrc` 中添加：

```bash
alias deploy-portfolio="cd ~/Documents/Project2025/high-end-portfolio && npm run deploy"
```

然后你可以在任何目录运行：

```bash
deploy-portfolio
```

### 2. 自动化部署脚本

创建 `scripts/deploy.sh`：

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# 运行测试
echo "📝 Running linter..."
npm run lint

# 构建
echo "🔨 Building..."
npm run build:cf

# 部署
echo "☁️  Deploying to Cloudflare Workers..."
npx wrangler deploy

echo "✅ Deployment complete!"
```

使用：

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 3. Git Hooks 自动部署

创建 `.git/hooks/post-commit`：

```bash
#!/bin/bash
# 可选：在每次 commit 后自动部署
# npm run deploy
```

## 🐛 常见问题

### Q1: 部署后看不到更新？

**原因**：浏览器缓存或 CDN 缓存

**解决方案**：

```bash
# 1. 清除浏览器缓存（Cmd+Shift+R 或 Ctrl+Shift+R）
# 2. 或使用隐私模式访问
# 3. 或在 URL 后添加查询参数
https://your-site.workers.dev/?v=2
```

### Q2: 部署失败怎么办？

**解决方案**：

```bash
# 1. 查看详细错误信息
npm run deploy

# 2. 清理并重新构建
rm -rf .next .open-next
npm run build:cf

# 3. 检查 wrangler.toml 配置
# 4. 查看 Cloudflare Dashboard 中的错误日志
```

### Q3: 如何测试不影响生产环境？

**解决方案**：使用开发环境

```bash
# 部署到开发环境（默认）
npm run deploy

# 部署到生产环境
npm run deploy:prod
```

或在 `wrangler.toml` 中配置多个环境：

```toml
# 开发环境（默认）
name = "high-end-portfolio-dev"

# 生产环境
[env.production]
name = "high-end-portfolio"
routes = [
  { pattern = "your-domain.com/*", zone_name = "your-domain.com" }
]
```

### Q4: 更新后某些功能不工作？

**解决方案**：

```bash
# 1. 查看实时日志
npx wrangler tail

# 2. 检查构建输出
npm run build:cf

# 3. 本地测试 Worker
npm run preview
```

## 📈 最佳实践

### 1. 使用语义化版本控制

```bash
git commit -m "feat: 添加新功能"
git commit -m "fix: 修复 bug"
git commit -m "docs: 更新文档"
git commit -m "style: 样式调整"
```

### 2. 定期备份

```bash
# 定期推送到 GitHub
git push origin main

# 或创建标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### 3. 监控性能

- 在 Cloudflare Dashboard 查看 **Analytics**
- 使用 `wrangler tail` 监控实时请求
- 定期检查 **Metrics** 中的性能数据

### 4. 渐进式更新

对于大型更新：

1. 先在开发环境测试
2. 部署到测试 Worker
3. 验证无误后部署到生产环境

## 🔗 相关资源

- [部署指南](./deploy-to-workers.md)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)

## 📞 获取帮助

如果遇到问题：

1. 查看 `npx wrangler tail` 日志
2. 检查 Cloudflare Dashboard 中的错误
3. 参考 [Cloudflare Community](https://community.cloudflare.com/)
