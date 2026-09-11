import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostsService } from '../../services/posts.service';
import { Post } from '../../models/post';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  protected readonly posts = signal<Post[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly postsService = inject(PostsService);

  ngOnInit(): void {
    this.postsService.getPublishedPosts().subscribe({
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
}
