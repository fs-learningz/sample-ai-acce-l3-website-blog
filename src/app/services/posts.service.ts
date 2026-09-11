import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../models/post';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:10010/api';

  getPublishedPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/posts`);
  }

  getPost(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/posts/${id}`);
  }

  getAdminPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/admin/posts`);
  }

  createPost(post: { title: string; content: string; author: string }): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/admin/posts`, post);
  }

  updatePost(id: string, post: { title: string; content: string }): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/admin/posts/${id}`, post);
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/posts/${id}`);
  }

  publishPost(id: string): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/admin/posts/${id}/publish`, {});
  }

  unpublishPost(id: string): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/admin/posts/${id}/unpublish`, {});
  }
}
