import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../core/blog.service';
import { AdminPost } from '../../core/models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  selector: 'app-admin-posts',
  styleUrl: './admin-posts.css',
  templateUrl: './admin-posts.html',
})
export class AdminPosts implements OnInit {
  private readonly blog = inject(BlogService);

  protected readonly posts = signal<AdminPost[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  ngOnInit(): void {
    this.blog.getAdminPosts().subscribe({
      next: posts => {
        this.posts.set(posts);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your posts. Please try again.');
        this.loading.set(false);
      },
    });
  }

  protected deletePost(post: AdminPost): void {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      return;
    }

    this.blog.deletePost(post.id).subscribe({
      next: () => this.posts.update(list => list.filter(item => item.id !== post.id)),
      error: () => this.error.set('Could not delete the post. Please try again.'),
    });
  }
}