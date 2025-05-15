import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgForOf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PostService, Post, Comment } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { CommentService } from '../../services/comment.service';
import { ReservationService, Reservation } from '../../services/reservation.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgForOf, RouterModule],
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

    addReservation() {
        if (!this.currentUserId) {
          alert('You must be logged in to make a reservation.');
          return;
        }
    
        const startTimeStr = prompt('Enter start time (ISO format, e.g., 2025-05-14T10:00):');
        const endTimeStr = prompt('Enter end time (ISO format, e.g., 2025-05-14T11:00):');
        const fieldId = Number(prompt('Enter field ID:'));
        const participantIds = prompt('Enter participant IDs (comma-separated):')?.split(',').map(id => Number(id.trim())) || [];
       
        if (startTimeStr && endTimeStr && fieldId) {
          const startTime = new Date(startTimeStr);
          const endTime = new Date(endTimeStr);
          if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            alert('Invalid date format for start or end time.');
            return;
          }
          const reservation: Reservation = {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            authorId: this.currentUserId,
            fieldId,
            participantIds: participantIds  // Assign parsed participantIds here
          };
  
          this.reservationService.addReservation(reservation).subscribe({
            next: (res) => {
              alert('Rezervare salvată cu succes!');
              console.log('Rezervare:', res);
              // Dacă vrei, poți reîncărca postările aici cu `this.loadPosts();`
            },
            error: (err) => {
              console.error('Eroare la salvare rezervare:', err);
              alert('A apărut o eroare: ' + (err?.message || JSON.stringify(err)));
            }
  
          });
        } else {
          alert('Datele introduse nu sunt valide.');
        }
  }
  deleteReservation(reservation: Reservation) {
    if (!reservation.reservationId) {
      alert('Reservation ID missing!');
      return;
    }
    if (confirm('Ești sigur că vrei să ștergi această rezervare?')) {
      this.reservationService.deleteReservation(reservation.reservationId).subscribe({
        next: () => {
          this.reservations = this.reservations.filter(r => r.reservationId !== reservation.reservationId);
          alert('Rezervarea a fost ștearsă.');
        },
        error: (err) => {
          console.error('Eroare la ștergere rezervare:', err);
          alert('A apărut o eroare la ștergere.');
        }
      });
    }
  }
  editReservation(reservation: Reservation) {
    if (!reservation.reservationId) {
      alert('Reservation ID missing!');
      return;
    }

    const startTimeStr = prompt('Enter new start time (ISO format):', reservation.startTime);
    const endTimeStr = prompt('Enter new end time (ISO format):', reservation.endTime);
    const fieldIdStr = prompt('Enter new field ID:', reservation.fieldId.toString());
    const participantIdsStr = prompt(
      'Enter new participant IDs (comma-separated):',
      reservation.participantIds.join(',')
    );

    if (startTimeStr && endTimeStr && fieldIdStr && participantIdsStr) {
      const startTime = new Date(startTimeStr);
      const endTime = new Date(endTimeStr);
      const fieldId = Number(fieldIdStr);
      const participantIds = participantIdsStr.split(',').map(id => Number(id.trim()));

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || isNaN(fieldId)) {
        alert('Invalid input.');
        return;
      }

      // Trimite DTO-ul cu proprietăți cu majusculă, conform backend-ului
      const updatedReservation = {
        ReservationId: reservation.reservationId,
        StartTime: startTime.toISOString(),
        EndTime: endTime.toISOString(),
        FieldId: fieldId,
        AuthorId: reservation.authorId,
        ParticipantIds: participantIds
      };

      this.reservationService.updateReservation(reservation.reservationId, updatedReservation).subscribe({
        next: (res) => {
          alert('Rezervarea a fost modificată cu succes!');
          this.loadReservations();
        },
        error: (err) => {
          console.error('Eroare la modificare rezervare:', err);
          alert('A apărut o eroare la modificare.');
        }
      });
    } else {
      alert('Datele introduse nu sunt valide.');
    }
  }
}
