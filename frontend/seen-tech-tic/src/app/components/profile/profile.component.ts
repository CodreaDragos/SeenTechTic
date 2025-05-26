import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PostService, Post } from '../../services/post.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, UserProfile } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { BackButtonComponent } from '../back-button/back-button.component';
import { CommentService, Comment } from '../../services/comment.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BackButtonComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  posts: Post[] = [];
  currentUserId: number | null = null;
  userProfile: UserProfile | null = null;
  isEditing = false;
  newUsername = '';
  newPassword = '';
  selectedFile: File | null = null;
  passwordVisible = false;
  newCommentContent: { [postId: number]: string } = {};

  constructor(
    private authService: AuthService,
    private router: Router,
    private postService: PostService,
    private userService: UserService,
    private commentService: CommentService
  ) {}

  ngOnInit() {
    this.authService.currentUserId$.subscribe(id => {
      this.currentUserId = id;
      console.log('Current user ID:', id);

      if (this.currentUserId) {
        this.loadUserPosts();
        this.loadUserProfile();
      } else {
        console.warn('User not authenticated.');
      }
    });
  }

  loadUserPosts() {
    this.postService.getPosts().subscribe(posts => {
      console.log('Posts received:', posts);
      this.posts = posts.filter(post => post.authorId === this.currentUserId);
      // Initialize comments array if not present
      this.posts.forEach(post => {
        if (!post.comments) {
          post.comments = [];
        }
      });
      console.log('Filtered posts:', this.posts);
    }, error => {
      console.error('Error loading posts:', error);
    });
  }

  loadUserProfile() {
    this.userService.getCurrentUserProfile().subscribe(profile => {
      this.userProfile = profile;
      this.newUsername = profile.username;
      console.log('User profile loaded:', profile);
    }, error => {
      console.error('Failed to load user profile:', error);
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.userProfile) {
          this.userProfile.photoUrl = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form when canceling edit
      this.loadUserProfile();
    }
  }

  saveProfile() {
    if (!this.userProfile) return;

    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }
    if (this.newUsername !== this.userProfile.username) {
      formData.append('username', this.newUsername);
    }
    if (this.newPassword) {
      formData.append('password', this.newPassword);
    }

    this.userService.updateProfile(formData).subscribe({
      next: (updatedProfile) => {
        this.userProfile = updatedProfile;
        // If profile picture is present, convert to data URL for preview
        if (this.userProfile && this.userProfile.photoUrl && !this.userProfile.photoUrl.startsWith('data:image')) {
          this.userProfile.photoUrl = 'data:image/png;base64,' + this.userProfile.photoUrl;
        }
        this.isEditing = false;
        this.newPassword = '';
        this.selectedFile = null;
      },
      error: (error) => {
        console.error('Failed to update profile:', error);
        alert('Failed to update profile. Please try again.');
      }
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  editPost(post: Post) {
    console.log('editPost called with post:', post);
    if (post.postId) {
      console.log('Navigating to edit post with ID:', post.postId);
      this.router.navigate(['/posts/edit', post.postId]);
    } else {
      alert('Post ID is missing, cannot edit.');
    }
  }

  deletePost(postId: number | undefined) {
    if (!postId) return;
    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(post => post.postId !== postId);
        console.log(`Post ${postId} deleted`);
      },
      error: (err) => {
        alert('Failed to delete post');
        console.error(err);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  addComment(post: Post) {
    if (!this.currentUserId) {
      alert('You must be logged in to add a comment.');
      return;
    }

    const content = this.newCommentContent[post.postId || 0];
    if (!content || content.trim() === '') {
      alert('Please enter a comment.');
      return;
    }

    const newComment: Comment = {
      commentContent: content,
      postId: post.postId || 0,
      authorId: this.currentUserId
    };

    this.commentService.addComment(newComment).subscribe({
      next: (comment) => {
        if (!post.comments) {
          post.comments = [];
        }
        post.comments.push(comment);
        this.newCommentContent[post.postId || 0] = '';
      },
      error: (error) => {
        console.error('Failed to add comment:', error);
        alert('Failed to add comment. Please try again.');
      }
    });
  }
}
