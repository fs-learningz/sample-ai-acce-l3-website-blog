import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostsService } from '../../../services/posts.service';
import { Post } from '../../../models/post';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-editor',
  templateUrl: './editor.html',
})
export class Editor implements OnInit {
  protected readonly postId = signal<string | null>(null);
  protected readonly original = signal<Post | null>(null);

  protected readonly title = signal('');
  protected readonly content = signal('');

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);

  protected readonly isEdit = computed(() => this.postId() !== null);
  protected readonly isPublished = computed(() => this.original()?.isPublished ?? false);
  protected readonly canSave = computed(
    () => this.title().trim().length > 0 && this.content().trim().length > 0,
  );

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly postsService = inject(PostsService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.postId.set(id);
    this.postsService.getAdminPosts().subscribe({
      next: (posts) => {
        const post = posts.find((p) => p.id === id);
        if (!post) {
          this.error.set('Post not found.');
        } else {
          this.original.set(post);
          this.title.set(post.title);
          this.content.set(post.content);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load post.');
        this.loading.set(false);
      },
    });
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.notice.set(null);

    const onSuccess = (post: Post) => {
      this.original.set(post);
      this.saving.set(false);
      this.notice.set(post.isPublished ? 'Post saved.' : 'Draft saved.');
      if (!this.postId()) {
        this.postId.set(post.id);
        this.router.navigate(['/admin/editor', post.id], { replaceUrl: true });
      }
    };

    if (this.postId()) {
      this.postsService
        .updatePost(this.postId()!, { title: this.title(), content: this.content() })
        .subscribe({ next: onSuccess, error: () => this.fail('Failed to save post.') });
    } else {
      this.postsService
        .createPost({ title: this.title(), content: this.content() })
        .subscribe({ next: onSuccess, error: () => this.fail('Failed to create post.') });
    }
  }

  publish(): void {
    const id = this.postId();
    if (!id) {
      this.error.set('Save the post before publishing.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.notice.set(null);
    this.postsService.publishPost(id).subscribe({
      next: (post) => {
        this.original.set(post);
        this.saving.set(false);
        this.notice.set('Post published. It is now visible to readers.');
      },
      error: () => this.fail('Failed to publish post.'),
    });
  }

  unpublish(): void {
    const id = this.postId();
    if (!id) {
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.notice.set(null);
    this.postsService.unpublishPost(id).subscribe({
      next: (post) => {
        this.original.set(post);
        this.saving.set(false);
        this.notice.set('Post unpublished. Readers can no longer see it.');
      },
      error: () => this.fail('Failed to unpublish post.'),
    });
  }

  delete(): void {
    const id = this.postId();
    if (!id || !confirm('Delete this post? This cannot be undone.')) {
      return;
    }

    this.saving.set(true);
    this.postsService.deletePost(id).subscribe({
      next: () => this.router.navigate(['/admin/posts']),
      error: (err: HttpErrorResponse) => this.fail(err.error?.message ?? 'Failed to delete post.'),
    });
  }

  private fail(message: string): void {
    this.error.set(message);
    this.saving.set(false);
  }
}
