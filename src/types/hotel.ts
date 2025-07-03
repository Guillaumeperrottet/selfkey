export interface Room {
  id: string;
  name: string;
  price: number;
}

export interface HotelConfig {
  name: string;
  logo: string;
  colors: {
    primary: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  stripe_key: string; // Clé publique de la plateforme
  stripe_account_id: string; // ID du compte Stripe Connect du propriétaire
  currency: string;
  rooms: Room[];
  commission?: {
    rate: number; // Pourcentage (ex: 5 pour 5%)
    fixed_fee: number; // Montant fixe en CHF
  };
}

// Plus besoin d'AvailableRoom, on utilise Room directement
export type AvailableRoom = Room;

export interface BookingData {
  roomId: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;
  clientBirthDate: Date;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  clientCountry: string;
  clientIdNumber: string;
  guests: number;
  amount: number;
  checkInDate: Date;
  checkOutDate: Date;
}

export interface StripeAccount {
  id: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  email?: string;
}
