import { ChevronLeft, ChevronRight } from 'lucide-react';
import { monthGrid, toKey, WEEKDAYS, formatMonth } from '../dates.js';
import { TYPES } from '../store.js';

export default function Calendar({ year, month, items, selected, today, onSelect, onMonthChange }) {
  const days = monthGrid(year, month);

  const byDay = {};
  for (const it of items) (byDay[it.date] ||= []).push(it);

  const shift = (delta) => {
    const d = new Date(year, month + delta, 1);
    onMonthChange(d.getFullYear(), d.getMonth());
  };

  return (
    <section className="card calendar">
      <header className="cal-head">
        <h2 className="cal-title">{formatMonth(year, month)}</h2>
        <div className="cal-nav">
          <button className="icon-btn" onClick={() => shift(-1)} aria-label="Mois précédent"><ChevronLeft size={18} /></button>
          <button className="btn ghost" onClick={() => { const n = new Date(); onMonthChange(n.getFullYear(), n.getMonth()); onSelect(toKey(n)); }}>Aujourd'hui</button>
          <button className="icon-btn" onClick={() => shift(1)} aria-label="Mois suivant"><ChevronRight size={18} /></button>
        </div>
      </header>

      <div className="cal-grid">
        {WEEKDAYS.map((w) => <div key={w} className="cal-weekday">{w}</div>)}
        {days.map((d) => {
          const key = toKey(d);
          const list = byDay[key] || [];
          const pending = list.filter((i) => i.type !== 'journal' && !i.validated).length;
          const done = list.filter((i) => i.type !== 'journal' && i.validated).length;
          const late = pending > 0 && key < today;
          const cls = [
            'cal-day',
            d.getMonth() !== month && 'out',
            key === today && 'today',
            key === selected && 'selected',
            late && 'late',
          ].filter(Boolean).join(' ');
          return (
            <button key={key} className={cls} onClick={() => onSelect(key)}>
              <span className="cal-num">{d.getDate()}</span>
              <span className="cal-dots">
                {list.slice(0, 4).map((i) => (
                  <span key={i.id} className={`dot ${i.validated ? 'ok' : ''}`} style={{ background: TYPES[i.type]?.color }} />
                ))}
              </span>
              {list.length > 0 && (
                <span className="cal-meta">
                  {done > 0 && <span className="m-ok">{done}✓</span>}
                  {pending > 0 && <span className={late ? 'm-late' : 'm-todo'}>{pending}</span>}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <footer className="legend">
        {Object.entries(TYPES).map(([k, t]) => (
          <span key={k}><span className="dot" style={{ background: t.color }} />{t.label}</span>
        ))}
      </footer>
    </section>
  );
}
