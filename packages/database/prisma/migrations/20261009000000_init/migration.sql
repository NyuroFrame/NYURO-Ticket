-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationDomain" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgUnit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "managerName" TEXT,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'REQUESTER',
    "mustResetPassword" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,
    "organizationId" TEXT,
    "orgUnitId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "resolutionNotes" TEXT,
    "completedAt" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "orgUnitId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketAttachment" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_code_key" ON "Organization"("code");

-- CreateIndex
CREATE INDEX "Organization_tenantId_idx" ON "Organization"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_tenantId_slug_key" ON "Organization"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "OrganizationDomain_tenantId_idx" ON "OrganizationDomain"("tenantId");

-- CreateIndex
CREATE INDEX "OrganizationDomain_organizationId_idx" ON "OrganizationDomain"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationDomain_tenantId_organizationId_idx" ON "OrganizationDomain"("tenantId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationDomain_tenantId_domain_key" ON "OrganizationDomain"("tenantId", "domain");

-- CreateIndex
CREATE INDEX "OrgUnit_tenantId_idx" ON "OrgUnit"("tenantId");

-- CreateIndex
CREATE INDEX "OrgUnit_organizationId_idx" ON "OrgUnit"("organizationId");

-- CreateIndex
CREATE INDEX "OrgUnit_parentId_idx" ON "OrgUnit"("parentId");

-- CreateIndex
CREATE INDEX "OrgUnit_tenantId_organizationId_idx" ON "OrgUnit"("tenantId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE INDEX "Ticket_organizationId_idx" ON "Ticket"("organizationId");

-- CreateIndex
CREATE INDEX "Ticket_orgUnitId_idx" ON "Ticket"("orgUnitId");

-- CreateIndex
CREATE INDEX "Ticket_createdById_idx" ON "Ticket"("createdById");

-- CreateIndex
CREATE INDEX "Ticket_assigneeId_idx" ON "Ticket"("assigneeId");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "TicketAttachment_ticketId_idx" ON "TicketAttachment"("ticketId");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationDomain" ADD CONSTRAINT "OrganizationDomain_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationDomain" ADD CONSTRAINT "OrganizationDomain_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgUnit" ADD CONSTRAINT "OrgUnit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgUnit" ADD CONSTRAINT "OrgUnit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgUnit" ADD CONSTRAINT "OrgUnit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "OrgUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgUnitId_fkey" FOREIGN KEY ("orgUnitId") REFERENCES "OrgUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_orgUnitId_fkey" FOREIGN KEY ("orgUnitId") REFERENCES "OrgUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketAttachment" ADD CONSTRAINT "TicketAttachment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

