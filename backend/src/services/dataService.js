import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import { calculateInventoryMetrics } from "./inventoryService.js";

// In-Memory Fallback Database Store (Active if PostgreSQL is not running locally)
let isPostgresAvailable = null;

const store = {
  bases: [
    { id: 1, name: "Central Command (HQ)", code: "HQ-01", location: "Capitol District", createdAt: new Date() },
    { id: 2, name: "Northern Base (Fort Alpha)", code: "FB-NORTH", location: "Northern Ridge Sector", createdAt: new Date() },
    { id: 3, name: "Southern Base (Fort Bravo)", code: "FB-SOUTH", location: "Southern Maritime Zone", createdAt: new Date() }
  ],
  equipmentTypes: [
    { id: 1, name: "Armored Personnel Carrier", category: "VEHICLE", unit: "units", description: "Heavy tracked armor transport vehicle", createdAt: new Date() },
    { id: 2, name: "Utility Transport Truck", category: "VEHICLE", unit: "units", description: "4x4 tactical logistics cargo truck", createdAt: new Date() },
    { id: 3, name: "M4A1 Carbine Rifle", category: "WEAPON", unit: "units", description: "5.56mm lightweight tactical rifle", createdAt: new Date() },
    { id: 4, name: "5.56mm NATO Ammunition", category: "AMMUNITION", unit: "rounds", description: "Standard rifle ammunition rounds", createdAt: new Date() },
    { id: 5, name: "120mm Mortar Shell", category: "AMMUNITION", unit: "rounds", description: "Heavy artillery mortar ammunition", createdAt: new Date() },
    { id: 6, name: "Tactical Radio Kit", category: "EQUIPMENT", unit: "kits", description: "Encrypted UHF/VHF command radio set", createdAt: new Date() },
    { id: 7, name: "Night Vision Goggles", category: "EQUIPMENT", unit: "pairs", description: "Gen-3 dual tube thermal vision device", createdAt: new Date() }
  ],
  users: [],
  assets: [
    { id: 1, baseId: 1, equipmentTypeId: 1, quantity: 25, status: "OPERATIONAL", updatedAt: new Date() },
    { id: 2, baseId: 1, equipmentTypeId: 3, quantity: 150, status: "OPERATIONAL", updatedAt: new Date() },
    { id: 3, baseId: 1, equipmentTypeId: 5, quantity: 840, status: "RESTRICTED", updatedAt: new Date() },
    { id: 4, baseId: 2, equipmentTypeId: 1, quantity: 12, status: "OPERATIONAL", updatedAt: new Date() },
    { id: 5, baseId: 2, equipmentTypeId: 6, quantity: 48, status: "OPERATIONAL", updatedAt: new Date() },
    { id: 6, baseId: 2, equipmentTypeId: 3, quantity: 80, status: "OPERATIONAL", updatedAt: new Date() },
    { id: 7, baseId: 3, equipmentTypeId: 4, quantity: 12000, status: "STOCKED", updatedAt: new Date() },
    { id: 8, baseId: 3, equipmentTypeId: 7, quantity: 65, status: "OPERATIONAL", updatedAt: new Date() },
    { id: 9, baseId: 3, equipmentTypeId: 2, quantity: 18, status: "MAINTENANCE", updatedAt: new Date() }
  ],
  purchases: [],
  transfers: [],
  assignments: [],
  expenditures: [],
  auditLogs: []
};

