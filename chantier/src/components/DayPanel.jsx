import { Plus, Check, Clock, MapPin, Pencil, CalendarClock, NotebookPen, Hammer, Undo2 } from 'lucide-react';
import { formatLong } from '../dates.js';
import { TYPES } from '../store.js';

const ICONS = { travail: Hammer, rdv: CalendarClock, journal: NotebookPen };

export default function DayPanel({ dateKey, items, today, onAdd, onEdit, onToggle }) {
  const list = items
    .filter((i) => i.date === dateKey)
    .sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));

  const tasks = list.filter((i) => i.type !== 'journal');
  const journal = list.filter((i) => i.type === 'journal');
  const done = tasks.filter((i) => i.validated).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <section className="card day-panel">
      <header className="day-head">
        <div>
          <h2>{dateKey === today ? "Aujourd'hui" : formatLong(dateKey)}</h2>
          {dateKey === today && <p className="muted">{formatLong(dateKey)}</p>}
        </div>
        <button className="btn primary" onClick={() => onAdd('travail')}><Plus size={16} />Ajouter</button>
      </header>

      {tasks.length > 0 && (
        <div className="progress" aria-label={`${done} sur ${tasks.length} validés`}>
          <div className="progress-bar"><span style={{ width: `${pct}%` }} /></div>
          <span className="muted">{done}/{tasks.length} validés</span>
        </div>
      )}

      <h3 className="section-label">Travaux et rendez-vous</h3>
      {tasks.length === 0 ? (
        <p className="empty">Rien de prévu ce jour. <button className="link" onClick={() => onAdd('travail')}>Ajouter un travail</button> ou <button className="link" onClick={() => onAdd('rdv')}>un rendez-vous</button>.</p>
      ) : (
        <ul className="items">
          {tasks.map((i) => <Item key={i.id} item={i} late={!i.validated && dateKey < today} onEdit={onEdit} onToggle={onToggle} />)}
        </ul>
      )}

      <h3 className="section-label">Ce que j'ai fait</h3>
      {journal.length === 0 ? (
        <p className="empty">Aucune note. <button className="link" onClick={() => onAdd('journal')}>Noter la journée</button></p>
      ) : (
        <ul className="items">
          {journal.map((i) => <Item key={i.id} item={i} onEdit={onEdit} />)}
        </ul>
      )}
    </section>
  );
}

function Item({ item, late, onEdit, onToggle }) {
  const Icon = ICONS[item.type];
  const isJournal = item.type === 'journal';
  return (
    <li className={`item ${item.validated ? 'done' : ''} ${late ? 'late' : ''}`} style={{ '--tc': TYPES[item.type].color }}>
      <span className="item-icon"><Icon size={16} /></span>
      <div className="item-body">
        <div className="item-title">{item.title}</div>
        <div className="item-meta">
          {item.time && <span><Clock size={12} />{item.time}</span>}
          {item.location && <span><MapPin size={12} />{item.location}</span>}
          {late && <span className="tag-late">En retard</span>}
          {item.validated && item.validatedAt && (
            <span className="tag-ok">Validé le {new Date(item.validatedAt).toLocaleDateString('fr-FR')} à {new Date(item.validatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
        {item.notes && <p className="item-notes">{item.notes}</p>}
      </div>
      <div className="item-actions">
        <button className="icon-btn" onClick={() => onEdit(item)} aria-label="Modifier"><Pencil size={15} /></button>
        {!isJournal && (
          <button
            className={`validate ${item.validated ? 'on' : ''}`}
            onClick={() => onToggle(item.id)}
            aria-label={item.validated ? 'Annuler la validation' : 'Valider'}
            title={item.validated ? 'Annuler la validation' : 'Valider'}
          >
            {item.validated ? <Undo2 size={15} /> : <Check size={16} />}
            <span>{item.validated ? 'Validé' : 'Valider'}</span>
          </button>
        )}
      </div>
    </li>
  );
}
