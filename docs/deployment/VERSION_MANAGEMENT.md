# 版本号管理指南

## 📦 当前版本

**版本**: `0.1.0`

位置：`package.json` 第 3 行

## 🎯 语义化版本控制（Semver）

版本号格式：`主版本号.次版本号.修订号` (MAJOR.MINOR.PATCH)

```
版本号：  1  .  2  .  3
         │     │     │
         │     │     └─ PATCH  修订号：bug 修复
         │     └─────── MINOR  次版本号：新功能（向后兼容）
         └─────────── MAJOR  主版本号：重大更新（可能不兼容）
```

### 版本号含义

| 类型 | 何时使用 | 示例 |
|------|---------|------|
| **PATCH** | Bug 修复、小改进 | 0.1.0 → 0.1.1 |
| **MINOR** | 新功能、向后兼容 | 0.1.0 → 0.2.0 |
| **MAJOR** | 重大更新、破坏性变更 | 0.1.0 → 1.0.0 |

## 🚀 方法 1：使用 npm version（推荐）

### 基本命令

```bash
# 修订号 +1 (Bug 修复)
npm version patch
# 0.1.0 → 0.1.1

# 次版本号 +1 (新功能)
npm version minor
# 0.1.0 → 0.2.0

# 主版本号 +1 (重大更新)
npm version major
# 0.1.0 → 1.0.0
```

### 自定义提交信息

```bash
npm version patch -m "chore: bump version to %s"
# %s 会被替换为新版本号
```

### 预发布版本

```bash
# 创建 alpha 版本
npm version prerelease --preid=alpha
# 0.1.0 → 0.1.1-alpha.0

# 创建 beta 版本
npm version prerelease --preid=beta
# 0.1.0 → 0.1.1-beta.0

# 创建 rc (release candidate) 版本
npm version prerelease --preid=rc
# 0.1.0 → 0.1.1-rc.0
```

### npm version 自动执行的操作

1. ✅ 更新 `package.json` 中的版本号
2. ✅ 更新 `package-lock.json` 中的版本号
3. ✅ 创建 Git commit（消息：`v0.1.1`）
4. ✅ 创建 Git tag（标签：`v0.1.1`）

## 🔧 方法 2：手动编辑

### 步骤

1. **编辑 package.json**

   ```json
   {
     "name": "high-end-portfolio",
     "version": "0.2.0",  // 手动修改这里
     "private": true
   }
   ```

2. **提交更改**

   ```bash
   git add package.json
   git commit -m "chore: bump version to 0.2.0"
   git tag -a v0.2.0 -m "Release version 0.2.0"
   ```

3. **推送到远程**

   ```bash
   git push origin main
   git push origin v0.2.0
   ```

## 📋 完整版本发布工作流

### 工作流 1：小版本更新（推荐）

```bash
# 1. 确保代码已提交
git status

# 2. 更新版本号
npm version patch -m "chore: release v%s"

# 3. 推送代码和标签
git push origin main --follow-tags

# 4. 部署新版本
npm run deploy
```

### 工作流 2：功能版本发布

```bash
# 1. 确保在 main 分支
git checkout main
git pull origin main

# 2. 更新版本号（新功能）
npm version minor -m "chore: release v%s - 新功能描述"

# 3. 推送
git push origin main --follow-tags

# 4. 部署
npm run deploy

# 5. 创建 GitHub Release（可选）
# 在 GitHub 上基于 tag 创建 Release
```

### 工作流 3：重大版本发布

```bash
# 1. 创建发布分支
git checkout -b release/v1.0.0

# 2. 更新版本号
npm version major -m "chore: release v%s - 重大更新"

# 3. 测试
npm run dev
npm run build:cf

# 4. 合并到 main
git checkout main
git merge release/v1.0.0

# 5. 推送
git push origin main --follow-tags

# 6. 部署
npm run deploy
```

## 🏷️ Git 标签管理

### 查看所有标签

```bash
git tag
# 或查看详细信息
git tag -n
```

### 查看特定标签

```bash
git show v0.1.0
```

### 删除标签

```bash
# 删除本地标签
git tag -d v0.1.0

# 删除远程标签
git push origin --delete v0.1.0
```

### 推送标签

```bash
# 推送单个标签
git push origin v0.1.0

# 推送所有标签
git push origin --tags

# 推送代码和标签
git push origin main --follow-tags
```

## 📊 版本历史示例

