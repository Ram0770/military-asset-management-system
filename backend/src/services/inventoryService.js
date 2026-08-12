import prisma from "../config/prisma.js";

/**
 * Pure calculation function for inventory formulas (Formula 1 & Formula 2).
 * Strictly enforces:
 * Net Movement = Purchases + Transfers In - Transfers Out
 * Closing Balance = Opening Balance + Net Movement - Assigned - Expended
 */
export function calculateInventoryMetrics({
  openingBalance = 0,
  purchases = 0,
  transfersIn = 0,
  transfersOut = 0,
  assigned = 0,
  expended = 0
}) {
  const netMovement = purchases + transfersIn - transfersOut;
  const closingBalance = openingBalance + netMovement - assigned - expended;

  return {
    openingBalance,
    purchases,
    transfersIn,
    transfersOut,
    netMovement,
    assigned,
    expended,
    closingBalance
  };
}

/**
 * Dynamically computes inventory metrics from database transactional records
 * given optional filters: baseId, equipmentTypeId, startDate, endDate.
 */
export async function getInventorySummary({ baseId, equipmentTypeId, startDate, endDate } = {}) {
  const parsedBaseId = baseId ? Number(baseId) : undefined;
  const parsedEquipmentTypeId = equipmentTypeId ? Number(equipmentTypeId) : undefined;
  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;

  // Build date range filters
  const dateFilter = {};
  if (start) dateFilter.gte = start;
  if (end) dateFilter.lte = end;

  const hasDateFilter = Object.keys(dateFilter).length > 0;

  // 1. Calculate Opening Balance (activity BEFORE start date)
  let openingBalance = 0;
  if (start) {
    const priorPurchases = await prisma.purchase.aggregate({
      _sum: { quantity: true },
      where: {
        ...(parsedBaseId && { baseId: parsedBaseId }),
        ...(parsedEquipmentTypeId && { equipmentTypeId: parsedEquipmentTypeId }),
        createdAt: { lt: start }
      }
    });

    const priorTransfersIn = await prisma.transfer.aggregate({
      _sum: { quantity: true },
      where: {
        ...(parsedBaseId && { destinationBaseId: parsedBaseId }),
        ...(parsedEquipmentTypeId && { equipmentTypeId: parsedEquipmentTypeId }),
        createdAt: { lt: start }
      }
    });

    const priorTransfersOut = await prisma.transfer.aggregate({
      _sum: { quantity: true },
      where: {
        ...(parsedBaseId && { sourceBaseId: parsedBaseId }),
        ...(parsedEquipmentTypeId && { equipmentTypeId: parsedEquipmentTypeId }),
        createdAt: { lt: start }
      }
    });

    const priorAssigned = await prisma.assignment.aggregate({
      _sum: { quantity: true },
      where: {
        ...(parsedBaseId && { baseId: parsedBaseId }),
        ...(parsedEquipmentTypeId && { equipmentTypeId: parsedEquipmentTypeId }),
        createdAt: { lt: start }
      }
    });

    const priorExpended = await prisma.expenditure.aggregate({
      _sum: { quantity: true },
      where: {
        ...(parsedBaseId && { baseId: parsedBaseId }),
        ...(parsedEquipmentTypeId && { equipmentTypeId: parsedEquipmentTypeId }),
        createdAt: { lt: start }
      }
    });

    const pP = priorPurchases._sum.quantity || 0;
    const pTI = priorTransfersIn._sum.quantity || 0;
    const pTO = priorTransfersOut._sum.quantity || 0;
    const pA = priorAssigned._sum.quantity || 0;
    const pE = priorExpended._sum.quantity || 0;

    openingBalance = pP + pTI - pTO - pA - pE;
  }

  // 2. Calculate Window Activity (Purchases, Transfers, Assignments, Expenditures)
  const purchasesAggregate = await prisma.purchase.aggregate({
    _sum: { quantity: true },
    where: {
      ...(parsedBaseId && { baseId: parsedBaseId }),
      ...(parsedEquipmentTypeId && { equipmentTypeId: parsedEquipmentTypeId }),
      ...(hasDateFilter && { createdAt: dateFilter })
    }
  });

  const transfersInAggregate = await prisma.transfer.aggregate({
    _sum: { quantity: true },
    where: {
      ...(parsedBaseId && { destinationBaseId: parsedBaseId }),
      ...(parsedEquipmentTypeId && { equipmentTypeId: parsedEquipmentTypeId }),
      ...(hasDateFilter && { createdAt: dateFilter })
    }
  });

  const transfersOutAggregate = await prisma.transfer.aggregate({
    _sum: { quantity: true },
    where: {
      ...(parsedBaseId && { sourceBaseId: parsedBaseId }),
      ...(parsedEquipmentTypeId && { equipmentTypeId: parsedEquipmentTypeId }),
      ...(hasDateFilter && { createdAt: dateFilter })
    }
  });

  const assignmentsAggregate = await prisma.assignment.aggregate({
    _sum: { quantity: true },
    where: {
      ...(parsedBaseId && { baseId: parsedBaseId }),
      ...(parsedEquipmentTypeId && { equipmentTypeId: parsedEquipmentTypeId }),
      ...(hasDateFilter && { createdAt: dateFilter })
    }
  });

  const expendituresAggregate = await prisma.expenditure.aggregate({
    _sum: { quantity: true },
    where: {
      ...(parsedBaseId && { baseId: parsedBaseId }),
      ...(parsedEquipmentTypeId && { equipmentTypeId: parsedEquipmentTypeId }),
      ...(hasDateFilter && { createdAt: dateFilter })
    }
  });

  const purchases = purchasesAggregate._sum.quantity || 0;
  const transfersIn = transfersInAggregate._sum.quantity || 0;
  const transfersOut = transfersOutAggregate._sum.quantity || 0;
  const assigned = assignmentsAggregate._sum.quantity || 0;
  const expended = expendituresAggregate._sum.quantity || 0;

  return calculateInventoryMetrics({
    openingBalance,
    purchases,
    transfersIn,
    transfersOut,
    assigned,
    expended
  });
}
