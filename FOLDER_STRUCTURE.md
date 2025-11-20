# Project Structure Documentation

## 📁 Folder Structure Overview

```
high-end-portfolio/
├── .next/                      # Next.js build output (auto-generated)
├── node_modules/               # Dependencies (auto-generated)
├── public/                     # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/                        # Source code
│   ├── app/                    # Next.js App Router
│   │   ├── favicon.ico         # Browser favicon
│   │   ├── globals.css         # Global styles & CSS variables
│   │   ├── layout.tsx          # Root layout with fonts & SmoothScroll
│   │   ├── loading.tsx         # Global loading state (NEW)
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── ui/                 # UI components
│   │   │   ├── GridBackground.tsx   # Decorative grid overlay
│   │   │   ├── Hero.tsx            # Hero section with animations
│   │   │   └── ProjectCard.tsx     # Project display card
│   │   └── ErrorBoundary.tsx   # Error handling wrapper (NEW)
│   ├── config/                 # Configuration files (NEW)
│   │   └── seo.ts              # SEO metadata configuration
│   ├── lib/                    # Utility libraries
│   │   ├── animations.ts       # Animation constants & variants (NEW)
│   │   ├── smooth-scroll.tsx   # Lenis smooth scroll wrapper
│   │   └── utils.ts            # Utility functions (cn helper)
│   └── types/                  # TypeScript type definitions (NEW)
│       └── index.ts            # Shared type definitions
├── .gitignore                  # Git ignore rules
├── DESIGN_SYSTEM.md            # Design system guidelines
├── DEVELOPMENT_GUIDE.md        # Development best practices
├── README.md                   # Project documentation
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js configuration
├── next-env.d.ts               # Next.js TypeScript declarations
├── package.json                # Dependencies & scripts
├── package-lock.json           # Locked dependencies
├── postcss.config.mjs          # PostCSS configuration
└── tsconfig.json               # TypeScript configuration
```

---

## 📂 Directory Deep Dive

### **`/public`** - Static Assets
**Purpose**: Stores publicly accessible static files that can be referenced directly in your code.

**Contents**:
- SVG icons and images
- Any files placed here are served at the root URL path

**Usage**:
```tsx
<Image src="/next.svg" alt="Next.js Logo" />
```

---

### **`/src/app`** - Next.js App Router
**Purpose**: The core of your Next.js application using the App Router architecture.

**Key Files**:

#### `layout.tsx` (Root Layout)
- **Role**: Wraps ALL pages in the application
- **Responsibilities**:
  - Defines HTML structure (`<html>`, `<body>`)
  - Loads Google Fonts (Inter, Outfit)
  - Applies global CSS classes
  - Wraps content with `<SmoothScroll>` for Lenis
  - Sets metadata (title, description)

#### `page.tsx` (Home Page)
- **Role**: The landing page (`/` route)
- **Components Used**:
  - `<GridBackground />` - Visual grid overlay
  - `<Hero />` - Animated hero section
  - `<ProjectCard />` - Project showcase cards
- **Data**: Hardcoded projects array (consider moving to `/src/data` in future)

#### `loading.tsx` (Loading State)
- **Role**: Displayed while page content is loading
- **Automatic**: Next.js shows this during Suspense boundaries

#### `globals.css` (Global Styles)
- **Role**: Contains:
  - CSS custom properties (colors, fonts)
  - Tailwind CSS imports
  - Tailwind theme extensions (animations, keyframes)
  - Lenis smooth scroll styles

---

### **`/src/components`** - React Components

#### **`/src/components/ui`** - UI Components
Reusable, presentational components.

**`GridBackground.tsx`**
- **Purpose**: Renders vertical grid lines for visual structure
- **Props**: `className` (optional)
- **Styling**: Fixed position, responsive grid lines

**`Hero.tsx`**
- **Purpose**: Animated hero section with staggered text reveals
- **Features**:
  - Custom `OverflowText` component for slide-up animations
  - Framer Motion for orchestrated animations
  - Responsive typography using viewport units (`vw`)

**`ProjectCard.tsx`**
- **Purpose**: Displays individual project information
- **Props**: `title`, `category`, `year`, `index`
- **Features**:
  - Scroll-triggered animations (`whileInView`)
  - Hover effects with transforms
  - Staggered entrance based on index

#### **`ErrorBoundary.tsx`** (NEW)
- **Purpose**: Catches React errors and displays fallback UI
- **Usage**: Wrap around components that might throw errors
- **Features**: Reload button, error message display

---

### **`/src/lib`** - Utility Libraries

#### **`utils.ts`**
- **Purpose**: Common utility functions
- **Export**: `cn()` - Combines Tailwind classes with clsx and tailwind-merge

