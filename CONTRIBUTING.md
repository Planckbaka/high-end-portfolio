# 贡献指南 | Contributing Guide

感谢您对本项目的关注！我们欢迎所有形式的贡献。

## 📋 目录

- [开发环境设置](#开发环境设置)
- [开发工作流](#开发工作流)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [测试要求](#测试要求)

---

## 开发环境设置

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 安装步骤

1. **Fork 并克隆仓库**

```bash
git clone https://github.com/YOUR_USERNAME/high-end-portfolio.git
cd high-end-portfolio
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

```bash
cp .env.example .env.local
# 编辑 .env.local 添加必要的环境变量
```

4. **启动开发服务器**

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

---

## 开发工作流

### 1. 创建功能分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 2. 进行开发

- 编写代码
- 添加测试
- 更新文档

### 3. 运行质量检查

```bash
# 运行所有检查
npm run lint          # ESLint
npm test              # Jest 测试
npm run test:coverage # 测试覆盖率
npx tsc --noEmit      # TypeScript 类型检查
```

### 4. 提交更改

```bash
git add .
git commit -m "feat: add new feature"
```

### 5. 推送到远程仓库

```bash
git push origin feature/your-feature-name
```

### 6. 创建 Pull Request

在 GitHub 上创建 Pull Request，并填写 PR 模板。

---

## 代码规范

### TypeScript

- ✅ 使用 TypeScript 严格模式
- ✅ 避免使用 `any` 类型
- ✅ 为所有函数参数和返回值添加类型
- ✅ 使用接口 (interface) 而不是类型别名 (type) 定义对象结构

**示例**:

```typescript
// ✅ 好的做法
interface UserProps {
  name: string;
  email: string;
  age?: number;
}

function createUser(props: UserProps): User {
  // ...
}

// ❌ 避免
function createUser(props: any) {
  // ...
}
```

### React 组件

- ✅ 使用函数组件和 Hooks
- ✅ 组件名使用 PascalCase
- ✅ Props 接口命名为 `ComponentNameProps`
- ✅ 使用 `React.FC` 或显式返回类型

**示例**:

```typescript
// ✅ 好的做法
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `Navbar`, `ArticleCard` |
| 函数 | camelCase | `getAllArticles`, `formatDate` |
| 常量 | UPPER_SNAKE_CASE | `MAX_LENGTH`, `API_URL` |
| 文件 | kebab-case | `article-card.tsx`, `utils.ts` |
| 接口 | PascalCase | `Article`, `UserProps` |
| 类型别名 | PascalCase | `ArticleId`, `Status` |

### 导入顺序

```typescript
// 1. React 和 Next.js
import { useState } from 'react';
import Image from 'next/image';

// 2. 第三方库
import { motion } from 'framer-motion';
import clsx from 'clsx';

// 3. 内部模块 - 按层级排序
import { cn } from '@/lib/utils';
import { Article } from '@/types';
import { Navbar } from '@/components/ui/Navbar';

// 4. 样式
import styles from './component.module.css';
```

### 文件结构

```typescript
// 1. 导入
import { ... } from '...';

// 2. 类型定义
interface ComponentProps {
  // ...
}

// 3. 常量
const ANIMATION_DURATION = 0.8;

// 4. 主组件
export function Component({ prop }: ComponentProps) {
  // 4.1 Hooks
  const [state, setState] = useState();
  
  // 4.2 派生状态
  const derivedValue = useMemo(() => {}, []);
  
  // 4.3 事件处理
  const handleClick = () => {};
  
  // 4.4 渲染
  return <div>...</div>;
}

// 5. 子组件 (如果只在此文件使用)
function SubComponent() {
  // ...
}
```

---

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 提交消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: add dark mode toggle` |
| `fix` | Bug 修复 | `fix: resolve navigation issue` |
| `docs` | 文档更新 | `docs: update README` |
| `style` | 代码格式 (不影响功能) | `style: format code` |
| `refactor` | 重构 | `refactor: simplify utils function` |
| `perf` | 性能优化 | `perf: optimize image loading` |
| `test` | 测试相关 | `test: add unit tests for utils` |
| `chore` | 构建/工具相关 | `chore: update dependencies` |

### 示例

```bash
# 新功能
git commit -m "feat(navbar): add mobile menu"

# Bug 修复
git commit -m "fix(api): handle null email error"

# 文档
git commit -m "docs: add contributing guide"

# 重构
git commit -m "refactor(components): extract common logic"
```

---

## Pull Request 流程

### PR 标题

使用与提交消息相同的格式：

```
feat(navbar): add mobile menu
```

### PR 描述模板

```markdown
## 描述
简要描述此 PR 的目的和内容。

## 更改类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档更新
- [ ] 性能优化
- [ ] 测试

## 测试
描述如何测试这些更改。

## 截图 (如适用)
添加相关截图。

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 已添加/更新测试
- [ ] 所有测试通过
- [ ] 已更新文档
- [ ] 无 ESLint 错误
- [ ] 无 TypeScript 错误
```

### 审查流程

1. 提交 PR 后，CI 会自动运行测试和检查
2. 至少需要 1 个审查者批准
3. 所有检查必须通过
4. 解决所有审查意见
5. 合并到主分支

---

## 测试要求

### 测试覆盖率

- 新功能必须包含测试
- 目标覆盖率: 70%
- 关键路径必须 100% 覆盖

### 测试类型

#### 1. 单元测试

测试独立的函数和组件。

```typescript
// src/lib/__tests__/utils.test.ts
import { cn } from '../utils';

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });
});
```

#### 2. 组件测试

测试 React 组件的行为。

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click" onClick={handleClick} />);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### 3. 集成测试

测试多个组件或模块的交互。

```typescript
// src/app/api/__tests__/contact.test.ts
import { POST } from '../contact/route';

describe('POST /api/contact', () => {
  it('sends email successfully', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John',
        email: 'john@example.com',
        message: 'Hello',
      }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 运行特定测试文件
npm test -- utils.test.ts
```

---

## 🎯 质量门槛

在合并 PR 之前，必须满足以下条件：

- ✅ 所有测试通过
- ✅ 测试覆盖率 >= 70%
- ✅ 无 ESLint 错误
- ✅ 无 TypeScript 错误
- ✅ 构建成功
- ✅ 至少 1 个审查者批准

---

## 💬 获取帮助

如有问题，请：

1. 查看 [README.md](./README.md)
2. 查看 [文档](./docs/INDEX.md)
3. 创建 [Issue](https://github.com/Planckbaka/high-end-portfolio/issues)
4. 联系维护者

---

## 📄 许可证

通过贡献代码，您同意您的贡献将在 [MIT License](./LICENSE) 下授权。

---

**感谢您的贡献！** 🎉
