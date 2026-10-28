import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from './Layout'
import { updateWs } from '../../lib/store'
import { agentSay } from '../../lib/chat'
import { ago, time, initials } from '../../lib/fmt'
import { Badge, Icon, stageBadge, WaIcon } from '../../components/ui'
import { waLink } from '../../lib/engine'

const ST: Record<string, [string, any]> = { ai: ['AI handling', 'blue'], 'needs-human': ['Needs a person', 'acc'], human: ['With team', 'ok'], closed: ['Closed', ''] }

export default function Inbox() {
  const { ws, wsId, me, leads } = useApp()
  const { id } = useParams(); const nav = useNavigate()
  const [filter, setFilter] = useState<'all' | 'needs' | 'ai' | 'human'>('all')
  const [text, setText] = useState('')
  const threadRef = useRef<HTMLDivElement>(null)
  const convs = ws.conversations.filter(c => me.role !== 'Salesperson' || leads.some(l => l.id === c.leadId) || !c.leadId)
    .filter(c => filter === 'all' || (filter === 'needs' ? c.status === 'needs-human' : c.status === filter)).sort((a, b) => b.updatedAt - a.updatedAt)
  const cur = ws.conversations.find(c => c.id === id) || convs[0]
  const lead = ws.leads.find(l => l.id === cur?.leadId)
  useEffect(() => { if (cur?.unread) updateWs(wsId, w => { const c = w.conversations.find(c => c.id === cur.id); if (c) c.unread = 0 }) }, [cur?.id, cur?.unread, wsId])
  useEffect(() => { threadRef.current?.scrollTo({ top: 1e6 }) }, [cur?.id, cur?.messages.length])
  const send = () => { if (!text.trim() || !cur) return; agentSay(wsId, cur.id, text.trim(), me.id); setText('') }
  const templates = [`Hi ${cur?.ctx.name?.split(' ')[0] || 'there'}, thanks for your enquiry — I'm ${me.name.split(' ')[0]} from ${ws.profile.name}. When is a good time to call?`, 'I can prepare a formal quotation today. Could you confirm the room size?', `You're welcome to visit our ${ws.profile.showrooms[0]} showroom. ${ws.profile.hours}.`]
  return (
    <div className="inbox">
      <div className="card tight">
        <div className="spread"><span className="label">Conversations</span><span className="xs muted">{convs.length}</span></div>
        <div className="tabs" style={{ margin: '12px 0', display: 'flex' }}>
          {([['all', 'All'], ['needs', 'Waiting'], ['ai', 'AI'], ['human', 'Team']] as const).map(([k, l]) => <button key={k} className={filter === k ? 'on' : ''} style={{ flex: 1, padding: '0 6px', fontSize: 12 }} onClick={() => setFilter(k)}>{l}</button>)}
        </div>
        <div className="clist">
          {convs.map(c => { const last = c.messages[c.messages.length - 1]; return (
            <button key={c.id} className={`citem ${cur?.id === c.id ? 'on' : ''}`} onClick={() => nav(`/app/inbox/${c.id}`)} data-testid="conv-item">
              <span className="av">{initials(c.ctx.name || 'Visitor')}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="spread"><span style={{ fontSize: 14, fontWeight: c.unread ? 500 : 400 }}>{c.ctx.name || 'Website visitor'}</span><span className="xs muted">{ago(c.updatedAt)}</span></span>
                <span className="pv" style={{ display: 'block' }}>{last.from === 'visitor' ? '' : last.from === 'agent' ? 'You: ' : last.from === 'bot' ? 'AI: ' : ''}{last.text}</span>
                <span className="row" style={{ gap: 6, marginTop: 6 }}><Badge kind={ST[c.status][1]}>{ST[c.status][0]}</Badge><span className="xs muted">{c.channel}</span>{c.unread > 0 && <span className="dot-red" style={{ marginLeft: 'auto' }} />}</span>
              </span>
            </button>) })}
          {!convs.length && <div className="empty">No conversations here yet.</div>}
        </div>
      </div>
      {cur ? <div className="card tight">
        <div className="spread" style={{ paddingBottom: 12, borderBottom: '1px solid var(--hl)' }}>
          <div className="row"><span className="av lg">{initials(cur.ctx.name || 'V')}</span><div><div style={{ fontSize: 16 }}>{cur.ctx.name || 'Website visitor'}</div><div className="xs muted">{cur.channel} · {cur.page} · started {ago(cur.createdAt)}</div></div></div>
          <div className="row">
            <Badge kind={ST[cur.status][1]}>{ST[cur.status][0]}</Badge>
            {cur.status !== 'human' ? <button className="btn ghost sm" onClick={() => updateWs(wsId, w => { const c = w.conversations.find(c => c.id === cur.id)!; c.status = 'human'; c.messages.push({ id: 'm' + Date.now(), from: 'system', text: `${me.name.split(' ')[0]} took over from the assistant`, at: Date.now() }) })}>Take over</button>
              : <button className="btn ghost sm" onClick={() => updateWs(wsId, w => { const c = w.conversations.find(c => c.id === cur.id)!; c.status = 'ai'; c.messages.push({ id: 'm' + Date.now(), from: 'system', text: 'Handed back to the assistant', at: Date.now() }) })}>Hand back to AI</button>}
          </div>
        </div>
        <div className="thread" ref={threadRef} data-testid="thread">
          {cur.messages.map(m => m.from === 'system' ? <div key={m.id} className="sysm">{m.text}</div> :
            <div key={m.id} className={`msg ${m.from === 'visitor' ? 'v' : m.from === 'agent' ? 'a' : 'b'}`}><span className="who">{m.from === 'visitor' ? (cur.ctx.name || 'Visitor') : m.from === 'agent' ? (ws.staff.find(s => s.id === m.author)?.name || 'Team') : 'Enquivo AI'} · {time(m.at)}</span>{m.text}</div>)}
        </div>
        <div className="row wrap" style={{ gap: 6, marginBottom: 8 }}>{templates.map((t, i) => <button key={i} className="chip" style={{ height: 28, fontSize: 12 }} onClick={() => setText(t)}>{['Intro', 'Quote', 'Visit'][i]} template</button>)}</div>
        <div className="composer">
          <textarea className="textarea" placeholder={`Reply as ${me.name.split(' ')[0]} — the customer sees this in their chat`} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} data-testid="agent-input" />
          <button className="btn cta" onClick={send} disabled={!text.trim()}>Send</button>
        </div>
      </div> : <div className="card empty">Select a conversation.</div>}
      {cur && <div className="card tight ctxp" style={{ overflow: 'auto' }}>
        <span className="label">Collected details</span>
        <div className="stack small" style={{ marginTop: 12, gap: 8 }}>
          {([['Name', cur.ctx.name], ['Phone', cur.ctx.phone], ['City', cur.ctx.city], ['Interest', cur.ctx.interest], ['Budget', cur.ctx.budget], ['Intent', cur.ctx.intent], ['Referral', cur.ctx.ref]] as const).map(([k, v]) => <div key={k} className="spread"><span className="muted">{k}</span><span style={{ textAlign: 'right' }}>{v || '—'}</span></div>)}
        </div>
        <div className="hr" />
        {lead ? <>
          <span className="label">Lead</span>
          <div style={{ marginTop: 10 }}><Badge kind={stageBadge(lead.stage)}>{lead.stage}</Badge></div>
          <p className="small" style={{ marginTop: 10, color: 'var(--ink-3)' }}>{lead.summary}</p>
          <p className="xs muted" style={{ marginTop: 8 }}>Owner: {ws.staff.find(s => s.id === lead.assignee)?.name || 'Unassigned'}</p>
          <div className="stack" style={{ marginTop: 14, gap: 8 }}>
            <Link to={`/app/leads/${lead.id}`} className="btn glass sm">Open lead</Link>
            <Link to={`/app/quotes/new?lead=${lead.id}`} className="btn glass sm">Create quotation</Link>
            <a className="btn glass sm" href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${lead.name.split(' ')[0]}, this is ${me.name.split(' ')[0]} from ${ws.profile.name}. Thanks for your enquiry about the ${lead.interest}.`)}`} target="_blank" rel="noreferrer"><WaIcon s={14} />WhatsApp</a>
          </div>
        </> : <p className="small muted">No lead yet — Enquivo creates one as soon as a name and phone number are shared.</p>}
        <div className="hr" />
        <a className="link xs" href={waLink(ws, cur.ctx)} target="_blank" rel="noreferrer"><Icon n="ext" s={11} /> Customer's WhatsApp hand-off link</a>
      </div>}
    </div>
  )
}
