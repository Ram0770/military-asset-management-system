import test from "node:test";
import assert from "node:assert/strict";
import { calculateInventoryMetrics } from "../src/services/inventoryService.js";

test("Section 27 Baseline Requirement Test - Formulas 1 & 2", () => {
  // Section 27 Test Scenario:
  // Opening Balance = 100
  // Purchases = 50
  // Transfers In = 20
  // Transfers Out = 10
  // Assigned = 30
  // Expended = 15
  // Expected:
  // Net Movement = 50 + 20 - 10 = 60
  // Closing Balance = 100 + 60 - 30 - 15 = 115

  const result = calculateInventoryMetrics({
    openingBalance: 100,
    purchases: 50,
    transfersIn: 20,
    transfersOut: 10,
    assigned: 30,
    expended: 15
  });

  assert.equal(result.netMovement, 60, "Net Movement must equal Purchases + Transfers In - Transfers Out");
  assert.equal(result.closingBalance, 115, "Closing Balance must equal Opening Balance + Net Movement - Assigned - Expended");
});

test("Inventory Formula with Zero Net Movement", () => {
  const result = calculateInventoryMetrics({
    openingBalance: 500,
    purchases: 100,
    transfersIn: 50,
    transfersOut: 150,
    assigned: 100,
    expended: 50
  });

  assert.equal(result.netMovement, 0);
  assert.equal(result.closingBalance, 350);
});

test("Inventory Formula with High Transfers In", () => {
  const result = calculateInventoryMetrics({
    openingBalance: 0,
    purchases: 0,
    transfersIn: 1000,
    transfersOut: 0,
    assigned: 200,
    expended: 50
  });

  assert.equal(result.netMovement, 1000);
  assert.equal(result.closingBalance, 750);
});
