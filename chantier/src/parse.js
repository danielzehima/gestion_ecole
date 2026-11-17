// Analyse locale d'une phrase dictée en français → éléments du calendrier.
// Sert de solution de secours quand Claude n'est pas disponible.
// Ex. : « Demain à 10h rendez-vous avec le plombier » →
//   { type: 'rdv', title: 'Rendez-vous avec le plombier', date: <demain>, time: '10:00' }

import { toKey } from './dates.js';

const WEEKDAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MONTHS_PLAIN = MONTHS.map((m) => m.normalize('NFD').replace(/[̀-ͯ]/g, ''));

const RDV = /\b(rendez[- ]vous|rdv|réunion|reunion|rencontre|visite|rencontrer|voir|appeler|appel|livraison)\b/i;
const DONE = /^(j'ai|j’ai|nous avons|on a)\b|\b(terminée?s?|finie?s?|achevée?s?|réalisée?s?|faite?s?|posée?s?|coulée?s?|livrée?s?)\b/i;

const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

function findDate(s, now) {
  const rules = [
    [/\bavant[- ]hier\b/i, () => addDays(now, -2)],
    [/\bapr[eè]s[- ]demain\b/i, () => addDays(now, 2)],
    [/\baujourd['’ ]?hui\b|\bce (matin|soir|midi|après-midi)\b|\bcet après-midi\b/i, () => now],
    [/\bdemain\b/i, () => addDays(now, 1)],
    [/\bhier\b/i, () => addDays(now, -1)],
  ];
  for (const [re, fn] of rules) {
    const m = s.match(re);
    if (m) return { date: fn(), match: m[0] };
  }

  // « le 25 novembre », « 25 novembre », « le 3 »
  const mm = s.match(new RegExp(`\\b(?:le\\s+)?(\\d{1,2})(?:er)?\\s+(${[...MONTHS, ...MONTHS_PLAIN].join('|')})(?:\\s+(\\d{4}))?\\b`, 'i'));
  if (mm) {
    const name = mm[2].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const month = MONTHS_PLAIN.indexOf(name);
    let year = mm[3] ? Number(mm[3]) : now.getFullYear();
    let d = new Date(year, month, Number(mm[1]));
    if (!mm[3] && d < addDays(now, -60)) d = new Date(year + 1, month, Number(mm[1]));
    return { date: d, match: mm[0] };
  }

  // « 25/11 », « 25/11/2026 »
  const ms = s.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (ms) {
    let year = ms[3] ? Number(ms[3].length === 2 ? `20${ms[3]}` : ms[3]) : now.getFullYear();
    return { date: new Date(year, Number(ms[2]) - 1, Number(ms[1])), match: ms[0] };
  }

  // « lundi », « lundi prochain », « mardi dernier »
  const mw = s.match(new RegExp(`\\b(${WEEKDAYS.join('|')})(\\s+(prochain|dernier))?\\b`, 'i'));
  if (mw) {
    const target = WEEKDAYS.indexOf(mw[1].toLowerCase());
    const cur = now.getDay();
    let diff;
    if (mw[3]?.toLowerCase() === 'dernier') diff = -(((cur - target) + 7) % 7 || 7);
    else diff = ((target - cur) + 7) % 7 || 7;
    return { date: addDays(now, diff), match: mw[0] };
  }

  // « le 3 » (jour du mois courant, ou du mois suivant s'il est passé)
  const md = s.match(/\ble\s+(\d{1,2})(?:er)?\b(?!\s*(h|heures?|:))/i);
  if (md) {
    let d = new Date(now.getFullYear(), now.getMonth(), Number(md[1]));
    if (d < addDays(now, -1)) d = new Date(now.getFullYear(), now.getMonth() + 1, Number(md[1]));
    return { date: d, match: md[0] };
  }
  return null;
}

function findTime(s) {
  if (/(?:à\s+)?\bmidi\b/i.test(s) && !/après-midi/i.test(s)) return { time: '12:00', match: s.match(/(?:à\s+)?\bmidi\b/i)[0] };
  const m = s.match(/(?:(?:^|\s)(?:à|a|vers|pour)\s+)?\b(\d{1,2})\s*(?:h|heures?|:)\s*(\d{2}|et demie|et quart|moins le quart)?/i);
  if (!m) return null;
  let h = Number(m[1]);
  let min = 0;
  const tail = (m[2] || '').toLowerCase();
  if (tail === 'et demie') min = 30;
  else if (tail === 'et quart') min = 15;
  else if (tail === 'moins le quart') { h -= 1; min = 45; }
  else if (tail) min = Number(tail);
  if (/\b(de l'après-midi|du soir)\b/i.test(s) && h < 12) h += 12;
  if (h > 23 || min > 59) return null;
  return { time: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`, match: m[0] };
}

function clean(s, parts) {
  let t = s;
  for (const p of parts) if (p) t = t.replace(p, ' ');
  t = t
    .replace(/\b(ce matin|ce soir|cet après-midi|de l'après-midi|du soir)\b/gi, ' ')
    .replace(/^\s*(il faut|je dois|on doit|penser à|pense à|rappelle-moi de|rappelle moi de|note que|noter que|ajoute|ajouter)\s+/i, '')
    .replace(/\s+([,.])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,.:;-]+|[\s,.:;-]+$/g, '')
    .replace(/^(à|a|le|pour|vers)\s+/i, '')
    .replace(/\s+(à|a|le|pour|vers)$/i, '');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function parseSentence(s, now) {
  const d = findDate(s, now);
  const t = findTime(s);
  const date = d ? d.date : now;
  const key = toKey(date);
  const past = key < toKey(now);

  let type = 'travail';
  if (DONE.test(s) && !(key > toKey(now))) type = 'journal';
  else if (RDV.test(s) && !past) type = 'rdv';

  const loc = s.match(/\bavec\s+((?:l['’]\s*|le |la |les |m\. |mme |monsieur |madame )?[\p{L}'’-]+(?:\s+[\p{Lu}][\p{L}'’-]+)*)/iu);

  const title = clean(s, [d?.match, t?.match]);
  if (!title) return null;
  return {
    type,
    title,
    date: key,
    time: t ? t.time : '',
    location: type === 'journal' || !loc ? '' : loc[1].trim(),
    notes: '',
  };
}

export function parseNote(text, now = new Date()) {
  return text
    .split(/[.;!?\n]+|\s+(?:puis|ensuite|et après)\s+/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2)
    .map((s) => parseSentence(s, now))
    .filter(Boolean);
}
