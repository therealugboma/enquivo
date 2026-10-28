import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp, PageHead } from './Layout'
import { setFollowUp, logContact } from '../../lib/ops'
import { today, dateStr } from '../../lib/fmt'
import { Badge, Icon, WaIcon } from '../../components/ui'
import type { Lead } from '../../lib/types'

export default function FollowUps() {
  const { ws, wsId, me, leads } = useApp()
  const [tpl, setTpl] = useState(0)
  const T = [
    { n: 'Gentle check-in', t: (l: Lead) => `Hi ${l.name.split(' ')[0]}, it's ${me.name.split(' ')[0]} from ${ws.profile.name}. Just checking in on your enquiry about the ${l.interest}. Happy to answer any questions.` },
    { n: 'Quote reminder', t: (l: Lead) => `Hi ${l.name.split(' ')[0]}, a quick reminder that your quotation for the ${l.interest} is valid for a few more days. Shall I reserve a production slot for you?` },
    { n: 'Showroom invite', t: (l: Lead) => `Hi ${l.name.split(' ')[0]}, you're welcome to visit our ${ws.profile.showrooms[0]} showroom and play on the table before deciding. ${ws.profile.hours}.` },
  ]
  const open = leads.filter(l => l.followUp && !['won', 'lost'].includes(l.stage)).sort((a, b) => a.followUp!.localeCompare(b.followUp!))
  const groups: [string, Lead[], any][] = [['Overdue', open.filter(l => l.followUp! < today()), 'acc'], ['Due today', open.filter(l => l.followUp === today()), 'warn'], ['Upcoming', open.filter(l => l.followUp! > today()), '']]
  const unattended = leads.filter(l => l.stage === 'new' && Date.now() - l.createdAt > 3600000 && !l.timeline.some(t => t.kind === 'contact' || t.kind === 'message'))
  const plus = (d: number) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10)
  return (
    <>
      <PageHead label="Follow-ups" title="Who needs a nudge today">
        <span className="small muted">Message template</span>
        <div className="tabs">{T.map((t, i) => <button key={t.n} className={tpl === i ? 'on' : ''} onClick={() => setTpl(i)}>{t.n}</button>)}</div>
      </PageHead>
      <div className="grid g3">
        {groups.map(([n, ls, k]) => <div key={n} className="card kpi tight"><span className="label">{n}</span><div className="v">{ls.length}</div></div>)}
      </div>
      {unattended.length > 0 && <div className="card tight row" style={{ gap: 12 }}><Badge kind="acc">Alert</Badge><span className="small">{unattended.length} new lead{unattended.length > 1 ? 's have' : ' has'} waited over an hour without contact: {unattended.map(l => <Link key={l.id} className="link" to={`/app/leads/${l.id}`} style={{ marginRight: 8 }}>{l.name}</Link>)}</span></div>}
      {groups.map(([n, ls, k]) => ls.length > 0 && (
        <div key={n} className="card flush">
          <div style={{ padding: '18px 24px 4px' }} className="row"><Badge kind={k}>{n}</Badge><span className="xs muted">{ls.length}</span></div>
          <div style={{ overflowX: 'auto' }}><table className="table"><tbody>
            {ls.map(l => { const msg = T[tpl].t(l); return (
              <tr key={l.id}>
                <td style={{ width: '24%' }}><Link to={`/app/leads/${l.id}`} className="link">{l.name}</Link><div className="xs muted">{l.city} · {l.stage}</div></td>
                <td className="small">{l.followUpNote || 'Follow up'}<div className="xs muted">{dateStr(l.followUp!)} · {ws.staff.find(s => s.id === l.assignee)?.name || 'Unassigned'}</div></td>
                <td className="r" style={{ whiteSpace: 'nowrap' }}>
                  <div className="row" style={{ justifyContent: 'flex-end', gap: 6 }}>
                    <a className="btn glass sm" title={msg} href={`https://wa.me/${l.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer" onClick={() => logContact(wsId, l.id, 'WhatsApp')}><WaIcon s={14} />WhatsApp</a>
                    <a className="btn glass sm" title={msg} href={`mailto:${l.email || ''}?subject=${encodeURIComponent(`Your ${ws.profile.name} enquiry`)}&body=${encodeURIComponent(msg)}`} onClick={() => logContact(wsId, l.id, 'email')}><Icon n="mail" s={14} />Email</a>
                    <button className="btn ghost sm" onClick={() => setFollowUp(wsId, l.id, plus(1), l.followUpNote || '')}>Snooze 1d</button>
                    <button className="btn soft sm" onClick={() => setFollowUp(wsId, l.id, '', 'Done')}><Icon n="check" s={14} />Done</button>
                  </div>
                </td>
              </tr>) })}
          </tbody></table></div>
        </div>))}
      <div className="card tight"><span className="label">Preview · {T[tpl].n}</span><p className="small" style={{ marginTop: 8, color: 'var(--ink-3)' }}>{open[0] ? T[tpl].t(open[0]) : '—'}</p><p className="xs muted" style={{ marginTop: 8 }}>One click opens WhatsApp or email with the message pre-filled, and logs the contact on the lead's timeline. Sending stays with your staff.</p></div>
    </>
  )
}
