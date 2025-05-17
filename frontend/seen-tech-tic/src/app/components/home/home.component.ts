import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgForOf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PostService, Post, Comment } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { CommentService } from '../../services/comment.service';
import { ReservationService, Reservation } from '../../services/reservation.service';
import { HeaderComponent } from '../../components/header/header.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    NgForOf,
    RouterModule,
    HeaderComponent ,// 👈 aici îl adaugi
    ReactiveFormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [DatePipe]
})
export class HomeComponent implements OnInit {
  profileIcon = 'assets/profile-icon.png';

  posts: Post[] = [];
  currentUserId: number | null = null;
  reservations: Reservation[] = [];

  constructor(
    private router: Router,
    private postService: PostService,
    private authService: AuthService,
    private commentService: CommentService,
    private reservationService: ReservationService 
  ) {}

  ngOnInit() {
    this.authService.currentUserId$.subscribe((id: number | null) => {
      this.currentUserId = id;
      console.log('Current User ID:', this.currentUserId);
    });
    this.loadPosts();
    this.loadReservations();
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
  loadReservations() {
    this.reservationService.getAllReservations().subscribe({
      next: (data: any) => {
        console.log('Reservations loaded:', JSON.stringify(data, null, 2));
        if (data && data.$values && Array.isArray(data.$values)) {
          this.reservations = data.$values;
        } else if (Array.isArray(data)) {
          this.reservations = data;
        } else {
          console.error('Unexpected reservations data format', data);
          this.reservations = [];
        }
      },
      error: (err: any) => console.error('Failed to load reservations', err)
    });
  }

  loadPosts() {
    this.postService.getPosts().subscribe({
      next: (data: any) => {
        console.log('Posts loaded:', JSON.stringify(data, null, 2));
        if (data && data.$values && Array.isArray(data.$values)) {
          this.posts = data.$values;
        } else if (Array.isArray(data)) {
          this.posts = data;
        } else {
          console.error('Unexpected posts data format', data);
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

  addComment(post: Post) {
    if (!this.currentUserId) {
      alert('You must be logged in to add a comment.');
      return;
    }
    const commentContent = prompt('Enter your comment:');
    if (commentContent) {
      const newComment: Comment = {
        commentContent,
        postId: post.postId!,
        authorId: this.currentUserId,
        createdAt: new Date().toISOString()
      };
      this.commentService.addComment(newComment).subscribe({
        next: (comment: Comment) => {
          if (!Array.isArray(post.comments)) {
            post.comments = [];
          }
          // Set author username from current user for immediate display
          comment.author = { userId: this.currentUserId!, username: 'You' };
          post.comments.unshift(comment);
        },
        error: (err: any) => console.error('Failed to add comment', err)
      });
    }
  }

 

}
