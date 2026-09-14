import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BlogService } from '../../core/blog.service';
import { AdminPost, PostSaveRequest, PostStatus } from '../../core/models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-post-editor',
  styleUrl: './post-editor.css',
  templateUrl: './post-editor.html',
})
export class PostEditor implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly blog = inject(BlogService);

  protected readonly postId = signal<number | null>(null);
  protected readonly isEditMode = computed(() => this.postId() !== null);

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected readonly form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    content: ['', Validators.required],
    status: ['draft' as PostStatus],
  });

  ngOnInit(): void {
    const stateMessage = history.state?.['successMessage'];
    if (typeof stateMessage === 'string') {
      this.successMessage.set(stateMessage);
    }

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(paramMap => {
      const rawId = paramMap.get('id');
      const id = rawId === null ? Number.NaN : Number(rawId);

      if (!Number.isInteger(id) || id <= 0) {
        this.postId.set(null);
        this.errorMessage.set('');
        this.form.reset({ title: '', content: '', status: 'draft' });
        return;
      }

      this.postId.set(id);
      this.loadPost(id);
    });
  }

  protected save(statusOverride?: PostStatus): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Please provide a title and content before saving.');
      this.successMessage.set('');
      return;
    }

    const { title, content } = this.form.getRawValue();
    const request: PostSaveRequest = {
      title,
      content,
      status: statusOverride ?? this.form.getRawValue().status,
    };

    const id = this.postId();
    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const operation = id === null ? this.blog.createPost(request) : this.blog.updatePost(id, request);

    operation.subscribe({
      next: post => {
        this.saving.set(false);

        if (id === null) {
          this.successMessage.set('Post created. Keep editing or head back to your posts.');
          this.router.navigate(['/admin/editor', post.id], {
            state: { successMessage: 'Post created. Keep editing or head back to your posts.' },
          });
        } else {
          this.form.patchValue({ status: post.status });
          this.successMessage.set(
            post.status === 'published' ? 'Post saved and published.' : 'Post saved as draft.',
          );
        }
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('Could not save the post. Please try again.');
      },
    });
  }

  protected saveAsDraft(): void {
    this.save('draft');
  }

  protected publish(): void {
    this.save('published');
  }

  protected delete(): void {
    const id = this.postId();
    if (id === null) {
      return;
    }
    if (!window.confirm('Delete this post permanently?')) {
      return;
    }

    this.blog.deletePost(id).subscribe({
      next: () => this.router.navigate(['/admin']),
      error: () => this.errorMessage.set('Could not delete the post. Please try again.'),
    });
  }

  private loadPost(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.blog.getAdminPost(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (post: AdminPost) => {
        this.form.patchValue({ title: post.title, content: post.content, status: post.status });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load this post.');
        this.loading.set(false);
      },
    });
  }
}