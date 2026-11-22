'use client'

import { useEffect, useState } from 'react'
import { draw, CODE, CN } from '../lib/engine.js'

// Plays a list of recorded steps: Back / Play / Next / Skip to end.
export function usePlayer(delay) {
  const [st, setSt] = useState([])
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setI((x) => (x >= st.length - 1 ? (setPlaying(false), x) : x + 1)), delay)
    return () => clearInterval(t)
  }, [playing, delay, st])
  return {
    st, i, playing,
    run: (s) => { setSt(s); setI(0); setPlaying(s.length > 1) },
    idle: () => { setSt([]); setI(0); setPlaying(false) },
    toggle: () => setPlaying((p) => !p),
    go: (k) => { setPlaying(false); setI((x) => (k === 'b' ? Math.max(0, x - 1) : k === 'n' ? Math.min(st.length - 1, x + 1) : st.length - 1)) },
  }
}

export default function Viz({ p, n }) {
  const s = p.st[p.i]
  const trail = new Set()
  for (let q = 0; q <= p.i && p.st[q]; q++) trail.add(p.st[q].at.l + '|' + p.st[q].at.k)
  const svg = s ? draw(s.d, s.at, trail, s.kind || 'x') : draw(n, null, new Set(), '')
  const op = p.st.op || 'search'
  return (
    <div>
      <div className="sg">
        <div className="vw" dangerouslySetInnerHTML={{ __html: svg }} />
        <pre className="cp">
          {s ? <><div className="ct">C++ · {CN[op]}</div>{CODE[op].map((t, k) => <div key={k} className={k === s.ln ? 'hl' : ''}>{t || ' '}</div>)}</>
            : <div className="ct">The C++ behind each step shows here when you run an operation.</div>}
        </pre>
      </div>
      <div className="info">{s ? `Step ${p.i + 1} of ${p.st.length}: ${s.t}` : 'Run an operation to watch it step by step.'}</div>
      <div className="bar">
        <button onClick={() => p.go('b')} disabled={!s || p.i === 0}>Back</button>
        <button onClick={p.toggle} disabled={!s}>{p.playing ? 'Pause' : 'Play'}</button>
        <button onClick={() => p.go('n')} disabled={!s || p.i >= p.st.length - 1}>Next step</button>
        <button onClick={() => p.go('e')} disabled={!s || p.i >= p.st.length - 1}>Skip to end</button>
      </div>
    </div>
  )
}
