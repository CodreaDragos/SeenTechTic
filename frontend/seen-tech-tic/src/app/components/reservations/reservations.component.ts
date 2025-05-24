import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReservationService, Reservation } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';
import { BackButtonComponent } from '../back-button/back-button.component';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BackButtonComponent],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  currentUserId: number | null = null;
  reservationForm!: FormGroup;
  showAddForm = false;
  editingReservationId: number | null = null;

  constructor(
  private fb: FormBuilder,
  private reservationService: ReservationService,
  private authService: AuthService,
  private router: Router
) { }
logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  ngOnInit(): void {
    this.authService.currentUserId$.subscribe(id => this.currentUserId = id);
    this.loadReservations();

    this.reservationForm = this.fb.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      fieldId: ['', Validators.required]
    });
  }

  loadReservations(): void {
    this.reservationService.getAllReservations().subscribe({
      next: (reservations: Reservation[]) => {
        this.reservations = reservations.filter((r: Reservation) => r.authorId === this.currentUserId);
      },
      error: (err: any) => console.error('Failed to load reservations', err)
    });
  }

  addReservation(): void {
    if (!this.currentUserId) {
      alert('Trebuie să fii logat pentru a face o rezervare.');
      return;
    }

    if (this.reservationForm.invalid) {
      alert('Completează toate câmpurile.');
      this.reservationForm.markAllAsTouched();
      return;
    }

    const { startTime, endTime, fieldId } = this.reservationForm.value;

    const startIso = this.parseDateLocalToUTC(startTime);
    const endIso = this.parseDateLocalToUTC(endTime);

    const field = Number(fieldId);

    const reservationDto = {
      startTime: startIso,
      endTime: endIso,
      authorId: this.currentUserId,
      fieldId: field,
      participantIds: [] // Send empty array to satisfy backend
    };

    if (this.editingReservationId) {
      this.reservationService.updateReservation(this.editingReservationId, {
        ...reservationDto,
        ReservationId: this.editingReservationId
      }).subscribe({
        next: () => {
          alert('Rezervarea a fost modificată cu succes!');
          this.resetForm();
        },
        error: err => {
          console.error('Eroare la modificare rezervare:', err);
          alert('A apărut o eroare la modificare.');
        }
      });
    } else {
      this.reservationService.addReservation(reservationDto).subscribe({
        next: () => {
          alert('Rezervare salvată cu succes!');
          this.resetForm();
        },
        error: err => {
          console.error('Eroare la salvare rezervare:', err);
          alert('Eroare: ' + (err?.message || 'A apărut o problemă.'));
        }
      });
    }
  }

  private resetForm() {
    this.reservationForm.reset();
    this.showAddForm = false;
    this.editingReservationId = null;
    this.loadReservations();
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
    this.editingReservationId = reservation.reservationId ?? null;
    this.showAddForm = true;

    this.reservationForm.patchValue({
      startTime: reservation.startTime ? this.toInputDateTimeLocal(reservation.startTime) : '',
      endTime: reservation.endTime ? this.toInputDateTimeLocal(reservation.endTime) : '',
      fieldId: reservation.fieldId ?? ''
    });
  }

  private toInputDateTimeLocal(dateStr: string): string {
    const date = new Date(dateStr);

    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Bucharest',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';

    return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`;
  }

  private parseDateLocalToUTC(dateTimeLocal: string): string {
    const [datePart, timePart] = dateTimeLocal.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Bucharest',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const fakeUTCDate = new Date(Date.UTC(year, month - 1, day, hour - 3, minute));

    const parts = dtf.formatToParts(fakeUTCDate);

    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';

    const bucharestYear = Number(getPart('year'));
    const bucharestMonth = Number(getPart('month'));
    const bucharestDay = Number(getPart('day'));
    const bucharestHour = Number(getPart('hour'));
    const bucharestMinute = Number(getPart('minute'));
    const bucharestSecond = Number(getPart('second'));

    const bucharestDateUTC = Date.UTC(
      bucharestYear,
      bucharestMonth - 1,
      bucharestDay,
      bucharestHour,
      bucharestMinute,
      bucharestSecond
    );

    return new Date(bucharestDateUTC).toISOString();
  }

  onSubmit() {
    if (this.reservationForm.valid) {
      const reservation: Reservation = {
        startTime: this.reservationForm.value.startTime,
        endTime: this.reservationForm.value.endTime,
        fieldId: Number(this.reservationForm.value.fieldId),
        authorId: this.currentUserId || 0,
        participantIds: []
      };
      // ... rest of the code ...
    }
  }
}

