import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format ISO datetime string to readable date format
 * @param datetime - ISO datetime string from API
 * @returns Formatted date string (e.g., "12 Mar 2025")
 */
export function formatArticleDate(datetime: string | Date): string {
  if (!datetime) return "";
  const date = typeof datetime === 'string' ? new Date(datetime) : datetime;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Map category name to color class for styling
 * @param category - Category name from Article
 * @returns Color identifier for pillarColor mapping
 */
export function getCategoryColor(category: string | null | undefined): string {
  if (!category) return "leadership";

  const mapping: Record<string, string> = {
    "Leadership": "leadership",
    "Branch Development": "branch",
    "Resource Mobilisation": "resource",
    "Finance Development": "finance",
  };

  return mapping[category] || "leadership";
}

/**
 * Transform Article API response to NewsItem format expected by components
 */
export interface Article {
  name: string;
  title: string;
  slug: string;
  subtitle?: string;
  summary: string;
  body: string;
  cover_image?: string;
  article_type: string;
  category: string;
  author: string;
  published_on: string;
  read_time?: number;
  is_featured?: number;
  sort_order?: number;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
}

export interface NewsItem {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  body: string;
  date: string;
  place: string;
  color: string;
}

export function mapArticleToNewsItem(article: Article): NewsItem {
  return {
    slug: article.slug,
    tag: article.category,
    title: article.title,
    excerpt: article.summary,
    body: article.body,
    date: formatArticleDate(article.published_on),
    place: "", // Location field removed
    color: getCategoryColor(article.category),
  };
}
