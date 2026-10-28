import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApp } from './Layout'
import { STAGES } from '../../lib/types'
import { moveStage, assignLead, addNote, setFollowUp, logContact } from '../../lib/ops'
import { updateWs } from '../../lib/store'
import { naira, dateStr, time, initials, today } from '../../lib/fmt'
import { Badge, Icon, WaIcon, quoteBadge } from '../../components/ui'
import { quoteTotals } from '../../lib/fmt'

export default function LeadDetail() {
  const { id } = useParams()
  const { ws, wsId, me } = useApp()
  const l = ws.leads.find(l => l.id === id)
  const [note, setNote] = useState('')
  const [fu, setFu] = useState({ date: l?.followUp || '', note: l?.followUpNote || '' })
  if (!l) return <div className="card empty">Lead not found. <Link className="link" to="/app/pipeline">Back to pipeline</Link></div>
  const conv = ws.conversations.find(c => c.id === l.conversationId)
  const quotes = ws.quotes.filter(q => q.leadId === l.id)
  const ref = ws.referrers.find(r => r.code === l.refCode)
  const wa = `https://wa.me/${l.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${l.name.split(' ')[0]}, this is ${me.name.split(' ')[0]} from ${ws.profile.name}. Thanks for your enquiry about the ${l.interest}. When is a good time to talk?`)}`
  const si = STAGES.findIndex(s => s.id === l.stage)
  return (
    <>
      <div className="row xs muted"><Link className="link" to="/app/pipeline">Pipeline</Link> / {l.name}</div>
      <div className="card">
        <div className="spread" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div className="row" style={{ gap: 14 }}><span className="av lg">{initials(l.name)}</span><div><h1 style={{ fontSize: 28, lineHeight: 1.1 }}>{l.name}</h1><div className="small muted" style={{ marginTop: 4 }}>{l.city} · {l.phone}{l.email ? ` · ${l.email}` : ''}</div></div></div>
          <div className="row wrap">
            <a className="btn glass sm" href={wa} target="_blank" rel="noreferrer" onClick={() => logContact(wsId, l.id, 'WhatsApp')}><WaIcon s={14} />WhatsApp</a>
            <a className="btn glass sm" href={`tel:${l.phone.replace(/\s/g, '')}`} onClick={() => logContact(wsId, l.id, 'phone call')}><Icon n="phone" s={14} />Call</a>
            <Link className="btn cta sm" to={`/app/quotes/new?lead=${l.id}`} data-testid="create-quote">Create quotation</Link>
          </div>
        </div>
        <div className="stepper" style={{ marginTop: 22 }}>
          {STAGES.map((s, i) => <button key={s.id} className={`${l.stage === s.id ? 'cur' : i < si && l.stage !== 'lost' ? 'past' : ''} ${s.id === 'lost' ? 'lost' : ''}`} onClick={() => moveStage(wsId, l.id, s.id)}>{s.label}</button>)}
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)' }}>
        <div className="stack" style={{ gap: 16 }}>
          <div className="card">
            <div className="spread"><span className="label">AI summary</span><Badge kind="blue">{l.intent}</Badge></div>
            <p style={{ marginTop: 12, fontSize: 16, lineHeight: 1.55 }}>{l.summary}</p>
            <div className="grid g3" style={{ marginTop: 18, gap: 10 }}>
              <div><div className="label">Interest</div><div className="small" style={{ marginTop: 4 }}>{l.interest}</div></div>
              <div><div className="label">Budget</div><div className="small" style={{ marginTop: 4 }}>{l.budget || '—'}</div></div>
              <div><div className="label">Est. value</div><div className="small num" style={{ marginTop: 4 }}>{naira(l.value)}</div></div>
            </div>
          </div>
          {conv && <div className="card">
            <div className="spread"><span className="label">Conversation · {conv.channel}</span><Link className="link small" to={`/app/inbox/${conv.id}`}>Reply in inbox →</Link></div>
            <div className="thread" style={{ maxHeight: 340, marginTop: 10 }}>
              {conv.messages.map(m => m.from === 'system' ? <div key={m.id} className="sysm">{m.text}</div> : <div key={m.id} className={`msg ${m.from === 'visitor' ? 'v' : m.from === 'agent' ? 'a' : 'b'}`}><span className="who">{m.from === 'visitor' ? l.name.split(' ')[0] : m.from === 'agent' ? 'Team' : 'Enquivo AI'} · {time(m.at)}</span>{m.text}</div>)}
            </div>
          </div>}
          <div className="card">
            <span className="label">Timeline</span>
            <div className="tl" style={{ marginTop: 16 }}>
              {[...l.timeline].reverse().map(t => <div key={t.id} className={`it ${t.kind === 'stage' ? 'stage' : ''}`}>{t.text}<div className="m">{dateStr(t.at)} · {time(t.at)}{t.by ? ` · ${t.by}` : ''}</div></div>)}
            </div>
          </div>
        </div>
        <div className="stack" style={{ gap: 16 }}>
          <div className="card">
            <span className="label">Ownership</span>
            <label className="field" style={{ marginTop: 14 }}><span>Assigned salesperson</span>
              <select className="select" value={l.assignee || ''} onChange={e => assignLead(wsId, l.id, e.target.value)} data-testid="assign">{!l.assignee && <option value="">Unassigned</option>}{ws.staff.filter(s => s.role !== 'Operations').map(s => <option key={s.id} value={s.id}>{s.name} · {s.role}</option>)}</select>
            </label>
            <div className="stack small" style={{ marginTop: 14, gap: 8 }}>
              <div className="spread"><span className="muted">Source</span><span>{l.source}</span></div>
              <div className="spread"><span className="muted">Original referrer</span><span>{ref ? `${ref.name} (${ref.code})` : '—'}</span></div>
              <div className="spread"><span className="muted">Deal owner</span><span>{ws.staff.find(s => s.id === l.owner)?.name || '—'}</span></div>
              <div className="spread"><span className="muted">Created</span><span>{dateStr(l.createdAt)}</span></div>
            </div>
          </div>
          <div className="card">
            <div className="spread"><span className="label">Follow-up</span>{l.followUp && (l.followUp < today() ? <Badge kind="acc">Overdue</Badge> : l.followUp === today() ? <Badge kind="warn">Due today</Badge> : <Badge>Scheduled</Badge>)}</div>
            <div className="grid g2" style={{ marginTop: 14, gap: 10 }}>
              <label className="field"><span>Date</span><input type="date" className="input" value={fu.date} onChange={e => setFu({ ...fu, date: e.target.value })} /></label>
              <label className="field"><span>Action</span><input className="input" value={fu.note} placeholder="e.g. Call back" onChange={e => setFu({ ...fu, note: e.target.value })} /></label>
            </div>
            <div className="row" style={{ marginTop: 10, gap: 6, flexWrap: 'wrap' }}>
              {[1, 3, 7].map(d => <button key={d} className="chip" style={{ height: 28, fontSize: 12 }} onClick={() => setFu({ ...fu, date: new Date(Date.now() + d * 86400000).toISOString().slice(0, 10) })}>+{d} day{d > 1 ? 's' : ''}</button>)}
              <button className="btn ghost sm" style={{ marginLeft: 'auto' }} onClick={() => setFollowUp(wsId, l.id, fu.date, fu.note)}>Save</button>
            </div>
          </div>
          <div className="card">
            <span className="label">Notes</span>
            <form className="row" style={{ marginTop: 12 }} onSubmit={e => { e.preventDefault(); if (note.trim()) { addNote(wsId, l.id, note.trim()); setNote('') } }}><input className="input" placeholder="Add an internal note" value={note} onChange={e => setNote(e.target.value)} /><button className="btn ghost sm">Add</button></form>
            <div className="stack" style={{ marginTop: 12, gap: 8 }}>{l.notes.map((n, i) => <div key={i} className="small" style={{ background: 'var(--bg)', padding: '10px 12px', borderRadius: 12 }}>{n}</div>)}{!l.notes.length && <p className="xs muted">Notes are internal — customers never see them.</p>}</div>
          </div>
          <div className="card">
            <span className="label">Quotations</span>
            <div className="stack" style={{ marginTop: 12, gap: 8 }}>
              {quotes.map(q => <Link key={q.id} to={`/app/quotes/${q.id}`} className="spread" style={{ textDecoration: 'none', padding: '10px 12px', background: 'var(--bg)', borderRadius: 12 }}><span className="small">{q.number}</span><span className="row" style={{ gap: 8 }}><span className="num small">{naira(quoteTotals(q).total)}</span><Badge kind={quoteBadge(q.status)}>{q.status}</Badge></span></Link>)}
              {!quotes.length && <p className="xs muted">No quotations yet.</p>}
            </div>
          </div>
          {l.stage === 'lost' && <div className="card"><label className="field"><span>Lost reason</span><select className="select" value={l.lostReason || ''} onChange={e => updateWs(wsId, w => { w.leads.find(x => x.id === l.id)!.lostReason = e.target.value })}><option value="">—</option><option>Price</option><option>Timing</option><option>Chose competitor</option><option>No response</option></select></label></div>}
        </div>
      </div>
    </>
  )
}
