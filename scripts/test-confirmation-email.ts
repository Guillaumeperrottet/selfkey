import { PrismaClient } from '@prisma/client';
import { sendBookingConfirmation } from '../src/lib/email';

const prisma = new PrismaClient();

async function testConfirmationEmail() {
  try {
    // Récupérer la réservation avec chien (Marie Dupont)
    const booking = await prisma.booking.findFirst({
      where: {
        bookingNumber: 100014, // La réservation avec chien
      },
      include: {
        establishment: true,
        room: true,
      },
    });

    if (!booking) {
      console.error('❌ Réservation #100014 non trouvée');
      return;
    }

    console.log('📧 Envoi de l\'email de confirmation...');
    console.log('👤 Client:', `${booking.clientFirstName} ${booking.clientLastName}`);
    console.log('🐕 A un chien:', booking.hasDog ? 'OUI' : 'NON');
    console.log('📄 Type de document:', booking.clientIdType);
    console.log('');

    // Envoyer l'email
    await sendBookingConfirmation(
      {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        clientName: `${booking.clientFirstName} ${booking.clientLastName}`,
        clientEmail: booking.clientEmail,
        roomName: booking.room?.name || 'Parking jour',
        roomId: booking.roomId,
        amount: booking.amount,
        currency: booking.currency || 'CHF',
        bookingDate: booking.bookingDate,
        hotelSlug: booking.hotelSlug,
      },
      {
        name: booking.establishment.name,
        currency: 'CHF',
        rooms: [],
        logo: '',
        colors: { primary: '#000' },
        contact: {
          email: booking.establishment.hotelContactEmail || 'contact@example.com',
          phone: booking.establishment.hotelContactPhone || '+41 00 000 00 00',
        },
        stripe_key: '',
        stripe_account_id: '',
      }
    );

    console.log('✅ Email envoyé avec succès !');
    console.log('📬 Vérifie ta boîte mail:', booking.clientEmail);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erreur:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConfirmationEmail();
