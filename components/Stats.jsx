export default function Stats({ items }) {
  return <div className="stats">{items.map(([k, v]) => <div className="stat" key={k}><span>{k}</span><b>{v}</b></div>)}</div>
}
