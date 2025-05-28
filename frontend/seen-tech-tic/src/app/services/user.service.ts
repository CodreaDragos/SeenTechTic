import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, UserDisplayDto } from '../types'; // ajustează calea după caz
// Detaliile userului curent / individual
export interface UserProfile {
  userId: number;
  username: string;
  description?: string;
  photoUrl?: string;
  // Add other properties as needed
}

// Pentru dropdown, listă etc.


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5041/api/users';

  constructor(private http: HttpClient) { }

  // Get current logged in user profile
  getCurrentUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  // Get any user's full profile by ID
  getUserProfile(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}`);
  }

  // Update profile using multipart/form-data (e.g., with image)
  updateProfile(formData: FormData): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, formData);
  }

  // 🔥 NEW: Get list of users (username + photo only)
  getDisplayUsers(): Observable<UserDisplayDto[]> {
    return this.http.get<UserDisplayDto[]>(`${this.apiUrl}/display`);
  }
}