```
v0.1.0 - 初始版本
  ├─ v0.1.1 - 修复导航 bug
  ├─ v0.1.2 - 修复图片加载问题
  └─ v0.2.0 - 添加博客功能
      ├─ v0.2.1 - 修复博客样式
      └─ v0.3.0 - 添加联系表单
          └─ v1.0.0 - 正式发布
```

## 🎯 版本号选择指南

### 何时使用 PATCH (0.1.0 → 0.1.1)

- ✅ 修复 bug
- ✅ 性能优化
- ✅ 文档更新
- ✅ 样式微调
- ✅ 依赖更新（无功能变化）

**示例**：

```bash
npm version patch -m "fix: resolve navigation menu bug"
```

### 何时使用 MINOR (0.1.0 → 0.2.0)

- ✅ 添加新功能
- ✅ 添加新页面
- ✅ 添加新组件
- ✅ API 扩展（向后兼容）
- ✅ 依赖升级（新功能）

**示例**：

```bash
npm version minor -m "feat: add blog section"
```

### 何时使用 MAJOR (0.1.0 → 1.0.0)

- ✅ 重大重构
- ✅ 破坏性 API 变更
- ✅ 移除功能
- ✅ 技术栈升级
- ✅ 正式发布（从 0.x.x 到 1.0.0）

**示例**：

```bash
npm version major -m "chore: v1.0.0 official release"
```

## 🔄 版本回退

### 回退到之前的版本

```bash
# 1. 查看版本历史
git tag

# 2. 检出特定版本
git checkout v0.1.0

# 3. 创建新分支（如果需要）
git checkout -b hotfix/v0.1.0

# 4. 或者重置到特定版本
git reset --hard v0.1.0
```

## 📝 版本发布检查清单

发布新版本前的检查：

- [ ] 所有测试通过

  ```bash
  npm run dev  # 本地测试
  npm run build:cf  # 构建测试
  ```

- [ ] 代码已提交

  ```bash
  git status
  ```

- [ ] 更新了 CHANGELOG（如果有）

- [ ] 更新版本号

  ```bash
  npm version [patch|minor|major]
  ```

- [ ] 推送代码和标签

  ```bash
  git push origin main --follow-tags
  ```

- [ ] 部署到生产环境

  ```bash
  npm run deploy
  ```

- [ ] 验证部署

  ```bash
  # 访问网站确认更新
  open https://high-end-portfolio.1229773363.workers.dev
  ```

- [ ] 创建 GitHub Release（可选）

## 🛠️ 实用脚本

### 创建发布脚本

创建 `scripts/release.sh`：

```bash
#!/bin/bash
set -e

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting release process...${NC}"

# 1. 检查工作目录是否干净
if [[ -n $(git status -s) ]]; then
  echo "❌ Working directory is not clean. Please commit your changes first."
  exit 1
fi

# 2. 拉取最新代码
echo -e "${BLUE}📥 Pulling latest changes...${NC}"
git pull origin main

# 3. 询问版本类型
echo "Select version bump type:"
echo "1) patch (bug fixes)"
echo "2) minor (new features)"
echo "3) major (breaking changes)"
read -p "Enter choice [1-3]: " choice

case $choice in
  1) VERSION_TYPE="patch";;
  2) VERSION_TYPE="minor";;
  3) VERSION_TYPE="major";;
  *) echo "Invalid choice"; exit 1;;
esac

# 4. 更新版本
echo -e "${BLUE}📦 Bumping version ($VERSION_TYPE)...${NC}"
npm version $VERSION_TYPE -m "chore: release v%s"

# 5. 推送
echo -e "${BLUE}📤 Pushing to remote...${NC}"
git push origin main --follow-tags

# 6. 部署
echo -e "${BLUE}☁️  Deploying to Cloudflare Workers...${NC}"
npm run deploy

echo -e "${GREEN}✅ Release complete!${NC}"
```

使用：

```bash
chmod +x scripts/release.sh
./scripts/release.sh
```

## 📚 相关资源

- [Semantic Versioning 规范](https://semver.org/)
- [npm version 文档](https://docs.npmjs.com/cli/v8/commands/npm-version)
- [Git 标签文档](https://git-scm.com/book/en/v2/Git-Basics-Tagging)

## 💡 最佳实践

1. **遵循语义化版本控制**
   - 让版本号有意义
   - 便于用户理解更新内容

2. **使用 Git 标签**
   - 方便回退到特定版本
   - 便于创建 Release

3. **编写 CHANGELOG**
   - 记录每个版本的变更
   - 帮助用户了解更新内容

4. **自动化发布流程**
   - 减少人为错误
   - 提高发布效率

5. **测试后再发布**
   - 确保新版本稳定
   - 避免发布有问题的版本
