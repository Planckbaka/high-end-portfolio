# High-End Portfolio

A modern, artistic portfolio website built with Next.js, designed to showcase creative work with premium aesthetics, smooth animations, and a seamless user experience.

![Portfolio Preview](https://grids.obys.agency/og.jpg)
*(Note: Replace with your own screenshot)*

## Features

* **Premium Design**: Minimalist, grid-based layout inspired by high-end design agencies.
* **Smooth Animations**: Powered by [Framer Motion](https://www.framer.com/motion/) for complex entrance and scroll animations.
* **Smooth Scrolling**: Integrated [Lenis](https://github.com/studio-freight/lenis) for a buttery-smooth scroll experience.
* **Dark/Light Mode**: Fully supported theme switching with a custom toggle and system preference detection.
* **Responsive**: Flawless experience across desktop, tablet, and mobile devices.
* **Dynamic Routing**: Includes Home, Articles, and Contact pages with breadcrumb-style navigation.
* **Configurable Data**: Centralized configuration for easy content updates.

## Tech Stack

* **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)

## Installation

Follow these steps to get the project running on your local machine.

### Prerequisites

Ensure you have the following installed:

* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* npm, yarn, pnpm, or bun

### Steps

1. **Clone the repository**

    ```bash
    git clone <your-repo-url>
    cd high-end-portfolio
    ```

2. **Install dependencies**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3. **Run the development server**

    ```bash
    npm run dev
    ```

4. **Open in browser**
    Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Building for Production

To create an optimized production build:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

## Customization

### Content

You can easily update the website content by modifying the configuration file located at:
`src/config/data.ts`

Here you can change:

* Navigation items
* Project list
* Articles
* Social media links
* Contact details

### Styling

Global styles and theme variables are defined in `src/app/globals.css`.
Tailwind configuration can be found in `postcss.config.mjs` (or standard Tailwind config if applicable).

## Project Structure

```
src/
├── app/              # Next.js App Router pages and layouts
│   ├── api/          # API routes (contact form)
│   ├── articles/     # Blog articles
│   └── contact/      # Contact page
├── components/       # Reusable UI components
│   └── ui/           # Specific UI elements (Navbar, Cards, etc.)
├── config/           # Centralized data configuration
├── lib/              # Utilities and helper functions
└── types/            # TypeScript type definitions

docs/                 # Documentation
├── setup/            # Setup and configuration guides
├── deployment/       # Deployment guides
├── development/      # Development guides
└── architecture/     # Architecture and design docs
```

## Documentation

📚 **[Complete Documentation Index](docs/INDEX.md)**

### Quick Links

* **Setup**
  * [Email Quick Start](docs/setup/EMAIL_QUICKSTART.md) - Set up contact form email
  * [Email Setup Guide](docs/setup/EMAIL_SETUP.md) - Detailed email configuration
  
* **Deployment**
  * [Workers Deployment](docs/deployment/WORKERS_DEPLOYMENT.md) - Deploy to Cloudflare Workers
  * [Version Management](docs/deployment/VERSION_MANAGEMENT.md) - Manage project versions
  
* **Development**
  * [Development Guide](docs/development/DEVELOPMENT_GUIDE.md) - Development workflow
  * [Quick Reference](docs/development/QUICK_REFERENCE.md) - Common commands

## Deployment

This project is deployed on **Cloudflare Workers** for optimal global performance.

### Live Site

🌐 **[https://high-end-portfolio.1229773363.workers.dev](https://high-end-portfolio.1229773363.workers.dev)**

### Deploy Your Own

```bash
# 1. Install dependencies
npm install

# 2. Build for Cloudflare Workers
npm run build:cf

# 3. Deploy
npm run deploy
```

For detailed deployment instructions, see [Workers Deployment Guide](docs/deployment/WORKERS_DEPLOYMENT.md).

## Features in Detail

### Contact Form with Email Integration

- ✅ Integrated with Resend API
* ✅ Beautiful HTML email templates
* ✅ Form validation and error handling
* ✅ Direct email to your inbox

See [Email Setup Guide](docs/setup/EMAIL_SETUP.md) for configuration.

### Performance

- ⚡ 27ms Worker startup time
* 🌍 Global CDN distribution
* 📦 76% size reduction with compression
* 🚀 Edge computing with Cloudflare Workers

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

* Design inspiration from [Obys Agency](https://grids.obys.agency/)
* Built with [Next.js](https://nextjs.org/)
* Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)
