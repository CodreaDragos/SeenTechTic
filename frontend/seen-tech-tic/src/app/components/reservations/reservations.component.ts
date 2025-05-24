import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReservationService, Reservation } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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

  // New property to hold occupied hours for selected date and field
  occupiedHours: string[] = [];

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private authService: AuthService,
    private router: Router,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.authService.currentUserId$.subscribe(id => this.currentUserId = id);
    this.loadReservations();

    this.reservationForm = this.fb.group({
      startTime: ['', [Validators.required, this.occupiedHourValidator.bind(this)]],
      endTime: ['', Validators.required],
      fieldId: ['', [Validators.required, Validators.min(1)]]
    });

    // Watch for changes in fieldId and startTime to update occupied hours and validation
    this.reservationForm.get('fieldId')?.valueChanges.subscribe(() => {
      this.updateOccupiedHours();
    });

    this.reservationForm.get('startTime')?.valueChanges.subscribe(value => {
      if (value) {
        const startDate = new Date(value);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour

        // Format endDate to match desired display format MM/dd/yyyy hh:mm a
        this.formattedEndTime = this.datePipe.transform(endDate, 'MM/dd/yyyy hh:mm a') || '';

        // Also update endTimeValue in ISO format for form control
        const pad = (n: number) => n.toString().padStart(2, '0');
        const year = endDate.getFullYear();
        const month = pad(endDate.getMonth() + 1);
        const day = pad(endDate.getDate());
        const hours = pad(endDate.getHours());
        const minutes = pad(endDate.getMinutes());

        this.endTimeValue = `${year}-${month}-${day}T${hours}:${minutes}`;
        this.reservationForm.get('endTime')?.setValue(this.endTimeValue, { emitEvent: false });

        // Check for conflict with existing reservations for selected field
        const fieldId = Number(this.reservationForm.get('fieldId')?.value);
        if (fieldId) {
          const conflict = this.reservations.some(r => {
            if (r.fieldId !== fieldId) return false;
            const resStart = new Date(r.startTime);
            const resEnd = new Date(r.endTime);
            return startDate >= resStart && startDate < resEnd;
          });
          if (conflict) {
            this.calculateFreeIntervals(fieldId);
          } else {
            this.freeIntervals = [];
          }
          this.updateOccupiedHours();
        } else {
          this.freeIntervals = [];
          this.occupiedHours = [];
        }
      } else {
        this.endTimeValue = '';
        this.formattedEndTime = '';
        this.reservationForm.get('endTime')?.setValue('', { emitEvent: false });
        this.freeIntervals = [];
        this.occupiedHours = [];
      }
    });
  }

  // New method to update occupied hours based on selected date and field
  updateOccupiedHours(): void {
    const fieldId = Number(this.reservationForm.get('fieldId')?.value);
    const startTimeStr = this.reservationForm.get('startTime')?.value;
    if (!fieldId || !startTimeStr) {
      this.occupiedHours = [];
      return;
    }
    const selectedDate = new Date(startTimeStr);
    const selectedDateStr = selectedDate.toISOString().split('T')[0]; // yyyy-mm-dd

    // Filter reservations for the selected field and date
    const reservationsForFieldAndDate = this.reservations.filter(r => {
      if (r.fieldId !== fieldId) return false;
      const resStartDate = new Date(r.startTime);
      const resDateStr = resStartDate.toISOString().split('T')[0];
      return resDateStr === selectedDateStr;
    });

    // Extract occupied hours as strings in 12-hour format with AM/PM
    this.occupiedHours = reservationsForFieldAndDate.map(r => {
      const resStartDate = new Date(r.startTime);
      let hour = resStartDate.getHours();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      if (hour === 0) hour = 12;
      return `${hour} ${ampm}`;
    });
  }

  // Custom validator to prevent selecting occupied hours
  occupiedHourValidator(control: any) {
    if (!control.value) return null;
    const date = new Date(control.value);
    const hourStr = date.getHours().toString().padStart(2, '0') + ':00';
    if (this.occupiedHours.includes(hourStr)) {
      return { occupiedHour: true };
    }
    return null;
  }

  onStartTimeChange(): void {
    const startTimeControl = this.reservationForm?.get('startTime');
    if (startTimeControl) {
      let value: string = startTimeControl.value;
      if (value) {
        // Round minutes to 00
        const date = new Date(value);
        date.setMinutes(0, 0, 0);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = '00';
        const newValue = `${year}-${month}-${day}T${hours}:${minutes}`;
        startTimeControl.setValue(newValue, { emitEvent: true });
      }
    }
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

  freeIntervals: string[] = [];

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

    const { startTime, endTime, fieldId } = this.reservationForm.value;

    if (!startTime || !endTime || !fieldId) {
      alert('Completează toate câmpurile.');
      return;
    }

    const startIso = this.parseDateLocalToUTC(startTime);
    const endIso = this.parseDateLocalToUTC(endTime);

    const field = Number(fieldId);

    const reservationDto = {
      StartTime: startIso,
      EndTime: endIso,
      AuthorId: this.currentUserId!,
      FieldId: field,
      ParticipantIds: [] // Send empty array to satisfy backend
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
          this.calculateFreeIntervals(field);
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
          this.calculateFreeIntervals(field);
        },
        error: (err: any) => {
          console.error('Eroare la salvare rezervare:', err);
          // Inspect error response to detect conflict
          const errorMsg = err?.error || err?.message || '';
          if (err.status === 400 && typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('already booked')) {
            alert('Terenul este deja rezervat în intervalul selectat.');
            // Calculate free intervals for the selected field after conflict
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
    // Assuming reservations are loaded and filtered by fieldId
    const reservationsForField = this.reservations.filter(r => r.fieldId === fieldId);

    // Define working hours, e.g., 6:00 to 22:00
    const startHour = 6;
    const endHour = 22;

    // Create an array of all possible 1-hour intervals
    const intervals: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      intervals.push(`${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`);
    }

    // Remove intervals that overlap with existing reservations
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
          return false; // Overlaps, so not free
        }
      }
      return true;
    });

    this.freeIntervals = freeIntervals;
  }

  private resetForm() {
    this.reservationForm.reset();
    this.showAddForm = false;
    this.editingReservationId = null;
    // Do not load reservations here to avoid showing free intervals list after reservation
    // this.loadReservations();
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

    this.reservationForm.setValue({
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
}
