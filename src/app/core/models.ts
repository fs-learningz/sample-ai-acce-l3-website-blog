export type PostStatus = 'draft' | 'published';

export interface PostSummary {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  publishedAtUtc: string | null;
}

export interface PostDetailData {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  publishedAtUtc: string | null;
}

export interface AdminPost {
  id: number;
  title: string;
  content: string;
  status: PostStatus;
  author: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  publishedAtUtc: string | null;
}

export interface PostSaveRequest {
  title: string;
  content: string;
  status: PostStatus;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresAtUtc: string;
}