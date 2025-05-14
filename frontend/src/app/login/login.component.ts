import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { LoginDto } from '../../login.model';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../api.service';

import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';  // Mesaj de eroare
  successMessage: string = '';  // Mesaj de succes

  constructor(private authService: AuthService, private router: Router, private apiService: ApiService) { }
  ngOnInit(): void {
    this.apiService.getUsers().subscribe(
      (users) => {
        console.log('Users:', users);
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }
  onSubmit(): void {
    const loginDto: LoginDto = {
      email: this.email,
      password: this.password
      

    };
    this.authService.login(loginDto).subscribe(
      (response) => {
        console.log('Login successful:', response); // Log the response
        if (response.token) {
          localStorage.setItem('authToken', response.token); // Save the token
          this.router.navigate(['/greeting']); // Redirect to the GreetingComponent
        } else {
          this.errorMessage = 'Invalid response from server.';
        }
      },
      (error) => {
        console.error('Login failed:', error); // Log the error
        this.errorMessage = 'Login failed. Please try again.';
      }
    );
  }
}
