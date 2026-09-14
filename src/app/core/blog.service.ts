import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminPost, PostDetailData, PostSaveRequest, PostSummary } from './models';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = '/api';

  getPublishedPosts(): Observable<PostSummary[]> {
    return this.http.get<PostSummary[]>(`${this.apiBaseUrl}/posts`);
  }

  getPublishedPost(id: number): Observable<PostDetailData> {
    return this.http.get<PostDetailData>(`${this.apiBaseUrl}/posts/${id}`);
  }

  getAdminPosts(): Observable<AdminPost[]> {
    return this.http.get<AdminPost[]>(`${this.apiBaseUrl}/admin/posts`);
  }

  getAdminPost(id: number): Observable<AdminPost> {
    return this.http.get<AdminPost>(`${this.apiBaseUrl}/admin/posts/${id}`);
  }

  createPost(request: PostSaveRequest): Observable<AdminPost> {
    return this.http.post<AdminPost>(`${this.apiBaseUrl}/admin/posts`, request);
  }

  updatePost(id: number, request: PostSaveRequest): Observable<AdminPost> {
    return this.http.put<AdminPost>(`${this.apiBaseUrl}/admin/posts/${id}`, request);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/admin/posts/${id}`);
  }
}