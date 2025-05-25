import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reservation {
  reservationId?: number;
  startTime: string;
  endTime: string;
  fieldId: number;
  authorId: number;
  participantIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:5041/api/reservation';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Adjust if token is stored elsewhere
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  addReservation(reservation: any): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservation, { headers: this.getAuthHeaders() });
  }

  getAllReservations(): Observable<Reservation[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<Reservation[]>(this.apiUrl, { headers });
  }

  // New method to get occupied hours for a field and date
  getOccupiedHours(fieldId: number, date: string): Observable<string[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const params = { fieldId: fieldId.toString(), date };
    return this.http.get<string[]>(`${this.apiUrl}/occupied-hours`, { headers, params });
  }

  getReservation(reservationId: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${reservationId}`, { headers: this.getAuthHeaders() });
  }

  deleteReservation(reservationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reservationId}`, { headers: this.getAuthHeaders() });
  }

  updateReservation(reservationId: number, reservation: any): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${reservationId}`, reservation, { headers: this.getAuthHeaders() });
  }
}
