import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Importat pentru ngModel
import { PostService, Post, Comment } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { CommentService } from '../../services/comment.service';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, NgForOf, FormsModule], // ✅ Adăugat FormsModule
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {
  posts: Post[] = [];
  currentUserId: number | null = null;
  newCommentContent: { [postId: number]: string } = {};

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private commentService: CommentService
  ) {}

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
        // Initialize comments array if not present
        this.posts.forEach(post => {
          if (!post.comments) {
            post.comments = [];
          }
        });
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

  addComment(post: Post) {
    if (!this.currentUserId) {
      alert('You must be logged in to add a comment.');
      return;
    }
    const content = this.newCommentContent[post.postId || 0];
    if (!content || content.trim() === '') {
      alert('Comment content cannot be empty.');
      return;
    }
    const newComment: Comment = {
      commentContent: content,
      postId: post.postId || 0,
      authorId: this.currentUserId
    };
    this.commentService.addComment(newComment).subscribe({
      next: (comment: Comment) => {
        post.comments?.push(comment);
        this.newCommentContent[post.postId || 0] = '';
      },
      error: (err: any) => console.error('Failed to add comment', err)
    });
  }
  updatePost(post: Post) {
  if (!this.currentUserId) {
    alert('You must be logged in to update a post.');
    return;
  }
  const updatedTitle = prompt('Update post title:', post.postTitle);
  const updatedDescription = prompt('Update post description:', post.postDescription);
  if (updatedTitle && updatedDescription) {
    const updatedPost: Post = {
      ...post,
      postTitle: updatedTitle,
      postDescription: updatedDescription
    };
    this.postService.updatePost(updatedPost).subscribe({
      next: (res: Post) => {
        const index = this.posts.findIndex(p => p.postId === res.postId);
        if (index !== -1) {
          this.posts[index] = res;
        }
      },
      error: (err: any) => console.error('Failed to update post', err)
    });
  }
}

deletePost(post: Post) {
  if (!this.currentUserId) {
    alert('You must be logged in to delete a post.');
    return;
  }
  if (confirm('Are you sure you want to delete this post?')) {
    this.postService.deletePost(post.postId || 0).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.postId !== post.postId);
      },
      error: (err: any) => console.error('Failed to delete post', err)
    });
  }
}

}
