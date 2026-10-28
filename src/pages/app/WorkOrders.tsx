import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp, PageHead } from './Layout'
import { updateWs, uid } from '../../lib/store'
import { dateStr, today } from '../../lib/fmt'
import { Badge } from '../../components/ui'

export default function WorkOrders() {
  const { ws, wsId } = useApp()
  const [sp] = useSearchParams()
  const openId = sp.get('open')
  const [tab, setTab] = useState<'active' | 'done' | 'all'>('active')
  const isDone = (w: typeof ws.workOrders[number]) => w.stages.every(s => s.done)
  const list = ws.workOrders.filter(w => tab === 'all' || (tab === 'done' ? isDone(w) : !isDone(w)))
  const toggle = (woId: string, i: number) => updateWs(wsId, w => {
    const o = w.workOrders.find(o => o.id === woId)!; const st = o.stages[i]
    const done = !st.done
    o.stages.forEach((s, j) => { if (done && j <= i && !s.done) { s.done = true; s.doneAt = Date.now() } if (!done && j >= i) { s.done = false; s.doneAt = undefined } })
    const l = w.leads.find(l => l.id === o.leadId); if (l && done) l.timeline.push({ id: uid('t'), at: Date.now(), kind: 'workorder', text: `${o.number}: ${st.name} completed` })
  })
  const byStage = ws.woStages.map((s, i) => ({ s, n: ws.workOrders.filter(o => !isDone(o) && o.stages.findIndex(x => !x.done) === i).length }))
  return (
    <>
      <PageHead label="Operations · workshop" title="Work orders">
        <div className="tabs">{(['active', 'done', 'all'] as const).map(t => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div>
      </PageHead>
      <div className="card tight"><span className="label">In the workshop now</span>
        <div className="row wrap" style={{ marginTop: 12, gap: 8 }}>{byStage.map((b, i) => <div key={b.s} className="row" style={{ gap: 8, padding: '8px 12px', background: 'var(--bg)', borderRadius: 12 }}><span className="mono xs muted">{String(i + 1).padStart(2, '0')}</span><span className="small">{b.s}</span><span className="num" style={{ fontWeight: 500 }}>{b.n}</span></div>)}</div>
      </div>
      <div className="stack" style={{ gap: 16 }}>
        {list.map(o => {
          const l = ws.leads.find(l => l.id === o.leadId); const q = ws.quotes.find(q => q.id === o.quoteId)
          const cur = o.stages.findIndex(s => !s.done); const done = cur === -1
          const pct = Math.round(o.stages.filter(s => s.done).length / o.stages.length * 100)
          return (
            <div key={o.id} className="card" style={openId === o.id ? { boxShadow: '0 0 0 2px var(--ink)' } : undefined} data-testid="wo-card">
              <div className="spread" style={{ flexWrap: 'wrap' }}>
                <div><div className="row" style={{ gap: 10 }}><span className="mono small">{o.number}</span>{done ? <Badge kind="ok">Completed</Badge> : o.due < today() ? <Badge kind="acc">Overdue</Badge> : <Badge kind="warn">{o.stages[cur].name}</Badge>}{o.priority === 'Rush' && <Badge kind="acc">Rush</Badge>}{openId === o.id && <Badge kind="blue">Just created</Badge>}</div>
                  <h3 style={{ fontSize: 20, marginTop: 8, fontWeight: 400 }}>{o.title}</h3>
                  <p className="small muted" style={{ marginTop: 4 }}>{o.spec}</p></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: 30 }} className="num">{pct}%</div><div className="xs muted">due {dateStr(o.due)}</div></div>
              </div>
              <div className="wos">{o.stages.map((s, i) => <button key={s.name} className={`s ${s.done ? 'done' : i === cur ? 'cur' : ''}`} onClick={() => toggle(o.id, i)} title={s.doneAt ? `Done ${dateStr(s.doneAt)}` : 'Click to mark done'}><div className="bar" /><em>{s.name}</em></button>)}</div>
              <div className="grid g4 small" style={{ gap: 12, alignItems: 'end' }}>
                <div><div className="label">Customer</div><Link className="link" to={`/app/leads/${l?.id}`}>{l?.name}</Link><div className="xs muted">{l?.city}</div></div>
                <div><div className="label">From quote</div><Link className="link mono" to={`/app/quotes/${q?.id}`}>{q?.number}</Link></div>
                <label className="field"><span className="label">Assigned to</span><select className="select" value={o.assignee} onChange={e => updateWs(wsId, w => { w.workOrders.find(x => x.id === o.id)!.assignee = e.target.value })}>{ws.staff.map(s => <option key={s.id} value={s.id}>{s.name} · {s.role}</option>)}</select></label>
                <label className="field"><span className="label">Target date</span><input type="date" className="input" value={o.due} onChange={e => updateWs(wsId, w => { w.workOrders.find(x => x.id === o.id)!.due = e.target.value })} /></label>
              </div>
              {o.notes && <p className="small" style={{ marginTop: 12, padding: '10px 12px', background: 'var(--bg)', borderRadius: 12 }}>{o.notes}</p>}
            </div>)
        })}
        {!list.length && <div className="card empty">No work orders here. Accept a quotation and convert it to start one.</div>}
      </div>
    </>
  )
}
