import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'https://localhost:7042/swagger/index.html'; // URL-ul tău API

  constructor(private http: HttpClient) { }

  // Exemplu de metodă pentru a prelua produsele
  getProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/products`);  // Aici e endpointul backendului tău
  }
}
