-- CreateTable
CREATE TABLE "establishment_transfers" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserEmail" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "transferredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "establishment_transfers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "establishment_transfers" ADD CONSTRAINT "establishment_transfers_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "establishment_transfers" ADD CONSTRAINT "establishment_transfers_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "establishment_transfers" ADD CONSTRAINT "establishment_transfers_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
