/*
  Warnings:

  - You are about to drop the column `slug` on the `OrgUnit` table. All the data in the column will be lost.
  - Added the required column `orgUnitId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrgUnit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "managerName" TEXT,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrgUnit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrgUnit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrgUnit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "OrgUnit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrgUnit" ("createdAt", "id", "isActive", "name", "organizationId", "parentId", "tenantId", "updatedAt") SELECT "createdAt", "id", "isActive", "name", "organizationId", "parentId", "tenantId", "updatedAt" FROM "OrgUnit";
DROP TABLE "OrgUnit";
ALTER TABLE "new_OrgUnit" RENAME TO "OrgUnit";
CREATE INDEX "OrgUnit_tenantId_idx" ON "OrgUnit"("tenantId");
CREATE INDEX "OrgUnit_organizationId_idx" ON "OrgUnit"("organizationId");
CREATE INDEX "OrgUnit_parentId_idx" ON "OrgUnit"("parentId");
CREATE INDEX "OrgUnit_tenantId_organizationId_idx" ON "OrgUnit"("tenantId", "organizationId");
CREATE TABLE "new_Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "organizationId" TEXT NOT NULL,
    "orgUnitId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "assigneeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ticket_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_orgUnitId_fkey" FOREIGN KEY ("orgUnitId") REFERENCES "OrgUnit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ticket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ticket" ("assigneeId", "createdAt", "createdById", "description", "id", "priority", "status", "title", "updatedAt") SELECT "assigneeId", "createdAt", "createdById", "description", "id", "priority", "status", "title", "updatedAt" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
CREATE INDEX "Ticket_organizationId_idx" ON "Ticket"("organizationId");
CREATE INDEX "Ticket_orgUnitId_idx" ON "Ticket"("orgUnitId");
CREATE INDEX "Ticket_createdById_idx" ON "Ticket"("createdById");
CREATE INDEX "Ticket_assigneeId_idx" ON "Ticket"("assigneeId");
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'REQUESTER',
    "mustResetPassword" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT,
    "organizationId" TEXT,
    "orgUnitId" TEXT,
    CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_orgUnitId_fkey" FOREIGN KEY ("orgUnitId") REFERENCES "OrgUnit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "id", "mustResetPassword", "name", "organizationId", "password", "role", "tenantId", "updatedAt") SELECT "createdAt", "id", "mustResetPassword", "name", "organizationId", "password", "role", "tenantId", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
