
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
      const { username, password, confirmPassword } = this.registerForm.value;

      if (username.length < 3) {
        this.responseMessage = 'Username invalid: trebuie să aibă cel puțin 3 caractere.';
        this.isError = true;
        return;
      }

      if (password.length < 6) {
        this.responseMessage = 'Parola trebuie să aibă cel puțin 6 caractere.';
        this.isError = true;
        return;
      }

      if (password !== confirmPassword) {
        this.responseMessage = 'Parolele nu se potrivesc.';
        this.isError = true;
        return;
      }

      this.isLoading = true;
      this.responseMessage = '';
      this.isError = false;

      this.authService.register(this.registerForm.value).subscribe({
        next: (response: AuthResponse) => {
          this.isLoading = false;
          this.responseMessage = response.message;
          this.isError = !response.success;

          if (response.success) {
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.responseMessage = error.message || 'Înregistrarea a eșuat. Te rugăm să încerci din nou.';
          this.isError = true;
        }
      });
    } else {
      this.responseMessage = 'Te rugăm să completezi corect toate câmpurile.';
      this.isError = true;
    }
  }


}
