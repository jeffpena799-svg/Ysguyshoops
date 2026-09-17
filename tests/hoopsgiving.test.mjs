import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../api/_hoopsgiving.js', import.meta.url), 'utf8')
  .replace(/^import .*;$/gm, '')
  .replace(/const sql = postgres\([^\n]+\);/, '')
  .replace('export default async function handler', 'async function handler');
function fixture() {
  const store = new Map();
  const sql = async (strings, ...values) => {
    const query = strings.join('?');
    if (query.includes('CREATE TABLE')) return [];
    if (query.includes('INSERT INTO')) { store.set(values[0], structuredClone(values[1])); return []; }
    if (query.includes('SELECT data FROM league_state')) return [{ data: { players: [{ id: 'ty' }] } }];
    if (query.includes('SELECT data FROM hoopsgiving_events')) return query.includes('WHERE') ? (store.has(values[0]) ? [{ data: structuredClone(store.get(values[0])) }] : []) : [...store.values()].map(data => ({ data: structuredClone(data) }));
    if (query.includes('UPDATE hoopsgiving_events')) { store.set(values[1], structuredClone(values[0])); return []; }
    if (query.includes('DELETE FROM')) { store.delete(values[0]); return []; }
    throw new Error(query);
  };
  sql.json = value => value;
  sql.begin = async callback => callback(sql);
  const context = vm.createContext({ sql, crypto: { randomUUID: () => 'test' }, isAuthorized: req => req.headers.authorization === 'Bearer admin', console: { error() {} }, Date, Set, Boolean });
  vm.runInContext(source, context);
  async function call(body, admin = false, method = 'POST') {
    let code = 200, result;
    const response = { setHeader() {}, status(value) { code = value; return this; }, json(value) { result = value; } };
    await context.handler({ method, body, headers: admin ? { authorization: 'Bearer admin' } : {}, query: admin ? { admin: '1' } : {} }, response);
    return { code, result };
  }
  return { call };
}
test('players cannot create events or change payments; private payments never leak', async () => {
  const { call } = fixture();
  assert.equal((await call({ action: 'create' })).code, 401);
  const created = await call({ action: 'create' }, true);
  const event = created.result.event;
  await call({ action: 'edit', eventId: event.id, title: 'Hoopsgiving', date: '', location: '', notes: '', status: 'open' }, true);
  assert.equal((await call({ action: 'payment', eventId: event.id, playerId: 'ty', paid: true })).code, 401);
  await call({ action: 'payment', eventId: event.id, playerId: 'ty', paid: true }, true);
  const publicRead = await call({}, false, 'GET');
  assert.equal('payments' in publicRead.result.events[0], false);
  const rsvp = await call({ action: 'rsvp', eventId: event.id, playerId: 'ty', status: 'going', food: 'Pie' });
  assert.equal('payments' in rsvp.result.event, false);
});
test('one response per roster player, closed sign-ups, archive and confirmed deletion', async () => {
  const { call } = fixture();
  const { result: { event } } = await call({ action: 'create' }, true);
  const edit = status => call({ action: 'edit', eventId: event.id, title: event.title, date: '', location: '', notes: '', status }, true);
  await edit('open');
  assert.equal((await call({ action: 'rsvp', eventId: event.id, playerId: 'guest', status: 'going', food: '' })).code, 400);
  await call({ action: 'rsvp', eventId: event.id, playerId: 'ty', status: 'going', food: 'Pie' });
  const updated = await call({ action: 'rsvp', eventId: event.id, playerId: 'ty', status: 'maybe', food: 'Chips' });
  assert.equal(updated.result.event.responses.length, 1);
  assert.equal(updated.result.event.responses[0].food, 'Chips');
  await edit('closed');
  assert.equal((await call({ action: 'rsvp', eventId: event.id, playerId: 'ty', status: 'going', food: '' })).code, 400);
  await edit('archived');
  assert.equal((await call({}, false, 'GET')).result.events.length, 0);
  assert.equal((await call({}, true, 'GET')).result.events[0].responses.length, 1);
  assert.equal((await call({ action: 'delete', eventId: event.id }, true)).code, 400);
  assert.equal((await call({ action: 'delete', eventId: event.id, confirmation: 'DELETE' }, true)).code, 200);
});
