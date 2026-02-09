-- CreateIndex
CREATE INDEX "Charge_leaseId_status_idx" ON "Charge"("leaseId", "status");

-- CreateIndex
CREATE INDEX "Conversation_ownerId_lastMessageAt_idx" ON "Conversation"("ownerId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "Expense_ownerId_idx" ON "Expense"("ownerId");

-- CreateIndex
CREATE INDEX "Lease_unitId_idx" ON "Lease"("unitId");

-- CreateIndex
CREATE INDEX "Lease_tenantId_idx" ON "Lease"("tenantId");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_unitId_idx" ON "MaintenanceRequest"("unitId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_direction_readAt_idx" ON "Message"("conversationId", "direction", "readAt");

-- CreateIndex
CREATE INDEX "MileageTrip_ownerId_idx" ON "MileageTrip"("ownerId");

-- CreateIndex
CREATE INDEX "Property_ownerId_idx" ON "Property"("ownerId");

-- CreateIndex
CREATE INDEX "Unit_propertyId_idx" ON "Unit"("propertyId");
