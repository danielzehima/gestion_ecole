# Agenda Chantier

Calendrier de chantier avec un assistant de rappel.

- **Calendrier mensuel** : chaque jour montre ses travaux, rendez-vous et notes ;
  les jours avec des éléments non validés passent en rouge une fois dépassés.
- **Trois types d'éléments** : *Travail*, *Rendez-vous* (heure obligatoire) et
  *Fait du jour* (journal de ce qui a été réalisé).
- **Validation** au fur et à mesure, avec la date et l'heure de validation.
- **Assistant de rappel** (`src/agent.js`), réévalué toutes les 30 secondes :
  - rendez-vous imminent (délai réglable, 60 min par défaut), puis rendez-vous passé à valider ;
  - briefing du matin (7 h par défaut) ;
  - en fin de journée (17 h par défaut) : éléments restant à valider + rappel de noter la journée ;
  - éléments en retard des jours précédents.
  
  Notifications système une seule fois par rappel (cloche dans l'assistant).
- **Réglages** : nom du chantier, horaires de l'assistant, export/import JSON.

## Lancer

```bash
cd chantier
npm install
npm run dev     # http://localhost:5173
npm test        # tests de l'agent
npm run build
```

## Limites actuelles et suite (SaaS)

- Données stockées **dans le navigateur** de l'appareil (pensez à exporter).
- Les notifications ne partent que **quand la page est ouverte**.
- Étapes suivantes prévues :
  1. Brancher Supabase (`supabase/schema.sql` : comptes, plusieurs chantiers, sécurité par utilisateur).
  2. Faire tourner `computeReminders` côté serveur (Edge Function planifiée)
     pour envoyer les rappels par e-mail / SMS / WhatsApp même application fermée.
  3. PWA installable sur téléphone avec notifications push.
