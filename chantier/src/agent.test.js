import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeReminders } from './agent.js';
import { DEFAULT_SETTINGS } from './store.js';

const S = DEFAULT_SETTINGS;
const at = (h, m = 0) => new Date(2026, 10, 17, h, m);
const item = (f) => ({ id: Math.random().toString(36), type: 'travail', title: 't', date: '2026-11-17', time: '', validated: false, ...f });
const keys = (r) => r.map((x) => x.key.split(':')[0]);

test('rien à signaler sans éléments', () => {
  assert.deepEqual(computeReminders([], S, at(10)), []);
});

test('rendez-vous imminent', () => {
  const r = computeReminders([item({ type: 'rdv', time: '10:30', title: 'Plombier' })], S, at(10));
  assert.equal(r[0].level, 'urgent');
  assert.match(r[0].title, /30 min/);
});

test('rendez-vous trop lointain : pas de rappel urgent', () => {
  const r = computeReminders([item({ type: 'rdv', time: '15:00' })], S, at(10));
  assert.ok(!keys(r).includes('rdv'));
  assert.ok(keys(r).includes('morning'));
});

test('briefing du matin accordé', () => {
  const r = computeReminders([item({}), item({}), item({ type: 'rdv', time: '16:00' })], S, at(8));
  const m = r.find((x) => x.key.startsWith('morning'));
  assert.equal(m.message, "Aujourd'hui : 2 travaux et 1 rendez-vous.");
});

test('fin de journée : valider et noter', () => {
  const r = computeReminders([item({})], S, at(18));
  assert.ok(keys(r).includes('evening-validate'));
  assert.ok(keys(r).includes('evening-journal'));
});

test('fin de journée : tout validé + journal → rien', () => {
  const r = computeReminders([item({ validated: true }), item({ type: 'journal' })], S, at(18));
  assert.deepEqual(r, []);
});

test('retards des jours précédents', () => {
  const r = computeReminders([item({ date: '2026-11-15' }), item({ date: '2026-11-16', validated: true })], S, at(10));
  assert.equal(r[0].key.split(':')[0], 'overdue');
  assert.equal(r[0].itemIds.length, 1);
});
