import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService } from '../../core/blog.service';
import { PostDetailData } from '../../core/models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  selector: 'app-post-detail',
  styleUrl: './post-detail.css',
  templateUrl: './post-detail.html',
})
export class PostDetail implements OnInit {
  private readonly blog = inject(BlogService);
  private readonly route = inject(ActivatedRoute);

  protected readonly post = signal<PostDetailData | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = rawId === null ? Number.NaN : Number(rawId);

    if (!Number.isInteger(id) || id <= 0) {
      this.error.set('This post does not exist.');
      this.loading.set(false);
      return;
    }

    this.blog.getPublishedPost(id).subscribe({
      next: post => {
        this.post.set(post);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('This post does not exist or has not been published yet.');
        this.loading.set(false);
      },
    });
  }
}