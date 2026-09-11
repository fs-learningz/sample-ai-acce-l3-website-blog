export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string | null;
  isPublished: boolean;
  publishedAt: string | null;
}
