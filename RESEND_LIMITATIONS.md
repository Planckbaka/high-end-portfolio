# 🚨 Resend 测试模式限制说明

## ⚠️ 当前状态

你遇到的错误是 Resend 免费账户的**测试模式限制**。

## 📋 问题详情

### 错误信息

```
statusCode: 403
message: 'You can only send testing emails to your own email address (1229773363@qq.com). 
To send emails to other recipients, please verify a domain at resend.com/domains'
```

### 原因

Resend 免费账户的限制：

- ✅ **可以使用**：`onboarding@resend.dev` 作为发件人
- ❌ **只能发送到**：你注册 Resend 时使用的邮箱（`1229773363@qq.com`）
- ❌ **不能发送到**：其他任意邮箱（包括 `akiwayne24@gmail.com`）

## ✅ 临时解决方案（已实施）

我已经将代码修改为发送到你的 QQ 邮箱：

```typescript
// src/app/api/contact/route.ts
to: ['1229773363@qq.com'], // 你的 QQ 邮箱（Resend 注册邮箱）
```

**现在可以正常工作了！** 访客提交表单后，你会在 QQ 邮箱收到邮件。

## 🎯 永久解决方案：验证域名

要发送到任意邮箱（包括 Gmail），你需要验证一个域名。

### 方案 1：使用现有域名（推荐）

如果你有域名（如 `yourdomain.com`）：

#### 步骤 1：在 Resend 中添加域名

1. 访问 <https://resend.com/domains>
2. 点击 "Add Domain"
3. 输入你的域名（如 `yourdomain.com`）
4. 点击 "Add"

#### 步骤 2：配置 DNS 记录

Resend 会提供 3 条 DNS 记录，你需要在域名提供商处添加：

**示例（以 Cloudflare 为例）**：

| Type | Name | Value |
|------|------|-------|
| TXT | @ | `resend._domainkey=...` |
| MX | @ | `feedback-smtp.resend.com` (Priority: 10) |
| TXT | @ | `v=spf1 include:resend.com ~all` |

#### 步骤 3：验证域名

1. 添加 DNS 记录后，等待几分钟
2. 在 Resend Dashboard 点击 "Verify"
3. 验证成功后，状态会变为 "Verified"

#### 步骤 4：更新代码

```typescript
// src/app/api/contact/route.ts
from: 'Portfolio Contact <noreply@yourdomain.com>', // 使用你的域名
to: ['akiwayne24@gmail.com'], // 现在可以发送到任意邮箱了！
```

### 方案 2：购买域名（如果没有）

如果你还没有域名，可以：

1. **购买域名**
   - Cloudflare Registrar（推荐，价格透明）
   - Namecheap
   - GoDaddy

2. **使用免费子域名**（不推荐用于生产）
   - Freenom（.tk, .ml, .ga 等）
   - 但这些域名可能被邮件服务商标记为垃圾邮件

### 方案 3：使用其他邮件服务

如果不想验证域名，可以考虑：

#### SendGrid

- 免费额度：每天 100 封
- 需要验证域名或单个发件人邮箱

#### EmailJS

- 纯前端解决方案
- 免费额度：每月 200 封
- 不需要后端

#### Mailgun

- 免费额度：每月 5,000 封（前 3 个月）
- 需要信用卡验证

## 🔄 当前工作流程

### 现在的流程（使用 QQ 邮箱）

1. 访客在网站填写表单
2. 提交后，邮件发送到 `1229773363@qq.com`
3. 你在 QQ 邮箱查收
4. 可以直接回复访客（reply-to 已设置）

### 验证域名后的流程

1. 访客在网站填写表单
2. 提交后，邮件发送到 `akiwayne24@gmail.com`（或任意邮箱）
3. 发件人显示为 `noreply@yourdomain.com`
4. 更专业的形象

## 📊 对比

| 特性 | 测试模式（当前） | 验证域名后 |
|------|-----------------|-----------|
| 收件人 | 仅注册邮箱 | 任意邮箱 |
| 发件人 | <onboarding@resend.dev> | <your@domain.com> |
| 专业度 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 垃圾邮件风险 | 低 | 极低 |
| 免费额度 | 3,000/月 | 3,000/月 |

## 🎯 推荐做法

### 短期（现在）

✅ 使用 QQ 邮箱接收（已配置）

- 立即可用
- 功能完整
- 适合测试和初期使用

### 长期（未来）

🚀 验证域名

- 更专业
- 可发送到任意邮箱
- 提升品牌形象

## 📝 验证域名的详细步骤

### 如果你使用 Cloudflare 管理域名

1. **在 Resend 添加域名**

   ```bash
   open https://resend.com/domains
   # 点击 "Add Domain"
   # 输入域名并提交
   ```

2. **复制 DNS 记录**
   Resend 会显示需要添加的 DNS 记录

3. **在 Cloudflare 添加 DNS 记录**

   ```bash
   # 1. 登录 Cloudflare
   open https://dash.cloudflare.com/
   
   # 2. 选择你的域名
   # 3. 进入 DNS 设置
   # 4. 添加 Resend 提供的 3 条记录
   ```

4. **验证域名**

   ```bash
   # 等待 5-10 分钟让 DNS 传播
   # 然后在 Resend 点击 "Verify"
   ```

5. **更新代码**

   ```typescript
   from: 'Portfolio <noreply@yourdomain.com>',
   to: ['akiwayne24@gmail.com'],
   ```

6. **重新部署**

   ```bash
   npm run deploy
   ```

## 🧪 测试

### 测试当前配置（QQ 邮箱）

```bash
# 1. 访问联系页面
open http://localhost:3000/contact

# 2. 填写表单并提交

# 3. 检查 QQ 邮箱
# 你应该会收到邮件
```

### 验证域名后测试

```bash
# 1. 更新代码中的收件人为 Gmail
# 2. 重新部署
npm run deploy

# 3. 测试发送
# 4. 检查 Gmail 收件箱
```

## 💡 常见问题

### Q: 为什么不能直接发送到 Gmail？

A: Resend 的免费账户限制，只能发送到注册邮箱。这是为了防止垃圾邮件。

### Q: 验证域名需要多久？

A: DNS 记录添加后，通常 5-30 分钟即可验证成功。

### Q: 验证域名需要费用吗？

A: 不需要。Resend 的域名验证是免费的，但你需要拥有一个域名。

### Q: 可以使用子域名吗？

A: 可以。例如 `mail.yourdomain.com`。

### Q: QQ 邮箱会收到垃圾邮件吗？

A: 不会。只有通过你的表单提交的消息才会发送到你的邮箱。

## 📚 相关资源

- [Resend 域名验证文档](https://resend.com/docs/dashboard/domains/introduction)
- [Resend DNS 配置指南](https://resend.com/docs/dashboard/domains/dns-records)
- [Cloudflare DNS 管理](https://developers.cloudflare.com/dns/)

## 🎯 总结

**当前状态**：

- ✅ 邮件功能正常工作
- ✅ 发送到 QQ 邮箱 `1229773363@qq.com`
- ✅ 可以直接回复访客
- ⚠️ 受测试模式限制

**下一步**（可选）：

- 🔄 验证域名
- 🔄 发送到任意邮箱
- 🔄 更专业的邮件地址

现在你的联系表单已经可以正常使用了！🎉
