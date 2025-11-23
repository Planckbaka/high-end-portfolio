# 📧 邮件发送功能配置指南

## 🎯 功能说明

你的联系表单现在可以将访客的消息直接发送到你的 Gmail 邮箱：**<akiwayne24@gmail.com>**

## 🚀 快速开始

### 步骤 1：注册 Resend 账户

1. **访问 Resend**
   - 打开 <https://resend.com/>
   - 点击 "Sign Up" 注册账户
   - 使用 GitHub 或 Google 账户登录（推荐）

2. **验证邮箱**
   - 查收验证邮件并完成验证

### 步骤 2：获取 API Key

1. **登录 Resend Dashboard**
   - 访问 <https://resend.com/api-keys>

2. **创建 API Key**
   - 点击 "Create API Key"
   - 名称：`Portfolio Contact Form`
   - 权限：选择 "Sending access"
   - 点击 "Create"

3. **复制 API Key**
   - 复制生成的 API Key（格式：`re_xxxxxxxxxx`）
   - ⚠️ **重要**：这个 Key 只显示一次，请妥善保存！

### 步骤 3：配置环境变量

#### 本地开发环境

1. **创建 `.env.local` 文件**

   ```bash
   # 在项目根目录创建
   touch .env.local
   ```

2. **添加 API Key**

   ```bash
   # .env.local
   RESEND_API_KEY=re_your_actual_api_key_here
   ```

3. **重启开发服务器**

   ```bash
   npm run dev
   ```

#### Cloudflare Workers 生产环境

**方法 1：使用 wrangler.toml（不推荐，会暴露密钥）**

```toml
# ⚠️ 不要这样做！API Key 会被提交到 Git
[vars]
RESEND_API_KEY = "re_your_api_key"
```

**方法 2：使用 Wrangler Secrets（推荐）**

```bash
# 在命令行中设置密钥
npx wrangler secret put RESEND_API_KEY
# 然后粘贴你的 API Key 并按回车
```

**方法 3：在 Cloudflare Dashboard 中配置（最推荐）**

1. 访问 <https://dash.cloudflare.com/>
2. 进入 **Workers & Pages** → `high-end-portfolio`
3. 点击 **Settings** → **Variables**
4. 点击 **Add variable**
   - Variable name: `RESEND_API_KEY`
   - Value: 粘贴你的 API Key
   - Type: **Secret** (加密存储)
5. 点击 **Save**
6. 重新部署：`npm run deploy`

## 📋 完整配置步骤

### 1. 注册并获取 API Key

```bash
# 1. 访问 Resend
open https://resend.com/signup

# 2. 登录后访问 API Keys 页面
open https://resend.com/api-keys

# 3. 创建新的 API Key 并复制
```

### 2. 本地测试

```bash
# 1. 创建环境变量文件
echo "RESEND_API_KEY=re_your_api_key_here" > .env.local

# 2. 启动开发服务器
npm run dev

# 3. 访问联系页面
open http://localhost:3000/contact

# 4. 填写表单并测试发送
```

### 3. 部署到生产环境

```bash
# 1. 设置 Cloudflare Workers 密钥
npx wrangler secret put RESEND_API_KEY
# 粘贴 API Key 并按回车

# 2. 重新部署
npm run deploy

# 3. 测试生产环境
open https://high-end-portfolio.1229773363.workers.dev/contact
```

## 🔍 验证配置

### 本地验证

1. 启动开发服务器：`npm run dev`
2. 访问 <http://localhost:3000/contact>
3. 填写表单并提交
4. 检查：
   - ✅ 表单显示 "Message Sent!"
   - ✅ 你的 Gmail 收到邮件
   - ✅ 邮件中包含访客的姓名、邮箱和消息

### 生产环境验证

1. 访问 <https://high-end-portfolio.1229773363.workers.dev/contact>
2. 填写表单并提交
3. 检查 Gmail 收件箱

### 查看日志（如果有问题）

```bash
# 查看实时日志
npx wrangler tail

# 然后提交表单，查看错误信息
```

## 📧 邮件功能特性

