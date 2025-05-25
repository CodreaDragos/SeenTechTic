import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReservationService, Reservation } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss'],
  providers: [DatePipe]
})
export class ReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  currentUserId: number | null = null;
  reservationForm!: FormGroup;
  showAddForm = false;
  editingReservationId: number | null = null;
  endTimeValue: string = '';
  formattedEndTime: string = '';

  // New properties for custom date and hour controls
  allHours: string[] = [];
  occupiedHours: string[] = [];
  occupiedHoursFormatted: string[] = [];
  freeIntervals: string[] = [];

  // New property for fields list
  fields: { id: number; name: string }[] = [
    { id: 1, name: 'Football Field 1' },
    { id: 2, name: 'Football Field 2' },
    { id: 3, name: 'Football Field 3' },
    { id: 4, name: 'Football Field 4' },
    { id: 5, name: 'Football Field 5' },
    { id: 6, name: 'Basketball Court 1' },
    { id: 7, name: 'Basketball Court 2' },
    { id: 8, name: 'Basketball Court 3' },
    { id: 9, name: 'Basketball Court 4' },
    { id: 10, name: 'Basketball Court 5' },
    { id: 11, name: 'Volleyball Court 1' },
    { id: 12, name: 'Volleyball Court 2' },
    { id: 13, name: 'Volleyball Court 3' },
    { id: 14, name: 'Volleyball Court 4' },
    { id: 15, name: 'Volleyball Court 5' }
  ];

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private authService: AuthService,
    private router: Router,
    private datePipe: DatePipe
  ) { }

  toggleAddForm(): void {
    if (this.showAddForm) {
      this.resetForm();
    } else {
      this.resetForm();
    }
    this.showAddForm = !this.showAddForm;
  }

  ngOnInit(): void {
    this.authService.currentUserId$.subscribe(id => this.currentUserId = id);
    this.loadReservations();

    // Initialize allHours with 6 AM to 10 PM in "X AM/PM" format
    this.allHours = [];
    for (let hour = 6; hour <= 22; hour++) {
      let displayHour = hour % 12;
      if (displayHour === 0) displayHour = 12;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      this.allHours.push(`${displayHour} ${ampm}`);
    }

    this.reservationForm = this.fb.group({
      startDate: ['', Validators.required],
      startHour: ['', [Validators.required, this.occupiedHourValidator.bind(this)]],
      endTime: ['', Validators.required],
      fieldId: ['', [Validators.required, Validators.min(1)]]
    });

    // Watch for changes in fieldId, startDate, and startHour to update occupied hours and validation
    this.reservationForm.get('fieldId')?.valueChanges.subscribe((value) => {
      console.log('fieldId changed to:', value);
      this.updateOccupiedHours();
    });
    this.reservationForm.get('startDate')?.valueChanges.subscribe(() => {
      this.updateOccupiedHours();
    });
    this.reservationForm.get('startHour')?.valueChanges.subscribe((value) => {
      if (!value) return;
      // Convert value to "HH:00" format for comparison with occupiedHours
      let hourNum: number;
      if (/^\d{1,2}$/.test(value.trim())) {
        hourNum = parseInt(value.trim(), 10);
      } else {
        hourNum = this.parse12HourTo24Hour(value);
      }
      const hourStr = hourNum.toString().padStart(2, '0') + ':00';

      console.log('startHour value:', value);
      console.log('Normalized hourStr:', hourStr);
      console.log('Occupied hours:', this.occupiedHours);

      if (this.occupiedHours.includes(hourStr)) {
        alert('Ora selectată este deja ocupată. Te rugăm să alegi o altă oră.');
        this.reservationForm.get('startHour')?.setValue('', { emitEvent: false });
      } else {
        this.updateOccupiedHours();
        this.updateEndTime();
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadReservations(): void {
    this.reservationService.getAllReservations().subscribe({
      next: (data: any) => {
        const allReservations = Array.isArray(data?.$values) ? data.$values : data ?? [];
        this.reservations = allReservations; // Load all reservations, not filtered by user
      },
      error: (err: any) => console.error('Eroare la încărcare rezervări', err)
    });
  }

  updateEndTime(): void {
    const startDate = this.reservationForm.get('startDate')?.value;
    const startHour = this.reservationForm.get('startHour')?.value;
    if (!startDate || !startHour) {
      this.reservationForm.get('endTime')?.setValue('');
      return;
    }

    const hour = this.parse12HourTo24Hour(startHour);

    // Combine startDate and hour to create a Date object for start time
    const startDateObj = new Date(startDate);
    startDateObj.setHours(hour, 0, 0, 0);

    // Add one hour for end time
    const endDate = new Date(startDateObj.getTime() + 60 * 60 * 1000);

    // Format endDate to ISO string for form control
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = endDate.getFullYear();
    const month = pad(endDate.getMonth() + 1);
    const day = pad(endDate.getDate());
    const hours = pad(endDate.getHours());
    const minutes = pad(endDate.getMinutes());

    const endTimeValue = `${year}-${month}-${day}T${hours}:${minutes}`;
    this.reservationForm.get('endTime')?.setValue(endTimeValue, { emitEvent: false });
  }

  updateOccupiedHours(): void {
    const fieldIdRaw = this.reservationForm.get('fieldId')?.value;
    const fieldId = Number(fieldIdRaw);
    const startDate = this.reservationForm.get('startDate')?.value;

    if (!fieldIdRaw || isNaN(fieldId) || fieldId <= 0 || !startDate) {
      this.occupiedHours = [];
      return;
    }
    // Normalize date to local date string yyyy-mm-dd to avoid timezone issues
    const dateObj = new Date(startDate);
    const localDateStr = dateObj.getFullYear() + '-' +
      (dateObj.getMonth() + 1).toString().padStart(2, '0') + '-' +
      dateObj.getDate().toString().padStart(2, '0');

    console.log('updateOccupiedHours called with fieldId:', fieldId, 'startDate:', localDateStr);

    this.reservationService.getOccupiedHours(fieldId, localDateStr).subscribe({
      next: (hours: string[]) => {
        console.log('Occupied hours fetched:', hours);
        // Normalize occupied hours to "HH:00" format for consistent comparison
        this.occupiedHours = hours.map(h => {
          // h is in format like "9 AM", convert to "09:00"
          const hourNum = this.parse12HourTo24Hour(h);
          return hourNum.toString().padStart(2, '0') + ':00';
        });
        // Also create formatted occupied hours in "X AM/PM" format for template class binding
        this.occupiedHoursFormatted = hours.map(h => {
          // Normalize to consistent "X AM/PM" format
          const hourNum = this.parse12HourTo24Hour(h);
          let displayHour = hourNum % 12;
          if (displayHour === 0) displayHour = 12;
          const ampm = hourNum >= 12 ? 'PM' : 'AM';
          return `${displayHour} ${ampm}`;
        });
      },
      error: (err) => {
        console.error('Error fetching occupied hours:', err);
        this.occupiedHours = [];
      }
    });
  }

  occupiedHourValidator(control: any) {
    if (!control.value) return null;
    const date = new Date(control.value);
    const hourStr = date.getHours().toString().padStart(2, '0') + ':00';
    if (this.occupiedHours.includes(hourStr)) {
      return { occupiedHour: true };
    }
    return null;
  }

  private parse12HourTo24Hour(time12h: string): number {
    const trimmed = time12h.trim();
    if (/^\d{1,2}$/.test(trimmed)) {
      // Input is already in 24-hour format like "22"
      return parseInt(trimmed, 10);
    }
    const [hourStr, ampm] = trimmed.split(' ');
    let hour = parseInt(hourStr, 10);
    if (ampm === 'PM' && hour !== 12) {
      hour += 12;
    } else if (ampm === 'AM' && hour === 12) {
      hour = 0;
    }
    return hour;
  }

  addReservation(): void {
    if (!this.currentUserId) {
      alert('Trebuie să fii logat pentru a face o rezervare.');
      return;
    }

    if (!this.reservationForm || this.reservationForm.invalid) {
      alert('Completează toate câmpurile.');
      this.reservationForm?.markAllAsTouched();
      return;
    }

    const startDate: string = this.reservationForm.get('startDate')?.value;
    const startHour: string = this.reservationForm.get('startHour')?.value;
    if (!startDate || !startHour) {
      alert('Completează toate câmpurile.');
      return;
    }

    const hour = this.parse12HourTo24Hour(startHour);
    const startDateObj = new Date(startDate);
    startDateObj.setHours(hour, 0, 0, 0);
    const startTime = startDateObj.toISOString();


    const endTime: string = this.reservationForm.get('endTime')?.value;
    const fieldId: number = Number(this.reservationForm.get('fieldId')?.value);

    if (!startTime || !endTime || !fieldId) {
      alert('Completează toate câmpurile.');
      return;
    }

    const startIso = this.parseDateLocalToUTC(startTime);
    const endIso = this.parseDateLocalToUTC(endTime);

    const reservationDto = {
      startTime: startIso,
      endTime: endIso,
      authorId: this.currentUserId!,
      fieldId: fieldId,
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
        this.loadReservations();
        this.calculateFreeIntervals(fieldId);
        this.updateOccupiedHours();
        this.updateOccupiedHours();
        },
        error: (err: any) => {
          console.error('Eroare la modificare rezervare:', err);
          alert('A apărut o eroare la modificare.');
        }
      });
    } else {
      this.reservationService.addReservation(reservationDto).subscribe({
        next: () => {
          alert('Rezervare salvată cu succes!');
          this.resetForm();
          this.loadReservations();
          this.calculateFreeIntervals(fieldId);
        },
        error: (err: any) => {
          console.error('Eroare la salvare rezervare:', err);
          const errorMsg = err?.error || err?.message || '';
          if (err.status === 400 && typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('already booked')) {
            alert('Terenul este deja rezervat în intervalul selectat.');
            const fieldId = Number(this.reservationForm.get('fieldId')?.value);
            if (fieldId) {
              this.calculateFreeIntervals(fieldId);
            }
          } else {
            alert('Eroare: ' + errorMsg);
          }
        }
      });
    }
  }

  calculateFreeIntervals(fieldId: number): void {
    const reservationsForField = this.reservations.filter(r => r.fieldId === fieldId);

    const startHour = 6;
    const endHour = 22;

    const intervals: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      intervals.push(`${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`);
    }

    const freeIntervals = intervals.filter(interval => {
      const [startStr, endStr] = interval.split(' - ');
      const intervalStart = new Date();
      intervalStart.setHours(parseInt(startStr.split(':')[0]), 0, 0, 0);
      const intervalEnd = new Date();
      intervalEnd.setHours(parseInt(endStr.split(':')[0]), 0, 0, 0);

      for (const res of reservationsForField) {
        const resStart = new Date(res.startTime);
        const resEnd = new Date(res.endTime);

        if ((intervalStart < resEnd) && (intervalEnd > resStart)) {
          return false;
        }
      }
      return true;
    });

    this.freeIntervals = freeIntervals;
  }

  private resetForm() {
    this.reservationForm.reset();
    this.reservationForm.markAsPristine();
    this.reservationForm.markAsUntouched();
    this.showAddForm = false;
    this.editingReservationId = null;
    this.freeIntervals = [];
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

    if (reservation.startTime) {
      const startDateObj = new Date(reservation.startTime);
      const year = startDateObj.getFullYear();
      const month = (startDateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = startDateObj.getDate().toString().padStart(2, '0');
      const hours = startDateObj.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      let hour12 = hours % 12;
      if (hour12 === 0) hour12 = 12;
      const startDateStr = `${year}-${month}-${day}`;
      const startHourStr = `${hour12} ${ampm}`;

      this.reservationForm.setValue({
        startDate: startDateStr,
        startHour: startHourStr,
        endTime: reservation.endTime ? this.toInputDateTimeLocal(reservation.endTime) : '',
        fieldId: reservation.fieldId ?? ''
      });

      this.updateEndTime();
    } else {
      this.reservationForm.setValue({
        startDate: '',
        startHour: '',
        endTime: '',
        fieldId: reservation.fieldId ?? ''
      });
    }
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

  public parseDateLocalToUTC(dateTimeLocal: string): string {
    const localDate = new Date(dateTimeLocal);
    // Adjust for timezone offset to keep local time unchanged in UTC string
    const offsetMs = localDate.getTimezoneOffset() * 60000;
    const utcDate = new Date(localDate.getTime() - offsetMs);
    return utcDate.toISOString();
  }
}
