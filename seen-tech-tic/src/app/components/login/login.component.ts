import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService, AuthResponse } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  responseMessage: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.responseMessage = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response: AuthResponse) => {
          this.isLoading = false;
          this.responseMessage = response.message;
          this.isError = !response.success;
          
          if (response.success && response.token) {
            // Store the token
            localStorage.setItem('token', response.token);
            // Redirect to dashboard or home page
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.responseMessage = error.message || 'Login failed. Please try again.';
          this.isError = true;
        }
      });
    }
  }
  navigateToRegister() {
    this.router.navigate(['/register']);
  }

} 