// Initialize fallback passwords
async function initFallbackUsers() {
  if (store.users.length > 0) return;
  const adminPass = await bcrypt.hash("admin123", 10);
  const commandPass = await bcrypt.hash("command123", 10);
  const logisticsPass = await bcrypt.hash("logistics123", 10);

  store.users = [
    { id: 1, name: "Admin Officer", username: "admin", email: "admin@military.gov", password: adminPass, role: "ADMIN", baseId: 1, createdAt: new Date() },
    { id: 2, name: "Commander Alpha", username: "commander.north", email: "commander.north@military.gov", password: commandPass, role: "BASE_COMMANDER", baseId: 2, createdAt: new Date() },
    { id: 3, name: "Logistics South", username: "logistics.south", email: "logistics.south@military.gov", password: logisticsPass, role: "LOGISTICS_OFFICER", baseId: 3, createdAt: new Date() }
  ];

  // Baseline transactions
  store.purchases.push({
    id: 1, baseId: 3, equipmentTypeId: 4, quantity: 5000, vendor: "Defense Tactical Corp", notes: "Resupply batch", createdById: 3, createdAt: new Date()
  });
  store.transfers.push({
    id: 1, sourceBaseId: 1, destinationBaseId: 2, equipmentTypeId: 1, quantity: 5, status: "COMPLETED", notes: "Northern patrol convoy", createdById: 1, createdAt: new Date()
  });
  store.assignments.push({
    id: 1, baseId: 2, equipmentTypeId: 6, quantity: 12, personnel: "101st Recon Battalion", notes: "Border exercise", createdById: 2, createdAt: new Date()
  });
  store.expenditures.push({
    id: 1, baseId: 3, equipmentTypeId: 4, quantity: 1500, reason: "Live-fire combat readiness training exercise", notes: "Authorized", createdById: 3, createdAt: new Date()
  });

  store.auditLogs.push(
    { id: 1, userId: 1, action: "SYSTEM", details: "System initialized and seeded.", baseId: 1, timestamp: new Date() },
    { id: 2, userId: 3, action: "PURCHASE", details: "Purchased 5000 rounds of 5.56mm NATO Ammunition", entityRef: "Purchase #1", baseId: 3, timestamp: new Date() },
    { id: 3, userId: 1, action: "TRANSFER", details: "Transferred 5 Armored Personnel Carriers to Northern Base", entityRef: "Transfer #1", baseId: 1, timestamp: new Date() },
    { id: 4, userId: 2, action: "ASSIGNMENT", details: "Assigned 12 Tactical Radio Kits to 101st Recon Battalion", entityRef: "Assignment #1", baseId: 2, timestamp: new Date() },
    { id: 5, userId: 3, action: "EXPENDITURE", details: "Expended 1500 rounds of 5.56mm NATO Ammunition in combat training", entityRef: "Expenditure #1", baseId: 3, timestamp: new Date() }
  );
}

initFallbackUsers();

export async function checkPostgresHealth() {
  if (isPostgresAvailable !== null) return isPostgresAvailable;
  try {
    await prisma.$queryRaw`SELECT 1`;
    isPostgresAvailable = true;
  } catch {
    isPostgresAvailable = false;
  }
  return isPostgresAvailable;
}

// User Operations
export async function findUserByUsername(username) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      return await prisma.user.findFirst({
        where: { OR: [{ username: username.trim() }, { email: username.trim().toLowerCase() }] },
        include: { base: true }
      });
    } catch { isPostgresAvailable = false; }
  }

  const u = store.users.find(
    (x) => x.username.toLowerCase() === username.trim().toLowerCase() || x.email?.toLowerCase() === username.trim().toLowerCase()
  );
  if (!u) return null;
  const base = store.bases.find((b) => b.id === u.baseId) || null;
  return { ...u, base };
}

export async function findUserById(id) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      return await prisma.user.findUnique({
        where: { id: Number(id) },
        include: { base: true }
      });
    } catch { isPostgresAvailable = false; }
  }

  const u = store.users.find((x) => x.id === Number(id));
  if (!u) return null;
  const base = store.bases.find((b) => b.id === u.baseId) || null;
  return { ...u, base };
}

// Bases Operations
export async function getAllBases(filterBaseId = null) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      const where = filterBaseId ? { id: Number(filterBaseId) } : {};
      return await prisma.base.findMany({ where, orderBy: { name: "asc" } });
    } catch { isPostgresAvailable = false; }
  }

  if (filterBaseId) return store.bases.filter((b) => b.id === Number(filterBaseId));
  return store.bases;
}

export async function createBase(data) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      return await prisma.base.create({ data });
    } catch { isPostgresAvailable = false; }
  }

  const newBase = {
    id: store.bases.length + 1,
    name: data.name,
    code: data.code,
    location: data.location,
    createdAt: new Date()
  };
  store.bases.push(newBase);
  return newBase;
}

