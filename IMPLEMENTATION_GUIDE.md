# 代码改进实施指南

本文档提供了基于代码审查报告的具体改进步骤和示例代码。

## 📋 目录

1. [测试设置](#1-测试设置)
2. [环境变量改进](#2-环境变量改进)
3. [API 路由改进](#3-api-路由改进)
4. [错误处理改进](#4-错误处理改进)
5. [性能优化](#5-性能优化)

---

## 1. 测试设置

### 步骤 1: 安装测试依赖

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest
```

### 步骤 2: 更新 package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 步骤 3: 运行测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 已创建的文件

- ✅ `jest.config.ts` - Jest 配置
- ✅ `jest.setup.ts` - 测试环境设置
- ✅ `src/lib/__tests__/utils.test.ts` - 示例测试

---

## 2. 环境变量改进

### 改进内容

**文件**: `src/config/env.ts`

**新增功能**:
1. ✅ 生产环境必需变量验证
2. ✅ 类型守卫函数 (`isServer`, `isClient`)
3. ✅ 更好的错误提示

### 使用方法

```typescript
// 在应用启动时验证环境变量
// src/app/layout.tsx 或 middleware.ts
import { validateEnv } from '@/config/env';

// 在生产环境会抛出错误如果缺少必需变量
validateEnv();
```

```typescript
// 使用类型守卫
import { isServer, isClient } from '@/config/env';

if (isServer()) {
  // 仅在服务器端执行的代码
  console.log('Running on server');
}

if (isClient()) {
  // 仅在客户端执行的代码
  window.addEventListener('scroll', handleScroll);
}
```

---

## 3. API 路由改进

### 新增常量文件

**文件**: `src/config/constants.ts`

**包含内容**:
- ✅ 验证限制 (`VALIDATION_LIMITS`)
- ✅ HTTP 状态码 (`HTTP_STATUS`)
- ✅ 动画配置 (`ANIMATION_DURATION`, `ANIMATION_EASING`)
- ✅ 速率限制配置 (`RATE_LIMIT`)
- ✅ 错误和成功消息 (`ERROR_MESSAGES`, `SUCCESS_MESSAGES`)

### 使用示例

#### 在 API 路由中使用

```typescript
// src/app/api/contact/route.ts
import { VALIDATION_LIMITS, HTTP_STATUS, ERROR_MESSAGES } from '@/config/constants';

export async function POST(request: NextRequest) {
    const { name, email, message } = await request.json();
    
    // 使用常量而不是魔法数字
    if (name.length > VALIDATION_LIMITS.NAME_MAX_LENGTH) {
        return NextResponse.json(
            { error: ERROR_MESSAGES.TOO_LONG(VALIDATION_LIMITS.NAME_MAX_LENGTH) },
            { status: HTTP_STATUS.BAD_REQUEST }
        );
    }
    
    // ...
}
```

#### 在组件中使用

```typescript
// src/components/ui/Hero.tsx
import { ANIMATION_DURATION, ANIMATION_EASING } from '@/config/constants';

<motion.div
    initial={{ y: "100%" }}
    animate={{ y: 0 }}
    transition={{ 
        duration: ANIMATION_DURATION.SLOW, 
        ease: ANIMATION_EASING.EASE_OUT 
    }}
>
    {children}
</motion.div>
```

---

## 4. 错误处理改进

### 建议: 创建统一的错误处理工具

**文件**: `src/lib/error-logger.ts` (需要改进)

```typescript
export interface ErrorContext {
    componentStack?: string;
    userAgent?: string;
    url?: string;
    [key: string]: any;
}

export function logError(error: Error, context?: ErrorContext) {
    const errorData = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        ...context,
    };
    
    // 开发环境：详细日志
    if (process.env.NODE_ENV === 'development') {
        console.group('🔴 Error Logged');
        console.error('Error:', error);
        console.table(context);
        console.groupEnd();
    }
    
    // 生产环境：发送到错误追踪服务
    if (process.env.NODE_ENV === 'production') {
        // TODO: 集成 Sentry 或其他错误追踪服务
        // Sentry.captureException(error, { extra: context });
        
        // 临时方案：发送到自己的日志端点
        fetch('/api/log-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(errorData),
        }).catch(console.error);
    }
}
```

### 使用示例

```typescript
// 在组件中
try {
    await fetchData();
} catch (error) {
    logError(error as Error, {
        component: 'ArticleList',
        action: 'fetchArticles',
        userId: user?.id,
    });
}
```

---

## 5. 性能优化

### 5.1 图片优化

**改进前**:
```tsx
<Image
    src="/images/project-1.svg"
    alt="Project"
    width={800}
    height={600}
/>
```

**改进后**:
```tsx
<Image
    src="/images/project-1.svg"
    alt="Project thumbnail showcasing web design"
    width={800}
    height={600}
    loading="lazy"
    placeholder="blur"
    blurDataURL="data:image/svg+xml;base64,..."
    quality={85}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 5.2 字体优化

**文件**: `src/app/layout.tsx`

**改进前**:
```typescript
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});
```

**改进后**:
```typescript
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: 'swap',      // 防止 FOIT (Flash of Invisible Text)
  preload: true,        // 预加载字体
  fallback: ['system-ui', 'arial'],  // 回退字体
});
```

### 5.3 代码分割

**示例**: 动态导入大型组件

```typescript
// src/app/page.tsx
import dynamic from 'next/dynamic';

// 动态导入，减少初始加载
const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    loading: () => <Loading />,
    ssr: false,  // 如果不需要 SSR
  }
);

export default function Home() {
  return (
    <div>
      <Hero />
      <HeavyComponent />
    </div>
  );
}
```

---

## 📊 验证改进效果

### 运行质量检查

```bash
# 1. 运行测试
npm test

# 2. 检查测试覆盖率
npm run test:coverage

# 3. 运行 ESLint
npm run lint

# 4. 检查 TypeScript 类型
npx tsc --noEmit

# 5. 检查依赖安全性
npm audit

# 6. 构建项目
npm run build
```

### 预期结果

- ✅ 测试通过率: 100%
- ✅ 代码覆盖率: > 70%
- ✅ ESLint 错误: 0
- ✅ TypeScript 错误: 0
- ✅ 安全漏洞: 0
- ✅ 构建成功

---

## 🎯 下一步行动

### 立即执行 (本周)

1. [ ] 运行 `npm install` 安装测试依赖
2. [ ] 运行 `npm test` 验证测试配置
3. [ ] 更新 API 路由使用新的常量
4. [ ] 在 `layout.tsx` 中调用 `validateEnv()`

### 短期目标 (本月)

5. [ ] 为所有工具函数添加测试
6. [ ] 为关键组件添加测试
7. [ ] 实现 API 速率限制
8. [ ] 集成错误监控服务 (Sentry)

### 长期目标 (下季度)

9. [ ] 达到 70% 测试覆盖率
10. [ ] 添加 E2E 测试 (Playwright)
11. [ ] 性能监控和优化
12. [ ] CI/CD 自动化

---

## 📚 参考资源

- [Jest 文档](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

**最后更新**: 2025-12-31
