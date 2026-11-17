// Transforme une phrase dictée en éléments du calendrier.
// 1. Avec Claude si disponible (comprend les tournures libres).
// 2. Sinon avec l'analyseur local (parse.js).

import { parseNote } from './parse.js';
import { getCapability } from './capabilities.js';
import { toKey } from './dates.js';

const TYPES = ['travail', 'rdv', 'journal'];

function prompt(text, now) {
  const today = toKey(now);
  const weekday = now.toLocaleDateString('fr-FR', { weekday: 'long' });
  return `Tu es l'assistant d'un chef de chantier. Il te dicte une note vocale en français.
Transforme-la en éléments de son agenda de chantier.

Aujourd'hui : ${weekday} ${today}. Heure actuelle : ${now.toTimeString().slice(0, 5)}.

Types possibles :
- "travail" : une tâche ou un travail à faire sur le chantier
- "rdv" : un rendez-vous, une réunion, une visite, une livraison à heure fixe
- "journal" : quelque chose qu'il a déjà fait ou constaté (passé, « j'ai… », « c'est terminé »)

Règles :
- Une note peut contenir plusieurs éléments : sépare-les.
- Dates relatives (demain, lundi prochain, le 25) → date AAAA-MM-JJ. Sans date : aujourd'hui.
- "time" au format HH:MM, ou "" si aucune heure n'est dite.
- "title" : court et clair, commençant par une majuscule, sans la date ni l'heure.
- "location" : lieu ou intervenant (entreprise, personne), ou "".
- "notes" : détails utiles restants, ou "".
- Corrige les erreurs évidentes de la dictée.

Réponds uniquement en JSON : {"items":[{"type":"…","title":"…","date":"AAAA-MM-JJ","time":"","location":"","notes":""}]}

Note dictée :
"""${text}"""`;
}

function sanitize(raw, now) {
  const list = Array.isArray(raw?.items) ? raw.items : [];
  return list
    .map((i) => ({
      type: TYPES.includes(i.type) ? i.type : 'travail',
      title: String(i.title || '').trim().slice(0, 200),
      date: /^\d{4}-\d{2}-\d{2}$/.test(i.date) ? i.date : toKey(now),
      time: /^\d{2}:\d{2}$/.test(i.time) ? i.time : '',
      location: String(i.location || '').trim().slice(0, 200),
      notes: String(i.notes || '').trim().slice(0, 1000),
    }))
    .filter((i) => i.title);
}

export async function interpret(text, now = new Date()) {
  const sample = await getCapability('sample');
  if (sample) {
    try {
      const raw = await sample.json(prompt(text, now), { modelTier: 'quick' });
      const items = sanitize(raw, now);
      if (items.length) return { items, by: 'claude' };
    } catch {
      // refusé, limite atteinte ou réponse invalide : on passe au local
    }
  }
  return { items: parseNote(text, now), by: 'local' };
}
