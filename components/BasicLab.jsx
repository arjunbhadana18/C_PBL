'use client'

import { useRef, useState } from 'react'
import { M, put, find, rem, rng, trav, topL } from '../lib/engine.js'
import Viz, { usePlayer } from './Viz.jsx'
import Stats from './Stats.jsx'

const start = () => { const m = M(); for (let k = 1; k <= 10; k++) put(m, k, String(k * 10)); return m }

export default function Basic({ delay }) {
  const m = useRef(null)
  if (!m.current) m.current = start()
  const hist = useRef([])
  const p = usePlayer(delay)
  const [, bump] = useState(0)
  const [f, setF] = useState({ key: '11', val: '110', hi: '8', bulk: '' })
  const [full, setFull] = useState(false)
  const [msg, setMsg] = useState('')
  const [tv, setTv] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const n = m.current.n
  const key = parseInt(f.key), hi = parseInt(f.hi)
  const snap = () => { hist.current.push(JSON.parse(JSON.stringify(m.current.n))); if (hist.current.length > 30) hist.current.shift() }
  const done = () => bump((x) => x + 1)
  const noKey = () => Number.isNaN(key) && (setMsg('Enter a whole number key.'), true)

  const A = {
    set() { if (noKey()) return; snap(); setMsg(''); p.run(put(m.current, key, f.val, full).st); done() },
    get() { if (noKey()) return; const r = find(m.current, key); setMsg(r.n ? 'Value = ' + r.n.v : 'Key not found.'); p.run(r.st) },
    del() { if (noKey()) return; snap(); setMsg(''); p.run(rem(m.current, key).st); done() },
    rng() {
      if (noKey() || Number.isNaN(hi) || key > hi) return setMsg('Enter a low key that is not above the high key.')
      const r = rng(m.current, key, hi); setMsg(r.f.length ? r.f.map((x) => x.k + ' → ' + x.v).join(',  ') : 'No key in this range.'); p.run(r.st)
    },
    bulk() {
      const ks = f.bulk.split(/[\s,;]+/).filter(Boolean).map(Number).filter(Number.isInteger)
      if (!ks.length) return setMsg('Type whole-number keys separated by commas, like 5, 12, 20.')
      snap(); let r; for (const k of ks) r = put(m.current, k, String(k * 10), full)
      p.run(r.st); setMsg(`Inserted ${ks.length} key(s). The animation shows the last one.`); done()
    },
    rand() {
      snap(); const a = []
      for (let i = 0; i < 10; i++) { const k = 1 + Math.floor(Math.random() * 99); put(m.current, k, String(k * 10), full); a.push(k) }
      p.idle(); setMsg('Added random keys: ' + a.join(', ') + '.'); done()
    },
    undo() { const h = hist.current.pop(); if (!h) return setMsg('Nothing to undo.'); m.current.n = h; p.idle(); setMsg('Undone.'); done() },
    reset() { snap(); m.current = start(); p.idle(); setMsg('Reset to keys 1 to 10.'); done() },
    clear() { snap(); m.current.n = []; p.idle(); setMsg('List cleared.'); done() },
  }
  const enter = (fn) => (e) => e.key === 'Enter' && fn()

  return (
    <div className="stack">
      <Stats items={[['Keys', n.length], ['Levels', topL(m.current) + 1], ['Highest key', n.length ? n[n.length - 1].k : 'none']]} />
      <section className="card">
        <h2>Operations</h2>
        <div className="ctl">
          <input type="number" value={f.key} onChange={set('key')} onKeyDown={enter(A.set)} aria-label="Key" />
          <input className="w" value={f.val} onChange={set('val')} aria-label="Value" />
          <button className="pri" onClick={A.set}>Set</button><button onClick={A.get}>Search</button><button onClick={A.del}>Delete</button>
          <span className="sep" />
          <input type="number" value={f.hi} onChange={set('hi')} aria-label="Range high" /><button onClick={A.rng}>Range: key to high</button>
        </div>
        <div className="ctl">
          <input className="w" style={{ width: 210 }} placeholder="Bulk keys: 5, 12, 20, 33" value={f.bulk} onChange={set('bulk')} onKeyDown={enter(A.bulk)} aria-label="Bulk keys" />
          <button onClick={A.bulk}>Insert all</button><button onClick={A.rand}>Add 10 random</button>
          <span className="sep" />
          <button onClick={A.undo}>Undo</button><button onClick={A.reset}>Reset to 1–10</button><button onClick={A.clear}>Clear</button>
          <span className="sep" />
          <button onClick={() => setTv(!tv)}>{tv ? 'Hide' : 'Show'} traversal</button>
        </div>
        <label className="mut chk"><input type="checkbox" checked={full} onChange={(e) => setFull(e.target.checked)} /> Give a new highest key a full-height tower (untick for pure coin flips)</label>
        <p className="msg">{msg}</p>
      </section>
      <section className="card"><h2>How it works, step by step</h2><Viz p={p} n={n} /></section>
      {tv && <section className="card"><h2>Traversal</h2><pre className="tv">{trav(m.current)}</pre></section>}
      <section className="card"><h2>Key → value pairs</h2><div className="chips">{n.map((x) => <span key={x.k}><b>{x.k}</b> {x.v}</span>)}</div></section>
    </div>
  )
}
