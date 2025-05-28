export interface UserDisplayDto {
  id: number;
  username: string;
  photoUrl?: string;
}

export interface Reservation {
  reservationId: number;
  startTime: string;
  endTime: string;
  authorId: number;
  fieldId: number;
  participants: UserDisplayDto[]; // adaugă asta dacă lipsește
}

