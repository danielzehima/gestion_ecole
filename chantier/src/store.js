// Stockage des données. Pour l'instant dans le navigateur (localStorage),
// pour un usage personnel. L'interface (load/save) est volontairement simple
// pour pouvoir brancher Supabase plus tard (voir supabase/schema.sql).

const KEY = 'chantier-agenda:v1';

export const TYPES = {
  travail: { label: 'Travail', color: 'var(--c-travail)' },
  rdv: { label: 'Rendez-vous', color: 'var(--c-rdv)' },
  journal: { label: 'Fait du jour', color: 'var(--c-journal)' },
};

export const DEFAULT_SETTINGS = {
  siteName: 'Mon chantier',
  morningHour: 7,      // briefing du matin
  eveningHour: 17,     // rappel de validation de fin de journée
  rdvLeadMinutes: 60,  // prévenir avant un rendez-vous
  notifications: false,
};

function emptyState() {
  return { items: [], settings: { ...DEFAULT_SETTINGS }, sentReminders: {} };
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const data = JSON.parse(raw);
    return {
      items: Array.isArray(data.items) ? data.items : [],
      settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
      sentReminders: data.sentReminders || {},
    };
  } catch {
    return emptyState();
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // stockage indisponible (navigation privée…) : on continue en mémoire
  }
}

export function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function makeItem(fields) {
  return {
    id: newId(),
    type: 'travail',
    title: '',
    date: '',
    time: '',
    location: '',
    notes: '',
    validated: false,
    validatedAt: null,
    createdAt: new Date().toISOString(),
    ...fields,
  };
}

// Export / import JSON pour sauvegarder ou changer d'appareil.
export function exportJson(state) {
  return JSON.stringify({ items: state.items, settings: state.settings }, null, 2);
}

export function parseImport(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data.items)) throw new Error('Fichier invalide : pas de liste "items".');
  return { items: data.items, settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) } };
}
