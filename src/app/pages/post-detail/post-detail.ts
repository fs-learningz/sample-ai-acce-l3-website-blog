import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostsService } from '../../services/posts.service';
import { Post } from '../../models/post';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-post-detail',
  templateUrl: './post-detail.html',
})
export class PostDetail implements OnInit {
  protected readonly post = signal<Post | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly postsService = inject(PostsService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Post not found.');
      this.loading.set(false);
      return;
    }

    this.postsService.getPost(id).subscribe({
      next: (post) => {
        this.post.set(post);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('This post does not exist or is not published.');
        this.loading.set(false);
      },
    });
  }
}
