import assert from "node:assert/strict";
import test from "node:test";
import { applySeasonThreeMigration, SEASON_THREE_ID, SEASON_TWO_ID } from "./_season-three.js";

const fixture = () => ({
  players: [{id:"ty",name:"Ty",nickname:"Ty Bry",position:"G",wins:40,losses:20,pts:600,reb:300,ast:220,turnovers:44,stocks:31,defensiveGp:12,formulaOverall:91}],
  sundaySessions: [{id:"s1",date:"2026-09-27",lines:[]}],
  rankings: [{id:"r1",publishedAt:"2026-09-28T00:00:00.000Z",entries:[]}],
  polls: [{id:"mvp-1",category:"Weekly Award",status:"closed",officialWinnerId:"ty",deadline:"2026-09-27",createdAt:"2026-09-27"}],
  awards: [{season:"2025",name:"MVP",winner:"Ty",icon:"👑"},{season:"Season 2",name:"Hustle",winner:"Ty",icon:"🔥"}],
  seasons: [{name:"Summer 2026",status:"Active",games:9,champion:"TBD"},{name:"2025 Awards Season",status:"Archived",games:0,champion:"—"}],
});

test("archives the full current ledger and starts Season 3 without changing career totals", () => {
  const original = fixture();
  const result = applySeasonThreeMigration(original);
  assert.equal(result.changed, true);
  assert.equal(result.data.seasonSystem.activeSeasonId, SEASON_THREE_ID);
  assert.deepEqual(result.data.players, original.players);
  assert.equal(result.data.sundaySessions[0].seasonId, SEASON_TWO_ID);
  assert.equal(result.data.rankings[0].seasonId, SEASON_TWO_ID);
  const archive = result.data.seasonArchives.find(item => item.id === SEASON_TWO_ID);
  assert.equal(archive.playerStats[0].pts, 600);
  assert.equal(archive.playerStats[0].wins, 40);
  assert.equal(archive.weeklyMvps[0].winnerName, "Ty");
  assert.deepEqual(archive.awards.map(award => award.name), ["Hustle"]);
});

test("is idempotent after the rollover has been established", () => {
  const first = applySeasonThreeMigration(fixture());
  const second = applySeasonThreeMigration(first.data);
  assert.equal(second.changed, false);
  assert.strictEqual(second.data, first.data);
});
