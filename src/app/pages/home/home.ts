import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../core/blog.service';
import { PostSummary } from '../../core/models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private readonly blog = inject(BlogService);

  protected readonly posts = signal<PostSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  ngOnInit(): void {
    this.blog.getPublishedPosts().subscribe({
      next: posts => {
        this.posts.set(posts);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load the posts right now. Please try again later.');
        this.loading.set(false);
      },
    });
  }
}