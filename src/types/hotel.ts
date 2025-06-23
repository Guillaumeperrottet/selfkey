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

export interface AvailableRoom extends Room {
  available: number;
}

export interface BookingData {
  roomId: string;
  clientName: string;
  clientEmail: string;
  phone: string;
  guests: number;
  amount: number;
}

export interface StripeAccount {
  id: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  email?: string;
}