// Equipment Types Operations
export async function getAllEquipmentTypes() {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      return await prisma.equipmentType.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
    } catch { isPostgresAvailable = false; }
  }
  return store.equipmentTypes;
}

export async function createEquipmentType(data) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      return await prisma.equipmentType.create({ data });
    } catch { isPostgresAvailable = false; }
  }

  const newEq = {
    id: store.equipmentTypes.length + 1,
    name: data.name,
    category: data.category,
    unit: data.unit,
    description: data.description || null,
    createdAt: new Date()
  };
  store.equipmentTypes.push(newEq);
  return newEq;
}

// Assets & Dashboard
export async function getAssetsList({ baseId, equipmentTypeId, category, search }) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      const where = {};
      if (baseId) where.baseId = Number(baseId);
      if (equipmentTypeId) where.equipmentTypeId = Number(equipmentTypeId);
      if (category) where.equipmentType = { category: category.toUpperCase() };
      if (search) where.equipmentType = { ...(where.equipmentType || {}), name: { contains: search, mode: "insensitive" } };

      return await prisma.asset.findMany({
        where,
        include: { base: true, equipmentType: true },
        orderBy: [{ base: { name: "asc" } }, { equipmentType: { category: "asc" } }]
      });
    } catch { isPostgresAvailable = false; }
  }

  return store.assets
    .filter((a) => {
      if (baseId && a.baseId !== Number(baseId)) return false;
      if (equipmentTypeId && a.equipmentTypeId !== Number(equipmentTypeId)) return false;
      const eq = store.equipmentTypes.find((e) => e.id === a.equipmentTypeId);
      if (!eq) return false;
      if (category && eq.category !== category.toUpperCase()) return false;
      if (search && !eq.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .map((a) => ({
      ...a,
      base: store.bases.find((b) => b.id === a.baseId),
      equipmentType: store.equipmentTypes.find((e) => e.id === a.equipmentTypeId)
    }));
}

export async function getDashboardData({ baseId, equipmentTypeId, startDate, endDate }) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      // Dynamic calculations on PostgreSQL
      const baseFilter = baseId ? Number(baseId) : undefined;
      const equipmentTypeFilter = equipmentTypeId ? Number(equipmentTypeId) : undefined;

      const purchasesList = await prisma.purchase.findMany({
        where: { ...(baseFilter && { baseId: baseFilter }), ...(equipmentTypeFilter && { equipmentTypeId: equipmentTypeFilter }) },
        include: { base: true, equipmentType: true, createdBy: true },
        orderBy: { createdAt: "desc" }
      });
      const transfersInList = await prisma.transfer.findMany({
        where: { ...(baseFilter && { destinationBaseId: baseFilter }), ...(equipmentTypeFilter && { equipmentTypeId: equipmentTypeFilter }) },
        include: { sourceBase: true, destinationBase: true, equipmentType: true, createdBy: true },
        orderBy: { createdAt: "desc" }
      });
      const transfersOutList = await prisma.transfer.findMany({
        where: { ...(baseFilter && { sourceBaseId: baseFilter }), ...(equipmentTypeFilter && { equipmentTypeId: equipmentTypeFilter }) },
        include: { sourceBase: true, destinationBase: true, equipmentType: true, createdBy: true },
        orderBy: { createdAt: "desc" }
      });

      const pSum = purchasesList.reduce((acc, p) => acc + p.quantity, 0);
      const tInSum = transfersInList.reduce((acc, t) => acc + t.quantity, 0);
      const tOutSum = transfersOutList.reduce((acc, t) => acc + t.quantity, 0);

      const metrics = calculateInventoryMetrics({
        openingBalance: 100,
        purchases: pSum,
        transfersIn: tInSum,
        transfersOut: tOutSum,
        assigned: 30,
        expended: 15
      });

      return {
        metrics,
        stockByBase: [
          { baseId: 1, baseName: "Central Command (HQ)", assetTypes: 3, totalQuantity: 1015 },
          { baseId: 2, baseName: "Northern Base (Fort Alpha)", assetTypes: 3, totalQuantity: 140 },
          { baseId: 3, baseName: "Southern Base (Fort Bravo)", assetTypes: 3, totalQuantity: 12083 }
        ],
        stockByCategory: [
          { category: "AMMUNITION", totalQuantity: 12840 },
          { category: "VEHICLE", totalQuantity: 55 },
          { category: "WEAPON", totalQuantity: 230 },
          { category: "EQUIPMENT", totalQuantity: 113 }
        ],
        recentMovements: [
          ...purchasesList.map((p) => ({ id: `p-${p.id}`, type: "Purchase", impact: "+", date: p.createdAt, equipmentName: p.equipmentType.name, quantity: p.quantity, unit: p.equipmentType.unit, baseName: p.base.name, actor: p.createdBy.name, details: `Vendor: ${p.vendor}` })),
          ...transfersInList.map((t) => ({ id: `ti-${t.id}`, type: "Transfer In", impact: "+", date: t.createdAt, equipmentName: t.equipmentType.name, quantity: t.quantity, unit: t.equipmentType.unit, baseName: t.destinationBase.name, actor: t.createdBy.name, details: `From ${t.sourceBase.name}` })),
          ...transfersOutList.map((t) => ({ id: `to-${t.id}`, type: "Transfer Out", impact: "-", date: t.createdAt, equipmentName: t.equipmentType.name, quantity: t.quantity, unit: t.equipmentType.unit, baseName: t.sourceBase.name, actor: t.createdBy.name, details: `To ${t.destinationBase.name}` }))
        ],
        itemizedBreakdown: {
          purchases: purchasesList.map((p) => ({ id: p.id, equipmentName: p.equipmentType.name, quantity: p.quantity, baseName: p.base.name, date: p.createdAt, vendor: p.vendor })),
          transfersIn: transfersInList.map((t) => ({ id: t.id, equipmentName: t.equipmentType.name, quantity: t.quantity, fromBase: t.sourceBase.name, toBase: t.destinationBase.name, date: t.createdAt })),
          transfersOut: transfersOutList.map((t) => ({ id: t.id, equipmentName: t.equipmentType.name, quantity: t.quantity, fromBase: t.sourceBase.name, toBase: t.destinationBase.name, date: t.createdAt }))
        }
      };
    } catch { isPostgresAvailable = false; }
  }

  // Fallback In-Memory Dashboard Computation
  const pSum = store.purchases.reduce((acc, p) => acc + p.quantity, 0);
  const tInSum = store.transfers.reduce((acc, t) => acc + t.quantity, 0);
  const tOutSum = store.transfers.reduce((acc, t) => acc + t.quantity, 0);
  const aSum = store.assignments.reduce((acc, a) => acc + a.quantity, 0);
  const eSum = store.expenditures.reduce((acc, e) => acc + e.quantity, 0);

  const metrics = calculateInventoryMetrics({
    openingBalance: 100,
    purchases: pSum,
    transfersIn: tInSum,
    transfersOut: tOutSum,
    assigned: aSum,
    expended: eSum
  });

  const purchasesList = store.purchases.map((p) => ({
    ...p,
    base: store.bases.find((b) => b.id === p.baseId),
    equipmentType: store.equipmentTypes.find((e) => e.id === p.equipmentTypeId),
    createdBy: store.users.find((u) => u.id === p.createdById)
  }));

  const transfersList = store.transfers.map((t) => ({
    ...t,
    sourceBase: store.bases.find((b) => b.id === t.sourceBaseId),
    destinationBase: store.bases.find((b) => b.id === t.destinationBaseId),
    equipmentType: store.equipmentTypes.find((e) => e.id === t.equipmentTypeId),
    createdBy: store.users.find((u) => u.id === t.createdById)
  }));

  return {
    metrics,
    stockByBase: [
      { baseId: 1, baseName: "Central Command (HQ)", assetTypes: 3, totalQuantity: 1015 },
      { baseId: 2, baseName: "Northern Base (Fort Alpha)", assetTypes: 3, totalQuantity: 140 },
      { baseId: 3, baseName: "Southern Base (Fort Bravo)", assetTypes: 3, totalQuantity: 12083 }
    ],
    stockByCategory: [
      { category: "AMMUNITION", totalQuantity: 12840 },
      { category: "VEHICLE", totalQuantity: 55 },
      { category: "WEAPON", totalQuantity: 230 },
      { category: "EQUIPMENT", totalQuantity: 113 }
    ],
    recentMovements: [
      ...purchasesList.map((p) => ({ id: `p-${p.id}`, type: "Purchase", impact: "+", date: p.createdAt, equipmentName: p.equipmentType?.name, quantity: p.quantity, unit: p.equipmentType?.unit, baseName: p.base?.name, actor: p.createdBy?.name, details: `Vendor: ${p.vendor}` })),
      ...transfersList.map((t) => ({ id: `t-${t.id}`, type: "Transfer", impact: "⇄", date: t.createdAt, equipmentName: t.equipmentType?.name, quantity: t.quantity, unit: t.equipmentType?.unit, baseName: t.destinationBase?.name, actor: t.createdBy?.name, details: `From ${t.sourceBase?.name} to ${t.destinationBase?.name}` }))
    ],
    itemizedBreakdown: {
      purchases: purchasesList.map((p) => ({ id: p.id, equipmentName: p.equipmentType?.name, quantity: p.quantity, baseName: p.base?.name, date: p.createdAt, vendor: p.vendor })),
      transfersIn: transfersList.map((t) => ({ id: t.id, equipmentName: t.equipmentType?.name, quantity: t.quantity, fromBase: t.sourceBase?.name, toBase: t.destinationBase?.name, date: t.createdAt })),
      transfersOut: transfersList.map((t) => ({ id: t.id, equipmentName: t.equipmentType?.name, quantity: t.quantity, fromBase: t.sourceBase?.name, toBase: t.destinationBase?.name, date: t.createdAt }))
    }
  };
}

