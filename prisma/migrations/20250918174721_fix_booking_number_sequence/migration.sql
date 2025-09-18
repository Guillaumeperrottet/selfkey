-- Create sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS booking_number_seq START WITH 1;

-- Set sequence to the correct value based on existing data
SELECT setval('booking_number_seq', COALESCE((SELECT MAX("bookingNumber") FROM bookings), 0) + 1, false);

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "bookingNumber" SET DEFAULT nextval('booking_number_seq');
