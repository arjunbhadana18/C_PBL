'use client'

import { useEffect, useState } from 'react'
import { bench, chart } from '../lib/engine.js'
import Stats from './Stats.jsx'

export default function Complexity({ active }) {
  const [rows, setRows] = useState(null)
  const [busy, setBusy] = useState(false)
  const run = () => { setBusy(true); setTimeout(() => { setRows(bench()); setBusy(false) }, 50) }
  useEffect(() => { if (active && !rows && !busy) run() }, [active])
  const last = rows && rows[rows.length - 1]
  return (
    <div className="stack">
      {last && <Stats items={[['Keys measured', last.n.toLocaleString()], ['Skip list comparisons', last.sl.toFixed(1)], ['AVL comparisons', last.av.toFixed(1)], ['log₂ n', last.lg.toFixed(1)]]} />}
      <section className="card">
        <h2>Average comparisons per search</h2>
        <p className="mut">Real skip lists and AVL trees are built from n random keys, then 3,000 random searches are counted. </p>
        <button onClick={run} disabled={busy}>{busy ? 'Measuring…' : 'Run the measurement again'}</button>
        {rows && <div dangerouslySetInnerHTML={{ __html: chart(rows) }} />}
        {rows && <table><thead><tr><th>Keys (n)</th><th>Skip list</th><th>AVL tree</th><th>log₂ n</th><th>Skip list levels</th><th>AVL height</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.n}><td>{r.n.toLocaleString()}</td><td>{r.sl.toFixed(1)}</td><td>{r.av.toFixed(1)}</td><td>{r.lg.toFixed(1)}</td><td>{r.lv}</td><td>{r.ah}</td></tr>)}</tbody></table>}
      </section>
      <section className="card">
        <h2>Time complexity</h2>
        <table><thead><tr><th>Operation</th><th>Skip list (expected)</th><th>Skip list (worst)</th><th>AVL tree (worst)</th></tr></thead><tbody>
          <tr><td>Search</td><td>O(log n)</td><td>O(n)</td><td>O(log n)</td></tr>
          <tr><td>Insert / delete</td><td>O(log n)</td><td>O(n)</td><td>O(log n)</td></tr>
          <tr><td>Range (k results)</td><td>O(log n + k)</td><td>O(n)</td><td>O(log n + k)</td></tr>
          <tr><td>Extra space</td><td>O(n), about 2 pointers per node</td><td>O(n log n)</td><td>O(n)</td></tr></tbody></table>
        <p className="mut" style={{ marginTop: 10 }}>The skip list’s worst case needs very unlucky coin flips, so it is extremely rare.</p>
      </section>
      <section className="card"><h2>Skip list vs AVL tree</h2><ul>
        <li><b>Balance:</b> the AVL tree rebalances with rotations after every change. The skip list uses random levels and no rebalancing.</li>
        <li><b>Guarantee:</b> AVL height is at most about 1.44 log₂ n every time. The skip list is O(log n) on average.</li>
        <li><b>Code and range scans:</b> the skip list is much shorter to write, and a range query is a plain walk along level 0.</li></ul></section>
    </div>
  )
}
