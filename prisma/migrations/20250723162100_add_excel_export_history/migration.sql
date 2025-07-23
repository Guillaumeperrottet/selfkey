-- CreateTable
CREATE TABLE "excel_export_history" (
    "id" TEXT NOT NULL,
    "establishmentSlug" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "fileName" TEXT NOT NULL,
    "recordsCount" INTEGER NOT NULL,
    "exportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "excel_export_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "excel_export_history" ADD CONSTRAINT "excel_export_history_establishmentSlug_fkey" FOREIGN KEY ("establishmentSlug") REFERENCES "establishments"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "excel_export_history" ADD CONSTRAINT "excel_export_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