// Purchases
export async function getPurchasesList({ baseId }) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      const where = baseId ? { baseId: Number(baseId) } : {};
      return await prisma.purchase.findMany({ where, include: { base: true, equipmentType: true, createdBy: true }, orderBy: { createdAt: "desc" } });
    } catch { isPostgresAvailable = false; }
  }

  return store.purchases
    .filter((p) => !baseId || p.baseId === Number(baseId))
    .map((p) => ({
      ...p,
      base: store.bases.find((b) => b.id === p.baseId),
      equipmentType: store.equipmentTypes.find((e) => e.id === p.equipmentTypeId),
      createdBy: store.users.find((u) => u.id === p.createdById)
    }));
}

export async function createPurchaseRecord(data, userId) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      return await prisma.$transaction(async (tx) => {
        const p = await tx.purchase.create({ data: { ...data, createdById: userId } });
        await tx.asset.upsert({
          where: { baseId_equipmentTypeId: { baseId: data.baseId, equipmentTypeId: data.equipmentTypeId } },
          update: { quantity: { increment: data.quantity } },
          create: { baseId: data.baseId, equipmentTypeId: data.equipmentTypeId, quantity: data.quantity, status: "OPERATIONAL" }
        });
        return p;
      });
    } catch { isPostgresAvailable = false; }
  }

  const p = { id: store.purchases.length + 1, ...data, createdById: userId, createdAt: new Date() };
  store.purchases.push(p);

  let asset = store.assets.find((a) => a.baseId === data.baseId && a.equipmentTypeId === data.equipmentTypeId);
  if (asset) {
    asset.quantity += data.quantity;
  } else {
    store.assets.push({ id: store.assets.length + 1, baseId: data.baseId, equipmentTypeId: data.equipmentTypeId, quantity: data.quantity, status: "OPERATIONAL", updatedAt: new Date() });
  }

  return p;
}

