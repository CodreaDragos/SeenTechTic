import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import { PostService, Post } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, NgForOf],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {
  posts: Post[] = [];
  currentUserId: number | null = null;

  constructor(private postService: PostService, private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUserId$.subscribe((id: number | null) => {
      this.currentUserId = id;
    });
    this.loadPosts();
  }

  loadPosts() {
    this.postService.getPosts().subscribe({
      next: (data: any) => {
        if (data && data.$values && Array.isArray(data.$values)) {
          this.posts = data.$values;
        } else if (Array.isArray(data)) {
          this.posts = data;
        } else {
          this.posts = [];
        }
      },
      error: (err: any) => console.error('Failed to load posts', err)
    });
  }

  addPost() {
    if (!this.currentUserId) {
      alert('You must be logged in to add a post.');
      return;
    }
    const postTitle = prompt('Enter post title:');
    const postDescription = prompt('Enter post description:');
    if (postTitle && postDescription) {
      const newPost: Post = {
        postTitle,
        postDescription,
        authorId: this.currentUserId,
        reservationId: null,
        createdAt: new Date().toISOString()
      };
      this.postService.addPost(newPost).subscribe({
        next: (post: Post) => {
          this.posts.unshift(post);
        },
        error: (err: any) => console.error('Failed to add post', err)
      });
    }
  }
}
