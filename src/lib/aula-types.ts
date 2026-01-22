export type BookingStatus = 'propuesta' | 'confirmada' | 'cancelada';

export interface BookingLocation {
  municipio: string;
  vereda?: string | null;
  direccion: string;
  coordinates?: { lat: number; lng: number } | null;
}

export interface BookingPublic {
  courseId?: string | null;
  courseTitle?: string | null;
  associationName?: string;
  participants?: number;
  requestedDate?: string;
  reservedDates?: string[];
  location?: BookingLocation;
  status?: BookingStatus;
  createdAt?: string;
}

export interface BookingPrivate {
  contactName?: string | null;
  contactPhone?: string | null;
  createdAt?: string;
}

export interface Booking {
  id?: string;
  courseId?: string | null;
  courseTitle?: string | null;
  associationName?: string;
  contactName?: string | null;
  contactPhone?: string | null;
  participants?: number;
  canReadWrite?: boolean;
  public?: BookingPublic;
  private?: BookingPrivate;
  location?: BookingLocation;
  reservedDates?: string[]; // legacy
  requestedDate?: string; // legacy
  status?: BookingStatus; // legacy
  createdAt?: string;
}
