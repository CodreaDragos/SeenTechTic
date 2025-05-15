import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import { ReservationService, Reservation } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, NgForOf],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  currentUserId: number | null = null;

  constructor(private reservationService: ReservationService, private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUserId$.subscribe((id: number | null) => {
      this.currentUserId = id;
    });
    this.loadReservations();
  }

  loadReservations() {
    this.reservationService.getAllReservations().subscribe({
      next: (data: any) => {
        console.log('Raw reservations data:', data);
        if (data && data.$values && Array.isArray(data.$values)) {
          this.reservations = data.$values;
        } else if (Array.isArray(data)) {
          this.reservations = data;
        } else {
          this.reservations = [];
        }
      },
      error: (err: any) => console.error('Failed to load reservations', err)
    });
  }

  addReservation() {
    if (!this.currentUserId) {
      alert('You must be logged in to make a reservation.');
      return;
    }

    const startTimeStr = prompt('Enter start time (ISO format, e.g., 2025-05-14T10:00):');
    const endTimeStr = prompt('Enter end time (ISO format, e.g., 2025-05-14T11:00):');
    const fieldId = Number(prompt('Enter field ID:'));
    const participantIds = prompt('Enter participant IDs (comma-separated):')?.split(',').map(id => Number(id.trim())) || [];

    if (startTimeStr && endTimeStr && fieldId && this.currentUserId !== null && fieldId > 0 && this.currentUserId > 0 && Array.isArray(participantIds)) {
      const startTime = new Date(startTimeStr);
      const endTime = new Date(endTimeStr);
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        alert('Invalid date format for start or end time.');
        return;
      }
      console.log('Validated inputs:', { startTime, endTime, fieldId, currentUserId: this.currentUserId, participantIds });
      const reservationDto = {
        StartTime: startTime.toISOString(),
        EndTime: endTime.toISOString(),
        AuthorId: this.currentUserId,
        FieldId: fieldId,
        ParticipantIds: participantIds  // Match backend DTO property names
      };
      console.log('Sending reservation DTO:', reservationDto);

      this.reservationService.addReservation(reservationDto).subscribe({
        next: (res) => {
          alert('Rezervare salvată cu succes!');
          console.log('Rezervare:', res);
          this.loadReservations();
        },
        error: (err) => {
          console.error('Eroare la salvare rezervare:', err);
          alert('A apărut o eroare: ' + (err?.message || JSON.stringify(err)));
        }
      });
    } else {
      alert('Datele introduse nu sunt valide.');
    }
  }
  deleteReservation(reservation: Reservation) {
    if (!reservation.reservationId) {
      alert('Reservation ID missing!');
      return;
    }
    if (confirm('Ești sigur că vrei să ștergi această rezervare?')) {
      this.reservationService.deleteReservation(reservation.reservationId).subscribe({
        next: () => {
          this.reservations = this.reservations.filter(r => r.reservationId !== reservation.reservationId);
          alert('Rezervarea a fost ștearsă.');
        },
        error: (err) => {
          console.error('Eroare la ștergere rezervare:', err);
          alert('A apărut o eroare la ștergere.');
        }
      });
    }
  }
  editReservation(reservation: Reservation) {
    if (!reservation.reservationId) {
      alert('Reservation ID missing!');
      return;
    }

    const startTimeStr = prompt('Enter new start time (ISO format):', reservation.startTime);
    const endTimeStr = prompt('Enter new end time (ISO format):', reservation.endTime);
    const fieldIdStr = prompt('Enter new field ID:', reservation.fieldId.toString());
    const participantIdsStr = prompt(
      'Enter new participant IDs (comma-separated):',
      Array.isArray(reservation.participantIds) ? reservation.participantIds.join(',') : ''
    );

    if (startTimeStr && endTimeStr && fieldIdStr && participantIdsStr) {
      const startTime = new Date(startTimeStr);
      const endTime = new Date(endTimeStr);
      const fieldId = Number(fieldIdStr);
      const participantIds = participantIdsStr.split(',').map(id => Number(id.trim()));

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || isNaN(fieldId)) {
        alert('Invalid input.');
        return;
      }

      // Trimite DTO-ul cu proprietăți cu majusculă, conform backend-ului
      const updatedReservation = {
        ReservationId: reservation.reservationId,
        StartTime: startTime.toISOString(),
        EndTime: endTime.toISOString(),
        FieldId: fieldId,
        AuthorId: reservation.authorId,
        ParticipantIds: participantIds
      };
      console.log('Trimitem:', updatedReservation);
      console.log('ParticipantIds:', updatedReservation.ParticipantIds);

      this.reservationService.updateReservation(reservation.reservationId, updatedReservation).subscribe({
        next: (res) => {
          alert('Rezervarea a fost modificată cu succes!'); // <-- Mesaj clar de succes
          this.loadReservations();
        },
        error: (err) => {
          console.error('Eroare la modificare rezervare:', err);
          alert('A apărut o eroare la modificare.');
        }
      });
    } else {
      alert('Datele introduse nu sunt valide.');
    }
  }

}
