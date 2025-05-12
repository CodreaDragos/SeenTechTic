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
import { MatProgressBarModule } from '@angular/material/progress-bar';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  responseMessage: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

  }
  goToLogin() {
    this.router.navigate(['/login']);
  }

  onSubmit() {
    if (this.registerForm.valid) {
      if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
        this.responseMessage = 'Passwords do not match.';
        this.isError = true;
        return;
      }

      this.isLoading = true;
      this.responseMessage = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: (response: AuthResponse) => {
          this.isLoading = false;
          this.responseMessage = response.message;
          this.isError = !response.success;

          if (response.success) {
            // Optionally, redirect to login or dashboard
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.responseMessage = error.message || 'Registration failed. Please try again.';
          this.isError = true;
        }
      });
    }
  }
}