#### **`smooth-scroll.tsx`**
- **Purpose**: Integrates Lenis for smooth momentum scrolling
- **Features**:
  - Custom easing function
  - Proper cleanup with `cancelAnimationFrame`
  - Type-safe with refs

#### **`animations.ts`** (NEW)
- **Purpose**: Centralized animation constants
- **Exports**:
  - `EASINGS` - Reusable easing curves
  - `DURATIONS` - Standard timing values
  - Animation variants (fadeIn, slideUp, scaleUp)

---

### **`/src/config`** (NEW) - Configuration

#### **`seo.ts`**
- **Purpose**: Centralized SEO metadata configuration
- **Exports**:
  - `siteConfig` - Site-wide settings
  - `defaultMetadata` - OpenGraph, Twitter cards, robots

**Usage**:
```tsx
// In layout.tsx or page.tsx
import { defaultMetadata } from "@/config/seo";
export const metadata = defaultMetadata;
```

---

### **`/src/types`** (NEW) - TypeScript Types

#### **`index.ts`**
- **Purpose**: Shared type definitions
- **Types**:
  - `Project` - Project data structure
  - `AnimationConfig` - Animation parameters
  - `BaseComponentProps` - Common component props

**Usage**:
```tsx
import { Project } from "@/types";

const project: Project = {
  title: "Example",
  category: "Web Design",
  year: "2024"
};
```

---

## 🔧 Configuration Files

### **`tsconfig.json`** - TypeScript Configuration
Key settings:
- **Path aliases**: `@/*` maps to `./src/*`
- **JSX**: React 19 JSX transform
- **Strict mode**: Enabled for type safety

### **`next.config.ts`** - Next.js Configuration
- **React Compiler**: Enabled for performance optimizations

### **`package.json`** - Dependencies
**Key Dependencies**:
- `next` - Framework
- `react` & `react-dom` - UI library
- `framer-motion` - Animations
- `lenis` - Smooth scrolling
- `tailwindcss` - Styling
- `clsx` & `tailwind-merge` - Class management
- `lucide-react` - Icons

**Scripts**:
- `dev` - Development server
- `build` - Production build
- `start` - Production server
- `lint` - Run ESLint

---

## 🎨 Design System Files

### **`DESIGN_SYSTEM.md`**
Documents:
- Color palette with usage guidelines
- Typography hierarchy
- Component patterns
- Animation principles

### **`DEVELOPMENT_GUIDE.md`**
Guides:
- Adding new pages
- Animation patterns
- Styling conventions

---

## 🚀 Best Practices

### **File Organization**
1. **Components**: Keep presentational components in `/components/ui`
2. **Business Logic**: Create `/lib/hooks` for custom React hooks
3. **Data**: Consider adding `/src/data` for static content
4. **API Routes**: Use `/src/app/api` for server endpoints

### **Naming Conventions**
- **Components**: PascalCase (e.g., `Hero.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`)
- **Types**: PascalCase interfaces/types
- **Constants**: UPPER_SNAKE_CASE (e.g., `DURATIONS`)

### **Import Aliases**
Always use `@/` prefix for absolute imports:
```tsx
// ✅ Good
import { Hero } from "@/components/ui/Hero";

// ❌ Avoid
import { Hero } from "../../components/ui/Hero";
```

---

## 📦 Future Expansion Suggestions

### Recommended New Directories:
```
src/
├── data/           # Static data (projects, testimonials)
├── hooks/          # Custom React hooks
├── contexts/       # React Context providers
├── utils/          # Non-React utilities
└── styles/         # Additional CSS modules
```

### Example Structure for Scaling:
```
src/
├── app/
│   ├── (marketing)/    # Route group for marketing pages
│   │   ├── about/
│   │   └── contact/
│   ├── (projects)/     # Route group for project pages
│   │   └── [slug]/
│   └── api/            # API routes
├── components/
│   ├── layout/         # Header, Footer, Navigation
│   ├── ui/             # Presentational components
│   └── features/       # Feature-specific components
```

---

## 🔍 Path Resolution

The project uses TypeScript path mapping:
- `@/*` resolves to `src/*`
- Configured in `tsconfig.json`

**Example**:
```tsx
import { cn } from "@/lib/utils";           // → src/lib/utils
import { Hero } from "@/components/ui/Hero"; // → src/components/ui/Hero
import { Project } from "@/types";          // → src/types/index
```

---

## 📝 Notes

- **App Router**: This project uses Next.js 13+ App Router (not Pages Router)
- **Server Components**: Components are Server Components by default
- **Client Components**: Must add `"use client"` directive for:
  - React hooks (useState, useEffect)
  - Browser APIs
  - Interactive components
- **Build Output**: `.next/` folder contains optimized production build
- **Node Modules**: Always in `.gitignore`, install with `npm install`