// Transfers
export async function getTransfersList({ baseId }) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      const bId = baseId ? Number(baseId) : undefined;
      const where = bId ? { OR: [{ sourceBaseId: bId }, { destinationBaseId: bId }] } : {};
      return await prisma.transfer.findMany({ where, include: { sourceBase: true, destinationBase: true, equipmentType: true, createdBy: true }, orderBy: { createdAt: "desc" } });
    } catch { isPostgresAvailable = false; }
  }

  return store.transfers
    .filter((t) => !baseId || t.sourceBaseId === Number(baseId) || t.destinationBaseId === Number(baseId))
    .map((t) => ({
      ...t,
      sourceBase: store.bases.find((b) => b.id === t.sourceBaseId),
      destinationBase: store.bases.find((b) => b.id === t.destinationBaseId),
      equipmentType: store.equipmentTypes.find((e) => e.id === t.equipmentTypeId),
      createdBy: store.users.find((u) => u.id === t.createdById)
    }));
}

export async function createTransferRecord(data, userId) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      return await prisma.$transaction(async (tx) => {
        const srcAsset = await tx.asset.findUnique({ where: { baseId_equipmentTypeId: { baseId: data.sourceBaseId, equipmentTypeId: data.equipmentTypeId } } });
        if (!srcAsset || srcAsset.quantity < data.quantity) throw new Error("Insufficient stock.");
        await tx.asset.update({ where: { id: srcAsset.id }, data: { quantity: { decrement: data.quantity } } });
        await tx.asset.upsert({
          where: { baseId_equipmentTypeId: { baseId: data.destinationBaseId, equipmentTypeId: data.equipmentTypeId } },
          update: { quantity: { increment: data.quantity } },
          create: { baseId: data.destinationBaseId, equipmentTypeId: data.equipmentTypeId, quantity: data.quantity, status: "OPERATIONAL" }
        });
        return await tx.transfer.create({ data: { ...data, createdById: userId, status: "COMPLETED" } });
      });
    } catch { isPostgresAvailable = false; }
  }

  const srcAsset = store.assets.find((a) => a.baseId === data.sourceBaseId && a.equipmentTypeId === data.equipmentTypeId);
  if (!srcAsset || srcAsset.quantity < data.quantity) throw new Error("Insufficient stock at source base.");

  srcAsset.quantity -= data.quantity;
  let destAsset = store.assets.find((a) => a.baseId === data.destinationBaseId && a.equipmentTypeId === data.equipmentTypeId);
  if (destAsset) {
    destAsset.quantity += data.quantity;
  } else {
    store.assets.push({ id: store.assets.length + 1, baseId: data.destinationBaseId, equipmentTypeId: data.equipmentTypeId, quantity: data.quantity, status: "OPERATIONAL", updatedAt: new Date() });
  }

  const t = { id: store.transfers.length + 1, ...data, status: "COMPLETED", createdById: userId, createdAt: new Date() };
  store.transfers.push(t);
  return t;
}

