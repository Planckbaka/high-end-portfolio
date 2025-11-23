# Cloudflare Workers 部署配置总结

## ✅ 配置完成

你的项目已经成功配置为部署到 **Cloudflare Workers**！

## 📁 关键文件

### 1. `wrangler.toml` - Workers 配置

```toml
name = "high-end-portfolio"
main = ".open-next/worker.js"
compatibility_date = "2024-11-21"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"
binding = "ASSETS"
```

### 2. `open-next.config.ts` - OpenNext 配置

自动生成的配置文件，使用 R2 增量缓存。

### 3. `package.json` - 部署脚本

```json
{
  "scripts": {
    "build:cf": "opennextjs-cloudflare build",
    "deploy": "npm run build:cf && wrangler deploy",
    "deploy:prod": "npm run build:cf && wrangler deploy --env production",
    "preview": "wrangler dev"
  }
}
```

## 🚀 快速部署

### 第一次部署

1. **登录 Wrangler**（如果还没登录）

   ```bash
   npx wrangler login
   ```

2. **构建并部署**

   ```bash
   npm run deploy
   ```

3. **查看部署结果**
   部署成功后，Wrangler 会显示你的 Worker URL：

   ```
   https://high-end-portfolio.<your-subdomain>.workers.dev
   ```

### 后续部署

直接运行：

```bash
npm run deploy
```

## 🌐 部署环境

### 开发环境（默认）

```bash
npm run deploy
```

- URL: `https://high-end-portfolio.<subdomain>.workers.dev`
- 用于测试和开发

### 生产环境

```bash
npm run deploy:prod
```

- 需要在 `wrangler.toml` 中配置自定义域名
- 更稳定的部署环境

## 🔧 本地测试

在部署前本地测试：

```bash
npm run preview
```

这会启动本地 Wrangler 开发服务器，模拟 Cloudflare Workers 环境。

## 📊 构建输出

构建成功后，会生成以下文件：

- `.open-next/worker.js` - Worker 入口文件（2.6KB）
- `.open-next/assets/` - 静态资源目录
- `.open-next/server-functions/` - 服务器函数
- `.open-next/middleware/` - 中间件

## ⚠️ 注意事项

1. **Next.js 16 支持**
   - OpenNext 对 Next.js 16 的支持还在完善中
   - 某些功能可能无法正常工作
   - 建议关注 [@opennextjs/cloudflare](https://github.com/opennextjs/opennextjs-cloudflare) 的更新

2. **metadataBase 警告**
   - 需要在 `app/layout.tsx` 中设置 `metadataBase`
   - 用于生成正确的 Open Graph 和 Twitter 卡片图片 URL

3. **环境变量**
   - 在 `wrangler.toml` 的 `[vars]` 部分添加
   - 或在 Cloudflare Dashboard 中配置

## 🎯 下一步

1. **部署到 Workers**

   ```bash
   npm run deploy
   ```

2. **配置自定义域名**
   - 在 Cloudflare Dashboard 中添加
   - 或在 `wrangler.toml` 中配置路由

3. **监控性能**
   - 使用 `wrangler tail` 查看实时日志
   - 在 Cloudflare Dashboard 查看分析数据

4. **优化性能**
   - 配置缓存策略
   - 使用 Cloudflare KV/R2 存储
   - 启用 CDN 加速

## 📚 相关文档

- [完整部署指南](./.agent/workflows/deploy-to-workers.md)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)

## 🆘 遇到问题？

1. 查看构建日志：`npm run build:cf`
2. 查看部署日志：`wrangler tail`
3. 参考 [常见问题](./.agent/workflows/deploy-to-workers.md#常见问题)
