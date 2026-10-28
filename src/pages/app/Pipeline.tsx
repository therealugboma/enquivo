import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, PageHead } from './Layout'
import { STAGES, type Stage } from '../../lib/types'
import { moveStage, createLead } from '../../lib/ops'
import { nairaShort, ago, initials, naira } from '../../lib/fmt'
import { Badge, Modal, Icon } from '../../components/ui'

export default function Pipeline() {
  const { ws, wsId, leads } = useApp()
  const nav = useNavigate()
  const [over, setOver] = useState<Stage | null>(null)
  const [drag, setDrag] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [owner, setOwner] = useState('')
  const [view, setView] = useState<'board' | 'list'>('board')
  const [adding, setAdding] = useState(false)
  const shown = leads.filter(l => (!owner || l.assignee === owner) && (!q || `${l.name} ${l.city} ${l.interest} ${l.phone}`.toLowerCase().includes(q.toLowerCase())))
  const fresh = (t: number) => Date.now() - t < 10 * 60000
  return (
    <>
      <PageHead label="Leads" title="Pipeline">
        <input className="input" style={{ width: 200, borderRadius: 999, background: 'var(--card)', border: 0 }} placeholder="Search leads" value={q} onChange={e => setQ(e.target.value)} />
        <select className="select" style={{ width: 'auto', borderRadius: 999, background: 'var(--card)', border: 0 }} value={owner} onChange={e => setOwner(e.target.value)}><option value="">All owners</option>{ws.staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <div className="tabs"><button className={view === 'board' ? 'on' : ''} onClick={() => setView('board')}>Board</button><button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>List</button></div>
        <button className="btn cta sm" onClick={() => setAdding(true)}><Icon n="plus" s={14} />Add lead</button>
      </PageHead>
      {view === 'board' ? <div className="kanban">
        {STAGES.map(s => { const col = shown.filter(l => l.stage === s.id).sort((a, b) => b.createdAt - a.createdAt); return (
          <div key={s.id} className={`kcol ${over === s.id ? 'over' : ''}`} data-stage={s.id} onDragOver={e => { e.preventDefault(); setOver(s.id) }} onDragLeave={() => setOver(null)} onDrop={() => { if (drag) moveStage(wsId, drag, s.id); setOver(null); setDrag(null) }}>
            <h4><span className="row" style={{ gap: 8 }}>{s.id === 'won' ? <span className="badge ok">{s.label}</span> : s.id === 'lost' ? <span className="badge">{s.label}</span> : s.id === 'new' ? <span className="badge acc">{s.label}</span> : <span className="label" style={{ color: 'var(--ink)' }}>{s.label}</span>}<span className="xs muted num">{col.length}</span></span><span className="xs muted num">{nairaShort(col.reduce((a, l) => a + l.value, 0))}</span></h4>
            {col.map(l => { const i = STAGES.findIndex(x => x.id === l.stage); return (
              <div key={l.id} className={`kcard ${drag === l.id ? 'dragging' : ''} ${fresh(l.createdAt) ? 'fresh' : ''}`} draggable onDragStart={() => setDrag(l.id)} onDragEnd={() => setDrag(null)} onClick={() => nav(`/app/leads/${l.id}`)} data-testid="kcard">
                <div className="spread"><span style={{ fontSize: 14, fontWeight: 500 }}>{l.name}</span><span className="av" style={{ width: 24, height: 24, fontSize: 9 }} title={ws.staff.find(x => x.id === l.assignee)?.name}>{l.assignee ? initials(ws.staff.find(x => x.id === l.assignee)?.name || '') : '?'}</span></div>
                <div className="xs muted" style={{ marginTop: 4 }}>{l.interest}</div>
                <div className="spread" style={{ marginTop: 10 }}><span className="num small">{nairaShort(l.value)}</span><span className="xs muted">{l.city.split(' ')[0]} · {ago(l.createdAt)}</span></div>
                <div className="row" style={{ gap: 4, marginTop: 8, flexWrap: 'wrap' }}>{l.refCode && <Badge kind="blue">{l.refCode}</Badge>}{fresh(l.createdAt) && <Badge kind="acc">Just in</Badge>}{l.intent === 'Ready to buy' && <Badge kind="ok">Ready</Badge>}</div>
                <div className="mv" onClick={e => e.stopPropagation()}>
                  {i > 0 && s.id !== 'lost' && <button onClick={() => moveStage(wsId, l.id, STAGES[i - 1].id)}>←</button>}
                  {i < 3 && <button onClick={() => moveStage(wsId, l.id, STAGES[i + 1].id)}>{i === 2 ? 'Won ✓' : `${STAGES[i + 1].label} →`}</button>}
                  {i < 3 && <button onClick={() => moveStage(wsId, l.id, 'lost')} style={{ marginLeft: 'auto' }}>Lost</button>}
                </div>
              </div>) })}
            {!col.length && <div className="xs muted" style={{ padding: 16, textAlign: 'center' }}>Drop leads here</div>}
          </div>) })}
      </div> : <div className="card flush"><table className="table"><thead><tr><th>Customer</th><th>Interest</th><th>Stage</th><th>Owner</th><th>Follow-up</th><th className="r">Value</th></tr></thead><tbody>
        {shown.map(l => <tr key={l.id} className="click" onClick={() => nav(`/app/leads/${l.id}`)}><td>{l.name}<div className="xs muted">{l.phone}</div></td><td className="small">{l.interest}</td><td><Badge>{l.stage}</Badge></td><td className="small">{ws.staff.find(s => s.id === l.assignee)?.name || '—'}</td><td className="small">{l.followUp || '—'}</td><td className="r num">{naira(l.value)}</td></tr>)}
      </tbody></table></div>}
      <p className="xs muted">Drag cards between columns, or use the buttons on each card.</p>
      {adding && <AddLead onClose={() => setAdding(false)} onSave={d => { const id = createLead(wsId, d); setAdding(false); nav(`/app/leads/${id}`) }} />}
    </>
  )
}

function AddLead({ onClose, onSave }: { onClose: () => void; onSave: (d: any) => void }) {
  const { ws } = useApp()
  const [d, setD] = useState({ name: '', phone: '', city: '', interest: ws.products[0]?.name, source: 'Walk-in', assignee: ws.staff.find(s => s.role === 'Salesperson')?.id })
  return <Modal onClose={onClose}>
    <span className="label">New lead</span><h2 style={{ margin: '8px 0 18px' }}>Log a walk-in or call</h2>
    <form className="stack" onSubmit={e => { e.preventDefault(); onSave({ ...d, value: ws.products.find(p => p.name === d.interest)?.price || 0 }) }}>
      <div className="grid g2"><label className="field"><span>Name</span><input required className="input" value={d.name} onChange={e => setD({ ...d, name: e.target.value })} /></label><label className="field"><span>Phone</span><input required className="input" placeholder="+234 800 000 0000" value={d.phone} onChange={e => setD({ ...d, phone: e.target.value })} /></label></div>
      <div className="grid g2"><label className="field"><span>City</span><input className="input" value={d.city} onChange={e => setD({ ...d, city: e.target.value })} /></label><label className="field"><span>Source</span><select className="select" value={d.source} onChange={e => setD({ ...d, source: e.target.value })}><option>Walk-in</option><option>Phone call</option></select></label></div>
      <label className="field"><span>Interest</span><select className="select" value={d.interest} onChange={e => setD({ ...d, interest: e.target.value })}>{ws.products.map(p => <option key={p.id}>{p.name}</option>)}</select></label>
      <label className="field"><span>Assign to</span><select className="select" value={d.assignee} onChange={e => setD({ ...d, assignee: e.target.value })}>{ws.staff.map(s => <option key={s.id} value={s.id}>{s.name} · {s.role}</option>)}</select></label>
      <div className="row" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn cta">Add lead</button></div>
    </form>
  </Modal>
}
