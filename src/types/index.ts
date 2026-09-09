export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  problem: string;
  contribution: string;
  tradeoff: string;
  validation: string;
  limitations: string;
  articles: string[];
  url?: string;
}
export interface Article {
  id: string | number;
  title: string;
  date: string;
  updatedAt?: string;
  category: string;
  excerpt: string;
  slug: string;
  content: string;
  readingTime?: string;
  tags?: string[];
  series?: string;
  seriesOrder?: number;
  featured?: boolean;
  draft?: boolean;
  lang?: string;
  labPath?: string;
  toc?: { id: string; text: string; depth: number }[];
}
export type ArticleSummary = Omit<Article, "content" | "toc">;
export interface NavItem {
  name: string;
  path: string;
}
export interface Technology {
  id: number;
  name: string;
}
export interface SocialLink {
  name: string;
  url: string;
}
export interface ContactDetails {
  email: string;
  phone: string;
  location: string;
}
export interface SelfIntroData {
  heading: { main: string; sub: string };
  description: string;
  roles: string[];
  stats: { id: number; value: string; accent?: string; label: string }[];
}
export interface UpcomingTopic {
  id: string;
  title: string;
  category: string;
  status: "planning" | "outline" | "drafting" | "reviewing";
  estimatedDate: string;
  description: string;
}
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  ease?: number[] | string;
}
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}
