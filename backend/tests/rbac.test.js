import test from "node:test";
import assert from "node:assert/strict";
import { enforceBaseAccess } from "../src/middleware/auth.js";

test("enforceBaseAccess overrides query/body baseId for non-Admin users", () => {
  const req = {
    user: { id: 2, role: "BASE_COMMANDER", baseId: 1 },
    query: { baseId: "999" }, // Attempted parameter tampering to see Base 999
    body: { baseId: 999 }
  };

  const res = {};
  let nextCalled = false;
  const next = () => { nextCalled = true; };

  enforceBaseAccess(req, res, next);

  assert.equal(nextCalled, true);
  assert.equal(req.query.baseId, "1", "Base Commander query baseId must be forced to user.baseId (1)");
  assert.equal(req.body.baseId, 1, "Base Commander body baseId must be forced to user.baseId (1)");
});

test("enforceBaseAccess allows Admin users to pass custom baseId", () => {
  const req = {
    user: { id: 1, role: "ADMIN", baseId: 1 },
    query: { baseId: "2" },
    body: { baseId: 2 }
  };

  const res = {};
  let nextCalled = false;
  const next = () => { nextCalled = true; };

  enforceBaseAccess(req, res, next);

  assert.equal(nextCalled, true);
  assert.equal(req.query.baseId, "2", "Admin query baseId must not be overwritten");
  assert.equal(req.body.baseId, 2, "Admin body baseId must not be overwritten");
});
