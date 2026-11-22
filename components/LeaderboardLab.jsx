'use client'

import { useRef, useState } from 'react'
import { M, put, find, rem, rng, trav } from '../lib/engine.js'
import Viz, { usePlayer } from './Viz.jsx'
import Stats from './Stats.jsx'

const LB0 = { Aman: 720, Riya: 910, Kabir: 850, Neha: 850, Rahul: 780, Priya: 960, Karan: 690, Simran: 880, Rohit: 740, Ananya: 930, Vikas: 810, Ishita: 990, Aditya: 760, Meera: 870, Arjun: 950 }

// A score is the key; its value is the list of players with that score.
function lbPut(ml, ps, name, score) {
  if (name in ps) {
    const o = ml.n.find((x) => x.k === ps[name])
    o.v = o.v.filter((x) => x !== name)
    if (!o.v.length) ml.n = ml.n.filter((x) => x !== o)
  }
  const t = ml.n.find((x) => x.k === score)
  ps[name] = score
  return put(ml, score, (t ? t.v : []).concat(name))
}
const fresh = () => { const ml = M(), ps = {}; Object.entries(LB0).forEach(([n, s]) => lbPut(ml, ps, n, s)); return { ml, ps } }

export default function Leaderboard({ delay }) {
  const S = useRef(null)
  if (!S.current) S.current = fresh()
  const hist = useRef([])
  const p = usePlayer(delay)
  const [, bump] = useState(0)
  const [f, setF] = useState({ name: 'Meera', score: '905', lo: '800', hi: '900' })
  const [msg, setMsg] = useState('')
  const [tv, setTv] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const { ml, ps } = S.current
  const name = f.name.trim().split(/\s+/)[0]
  const score = parseInt(f.score), lo = parseInt(f.lo), hi = parseInt(f.hi)
  const snap = () => { hist.current.push({ n: JSON.parse(JSON.stringify(ml.n)), ps: { ...ps } }); if (hist.current.length > 30) hist.current.shift() }
  const done = () => bump((x) => x + 1)
  const missing = () => !(name in ps) && (setMsg('Player not found.'), true)

  const A = {
    add() {
      if (!name || Number.isNaN(score)) return setMsg('Enter a name and a whole number score.')
      snap(); const tie = ml.n.find((x) => x.k === score && !x.v.includes(name))
      setMsg(tie ? `${name} ties with ${tie.v.join(', ')} and shares that node.` : '')
      p.run(lbPut(ml, ps, name, score).st); done()
    },
    rm() {
      if (missing()) return; snap()
      const s = ps[name], o = ml.n.find((x) => x.k === s); delete ps[name]; setMsg(name + ' removed.')
      if (o.v.length > 1) { o.v = o.v.filter((x) => x !== name); p.run(find(ml, s).st) } else p.run(rem(ml, s).st)
      done()
    },
    find() {
      if (missing()) return; const s = ps[name]
      setMsg(`${name}: score ${s}, rank ${Object.values(ps).filter((v) => v > s).length + 1}.`); p.run(find(ml, s).st)
    },
    rand() {
      snap(); const nm = 'Player' + (100 + Math.floor(Math.random() * 900)), s = Math.floor(Math.random() * 1000)
      setMsg(`${nm} added with score ${s}.`); p.run(lbPut(ml, ps, nm, s).st); done()
    },
    rng() {
      if (Number.isNaN(lo) || Number.isNaN(hi) || lo > hi) return setMsg('Enter a low score that is not above the high score.')
      const r = rng(ml, lo, hi); setMsg(r.f.length ? r.f.flatMap((x) => x.v.map((q) => `${q} (${x.k})`)).join(', ') : 'No player in this range.'); p.run(r.st)
    },
    undo() { const h = hist.current.pop(); if (!h) return setMsg('Nothing to undo.'); S.current = { ml: { n: h.n }, ps: h.ps }; p.idle(); setMsg('Undone.'); done() },
    reset() { snap(); S.current = fresh(); p.idle(); setMsg('Leaderboard reset.'); done() },
    clear() { snap(); S.current = { ml: M(), ps: {} }; p.idle(); setMsg('Leaderboard cleared.'); done() },
  }
  const rows = []
  for (let i = ml.n.length - 1; i >= 0 && rows.length < 10; i--) for (const nm of ml.n[i].v) if (rows.length < 10) rows.push([nm, ml.n[i].k])

  return (
    <div className="stack">
      <Stats items={[['Players', Object.keys(ps).length], ['Distinct scores', ml.n.length], ['Top score', ml.n.length ? ml.n[ml.n.length - 1].k : 'none']]} />
      <section className="card">
        <h2>Operations</h2>
        <div className="ctl">
          <input className="w" value={f.name} onChange={set('name')} aria-label="Player name" />
          <input type="number" value={f.score} onChange={set('score')} aria-label="Score" />
          <button className="pri" onClick={A.add}>Add or update</button><button onClick={A.rm}>Remove</button><button onClick={A.find}>Search player</button><button onClick={A.rand}>Random player</button>
          <span className="sep" />
          <input type="number" value={f.lo} onChange={set('lo')} aria-label="Low score" /><input type="number" value={f.hi} onChange={set('hi')} aria-label="High score" /><button onClick={A.rng}>Score range</button>
        </div>
        <div className="ctl">
          <button onClick={A.undo}>Undo</button><button onClick={A.reset}>Reset</button><button onClick={A.clear}>Clear</button>
          <span className="sep" /><button onClick={() => setTv(!tv)}>{tv ? 'Hide' : 'Show'} traversal</button>
        </div>
        <p className="msg">{msg}</p>
      </section>
      <section className="card"><h2>How it works, step by step</h2><Viz p={p} n={ml.n} /></section>
      {tv && <section className="card"><h2>Traversal</h2><pre className="tv">{trav(ml)}</pre></section>}
      <section className="card">
        <h2>Top 10</h2>
        <table><thead><tr><th>Rank</th><th>Player</th><th>Score</th></tr></thead>
          <tbody>{rows.map(([nm, s], i) => <tr key={nm}><td>{i + 1}</td><td>{nm}</td><td>{s}</td></tr>)}</tbody></table>
      </section>
    </div>
  )
}
