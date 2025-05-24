import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PostService, Post } from '../../services/post.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, UserProfile } from '../../services/user.service';
import { BackButtonComponent } from '../back-button/back-button.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, BackButtonComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  posts: Post[] = [];
  currentUserId: number | null = null;
  userProfile: UserProfile | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private postService: PostService,
    private userService: UserService
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
      console.log('Filtered posts:', this.posts);
    }, error => {
      console.error('Error loading posts:', error);
    });
  }

  loadUserProfile() {
    this.userService.getCurrentUserProfile().subscribe(profile => {
      this.userProfile = profile;
      console.log('User profile loaded:', profile);
    }, error => {
      console.error('Failed to load user profile:', error);
    });
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
}
