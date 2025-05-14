import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reservation {
  
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

  addReservation(reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservation);
  }
  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

}
