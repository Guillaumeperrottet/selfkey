-- CreateTable
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add email copy configuration fields to establishment table
ALTER TABLE "establishments" ADD COLUMN IF NOT EXISTS "enableEmailCopyOnConfirmation" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "establishments" ADD COLUMN IF NOT EXISTS "emailCopyAddresses" TEXT[];
