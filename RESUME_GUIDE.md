# 如何在 Cloudflare 上托管简历 PDF

有两种主要方式可以实现：

## 方法一：直接放入项目 (推荐，最简单)

这是最简单的方法，因为你的网站是 Next.js 项目，Next.js 会自动服务 `public` 文件夹中的静态文件。

1. **准备文件**：
   将你的简历 PDF 重命名为 `resume.pdf`。

2. **放入目录**：
   将文件直接拖入项目的 `public/` 文件夹中。
   路径应该是：`high-end-portfolio/public/resume.pdf`

3. **部署**：
   当你将代码推送到 GitHub (并触发 Cloudflare Pages 构建) 后，你的简历就可以通过以下链接访问：
   `https://你的域名.com/resume.pdf`

   *在本地开发时，可以通过 `http://localhost:3000/resume.pdf` 访问测试。*

## 方法二：使用 Cloudflare R2 (适合大文件或需要独立管理)

如果你不想把 PDF 放在代码仓库里：

1. 登录 Cloudflare Dashboard。
2. 点击左侧的 **R2**。
3. 创建一个 Bucket (例如命名为 `portfolio-assets`)。
4. 上传 `resume.pdf`。
5. 在 Bucket 设置中，配置 **Public Access** (自定义域或 R2.dev 子域)。
6. 获取公开链接，例如 `https://assets.你的域名.com/resume.pdf`。

---

## 推荐做法

对于个人博客，**方法一** 是最完美的。它不需要额外配置，且加载速度极快。
