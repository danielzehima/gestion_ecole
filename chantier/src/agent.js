// L'agent de rappel : à partir des éléments du calendrier et de l'heure
// actuelle, il calcule les rappels à afficher. C'est une fonction pure,
// réutilisable plus tard côté serveur (Supabase Edge Function + e-mail/SMS).
//
// Chaque rappel a une `key` stable : elle sert à n'envoyer une notification
// qu'une seule fois pour le même rappel.

import { todayKey, itemDateTime } from './dates.js';

const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

export function computeReminders(items, settings, now = new Date()) {
  const today = todayKey(now);
  const hour = now.getHours() + now.getMinutes() / 60;
  const reminders = [];

  const todays = items.filter((i) => i.date === today);
  const toValidateToday = todays.filter((i) => i.type !== 'journal' && !i.validated);
  const rdvToday = todays.filter((i) => i.type === 'rdv');
  const workToday = todays.filter((i) => i.type === 'travail');

  // 1. Rendez-vous imminents
  for (const item of rdvToday) {
    if (item.validated) continue;
    const at = itemDateTime(item);
    if (!at) continue;
    const minutes = Math.round((at - now) / 60000);
    if (minutes >= 0 && minutes <= settings.rdvLeadMinutes) {
      reminders.push({
        key: `rdv:${item.id}:${item.date}:${item.time}`,
        level: 'urgent',
        title: minutes === 0 ? 'Rendez-vous maintenant' : `Rendez-vous dans ${minutes} min`,
        message: `${item.time} — ${item.title}${item.location ? ` (${item.location})` : ''}`,
        itemIds: [item.id],
      });
    } else if (minutes < 0 && minutes > -12 * 60) {
      reminders.push({
        key: `rdv-passed:${item.id}:${item.date}`,
        level: 'warning',
        title: 'Rendez-vous passé à valider',
        message: `${item.time} — ${item.title} : s'est-il bien tenu ?`,
        itemIds: [item.id],
      });
    }
  }

  // 2. Briefing du matin
  if (hour >= settings.morningHour && hour < settings.eveningHour && todays.length > 0) {
    const parts = [];
    if (workToday.length) parts.push(`${workToday.length} ${workToday.length > 1 ? 'travaux' : 'travail'}`);
    if (rdvToday.length) parts.push(`${rdvToday.length} rendez-vous`);
    if (parts.length) {
      reminders.push({
        key: `morning:${today}`,
        level: 'info',
        title: 'Programme du jour',
        message: `Aujourd'hui : ${parts.join(' et ')}.`,
        itemIds: [...workToday, ...rdvToday].map((i) => i.id),
      });
    }
  }

  // 3. Fin de journée : valider ce qui a été fait + noter la journée
  if (hour >= settings.eveningHour) {
    if (toValidateToday.length) {
      reminders.push({
        key: `evening-validate:${today}`,
        level: 'warning',
        title: 'Fin de journée : à valider',
        message: `Il reste ${plural(toValidateToday.length, 'élément')} à valider aujourd'hui.`,
        itemIds: toValidateToday.map((i) => i.id),
      });
    }
    if (!todays.some((i) => i.type === 'journal')) {
      reminders.push({
        key: `evening-journal:${today}`,
        level: 'info',
        title: "Qu'avez-vous fait aujourd'hui ?",
        message: 'Ajoutez une note « Fait du jour » pour garder la trace de la journée.',
        itemIds: [],
        action: 'journal',
      });
    }
  }

  // 4. Retards : éléments des jours passés jamais validés
  const overdue = items.filter((i) => i.type !== 'journal' && !i.validated && i.date && i.date < today);
  if (overdue.length) {
    reminders.push({
      key: `overdue:${today}:${overdue.length}`,
      level: 'urgent',
      title: 'En retard',
      message: `${plural(overdue.length, 'élément')} des jours précédents non ${overdue.length > 1 ? 'validés' : 'validé'}.`,
      itemIds: overdue.map((i) => i.id),
    });
  }

  const order = { urgent: 0, warning: 1, info: 2 };
  return reminders.sort((a, b) => order[a.level] - order[b.level]);
}

// Envoie une notification système pour chaque rappel urgent/important
// jamais envoyé. Retourne la nouvelle table des rappels déjà envoyés.
export function notifyNew(reminders, sent) {
  const next = { ...sent };
  const canNotify = typeof Notification !== 'undefined' && Notification.permission === 'granted';
  for (const r of reminders) {
    if (next[r.key]) continue;
    next[r.key] = Date.now();
    if (canNotify) {
      try {
        new Notification(r.title, { body: r.message, tag: r.key, icon: '/favicon.svg' });
      } catch {
        // certains navigateurs mobiles exigent un service worker : on ignore
      }
    }
  }
  // Nettoyage des clés de plus de 30 jours
  const limit = Date.now() - 30 * 24 * 3600 * 1000;
  for (const k of Object.keys(next)) if (next[k] < limit) delete next[k];
  return next;
}
