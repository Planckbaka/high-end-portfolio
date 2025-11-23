---
description: 如何部署项目到 Cloudflare Workers
---

# 部署到 Cloudflare Workers

本指南介绍如何将 Next.js 项目部署到 Cloudflare Workers。

## 🎯 为什么选择 Cloudflare Workers？

- **全球边缘计算**：在全球 300+ 个数据中心运行
- **SSR 支持**：完整的服务器端渲染支持
- **快速冷启动**：毫秒级启动时间
- **成本效益**：免费套餐每天 100,000 次请求

## 📋 前置要求

1. **安装依赖**

   ```bash
   npm install
   ```

2. **登录 Wrangler**

   ```bash
   npx wrangler login
   ```

   这会打开浏览器进行 Cloudflare 账户授权。

## 🚀 部署步骤

### 方法 1：一键部署（推荐）

```bash
npm run deploy
```

这个命令会：

1. 使用 `opennextjs-cloudflare` 构建项目
2. 自动部署到 Cloudflare Workers 开发环境

### 方法 2：分步部署

```bash
# 1. 构建项目
npm run build:cf

# 2. 部署到开发环境
wrangler deploy

# 3. 或部署到生产环境
npm run deploy:prod
```

## 🔧 配置说明

### `wrangler.toml` 配置

```toml
name = "high-end-portfolio"              # Worker 名称
main = ".open-next/worker.js"            # Worker 入口文件
compatibility_date = "2024-11-21"        # 兼容性日期
compatibility_flags = ["nodejs_compat"]  # Node.js 兼容性

[assets]
directory = ".open-next/assets"          # 静态资源目录
binding = "ASSETS"                       # 资产绑定名称
```

### 环境变量配置

在 `wrangler.toml` 中添加：

```toml
[vars]
NEXT_PUBLIC_SITE_URL = "https://your-domain.com"
NEXT_PUBLIC_SITE_NAME = "Your Portfolio"
```

或在 Cloudflare Dashboard 中配置：

1. 进入 **Workers & Pages** → 选择你的 Worker
2. 进入 **Settings** → **Variables**
3. 添加环境变量

## 🌐 自定义域名

### 在 Cloudflare Dashboard 中配置

1. **进入 Worker 设置**
   - 访问 <https://dash.cloudflare.com/>
   - 进入 **Workers & Pages** → 选择 `high-end-portfolio`

2. **添加自定义域名**
   - 进入 **Settings** → **Triggers** → **Custom Domains**
   - 点击 **Add Custom Domain**
   - 输入你的域名（例如：`portfolio.yourdomain.com`）

3. **配置 DNS**
   - Cloudflare 会自动为你配置 DNS 记录
   - 等待 DNS 传播（通常几分钟）

### 在 `wrangler.toml` 中配置路由

```toml
[env.production]
name = "high-end-portfolio"
routes = [
  { pattern = "portfolio.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

## 🧪 本地预览

在部署前本地测试 Worker：

```bash
npm run preview
```

这会启动本地 Wrangler 开发服务器，模拟 Cloudflare Workers 环境。

## 📊 监控和日志

### 查看实时日志

```bash
wrangler tail
```

### 在 Dashboard 中查看

1. 访问 <https://dash.cloudflare.com/>
2. 进入 **Workers & Pages** → 选择你的 Worker
3. 查看 **Metrics** 和 **Logs**

## 🔍 常见问题

### Q1: 部署后显示 404

**原因**：Worker 路由配置错误或资产绑定问题。

**解决方案**：

1. 检查 `wrangler.toml` 中的 `main` 和 `assets.directory` 配置
2. 确保 `.open-next/worker.js` 和 `.open-next/assets` 目录存在
3. 重新构建并部署：`npm run deploy`

### Q2: 图片无法加载

**原因**：静态资源路径配置问题。

**解决方案**：

1. 确保 `next.config.ts` 中设置了 `images.unoptimized = true`
2. 检查 `wrangler.toml` 中的 `[assets]` 配置
3. 使用相对路径引用图片

### Q3: 环境变量未生效

**原因**：环境变量配置位置错误。

**解决方案**：

1. 在 `wrangler.toml` 的 `[vars]` 部分添加环境变量
2. 或在 Cloudflare Dashboard 中配置
3. 重新部署项目

### Q4: Worker 超出大小限制

**原因**：Worker 脚本或资产过大。

**解决方案**：

1. 优化依赖：移除未使用的包
2. 启用代码分割
3. 使用 Cloudflare R2 存储大文件
4. 考虑升级到 Workers Paid 计划

### Q5: 部署失败：`main` 文件不存在

**原因**：`opennextjs-cloudflare build` 未正确生成 worker.js。

**解决方案**：

```bash
# 清理并重新构建
rm -rf .open-next .next
npm run build:cf
```

## 🎯 性能优化

### 1. 启用缓存

在 Worker 代码中添加缓存策略（OpenNext 已内置）：

```javascript
// 静态资源自动缓存
// API 路由可配置缓存策略
```

### 2. 使用 KV 存储

对于频繁访问的数据，使用 Cloudflare KV：

```toml
[[kv_namespaces]]
binding = "MY_KV"
id = "your-kv-namespace-id"
```

### 3. 启用压缩

Cloudflare Workers 自动启用 Brotli 和 Gzip 压缩。

## 📈 扩展功能

### 使用 Cloudflare D1（数据库）

```toml
[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "your-database-id"
```

### 使用 Cloudflare R2（对象存储）

```toml
[[r2_buckets]]
binding = "MY_BUCKET"
bucket_name = "my-bucket"
```

## 🔄 CI/CD 集成

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build:cf
        
      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy --env production
```

## 📚 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/workers/frameworks/framework-guides/nextjs/)

## 🆘 获取帮助

如果遇到问题：

1. 查看 [Cloudflare Community](https://community.cloudflare.com/)
2. 查看 [OpenNext GitHub Issues](https://github.com/opennextjs/opennextjs-cloudflare/issues)
3. 运行 `wrangler tail` 查看实时日志
