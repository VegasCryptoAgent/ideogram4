-- CreateTable
CREATE TABLE IF NOT EXISTS "AutoCloakSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "alias" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutoCloakSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AutoCloakSetting_userId_idx" ON "AutoCloakSetting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AutoCloakSetting_userId_site_key" ON "AutoCloakSetting"("userId", "site");

-- AddForeignKey
ALTER TABLE "AutoCloakSetting" ADD CONSTRAINT IF NOT EXISTS "AutoCloakSetting_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
