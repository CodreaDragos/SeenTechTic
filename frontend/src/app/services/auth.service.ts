import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import { LoginDto } from '../../login.model';
import { RegisterDto } from '../../register.model'; // Asigura-te că ai acest model
import { AuthResponseDto } from '../../auth-response.model'; // As
import { HttpParams } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `https://localhost:7042/api/auth`;  // URL-ul backend-ului tău pentru autentificare

  constructor(private http: HttpClient) { }

  login(loginDto: LoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/login`, loginDto);
  }
  register(registerDto: RegisterDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/register`, registerDto);
  }
}
