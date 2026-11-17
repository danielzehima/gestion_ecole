// Accès aux fonctions offertes par claude.ai quand l'app y est publiée
// (dictée vocale, compréhension par Claude, téléchargement de fichiers).
// Hors de claude.ai, tout renvoie null et l'app utilise ses solutions de secours.

const cache = {};

export function getCapability(name) {
  if (!(name in cache)) {
    const use = globalThis.window?.claude?.use;
    cache[name] = use ? Promise.resolve(use.call(window.claude, name)).catch(() => null) : Promise.resolve(null);
  }
  return cache[name];
}
