import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUserIdSubject = new BehaviorSubject<number | null>(null);
  currentUserId$ = this.currentUserIdSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserIdFromToken();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response: AuthResponse) => {
          if (response.token) {
            localStorage.setItem('authToken', response.token);
            this.updateUserIdFromToken();
          }
        }),
        catchError(this.handleError)
      );
  }

  logout() {
    localStorage.removeItem('authToken');
    this.currentUserIdSubject.next(null);
  }

  updateUserIdFromToken() {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload?.id ? parseInt(payload.id, 10) : null;
        this.currentUserIdSubject.next(userId);
      } catch (e) {
        this.currentUserIdSubject.next(null);
      }
    } else {
      this.currentUserIdSubject.next(null);
    }
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  private loadUserIdFromToken() {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload?.id ? parseInt(payload.id, 10) : null;
        this.currentUserIdSubject.next(userId);
      } catch (e) {
        this.currentUserIdSubject.next(null);
      }
    } else {
      this.currentUserIdSubject.next(null);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getCurrentUserId(): number | null {
    return this.currentUserIdSubject.value;
  }
}