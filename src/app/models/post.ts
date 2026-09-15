export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorUsername: string;
  createdAt: string;
  updatedAt: string | null;
  isPublished: boolean;
  publishedAt: string | null;
}
