# Project Structure Documentation

This document provides a detailed overview of the folder structure, key files, and architectural decisions for the High-End Portfolio project. It serves as a guide for developers to understand where code lives and how different parts of the application interact.

## 📁 Folder Structure Overview

```
high-end-portfolio/
├── .next/                      # Next.js build output (auto-generated, do not edit)
├── node_modules/               # Project dependencies (auto-generated)
├── public/                     # Static assets served at root path
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/                        # Main source code directory
│   ├── app/                    # Next.js App Router (Pages & Layouts)
│   │   ├── articles/           # Articles route group
│   │   │   └── page.tsx        # /articles page
│   │   ├── contact/            # Contact route group
│   │   │   └── page.tsx        # /contact page
│   │   ├── favicon.ico         # Browser tab icon
│   │   ├── globals.css         # Global styles, Tailwind directives, Theme variables
│   │   ├── layout.tsx          # Root layout (Fonts, Providers, SmoothScroll)
│   │   ├── loading.tsx         # Global loading state (Suspense fallback)
│   │   └── page.tsx            # Home page (/)
│   ├── components/             # React Components
│   │   ├── ui/                 # Reusable UI elements (Atoms/Molecules)
│   │   │   ├── GridBackground.tsx   # Decorative background grid
│   │   │   ├── Hero.tsx            # Landing page hero section
│   │   │   ├── Navbar.tsx          # Main navigation bar
│   │   │   ├── ProjectCard.tsx     # Portfolio item display card
│   │   │   ├── SelfIntro.tsx       # "About Me" section card
│   │   │   └── ThemeToggle.tsx     # Dark/Light mode switch
│   │   ├── ErrorBoundary.tsx   # Error handling wrapper
│   │   └── ThemeProvider.tsx   # Context provider for next-themes
│   ├── config/                 # Centralized Configuration & Data
│   │   ├── data.ts             # Static content (Nav, Projects, Articles)
│   │   └── seo.ts              # SEO metadata settings
│   ├── lib/                    # Utilities & Helper Functions
│   │   ├── animations.ts       # Framer Motion variants & constants
│   │   ├── smooth-scroll.tsx   # Lenis scroll integration
│   │   └── utils.ts            # Class name merger (cn)
│   └── types/                  # TypeScript Definitions
│       └── index.ts            # Shared interfaces (Project, Article, etc.)
├── .gitignore                  # Files to exclude from Git
├── DESIGN_SYSTEM.md            # Design guidelines (Colors, Typography)
├── DEVELOPMENT_GUIDE.md        # Best practices for development
├── FOLDER_STRUCTURE.md         # This file
├── README.md                   # Project entry point & setup guide
├── eslint.config.mjs           # Linter configuration
├── next.config.ts              # Next.js framework config
├── next-env.d.ts               # TypeScript declarations for Next.js
├── package.json                # Dependencies & Scripts
├── postcss.config.mjs          # CSS processing config
└── tsconfig.json               # TypeScript compiler config
```

---

## 📂 Directory Deep Dive

### **`/src/app`** - Next.js App Router
This directory maps directly to the URL structure of your website.

*   **`layout.tsx`**: The "shell" of your application. It never unmounts when navigating between pages.
    *   **Context**: Wraps the app in `ThemeProvider` for dark mode.
    *   **Styles**: Imports `globals.css`.
    *   **Fonts**: Loads `Inter` and `Outfit` from Google Fonts.
    *   **Structure**: `<Navbar />` is placed here so it persists across all pages.

*   **`page.tsx`**: The index route (`/`). It composes larger sections like `<Hero>`, `<SelfIntro>`, and `<ProjectCard>`.

*   **`globals.css`**: The engine room for styling.
    *   **Variables**: Defines CSS variables (`--background`, `--foreground`) that change based on the theme.
    *   **Tailwind**: Initializes Tailwind CSS.
    *   **Transitions**: Sets global transition properties for smooth theme switching.

### **`/src/components`** - Building Blocks
*   **`ui/`**: Contains "dumb" or presentational components. They receive data via props and render UI.
    *   **Example**: `ProjectCard.tsx` doesn't fetch data; it takes `title` and `image` as props and displays them.
*   **`ThemeProvider.tsx`**: A "smart" component (Client Component) that uses `next-themes` to manage the active theme state.

### **`/src/config`** - Data & Settings
**Why?** To separate content from code. This allows non-developers (or you in the future) to update text without touching complex React components.

*   **`data.ts`**:
    ```typescript
    export const navItems = [ ... ]; // Update menu links here
    export const projects = [ ... ]; // Add new portfolio projects here
    ```

### **`/src/lib`** - The Toolbox
Helper functions that are used in multiple places.

*   **`utils.ts`**:
    *   `cn(...)`: A utility to conditionally merge Tailwind classes. Essential for dynamic styling (e.g., `cn("base-class", isActive && "active-class")`).
*   **`animations.ts`**:
    *   Stores reusable Framer Motion variants. Instead of hardcoding `duration: 0.8` in every component, we import it from here to maintain consistency.

---

## 🔧 Key Architectural Decisions

### 1. Server vs. Client Components
*   **Server Components (Default)**: Used for pages (`page.tsx`) and layouts to ensure fast initial load and SEO.
*   **Client Components (`"use client"`)**: Used only when interactivity is needed.
    *   `Navbar.tsx`: Needs to know the current path (`usePathname`).
    *   `ThemeToggle.tsx`: Needs to access local storage and change state.
    *   `Hero.tsx`: Uses `framer-motion` for complex animations.

### 2. Styling Strategy
*   **Tailwind CSS**: Used for layout, spacing, and responsive design.
*   **CSS Variables**: Used for colors to support instant Dark/Light mode switching.
    *   Instead of `bg-black` (hardcoded), we use `bg-background` (variable).
    *   In Dark Mode: `--background: #0a0a0a`
    *   In Light Mode: `--background: #f5f5f5`

### 3. Animation System
*   **Framer Motion**: Handles all entrance and interaction animations.
*   **Lenis**: Takes over the native browser scroll to provide a "momentum" feel, which is critical for the "high-end" aesthetic.

---

## 🚀 How to Add New Content

### Adding a New Page
1.  Create a new folder in `src/app/`, e.g., `src/app/about/`.
2.  Create a `page.tsx` inside it.
3.  Export a default React component.
4.  (Optional) Add metadata for SEO.

### Adding a New Project
1.  Open `src/config/data.ts`.
2.  Add a new object to the `projects` array:
    ```typescript
    {
      title: "New Project",
      category: "Web Dev",
      year: "2025"
    }
    ```
3.  The Home page will automatically render the new card.
