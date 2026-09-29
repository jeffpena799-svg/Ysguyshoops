import assert from "node:assert/strict";
import test from "node:test";
import { applyNewPlayerBaselineRepair } from "../api/_new-player-baseline-repair.js";

const ricoId = "player-1786929747481-la8po";
const anwarId = "player-1786222560378-w87or";

test("repairs Rico and Anwar from published Sunday sessions exactly once", () => {
  const data = {
    players: [
      { id: ricoId, name: "Rico", photoUrl: "rico.jpg", wins: 55, losses: 49, pts: 438, reb: 229, ast: 83, turnovers: 42, stocks: 36, defensiveGp: 88, formulaOverall: 76 },
      { id: anwarId, name: "Anwar", nickname: "A", wins: 52, losses: 19, pts: 331, reb: 299, ast: 48, turnovers: 28, stocks: 2, defensiveGp: 35, formulaOverall: 79 },
      { id: "other", name: "Other", wins: 10, losses: 5, pts: 50, reb: 40, ast: 20, turnovers: 10 },
    ],
    statBaseline: { other: { wins: 1, losses: 1, pts: 1, reb: 1, ast: 1, turnovers: 1 } },
    sundaySessions: [
      { date: "2026-08-10", status: "published", lines: [{ playerId: anwarId, gp: 4, wins: 3, pts: 16, reb: 12, ast: 2, turnovers: 3 }] },
      { date: "2026-08-16", status: "published", lines: [{ playerId: ricoId, gp: 2, wins: 1, pts: 9, reb: 7, ast: 2, turnovers: 2 }] },
      { date: "2026-08-23", status: "published", lines: [
        { playerId: ricoId, gp: 3, wins: 2, pts: 15, reb: 8, ast: 3, turnovers: 1, stocks: 3 },
        { playerId: anwarId, gp: 5, wins: 4, pts: 27, reb: 27, ast: 4, turnovers: 0, stocks: 0 },
      ] },
      { date: "2026-09-28", status: "published", lines: [
        { playerId: ricoId, gp: 18, wins: 9, pts: 72, reb: 36, ast: 14, turnovers: 8, stocks: 6 },
        { playerId: anwarId, gp: 5, wins: 1, pts: 25, reb: 29, ast: 6, turnovers: 1, stocks: 2 },
      ] },
      { date: "2026-09-29", status: "draft", lines: [{ playerId: ricoId, gp: 99, wins: 99, pts: 999, reb: 999, ast: 999, turnovers: 999, stocks: 999 }] },
    ],
  };

  const repaired = applyNewPlayerBaselineRepair(data);
  assert.equal(repaired.changed, true);
  assert.deepEqual(repaired.data.players.find(player => player.id === ricoId), {
    id: ricoId, name: "Rico", photoUrl: "rico.jpg", wins: 12, losses: 11, pts: 96, reb: 51, ast: 19, turnovers: 11, stocks: 9, defensiveGp: 21,
  });
  assert.deepEqual(repaired.data.players.find(player => player.id === anwarId), {
    id: anwarId, name: "Anwar", nickname: "A", wins: 8, losses: 6, pts: 68, reb: 68, ast: 12, turnovers: 4, stocks: 2, defensiveGp: 10,
  });
  assert.deepEqual(repaired.data.statBaseline[ricoId], { wins: 0, losses: 0, pts: 0, reb: 0, ast: 0, turnovers: 0, stocks: 0, defensiveGp: 0 });
  assert.deepEqual(repaired.data.statBaseline[anwarId], { wins: 0, losses: 0, pts: 0, reb: 0, ast: 0, turnovers: 0, stocks: 0, defensiveGp: 0 });
  assert.deepEqual(repaired.data.players.find(player => player.id === "other"), data.players[2]);

  const repeated = applyNewPlayerBaselineRepair(repaired.data);
  assert.equal(repeated.changed, false);
  assert.strictEqual(repeated.data, repaired.data);
});

test("does not invent totals when a targeted player has no published session", () => {
  const data = { players: [{ id: ricoId, name: "Rico", wins: 1 }], statBaseline: {}, sundaySessions: [] };
  const result = applyNewPlayerBaselineRepair(data);
  assert.equal(result.changed, false);
  assert.strictEqual(result.data, data);
});
