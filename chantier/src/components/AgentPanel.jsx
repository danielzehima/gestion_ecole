import { Bot, BellRing, BellOff, AlertTriangle, Info, Siren, CheckCheck } from 'lucide-react';

const LEVEL_ICON = { urgent: Siren, warning: AlertTriangle, info: Info };

export default function AgentPanel({ reminders, items, notifications, onEnableNotifications, onValidateAll, onOpenItem, onAddJournal }) {
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));

  return (
    <section className="card agent">
      <header className="agent-head">
        <span className="agent-avatar"><Bot size={18} /></span>
        <div>
          <h2>Assistant de rappel</h2>
          <p className="muted">Je surveille votre agenda et je vous préviens.</p>
        </div>
        <button
          className={`icon-btn ${notifications ? 'on' : ''}`}
          onClick={onEnableNotifications}
          title={notifications ? 'Notifications activées' : 'Activer les notifications'}
          aria-label={notifications ? 'Notifications activées' : 'Activer les notifications'}
        >
          {notifications ? <BellRing size={18} /> : <BellOff size={18} />}
        </button>
      </header>

      {reminders.length === 0 ? (
        <p className="agent-ok"><CheckCheck size={18} />Tout est à jour. Rien à signaler.</p>
      ) : (
        <ul className="reminders">
          {reminders.map((r) => {
            const Icon = LEVEL_ICON[r.level];
            const linked = r.itemIds.map((id) => byId[id]).filter(Boolean);
            const validatable = linked.filter((i) => i.type !== 'journal' && !i.validated);
            return (
              <li key={r.key} className={`reminder ${r.level}`}>
                <Icon size={16} className="r-icon" />
                <div className="r-body">
                  <strong>{r.title}</strong>
                  <p>{r.message}</p>
                  {linked.length > 0 && linked.length <= 5 && (
                    <div className="r-links">
                      {linked.map((i) => (
                        <button key={i.id} className="chip" onClick={() => onOpenItem(i)}>{i.title}</button>
                      ))}
                    </div>
                  )}
                  <div className="r-actions">
                    {validatable.length > 0 && r.level !== 'info' && !r.key.startsWith('rdv:') && (
                      <button className="btn small" onClick={() => onValidateAll(validatable.map((i) => i.id))}>
                        {validatable.length > 1 ? `Tout valider (${validatable.length})` : 'Valider'}
                      </button>
                    )}
                    {r.action === 'journal' && <button className="btn small" onClick={onAddJournal}>Noter la journée</button>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
