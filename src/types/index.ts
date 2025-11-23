// Project types
export interface Project {
    id?: string;
    title: string;
    category: string;
    year: string;
    agency: string;
    grid: string;
    margins: string;
    powerLines: string;
    paddingsSystem: string;
    image: string;
    description?: string;
    tags?: string[];
    url?: string;
}

// Article types
export interface Article {
    id: number;
    title: string;
    date: string;
    category: string;
    excerpt: string;
    slug: string;
    content: string;
}

// Technology types
export interface Technology {
    id: number;
    name: string;
}

// Social Link types
export interface SocialLink {
    name: string;
    url: string;
}

// Contact Details types
export interface ContactDetails {
    email: string;
    phone: string;
    location: string;
}

// Self Intro types
export interface SelfIntroData {
    heading: {
        main: string;
        sub: string;
    };
    description: string;
    roles: string[];
    stats: Array<{
        id: number;
        value: string;
        accent?: string;
        label: string;
    }>;
}

// Navigation types
export interface NavItem {
    name: string;
    path: string;
}

// Animation types
export interface AnimationConfig {
    duration?: number;
    delay?: number;
    ease?: number[] | string;
}

// Component common props
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
}
