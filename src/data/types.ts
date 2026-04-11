export interface Salon {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  distance: string;
  address: string;
  services: string[];
  openNow: boolean;
  phone?: string;
  rushHourEnabled?: boolean;
  rushFee?: number;
}

export interface Barber {
  id: string;
  salonId: string;
  name: string;
  image: string;
  experience: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  portfolio: string[];
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  category: string;
}

export interface Booking {
  id: string;
  salonId: string;
  salonName: string;
  barberId: string;
  barberName: string;
  service: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  amount: number;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}