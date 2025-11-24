# Articles 文件夹使用说明

这个文件夹用于存放你的 Markdown 格式的博客文章。

## 文件格式

每个文章文件应该是一个 `.md` 文件，包含以下结构：

### Frontmatter（必需）

每个文件顶部需要包含 YAML frontmatter，格式如下：

```markdown
---
title: "文章标题"
date: "YYYY-MM-DD"
category: "分类"
excerpt: "文章摘要（可选，如果不提供会自动从内容提取）"
---
```

### 必需字段

- `title`: 文章标题
- `date`: 发布日期，格式为 YYYY-MM-DD
- `category`: 文章分类（如：Design、Development、Engineering、Trends 等）

### 可选字段

- `excerpt`: 文章摘要，在文章列表页显示。如果不提供，系统会自动提取文章前 150 个字符
- `id`: 文章 ID，如果不提供会自动生成

## 示例文件

```markdown
---
title: "我的第一篇文章"
date: "2024-11-23"
category: "Development"
excerpt: "这是一篇关于如何使用 Next.js 构建现代网站的文章。"
---

# 正文开始

这里是文章的正文内容...

## 支持的 Markdown 特性

- **粗体文本**
- *斜体文本*
- [链接](https://example.com)
- 代码块
- 列表
- 表格
- 等等...

\`\`\`typescript
const hello = "world";
console.log(hello);
\`\`\`
```

## 如何添加新文章

1. 在 `content/articles/` 文件夹中创建一个新的 `.md` 文件
2. 文件名会成为文章的 URL slug（如：`my-article.md` → `/articles/my-article`）
3. 添加必需的 frontmatter
4. 编写文章内容
5. 保存文件
6. 重新构建网站（开发模式下会自动刷新）

## 文件命名规范

- 使用小写字母
- 使用连字符 `-` 分隔单词
- 避免使用特殊字符
- 示例：`my-first-article.md`、`learning-go-microservices.md`

## 支持的 Markdown 特性

- GitHub Flavored Markdown (GFM)
- 代码高亮
- 表格
- 任务列表
- 删除线
- 自动链接
- 等等...

## 注意事项

- 文章会按照日期自动排序（最新的在前）
- 确保日期格式正确
- 文章会在构建时自动转换为 HTML
- 修改现有文章后需要重新构建
