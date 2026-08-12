import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Military Asset Management System database...");

  // 1. Seed Bases
  const basesData = [
    { name: "Central Command (HQ)", code: "HQ-01", location: "Capitol District" },
    { name: "Northern Base (Fort Alpha)", code: "FB-NORTH", location: "Northern Ridge Sector" },
    { name: "Southern Base (Fort Bravo)", code: "FB-SOUTH", location: "Southern Maritime Zone" }
  ];

  const bases = {};
  for (const b of basesData) {
    const created = await prisma.base.upsert({
      where: { code: b.code },
      update: { name: b.name, location: b.location },
      create: b
    });
    bases[b.code] = created;
  }
  console.log("Bases seeded.");

  // 2. Seed Equipment Types
  const equipmentTypesData = [
    { name: "Armored Personnel Carrier", category: "VEHICLE", unit: "units", description: "Heavy tracked armor transport vehicle" },
    { name: "Utility Transport Truck", category: "VEHICLE", unit: "units", description: "4x4 tactical logistics cargo truck" },
    { name: "M4A1 Carbine Rifle", category: "WEAPON", unit: "units", description: "5.56mm lightweight tactical rifle" },
    { name: "5.56mm NATO Ammunition", category: "AMMUNITION", unit: "rounds", description: "Standard rifle ammunition rounds" },
    { name: "120mm Mortar Shell", category: "AMMUNITION", unit: "rounds", description: "Heavy artillery mortar ammunition" },
    { name: "Tactical Radio Kit", category: "EQUIPMENT", unit: "kits", description: "Encrypted UHF/VHF command radio set" },
    { name: "Night Vision Goggles", category: "EQUIPMENT", unit: "pairs", description: "Gen-3 dual tube thermal vision device" }
  ];

  const eqTypes = {};
  for (const eq of equipmentTypesData) {
    const created = await prisma.equipmentType.upsert({
      where: { name: eq.name },
      update: { category: eq.category, unit: eq.unit, description: eq.description },
      create: eq
    });
    eqTypes[eq.name] = created;
  }
  console.log("Equipment Types seeded.");

  // 3. Seed Users with Bcrypt Hashed Passwords
  const usersData = [
    {
      name: "Admin Officer",
      username: "admin",
      email: "admin@military.gov",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
      baseId: bases["HQ-01"].id
    },
    {
      name: "Commander Alpha",
      username: "commander.north",
      email: "commander.north@military.gov",
      password: await bcrypt.hash("command123", 10),
      role: "BASE_COMMANDER",
      baseId: bases["FB-NORTH"].id
    },
    {
      name: "Logistics South",
      username: "logistics.south",
      email: "logistics.south@military.gov",
      password: await bcrypt.hash("logistics123", 10),
      role: "LOGISTICS_OFFICER",
      baseId: bases["FB-SOUTH"].id
    }
  ];

  const users = {};
  for (const u of usersData) {
    const created = await prisma.user.upsert({
      where: { username: u.username },
      update: { name: u.name, email: u.email, password: u.password, role: u.role, baseId: u.baseId },
      create: u
    });
    users[u.username] = created;
  }
  console.log("Users seeded.");

  // 4. Seed Initial Stock Assets
  const assetsData = [
    { baseId: bases["HQ-01"].id, equipmentTypeId: eqTypes["Armored Personnel Carrier"].id, quantity: 25, status: "OPERATIONAL" },
    { baseId: bases["HQ-01"].id, equipmentTypeId: eqTypes["M4A1 Carbine Rifle"].id, quantity: 150, status: "OPERATIONAL" },
    { baseId: bases["HQ-01"].id, equipmentTypeId: eqTypes["120mm Mortar Shell"].id, quantity: 840, status: "RESTRICTED" },
    { baseId: bases["FB-NORTH"].id, equipmentTypeId: eqTypes["Armored Personnel Carrier"].id, quantity: 12, status: "OPERATIONAL" },
    { baseId: bases["FB-NORTH"].id, equipmentTypeId: eqTypes["Tactical Radio Kit"].id, quantity: 48, status: "OPERATIONAL" },
    { baseId: bases["FB-NORTH"].id, equipmentTypeId: eqTypes["M4A1 Carbine Rifle"].id, quantity: 80, status: "OPERATIONAL" },
    { baseId: bases["FB-SOUTH"].id, equipmentTypeId: eqTypes["5.56mm NATO Ammunition"].id, quantity: 12000, status: "STOCKED" },
    { baseId: bases["FB-SOUTH"].id, equipmentTypeId: eqTypes["Night Vision Goggles"].id, quantity: 65, status: "OPERATIONAL" },
    { baseId: bases["FB-SOUTH"].id, equipmentTypeId: eqTypes["Utility Transport Truck"].id, quantity: 18, status: "MAINTENANCE" }
  ];

  for (const a of assetsData) {
    await prisma.asset.upsert({
      where: {
        baseId_equipmentTypeId: {
          baseId: a.baseId,
          equipmentTypeId: a.equipmentTypeId
        }
      },
      update: { quantity: a.quantity, status: a.status },
      create: a
    });
  }
  console.log("Assets seeded.");

  // 5. Seed Purchases, Transfers, Assignments, Expenditures & Audit Logs
  const samplePurchase = await prisma.purchase.create({
    data: {
      baseId: bases["FB-SOUTH"].id,
      equipmentTypeId: eqTypes["5.56mm NATO Ammunition"].id,
      quantity: 5000,
      vendor: "Defense Tactical Corp",
      notes: "Routine quarterly ammunition resupply batch",
      createdById: users["logistics.south"].id
    }
  });

  const sampleTransfer = await prisma.transfer.create({
    data: {
      sourceBaseId: bases["HQ-01"].id,
      destinationBaseId: bases["FB-NORTH"].id,
      equipmentTypeId: eqTypes["Armored Personnel Carrier"].id,
      quantity: 5,
      status: "COMPLETED",
      notes: "Northern border patrol deployment convoy",
      createdById: users["admin"].id
    }
  });

  const sampleAssignment = await prisma.assignment.create({
    data: {
      baseId: bases["FB-NORTH"].id,
      equipmentTypeId: eqTypes["Tactical Radio Kit"].id,
      quantity: 12,
      personnel: "101st Recon Battalion",
      notes: "Assigned for border monitoring exercise",
      createdById: users["commander.north"].id
    }
  });

  const sampleExpenditure = await prisma.expenditure.create({
    data: {
      baseId: bases["FB-SOUTH"].id,
      equipmentTypeId: eqTypes["5.56mm NATO Ammunition"].id,
      quantity: 1500,
      reason: "Live-fire combat readiness training exercise",
      notes: "Authorized by Command Center",
      createdById: users["logistics.south"].id
    }
  });

  await prisma.auditLog.createMany({
    data: [
      { userId: users["admin"].id, action: "SYSTEM", details: "System database initialized and demo data seeded.", baseId: bases["HQ-01"].id },
      { userId: users["logistics.south"].id, action: "PURCHASE", details: "Purchased 5000 rounds of 5.56mm NATO Ammunition", entityRef: `Purchase #${samplePurchase.id}`, baseId: bases["FB-SOUTH"].id },
      { userId: users["admin"].id, action: "TRANSFER", details: "Transferred 5 Armored Personnel Carriers to Northern Base", entityRef: `Transfer #${sampleTransfer.id}`, baseId: bases["HQ-01"].id },
      { userId: users["commander.north"].id, action: "ASSIGNMENT", details: "Assigned 12 Tactical Radio Kits to 101st Recon Battalion", entityRef: `Assignment #${sampleAssignment.id}`, baseId: bases["FB-NORTH"].id },
      { userId: users["logistics.south"].id, action: "EXPENDITURE", details: "Expended 1500 rounds of 5.56mm NATO Ammunition in combat training", entityRef: `Expenditure #${sampleExpenditure.id}`, baseId: bases["FB-SOUTH"].id }
    ]
  });

  console.log("Sample transactions and audit logs seeded.");
  console.log("Seeding complete successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
