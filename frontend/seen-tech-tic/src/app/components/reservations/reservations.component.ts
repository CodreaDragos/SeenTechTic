import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReservationService, Reservation } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.currentUserId$.subscribe(id => this.currentUserId = id);
    this.loadReservations();

    this.reservationForm = this.fb.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      fieldId: ['', [Validators.required, Validators.min(1)]],
      participantIds: ['', Validators.required]
    });
  }

  loadReservations(): void {
    this.reservationService.getAllReservations().subscribe({
      next: (data: any) => {
        const allReservations = Array.isArray(data?.$values) ? data.$values : data ?? [];
        this.reservations = this.currentUserId
          ? allReservations.filter((r: Reservation) => r.authorId === this.currentUserId)
          : [];
      },
      error: err => console.error('Eroare la încărcare rezervări', err)
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

    const { startTime, endTime, fieldId, participantIds } = this.reservationForm.value;

    // Convertim ora locală București (input datetime-local) în ISO UTC
    const startIso = this.parseDateLocalToUTC(startTime);
    const endIso = this.parseDateLocalToUTC(endTime);

    const field = Number(fieldId);
    const participants = participantIds
      .split(',')
      .map((id: string) => Number(id.trim()))
      .filter((id: number) => !isNaN(id));

    const reservationDto = {
      StartTime: startIso,
      EndTime: endIso,
      AuthorId: this.currentUserId,
      FieldId: field,
      ParticipantIds: participants
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

    this.reservationForm.setValue({
      startTime: reservation.startTime ? this.toInputDateTimeLocal(reservation.startTime) : '',
      endTime: reservation.endTime ? this.toInputDateTimeLocal(reservation.endTime) : '',
      fieldId: reservation.fieldId ?? '',
      participantIds: reservation.participantIds?.join(',') ?? ''
    });
  }

  // Convertim ISO date UTC la string formatat pentru input datetime-local în fusul Europe/Bucharest
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

  // Convertim input datetime-local (ora București) în ISO UTC string pentru backend
  private parseDateLocalToUTC(dateTimeLocal: string): string {
    // dateTimeLocal ex: "2025-05-17T12:30"
    // construim un obiect Date folosind fusul Europe/Bucharest

    const [datePart, timePart] = dateTimeLocal.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    // Obținem data în fusul Europe/Bucharest cu offset corect
    // Folosim Intl API pentru asta:

    // Construim o dată în UTC fix, apoi calculăm timestamp cu fusul orar București
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

    // Mai întâi construim o dată UTC pentru momentul introdus (fără fus orar):
    // Adică interpretăm ora ca UTC (nu e corect, dar e punct de plecare)
    const fakeUTCDate = new Date(Date.UTC(year, month - 1, day, hour - 3, minute));

    // Extragem ora reală în București
    const parts = dtf.formatToParts(fakeUTCDate);

    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';

    const bucharestYear = Number(getPart('year'));
    const bucharestMonth = Number(getPart('month'));
    const bucharestDay = Number(getPart('day'));
    const bucharestHour = Number(getPart('hour'));
    const bucharestMinute = Number(getPart('minute'));
    const bucharestSecond = Number(getPart('second'));

    // Construim data corectă în București ca timestamp UTC:
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


  // Determină offset-ul în minute pentru fusul Europe/Bucharest la o anumită dată
  private toISOStringForBucharest(dateTimeLocal: string): string {
    // dateTimeLocal ex: "2025-05-17T12:30"
    const [datePart, timePart] = dateTimeLocal.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    // Construim obiectul Date local, JS îl consideră în fusul local al mașinii
    // Dar tu vrei fix București, deci trebuie să forțezi compensarea:
    const localDate = new Date(year, month - 1, day, hour, minute);

    // Offset-ul București (UTC+2 sau UTC+3) depinde de data (ora de vară)
    // Verificăm offsetul real pentru data respectivă în București
    // Problema e că getTimezoneOffset() returnează offset-ul mașinii locale
    // Dacă mașina ta nu e pe fusul București, trebuie să forțezi manual
    const bucharestOffset = 180; // +180 min = +3 ore

    // Convertim la UTC scăzând offset-ul București
    const utcTimestamp = localDate.getTime() - bucharestOffset * 60 * 1000;

    const utcDate = new Date(utcTimestamp);

    return utcDate.toISOString();
  }

}
