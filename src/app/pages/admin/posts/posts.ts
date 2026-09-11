import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostsService } from '../../../services/posts.service';
import { Post } from '../../../models/post';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-admin-posts',
  templateUrl: './posts.html',
})
export class AdminPosts implements OnInit {
  protected readonly posts = signal<Post[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busyId = signal<string | null>(null);

  private readonly postsService = inject(PostsService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.postsService.getAdminPosts().subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load posts. Is the API running?');
        this.loading.set(false);
      },
    });
  }

  publish(post: Post): void {
    this.busyId.set(post.id);
    this.postsService.publishPost(post.id).subscribe({
      next: () => this.load(),
      error: () => this.busyId.set(null),
    });
  }

  unpublish(post: Post): void {
    this.busyId.set(post.id);
    this.postsService.unpublishPost(post.id).subscribe({
      next: () => this.load(),
      error: () => this.busyId.set(null),
    });
  }

  delete(post: Post): void {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      return;
    }

    this.busyId.set(post.id);
    this.postsService.deletePost(post.id).subscribe({
      next: () => this.load(),
      error: () => this.busyId.set(null),
    });
  }
}
