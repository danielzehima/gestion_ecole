import { useEffect, useMemo, useState } from 'react';
import { HardHat, Settings as SettingsIcon, CheckCircle2, ListTodo, AlertTriangle } from 'lucide-react';
import Calendar from './components/Calendar.jsx';
import DayPanel from './components/DayPanel.jsx';
import AgentPanel from './components/AgentPanel.jsx';
import ItemForm from './components/ItemForm.jsx';
import Settings from './components/Settings.jsx';
import VoiceCapture from './components/VoiceCapture.jsx';
import { getCapability } from './capabilities.js';
import { load, save, makeItem, exportJson, parseImport } from './store.js';
import { computeReminders, notifyNew } from './agent.js';
import { todayKey, fromKey } from './dates.js';

export default function App() {
  const [state, setState] = useState(load);
  const [now, setNow] = useState(() => new Date());
  const today = todayKey(now);
  const [selected, setSelected] = useState(today);
  const [view, setView] = useState(() => ({ year: now.getFullYear(), month: now.getMonth() }));
  const [editing, setEditing] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState('');
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const { items, settings } = state;

  // Persistance
  useEffect(() => { save(state); }, [state]);

  // L'agent se réveille toutes les 30 secondes
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const reminders = useMemo(() => computeReminders(items, settings, now), [items, settings, now]);

  // Notifications système pour les nouveaux rappels
  useEffect(() => {
    const fresh = reminders.some((r) => !state.sentReminders[r.key]);
    if (!fresh) return;
    const sentReminders = notifyNew(reminders, state.sentReminders);
    setState((s) => ({ ...s, sentReminders }));
  }, [reminders, state.sentReminders]);

  // Titre de l'onglet avec le nombre de rappels urgents
  useEffect(() => {
    const n = reminders.filter((r) => r.level !== 'info').length;
    document.title = n ? `(${n}) Agenda Chantier` : 'Agenda Chantier';
  }, [reminders]);

  const update = (fn) => setState((s) => ({ ...s, items: fn(s.items) }));

  const saveItem = (item) => {
    update((list) => (list.some((i) => i.id === item.id) ? list.map((i) => (i.id === item.id ? item : i)) : [...list, item]));
    setEditing(null);
    setSelected(item.date);
    const d = fromKey(item.date);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  };

  const deleteItem = (id) => {
    update((list) => list.filter((i) => i.id !== id));
    setEditing(null);
  };

  const createFromVoice = (fields) => {
    const created = fields.map((f) => makeItem(f));
    update((list) => [...list, ...created]);
    return created.map((i) => i.id);
  };

  const removeIds = (ids) => update((list) => list.filter((i) => !ids.includes(i.id)));

  const openItem = (id) => {
    const it = state.items.find((i) => i.id === id);
    if (!it) return;
    setSelected(it.date);
    const d = fromKey(it.date);
    setView({ year: d.getFullYear(), month: d.getMonth() });
    setEditing(it);
  };

  const setValidated = (ids, value) => {
    const stamp = new Date().toISOString();
    update((list) => list.map((i) => (ids.includes(i.id) ? { ...i, validated: value, validatedAt: value ? stamp : null } : i)));
  };

  const toggle = (id) => {
    const it = items.find((i) => i.id === id);
    if (it) setValidated([id], !it.validated);
  };

  const enableNotifications = async () => {
    if (typeof Notification === 'undefined') {
      flash("Les notifications ne sont pas disponibles ici. Les rappels restent visibles dans l'assistant.");
      return;
    }
    let perm = 'denied';
    try { perm = await Notification.requestPermission(); } catch { /* refusé */ }
    if (perm !== 'granted') flash("Notifications refusées. Les rappels restent visibles dans l'assistant.");
    setState((s) => ({ ...s, settings: { ...s.settings, notifications: perm === 'granted' } }));
    if (perm === 'granted') new Notification('Assistant de rappel activé', { body: 'Je vous préviendrai pour vos rendez-vous et validations.', icon: '/favicon.svg' });
  };

  const doExport = async () => {
    const downloads = await getCapability('downloads');
    if (downloads) {
      try {
        await downloads.save({ filename: `chantier-${today}.json`, data: exportJson(state) });
        flash('Sauvegarde exportée.');
      } catch {
        flash("Export annulé.");
      }
      return;
    }
    const blob = new Blob([exportJson(state)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `chantier-${today}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const doImport = async (file) => {
    try {
      const data = parseImport(await file.text());
      setState((s) => ({ ...s, ...data }));
      setShowSettings(false);
      flash(`${data.items.length} éléments importés.`);
    } catch (e) {
      flash(`Import impossible : ${e.message}`);
    }
  };

  // Indicateurs
  const tasks = items.filter((i) => i.type !== 'journal');
  const todayTasks = tasks.filter((i) => i.date === today);
  const stats = {
    todayDone: todayTasks.filter((i) => i.validated).length,
    todayTotal: todayTasks.length,
    upcoming: tasks.filter((i) => !i.validated && i.date > today).length,
    late: tasks.filter((i) => !i.validated && i.date < today).length,
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo"><HardHat size={20} /></span>
          <div>
            <h1>{settings.siteName}</h1>
            <p>Agenda de chantier</p>
          </div>
        </div>
        <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="Réglages"><SettingsIcon size={18} /></button>
      </header>

      <div className="stats">
        <Stat icon={CheckCircle2} label="Validés aujourd'hui" value={`${stats.todayDone}/${stats.todayTotal}`} tone="ok" />
        <Stat icon={ListTodo} label="À venir" value={stats.upcoming} />
        <Stat icon={AlertTriangle} label="En retard" value={stats.late} tone={stats.late ? 'late' : ''} />
      </div>

      <VoiceCapture onCreate={createFromVoice} onUndo={removeIds} onOpen={openItem} />

      <main className="layout">
        <div className="col-main">
          <Calendar
            year={view.year}
            month={view.month}
            items={items}
            selected={selected}
            today={today}
            onSelect={setSelected}
            onMonthChange={(year, month) => setView({ year, month })}
          />
          <DayPanel
            dateKey={selected}
            items={items}
            today={today}
            onAdd={(type) => setEditing(makeItem({ type, date: selected }))}
            onEdit={setEditing}
            onToggle={toggle}
          />
        </div>
        <aside className="col-side">
          <AgentPanel
            reminders={reminders}
            items={items}
            notifications={settings.notifications && typeof Notification !== 'undefined' && Notification.permission === 'granted'}
            onEnableNotifications={enableNotifications}
            onValidateAll={(ids) => setValidated(ids, true)}
            onOpenItem={(i) => { setSelected(i.date); const d = fromKey(i.date); setView({ year: d.getFullYear(), month: d.getMonth() }); }}
            onAddJournal={() => { setSelected(today); setEditing(makeItem({ type: 'journal', date: today })); }}
          />
        </aside>
      </main>

      {toast && <div className="toast" role="status">{toast}</div>}
      {editing && <ItemForm key={editing.id} initial={editing} onSave={saveItem} onCancel={() => setEditing(null)} onDelete={deleteItem} />}
      {showSettings && (
        <Settings
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(s) => { setState((st) => ({ ...st, settings: s })); setShowSettings(false); }}
          onExport={doExport}
          onImport={doImport}
        />
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone = '' }) {
  return (
    <div className={`stat card ${tone}`}>
      <Icon size={18} />
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
