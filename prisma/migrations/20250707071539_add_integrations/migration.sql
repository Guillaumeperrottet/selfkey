-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "establishmentSlug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "configuration" JSONB NOT NULL,
    "lastSync" TIMESTAMP(3),
    "lastError" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_logs" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_establishmentSlug_fkey" FOREIGN KEY ("establishmentSlug") REFERENCES "establishments"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_logs" ADD CONSTRAINT "integration_logs_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
