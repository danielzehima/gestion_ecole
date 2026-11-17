import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Send, Loader2, Undo2, Hammer, CalendarClock, NotebookPen } from 'lucide-react';
import { getCapability } from '../capabilities.js';
import { interpret } from '../interpret.js';
import { formatLong } from '../dates.js';
import { TYPES } from '../store.js';

const ICONS = { travail: Hammer, rdv: CalendarClock, journal: NotebookPen };

export default function VoiceCapture({ onCreate, onUndo, onOpen }) {
  const [text, setText] = useState('');
  const [partial, setPartial] = useState('');
  const [dictation, setDictation] = useState(null);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { items, ids }
  const [error, setError] = useState('');
  const textRef = useRef(null);

  // La dictée de claude.ai, si elle est disponible ici
  useEffect(() => {
    let off = [];
    getCapability('dictation').then((d) => {
      if (!d) return;
      setDictation(d);
      off = [
        d.onPartial(({ text: t }) => setPartial(t)),
        d.onFinal(({ text: t }) => { setPartial(''); setText((cur) => (cur ? `${cur} ${t}` : t)); }),
        d.onState(({ state, reason }) => {
          setListening(state === 'listening' || state === 'starting' || state === 'finishing');
          if (state === 'idle' && reason === 'not_granted') { setDictation(null); setError('Micro refusé : utilisez le micro de votre clavier.'); }
          if (state === 'idle' && reason === 'unavailable') setDictation(null);
        }),
      ];
    });
    return () => off.forEach((f) => f?.());
  }, []);

  const toggleMic = () => {
    setError('');
    if (!dictation) {
      // Pas de dictée intégrée : on ouvre le clavier, qui a son propre micro
      textRef.current?.focus();
      setError('Touchez le micro de votre clavier pour dicter.');
      return;
    }
    if (listening) { dictation.stop().catch(() => {}); return; }
    dictation.start().catch((e) => {
      if (e?.code === 'not_granted' || e?.code === 'unavailable') {
        setDictation(null);
        textRef.current?.focus();
        setError('Dictée indisponible ici : touchez le micro de votre clavier.');
      }
    });
  };

  const submit = async (e) => {
    e?.preventDefault();
    if (listening) await dictation.stop().catch(() => {});
    const note = (text + (partial ? ` ${partial}` : '')).trim();
    if (!note || busy) return;
    setBusy(true);
    setError('');
    try {
      const { items } = await interpret(note);
      if (!items.length) { setError("Je n'ai rien compris. Reformulez, par exemple : « demain à 10h réunion avec l'architecte »."); return; }
      const ids = onCreate(items);
      setResult({ items, ids });
      setText('');
      setPartial('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card voice">
      <form onSubmit={submit} className="voice-form">
        <button
          type="button"
          className={`mic ${listening ? 'on' : ''}`}
          onClick={toggleMic}
          aria-label={listening ? 'Arrêter la dictée' : 'Dicter une note'}
          title={listening ? 'Arrêter la dictée' : 'Dicter une note'}
        >
          {listening ? <Square size={20} /> : <Mic size={22} />}
        </button>
        <div className="voice-input">
          <label htmlFor="voice-text" className="voice-label">Dites-le à l'assistant</label>
          <textarea
            id="voice-text"
            ref={textRef}
            rows={2}
            value={text + (partial ? (text ? ' ' : '') + partial : '')}
            onChange={(e) => { setText(e.target.value); setPartial(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) submit(e); }}
            placeholder="Ex. : demain 10h réunion avec le plombier"
          />
        </div>
        <button type="submit" className="btn primary send" disabled={busy || !(text || partial).trim()} aria-label="Enregistrer">
          {busy ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
          <span>Enregistrer</span>
        </button>
      </form>

      {listening && <p className="voice-hint listening"><span className="pulse" />Je vous écoute… touchez ■ pour arrêter.</p>}
      {error && <p className="voice-hint">{error}</p>}

      {result && (
        <div className="voice-result">
          <div className="voice-result-head">
            <strong>{result.items.length > 1 ? `${result.items.length} éléments enregistrés` : 'Enregistré'}</strong>
            <button className="btn small" onClick={() => { onUndo(result.ids); setResult(null); }}><Undo2 size={14} />Annuler</button>
          </div>
          <ul>
            {result.items.map((i, n) => {
              const Icon = ICONS[i.type];
              return (
                <li key={result.ids[n]}>
                  <button className="voice-item" style={{ '--tc': TYPES[i.type].color }} onClick={() => onOpen(result.ids[n])}>
                    <Icon size={15} />
                    <span className="vi-title">{i.title}</span>
                    <span className="vi-meta">{TYPES[i.type].label} · {formatLong(i.date)}{i.time ? ` à ${i.time}` : ''}{i.location ? ` · ${i.location}` : ''}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
