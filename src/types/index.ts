// Project types
export interface Project {
    id?: string;
    title: string;
    category: string;
    year: string;
    description?: string;
    image?: string;
    tags?: string[];
    url?: string;
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
