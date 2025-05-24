import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel
import { PostService, Post, Comment } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { CommentService } from '../../services/comment.service';
import { ReservationService, Reservation } from '../../services/reservation.service';
import { Router } from '@angular/router';
import { BackButtonComponent } from '../back-button/back-button.component';

import { PostsNewComponent } from './posts-new.component';
import { PostsEditComponent } from './posts-edit.component';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PostsNewComponent,
    PostsEditComponent,
    BackButtonComponent
  ],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {
  posts: Post[] = [];
  currentUserId: number | null = null;
  newCommentContent: { [postId: number]: string } = {};
  editingPostId?: number;
  reservationsMap: Map<number, Reservation> = new Map();
  showAddPostForm = false;

  constructor(
  private postService: PostService,
  private authService: AuthService,
  private commentService: CommentService,
  private reservationService: ReservationService,
  private router: Router
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
        // Sort posts by createdAt (newest first)
        this.posts = this.posts.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        // Initialize comments array if not present
        this.posts.forEach(post => {
          if (!post.comments) {
            post.comments = [];
          }
        });
        this.loadAllReservationsAndMap();
      },
      error: (err: any) => console.error('Failed to load posts', err)
    });
  }

loadAllReservationsAndMap() {
  this.reservationService.getAllReservations().subscribe({
    next: (reservations: Reservation[]) => {
      this.reservationsMap.clear();
      // Store all reservations, not just user's reservations
      reservations.forEach(reservation => {
        this.reservationsMap.set(reservation.reservationId || 0, reservation);
      });
      this.assignReservationsToPosts();
    },
    error: (err: any) => console.error('Failed to load reservations', err)
  });
}


  private assignReservationsToPosts(): void {
    this.posts.forEach(post => {
      if (post.reservationId) {
        const reservation = this.reservationsMap.get(post.reservationId);
        if (reservation) {
          post.reservation = {
            ...reservation,
            fieldId: (reservation as any).fieldId ?? (reservation as any).FieldId,
            startTime: (reservation as any).startTime ?? (reservation as any).StartTime,
            endTime: (reservation as any).endTime ?? (reservation as any).EndTime,
            authorId: (reservation as any).authorId ?? (reservation as any).AuthorId,
          };
        }
      }
    });
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

  openEditPost(post: Post) {
    if (!this.currentUserId) {
      alert('You must be logged in to edit a post.');
      return;
    }
    if (post.authorId !== this.currentUserId) {
      alert('Nu ai permisiunea să modifici această postare.');
      return;
    }
    this.editingPostId = post.postId;
  }

  onPostUpdated(post: Post) {
    this.editingPostId = undefined;
    this.loadPosts();
  }
logout() {
  this.authService.logout();
  this.router.navigate(['/login']);
}
  deletePost(post: Post) {
    if (!this.currentUserId) {
      alert('You must be logged in to delete a post.');
      return;
    }
    if (post.authorId !== this.currentUserId) {
      alert('Nu ai permisiunea să ștergi această postare.');
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

  onPostCreated() {
    this.showAddPostForm = false;
    this.loadPosts();
  }
}
