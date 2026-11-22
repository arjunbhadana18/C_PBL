'use client'

import { useEffect, useState } from 'react'
import { cfg } from '../lib/engine.js'
import Basic from '../components/BasicLab.jsx'
import Leaderboard from '../components/LeaderboardLab.jsx'
import Complexity from '../components/ComplexityLab.jsx'

const TABS = [
  ['basic', 'Basic implementation', 'Set, search, delete and range on integer keys. Watch the real search path, level by level.'],
  ['lb', 'Leaderboard game', 'Scores are the keys, so the top players sit at the end of level 0. Equal scores share one node.'],
  ['cx', 'Complexity & graph', 'Skip list vs AVL tree: comparisons per search, measured live in your browser.'],
]

export default function Page() {
  // The labs use random skip list levels, so they render only in the browser (avoids a server/client mismatch).
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  const [tab, setTab] = useState('basic')
  const [speed, setSpeed] = useState(5)
  const [cap, setCap] = useState(4)
  cfg.cap = cap
  const delay = 1700 - speed * 150
  const cur = TABS.find((t) => t[0] === tab)
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">Skip List<span>Lab</span></div>
        <nav>{TABS.map(([k, t]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t}</button>)}</nav>
        <div className="prefs">
          <label>Animation speed<input type="range" min="1" max="10" value={speed} onChange={(e) => setSpeed(+e.target.value)} /></label>
          <label>Max level (new inserts)<input type="number" min="1" max="8" value={cap} onChange={(e) => setCap(Math.min(8, Math.max(1, +e.target.value || 1)))} /></label>
        </div>
      </aside>
      <main className="main">
        <header className="top"><h1>{cur[1]}</h1><p className="mut">{cur[2]}</p></header>
        {ready ? <>
          <div hidden={tab !== 'basic'}><Basic delay={delay} /></div>
          <div hidden={tab !== 'lb'}><Leaderboard delay={delay} /></div>
          <div hidden={tab !== 'cx'}><Complexity active={tab === 'cx'} /></div>
        </> : <p className="mut">Loading…</p>}
      </main>
    </div>
  )
}
