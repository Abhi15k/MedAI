import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-form.html',
  styleUrl: './post-form.css'
})
export class PostFormComponent implements OnInit {
  postForm: FormGroup;
  isEditMode = false;
  postId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      body: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.postId = +params['id'];
        this.loadPost(this.postId);
      }
    });
  }

  loadPost(id: number): void {
    this.loading = true;
    this.postService.getPost(id).subscribe({
      next: (post) => {
        this.postForm.patchValue({
          title: post.title,
          body: post.body
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load post. Please try again.';
        this.loading = false;
        console.error('Error loading post:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const postData: Post = {
      userId: 1,
      title: this.postForm.value.title,
      body: this.postForm.value.body
    };

    const request = this.isEditMode && this.postId
      ? this.postService.updatePost(this.postId, { ...postData, id: this.postId })
      : this.postService.createPost(postData);

    request.subscribe({
      next: () => {
        this.loading = false;
        alert(this.isEditMode ? 'Post updated successfully!' : 'Post created successfully!');
        this.router.navigate(['/posts']);
      },
      error: (err) => {
        this.error = 'Failed to save post. Please try again.';
        this.loading = false;
        console.error('Error saving post:', err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/posts']);
  }

  get title() {
    return this.postForm.get('title');
  }

  get body() {
    return this.postForm.get('body');
  }
}
