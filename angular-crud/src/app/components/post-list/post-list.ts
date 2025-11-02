import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-list',
  imports: [CommonModule],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css'
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private postService: PostService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.error = null;
    this.postService.getPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load posts. Please try again.';
        this.loading = false;
        console.error('Error loading posts:', err);
      }
    });
  }

  onCreateNew(): void {
    this.router.navigate(['/posts/new']);
  }

  onEdit(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/posts/edit', id]);
    }
  }

  onDelete(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(id).subscribe({
        next: () => {
          this.posts = this.posts.filter(post => post.id !== id);
          alert('Post deleted successfully!');
        },
        error: (err) => {
          alert('Failed to delete post. Please try again.');
          console.error('Error deleting post:', err);
        }
      });
    }
  }
}
