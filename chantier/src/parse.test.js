import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNote } from './parse.js';

const now = new Date(2026, 10, 17, 9, 0); // mardi 17 novembre 2026

test('rendez-vous demain avec heure', () => {
  const [i] = parseNote('Demain à 10h rendez-vous avec le plombier', now);
  assert.equal(i.type, 'rdv');
  assert.equal(i.date, '2026-11-18');
  assert.equal(i.time, '10:00');
  assert.equal(i.title, 'Rendez-vous avec le plombier');
  assert.equal(i.location, 'le plombier');
});

test('journal du jour', () => {
  const [i] = parseNote("J'ai terminé le coulage de la dalle", now);
  assert.equal(i.type, 'journal');
  assert.equal(i.date, '2026-11-17');
});

test('travail à un jour de la semaine', () => {
  const [i] = parseNote('Pose du carrelage vendredi', now);
  assert.equal(i.type, 'travail');
  assert.equal(i.date, '2026-11-20');
  assert.equal(i.title, 'Pose du carrelage');
});

test('date explicite et heure et demie', () => {
  const [i] = parseNote('Réunion de chantier le 25 novembre à 14h30', now);
  assert.equal(i.type, 'rdv');
  assert.equal(i.date, '2026-11-25');
  assert.equal(i.time, '14:30');
  assert.equal(i.title, 'Réunion de chantier');
});

test('plusieurs phrases', () => {
  const items = parseNote("J'ai fini le ferraillage. Demain 8h livraison des parpaings", now);
  assert.equal(items.length, 2);
  assert.equal(items[0].type, 'journal');
  assert.equal(items[1].date, '2026-11-18');
  assert.equal(items[1].time, '08:00');
});

test('formule « il faut »', () => {
  const [i] = parseNote('Il faut commander le ciment', now);
  assert.equal(i.title, 'Commander le ciment');
  assert.equal(i.type, 'travail');
});