### 发送的邮件包含

- ✅ 访客姓名
- ✅ 访客邮箱（可直接回复）
- ✅ 消息内容
- ✅ 发送时间（中国时区）
- ✅ 精美的 HTML 格式
- ✅ 一键回复按钮

### 邮件示例

```
发件人: Portfolio Contact <onboarding@resend.dev>
收件人: akiwayne24@gmail.com
回复: visitor@example.com
主题: New Contact Form Message from John Doe

[精美的 HTML 邮件，包含访客信息和消息]
```

## 🔒 安全性

### 环境变量保护

- ✅ API Key 存储在环境变量中
- ✅ 不会提交到 Git
- ✅ Cloudflare Workers 加密存储
- ✅ 只有服务器端可访问

### 表单验证

- ✅ 必填字段验证
- ✅ 邮箱格式验证
- ✅ 防止空提交
- ✅ 错误处理和用户反馈

### 防止滥用（可选增强）

未来可以添加：

- 🔄 Rate limiting（频率限制）
- 🤖 reCAPTCHA（人机验证）
- 🛡️ CSRF 保护

## 🎨 自定义邮件模板

邮件模板位于：`src/app/api/contact/route.ts`

你可以自定义：

- 邮件样式（CSS）
- 邮件内容
- 发件人名称
- 主题格式

## 📊 Resend 免费额度

- ✅ 每月 3,000 封邮件
- ✅ 每天 100 封邮件
- ✅ 无需信用卡
- ✅ 永久免费

对于个人作品集网站来说，完全够用！

## 🐛 常见问题

### Q1: 表单提交后显示错误

**检查清单**：

1. 确认 `.env.local` 文件存在且包含正确的 API Key
2. 重启开发服务器
3. 检查浏览器控制台的错误信息
4. 运行 `npx wrangler tail` 查看服务器日志

### Q2: 本地可以发送，生产环境失败

**解决方案**：

```bash
# 1. 确认 Cloudflare Workers 中设置了密钥
npx wrangler secret list

# 2. 如果没有，重新设置
npx wrangler secret put RESEND_API_KEY

# 3. 重新部署
npm run deploy
```

### Q3: Gmail 没有收到邮件

**检查**：

1. 查看 Gmail 的垃圾邮件文件夹
2. 确认 Resend API Key 有效
3. 检查 Resend Dashboard 的发送日志
4. 确认邮箱地址正确

### Q4: API Key 无效

**解决方案**：

1. 访问 <https://resend.com/api-keys>
2. 删除旧的 API Key
3. 创建新的 API Key
4. 更新环境变量
5. 重新部署

## 🔄 更新部署

每次修改代码后：

```bash
# 1. 提交代码
git add .
git commit -m "feat: update contact form"

# 2. 重新部署
npm run deploy

# 3. 测试
open https://high-end-portfolio.1229773363.workers.dev/contact
```

## 📚 相关资源

- [Resend 文档](https://resend.com/docs)
- [Resend API 参考](https://resend.com/docs/api-reference/emails/send-email)
- [Cloudflare Workers 环境变量](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [Wrangler Secrets](https://developers.cloudflare.com/workers/wrangler/commands/#secret)

## 💡 下一步增强

可选的功能增强：

1. **自动回复**
   - 向访客发送确认邮件

2. **邮件通知**
   - 使用 Telegram/Slack 接收通知

3. **数据存储**
   - 将消息保存到数据库（Cloudflare D1）

4. **分析统计**
   - 跟踪表单提交次数

5. **验证码**
   - 添加 reCAPTCHA 防止垃圾邮件

## 🎯 总结

现在你的联系表单已经完全配置好了！

**完成的功能**：

- ✅ 访客可以通过表单发送消息
- ✅ 消息直接发送到你的 Gmail
- ✅ 精美的 HTML 邮件格式
- ✅ 可以直接回复访客
- ✅ 完整的错误处理
- ✅ 用户友好的反馈

**下一步**：

1. 注册 Resend 账户
2. 获取 API Key
3. 配置环境变量
4. 测试并部署

祝你使用愉快！🚀