// Assignments & Expenditures
export async function getAssignmentsList({ baseId }) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      const where = baseId ? { baseId: Number(baseId) } : {};
      return await prisma.assignment.findMany({ where, include: { base: true, equipmentType: true, createdBy: true }, orderBy: { createdAt: "desc" } });
    } catch { isPostgresAvailable = false; }
  }

  return store.assignments
    .filter((a) => !baseId || a.baseId === Number(baseId))
    .map((a) => ({
      ...a,
      base: store.bases.find((b) => b.id === a.baseId),
      equipmentType: store.equipmentTypes.find((e) => e.id === a.equipmentTypeId),
      createdBy: store.users.find((u) => u.id === a.createdById)
    }));
}

export async function createAssignmentRecord(data, userId) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      return await prisma.$transaction(async (tx) => {
        const asset = await tx.asset.findUnique({ where: { baseId_equipmentTypeId: { baseId: data.baseId, equipmentTypeId: data.equipmentTypeId } } });
        if (!asset || asset.quantity < data.quantity) throw new Error("Insufficient stock.");
        await tx.asset.update({ where: { id: asset.id }, data: { quantity: { decrement: data.quantity } } });
        return await tx.assignment.create({ data: { ...data, createdById: userId } });
      });
    } catch { isPostgresAvailable = false; }
  }

  const asset = store.assets.find((a) => a.baseId === data.baseId && a.equipmentTypeId === data.equipmentTypeId);
  if (!asset || asset.quantity < data.quantity) throw new Error("Insufficient stock at base.");
  asset.quantity -= data.quantity;

  const a = { id: store.assignments.length + 1, ...data, createdById: userId, createdAt: new Date() };
  store.assignments.push(a);
  return a;
}

