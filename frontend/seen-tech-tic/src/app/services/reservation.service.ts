import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reservation {
  reservationId?: number;
  startTime: string;
  endTime: string;
  fieldId: number;
  authorId: number;
  participantIds: number[]; // ✅ Add this line
}


@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:5041/api/reservation'; // ajustează endpointul dacă e altul

  constructor(private http: HttpClient) { }

  addReservation(reservation: any): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservation);
  }
  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }
  deleteReservation(reservationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reservationId}`);
  }
  updateReservation(reservationId: number, reservation: any): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${reservationId}`, reservation);
  }
}
