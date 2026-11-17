import { useState } from 'react';
import { X } from 'lucide-react';
import { TYPES } from '../store.js';

export default function ItemForm({ initial, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState(initial);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, title: form.title.trim() });
  };

  const isEdit = Boolean(initial.title);

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="modal card" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h3>{isEdit ? 'Modifier' : 'Ajouter'}</h3>
          <button type="button" className="icon-btn" onClick={onCancel} aria-label="Fermer"><X size={18} /></button>
        </header>

        <div className="type-switch" role="radiogroup">
          {Object.entries(TYPES).map(([k, t]) => (
            <button
              type="button"
              key={k}
              role="radio"
              aria-checked={form.type === k}
              className={form.type === k ? 'active' : ''}
              style={{ '--tc': t.color }}
              onClick={() => setForm({ ...form, type: k })}
            >{t.label}</button>
          ))}
        </div>

        <label>
          {form.type === 'journal' ? "Ce que j'ai fait" : 'Intitulé'}
          <input
            autoFocus
            value={form.title}
            onChange={set('title')}
            placeholder={form.type === 'rdv' ? 'Ex. : Réunion avec le plombier' : form.type === 'journal' ? 'Ex. : Coulage de la dalle terminé' : 'Ex. : Pose du carrelage salle de bain'}
            required
          />
        </label>

        <div className="row">
          <label>Date<input type="date" value={form.date} onChange={set('date')} required /></label>
          <label>Heure{form.type !== 'rdv' && <small> (facultatif)</small>}<input type="time" value={form.time} onChange={set('time')} required={form.type === 'rdv'} /></label>
        </div>

        {form.type !== 'journal' && (
          <label>Lieu / intervenant<input value={form.location} onChange={set('location')} placeholder="Ex. : Bâtiment B, entreprise Dupont" /></label>
        )}

        <label>Notes<textarea rows={3} value={form.notes} onChange={set('notes')} placeholder="Détails, matériaux, observations…" /></label>

        <footer className="modal-foot">
          {isEdit && onDelete && <button type="button" className="btn danger" onClick={() => onDelete(form.id)}>Supprimer</button>}
          <span className="spacer" />
          <button type="button" className="btn ghost" onClick={onCancel}>Annuler</button>
          <button type="submit" className="btn primary">Enregistrer</button>
        </footer>
      </form>
    </div>
  );
}
