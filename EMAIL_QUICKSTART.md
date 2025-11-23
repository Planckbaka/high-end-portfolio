# 📧 联系表单邮件功能 - 快速设置

## ✅ 已完成的工作

我已经为你实现了完整的邮件发送功能：

1. ✅ **API 路由**：`src/app/api/contact/route.ts`
   - 处理表单提交
   - 发送邮件到 `akiwayne24@gmail.com`
   - 完整的错误处理

2. ✅ **前端更新**：`src/app/contact/ContactClient.tsx`
   - 调用 API 发送邮件
   - 用户友好的反馈

3. ✅ **精美的邮件模板**
   - HTML 格式
   - 包含访客信息
   - 一键回复按钮

## 🚀 你需要做的（3 步）

### 步骤 1：注册 Resend（2 分钟）

```bash
# 1. 打开 Resend 网站
open https://resend.com/signup

# 2. 使用 GitHub 或 Google 登录
# 3. 验证邮箱
```

### 步骤 2：获取 API Key（1 分钟）

```bash
# 1. 登录后访问
open https://resend.com/api-keys

# 2. 点击 "Create API Key"
#    - Name: Portfolio Contact Form
#    - Permission: Sending access
#    - 点击 Create

# 3. 复制 API Key（格式：re_xxxxxxxxxx）
```

### 步骤 3：配置环境变量

#### 本地开发

```bash
# 1. 创建 .env.local 文件
echo "RESEND_API_KEY=re_your_actual_api_key_here" > .env.local

# 2. 替换 your_actual_api_key_here 为你的真实 API Key

# 3. 重启开发服务器
npm run dev
```

#### 生产环境（Cloudflare Workers）

```bash
# 方法 1：使用命令行（推荐）
npx wrangler secret put RESEND_API_KEY
# 然后粘贴你的 API Key 并按回车

# 方法 2：在 Dashboard 中配置
# 1. 访问 https://dash.cloudflare.com/
# 2. Workers & Pages → high-end-portfolio
# 3. Settings → Variables → Add variable
#    - Name: RESEND_API_KEY
#    - Value: 你的 API Key
#    - Type: Secret
# 4. Save
```

## 🧪 测试

### 本地测试

```bash
# 1. 启动开发服务器
npm run dev

# 2. 访问联系页面
open http://localhost:3000/contact

# 3. 填写表单并提交
# 4. 检查你的 Gmail 收件箱
```

### 生产环境测试

```bash
# 1. 部署
npm run deploy

# 2. 访问网站
open https://high-end-portfolio.1229773363.workers.dev/contact

# 3. 填写表单并提交
# 4. 检查 Gmail
```

## 📧 你会收到的邮件

```
发件人: Portfolio Contact <onboarding@resend.dev>
收件人: akiwayne24@gmail.com
回复: visitor@example.com
主题: New Contact Form Message from [访客姓名]

[精美的 HTML 邮件，包含：]
- 访客姓名
- 访客邮箱
- 消息内容
- 发送时间
- 一键回复按钮
```

## 🔍 故障排除

### 问题：表单提交后显示错误

```bash
# 1. 检查环境变量
cat .env.local

# 2. 确认 API Key 正确
# 3. 重启开发服务器
npm run dev
```

### 问题：生产环境无法发送

```bash
# 1. 检查密钥是否设置
npx wrangler secret list

# 2. 如果没有，重新设置
npx wrangler secret put RESEND_API_KEY

# 3. 重新部署
npm run deploy
```

### 问题：没有收到邮件

1. 检查 Gmail 垃圾邮件文件夹
2. 访问 <https://resend.com/emails> 查看发送日志
3. 运行 `npx wrangler tail` 查看错误

## 📚 完整文档

详细配置指南：`EMAIL_SETUP.md`

## 💡 功能特性

- ✅ 免费（每月 3,000 封邮件）
- ✅ 快速（毫秒级发送）
- ✅ 可靠（99.9% 送达率）
- ✅ 安全（API Key 加密存储）
- ✅ 精美（HTML 邮件模板）
- ✅ 便捷（可直接回复访客）

## 🎯 总结

**现在只需 3 步**：

1. 注册 Resend
2. 获取 API Key
3. 配置环境变量

然后你的联系表单就可以正常工作了！🚀

有问题请查看 `EMAIL_SETUP.md` 获取详细帮助。
