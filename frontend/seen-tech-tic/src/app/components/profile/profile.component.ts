import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  template: `
    <h2>User Profile</h2>
    <p>This is the profile page.</p>
    <button (click)="logout()">Logout</button>
  `,
  styles: [`
    h2 {
      color: #3f51b5;
    }
    button {
      margin-top: 20px;
      padding: 8px 16px;
      background-color: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #d32f2f;
    }
  `]
})
export class ProfileComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
