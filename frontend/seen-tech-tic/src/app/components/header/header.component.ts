import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(page: string) {
    if (page === 'posts') {
      this.router.navigate(['/posts']);
    } else if (page === 'reservations') {
      this.router.navigate(['/reservations']);
    } else if (page === 'profile') {
      this.router.navigate(['/profile']);
    }
  }
}
