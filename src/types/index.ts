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
export interface PaperReference {
  title: string;
  arxiv: string;
  year?: number;
  tag?: string;
  firstCiteId?: string;
}
export interface TocEntry {
  id: string;
  text: string;
  depth: number;
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
  related?: string[];
  series?: string;
  seriesOrder?: number;
  featured?: boolean;
  draft?: boolean;
  lang?: string;
  labPath?: string;
  papers?: PaperReference[];
  toc?: TocEntry[];
}
export type ArticleSummary = Omit<Article, "content">;
export interface LabFile {
  name: string;
  relativePath: string;
  language: string;
  kind: "impl" | "test" | "result";
  defaultOpen: boolean;
  html: string;
  lineCount: number;
}
export interface LabSummary {
  track: "go" | "python" | "llm";
  name: string;
  labPath: string;
  title: string;
  summary: string;
  runCommands: string[];
  fileCount: number;
  companionSlugs: string[];
}
export interface LabDetail extends LabSummary {
  readmeHtml: string;
  files: LabFile[];
}
export interface LabsManifest {
  overviewHtml: string;
  labs: LabSummary[];
}
export interface NavItem {
  name: string;
  path: string;
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