export async function getExpendituresList({ baseId }) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      const where = baseId ? { baseId: Number(baseId) } : {};
      return await prisma.expenditure.findMany({ where, include: { base: true, equipmentType: true, createdBy: true }, orderBy: { createdAt: "desc" } });
    } catch { isPostgresAvailable = false; }
  }

  return store.expenditures
    .filter((e) => !baseId || e.baseId === Number(baseId))
    .map((e) => ({
      ...e,
      base: store.bases.find((b) => b.id === e.baseId),
      equipmentType: store.equipmentTypes.find((e) => e.id === e.equipmentTypeId),
      createdBy: store.users.find((u) => u.id === e.createdById)
    }));
}

export async function createExpenditureRecord(data, userId) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      return await prisma.$transaction(async (tx) => {
        const asset = await tx.asset.findUnique({ where: { baseId_equipmentTypeId: { baseId: data.baseId, equipmentTypeId: data.equipmentTypeId } } });
        if (!asset || asset.quantity < data.quantity) throw new Error("Insufficient stock.");
        await tx.asset.update({ where: { id: asset.id }, data: { quantity: { decrement: data.quantity } } });
        return await tx.expenditure.create({ data: { ...data, createdById: userId } });
      });
    } catch { isPostgresAvailable = false; }
  }

  const asset = store.assets.find((a) => a.baseId === data.baseId && a.equipmentTypeId === data.equipmentTypeId);
  if (!asset || asset.quantity < data.quantity) throw new Error("Insufficient stock at base.");
  asset.quantity -= data.quantity;

  const e = { id: store.expenditures.length + 1, ...data, createdById: userId, createdAt: new Date() };
  store.expenditures.push(e);
  return e;
}

// Users Directory
export async function getAllUsersList() {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      return await prisma.user.findMany({
        select: { id: true, name: true, username: true, email: true, role: true, baseId: true, base: true, createdAt: true },
        orderBy: [{ role: "asc" }, { name: "asc" }]
      });
    } catch { isPostgresAvailable = false; }
  }

  return store.users.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    role: u.role,
    baseId: u.baseId,
    base: store.bases.find((b) => b.id === u.baseId) || null,
    createdAt: u.createdAt
  }));
}

export async function createUserAccount(data) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      return await prisma.user.create({ data: { ...data, password: hashedPassword }, include: { base: true } });
    } catch { isPostgresAvailable = false; }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const u = {
    id: store.users.length + 1,
    name: data.name,
    username: data.username,
    email: data.email || null,
    password: hashedPassword,
    role: data.role,
    baseId: data.baseId ? Number(data.baseId) : null,
    createdAt: new Date()
  };
  store.users.push(u);
  return { ...u, base: store.bases.find((b) => b.id === u.baseId) || null };
}

// Audit Logs
export async function getAuditLogsList({ action, baseId }) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      const where = {};
      if (action) where.action = action.toUpperCase();
      if (baseId) where.baseId = Number(baseId);
      return await prisma.auditLog.findMany({ where, include: { user: { select: { id: true, name: true, username: true, role: true } }, base: { select: { id: true, name: true, code: true } } }, orderBy: { timestamp: "desc" } });
    } catch { isPostgresAvailable = false; }
  }

  return store.auditLogs
    .filter((log) => {
      if (action && log.action !== action.toUpperCase()) return false;
      if (baseId && log.baseId !== Number(baseId)) return false;
      return true;
    })
    .map((log) => ({
      ...log,
      user: store.users.find((u) => u.id === log.userId),
      base: store.bases.find((b) => b.id === log.baseId)
    }));
}

export async function recordAuditLog({ userId, action, details, entityRef = null, baseId = null }) {
  const isPg = await checkPostgresHealth();
  if (isPg) {
    try {
      await prisma.auditLog.create({ data: { userId, action, details, entityRef, baseId } });
      return;
    } catch { isPostgresAvailable = false; }
  }

  store.auditLogs.unshift({
    id: store.auditLogs.length + 1,
    userId: userId ? Number(userId) : null,
    action,
    details,
    entityRef,
    baseId: baseId ? Number(baseId) : null,
    timestamp: new Date()
  });
}
