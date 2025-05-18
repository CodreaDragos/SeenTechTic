import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PostService, Post } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { ReservationService, Reservation } from '../../services/reservation.service';

@Component({
  selector: 'app-posts-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './posts-edit.component.html',
  styleUrls: []  // Removed reference to missing stylesheet
})
export class PostsEditComponent implements OnInit, OnChanges {
  currentUserId: number | null = null;
  postForm!: FormGroup;
  showEditForm = false;
  reservations: Reservation[] = [];
  selectedReservationId: number | null = null;

  @Input() editPost?: Post;
  @Output() postUpdated = new EventEmitter<Post>();

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private authService: AuthService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUserId$.subscribe(id => this.currentUserId = id);
    this.loadReservations();

    this.postForm = this.fb.group({
      postTitle: ['', Validators.required],
      postDescription: ['', Validators.required],
      reservationId: [null]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editPost'] && this.editPost) {
      this.showEditForm = true;
      this.postForm.patchValue({
        postTitle: this.editPost.postTitle,
        postDescription: this.editPost.postDescription,
        reservationId: this.editPost.reservationId || null
      });
      this.selectedReservationId = this.editPost.reservationId || null;
    }
  }

  loadReservations(): void {
    this.reservationService.getAllReservations().subscribe({
      next: (data: Reservation[]) => {
        this.reservations = data;
      },
      error: err => console.error('Failed to load reservations', err)
    });
  }

  updatePost(): void {
    if (!this.currentUserId) {
      alert('Trebuie să fii logat pentru a modifica o postare.');
      return;
    }

    if (this.postForm.invalid) {
      alert('Completează toate câmpurile.');
      this.postForm.markAllAsTouched();
      return;
    }

    if (!this.editPost) {
      alert('Postarea de modificat nu este specificată.');
      return;
    }

    const { postTitle, postDescription, reservationId } = this.postForm.value;

    const updatedPost: Post = {
      ...this.editPost,
      postTitle,
      postDescription,
      reservationId
    };

    this.postService.updatePost(updatedPost).subscribe({
      next: (post: Post) => {
        alert('Postare modificată cu succes!');
        this.resetForm();
        this.postUpdated.emit(post);
      },
      error: err => {
        console.error('Eroare la modificarea postării:', err);
        alert('A apărut o eroare la modificarea postării.');
      }
    });
  }

  resetForm(): void {
    this.postForm.reset();
    this.showEditForm = false;
    this.editPost = undefined;
    this.selectedReservationId = null;
  }

  cancel(): void {
    this.resetForm();
  }
}
