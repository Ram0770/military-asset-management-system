-- PostgreSQL Schema DDL for Military Asset Management System

-- Create Enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER');
CREATE TYPE "Category" AS ENUM ('VEHICLE', 'WEAPON', 'AMMUNITION', 'EQUIPMENT');
CREATE TYPE "AssetStatus" AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'RESTRICTED', 'STOCKED');
CREATE TYPE "TransferStatus" AS ENUM ('COMPLETED', 'PENDING', 'CANCELLED');
CREATE TYPE "AuditAction" AS ENUM ('PURCHASE', 'TRANSFER', 'ASSIGNMENT', 'EXPENDITURE', 'AUTH', 'SYSTEM');

-- Table: bases
CREATE TABLE "bases" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "code" VARCHAR(50) NOT NULL UNIQUE,
    "location" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: users
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "username" VARCHAR(100) NOT NULL UNIQUE,
    "email" VARCHAR(255) UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "role" "Role" DEFAULT 'LOGISTICS_OFFICER' NOT NULL,
    "baseId" INTEGER REFERENCES "bases"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX "idx_users_base_id" ON "users"("baseId");

-- Table: equipment_types
CREATE TABLE "equipment_types" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "category" "Category" NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX "idx_equipment_types_category" ON "equipment_types"("category");

-- Table: assets
CREATE TABLE "assets" (
    "id" SERIAL PRIMARY KEY,
    "base_id" INTEGER NOT NULL REFERENCES "bases"("id") ON DELETE CASCADE,
    "equipment_type_id" INTEGER NOT NULL REFERENCES "equipment_types"("id") ON DELETE CASCADE,
    "quantity" INTEGER DEFAULT 0 NOT NULL CHECK ("quantity" >= 0),
    "status" "AssetStatus" DEFAULT 'OPERATIONAL' NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "unique_base_equipment" UNIQUE ("base_id", "equipment_type_id")
);
CREATE INDEX "idx_assets_base_id" ON "assets"("base_id");
CREATE INDEX "idx_assets_equipment_type_id" ON "assets"("equipment_type_id");

-- Table: purchases
CREATE TABLE "purchases" (
    "id" SERIAL PRIMARY KEY,
    "base_id" INTEGER NOT NULL REFERENCES "bases"("id") ON DELETE CASCADE,
    "equipment_type_id" INTEGER NOT NULL REFERENCES "equipment_types"("id") ON DELETE CASCADE,
    "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
    "purchase_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "vendor" VARCHAR(255) NOT NULL,
    "notes" TEXT,
    "created_by_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX "idx_purchases_base_id" ON "purchases"("base_id");
CREATE INDEX "idx_purchases_equipment_type_id" ON "purchases"("equipment_type_id");
CREATE INDEX "idx_purchases_created_at" ON "purchases"("created_at");

-- Table: transfers
CREATE TABLE "transfers" (
    "id" SERIAL PRIMARY KEY,
    "source_base_id" INTEGER NOT NULL REFERENCES "bases"("id") ON DELETE CASCADE,
    "destination_base_id" INTEGER NOT NULL REFERENCES "bases"("id") ON DELETE CASCADE,
    "equipment_type_id" INTEGER NOT NULL REFERENCES "equipment_types"("id") ON DELETE CASCADE,
    "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
    "status" "TransferStatus" DEFAULT 'COMPLETED' NOT NULL,
    "notes" TEXT,
    "created_by_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "chk_different_bases" CHECK ("source_base_id" <> "destination_base_id")
);
CREATE INDEX "idx_transfers_source_base_id" ON "transfers"("source_base_id");
CREATE INDEX "idx_transfers_destination_base_id" ON "transfers"("destination_base_id");
CREATE INDEX "idx_transfers_equipment_type_id" ON "transfers"("equipment_type_id");
CREATE INDEX "idx_transfers_created_at" ON "transfers"("created_at");

-- Table: assignments
CREATE TABLE "assignments" (
    "id" SERIAL PRIMARY KEY,
    "base_id" INTEGER NOT NULL REFERENCES "bases"("id") ON DELETE CASCADE,
    "equipment_type_id" INTEGER NOT NULL REFERENCES "equipment_types"("id") ON DELETE CASCADE,
    "personnel" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
    "assignment_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "notes" TEXT,
    "created_by_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX "idx_assignments_base_id" ON "assignments"("base_id");
CREATE INDEX "idx_assignments_equipment_type_id" ON "assignments"("equipment_type_id");
CREATE INDEX "idx_assignments_created_at" ON "assignments"("created_at");

-- Table: expenditures
CREATE TABLE "expenditures" (
    "id" SERIAL PRIMARY KEY,
    "base_id" INTEGER NOT NULL REFERENCES "bases"("id") ON DELETE CASCADE,
    "equipment_type_id" INTEGER NOT NULL REFERENCES "equipment_types"("id") ON DELETE CASCADE,
    "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
    "expenditure_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "created_by_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX "idx_expenditures_base_id" ON "expenditures"("base_id");
CREATE INDEX "idx_expenditures_equipment_type_id" ON "expenditures"("equipment_type_id");
CREATE INDEX "idx_expenditures_created_at" ON "expenditures"("created_at");

-- Table: audit_logs
CREATE TABLE "audit_logs" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
    "action" "AuditAction" NOT NULL,
    "details" TEXT NOT NULL,
    "entity_ref" VARCHAR(255),
    "base_id" INTEGER REFERENCES "bases"("id") ON DELETE SET NULL,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs"("user_id");
CREATE INDEX "idx_audit_logs_base_id" ON "audit_logs"("base_id");
CREATE INDEX "idx_audit_logs_timestamp" ON "audit_logs"("timestamp");
