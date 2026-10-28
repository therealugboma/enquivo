import { Link, useNavigate } from 'react-router-dom'
import { useApp, PageHead } from './Layout'
import { STAGES } from '../../lib/types'
import { nairaShort, ago, naira } from '../../lib/fmt'
import { Badge, stageBadge } from '../../components/ui'

export default function Overview() {
  const { ws, leads, me } = useApp()
  const nav = useNavigate()
  const D = 86400000, now = Date.now()
  const last7 = leads.filter(l => now - l.createdAt < 7 * D)
  const prev7 = leads.filter(l => now - l.createdAt >= 7 * D && now - l.createdAt < 14 * D)
  const won = leads.filter(l => l.stage === 'won'), lost = leads.filter(l => l.stage === 'lost')
  const conv = leads.length ? Math.round(won.length / leads.length * 100) : 0
  const open = leads.filter(l => !['won', 'lost'].includes(l.stage))
  const pipeline = open.reduce((a, l) => a + l.value, 0)
  const resp = ws.conversations.map(c => { const f = c.messages.find(m => m.from === 'agent'); return f ? f.at - c.createdAt : null }).filter((x): x is number => x !== null)
  const avgResp = resp.length ? resp.reduce((a, b) => a + b, 0) / resp.length : 0
  const fmtDur = (ms: number) => ms < 3600000 ? `${Math.round(ms / 60000)}m` : `${Math.floor(ms / 3600000)}h ${Math.round(ms % 3600000 / 60000)}m`
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(now - (13 - i) * D); const k = d.toISOString().slice(0, 10); return { k, l: d.toLocaleDateString('en-GB', { weekday: 'narrow' }), n: leads.filter(x => new Date(x.createdAt).toISOString().slice(0, 10) === k).length } })
  const maxD = Math.max(2, ...days.map(d => d.n))
  const bySource = Object.entries(leads.reduce((a, l) => ({ ...a, [l.source]: (a[l.source] || 0) + 1 }), {} as Record<string, number>)).sort((a, b) => b[1] - a[1])
  const byProduct = Object.entries(leads.reduce((a, l) => ({ ...a, [l.interest]: (a[l.interest] || 0) + 1 }), {} as Record<string, number>)).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const recent = [...leads].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6)
  const sales = ws.staff.filter(s => s.role === 'Salesperson' || s.role === 'Manager')
  const aiHandled = ws.conversations.filter(c => c.status === 'ai').length
  return (
    <>
      <PageHead label={`${ws.profile.name} · Overview`} title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${me.name.split(' ')[0]}.`}>
        <Link to="/app/inbox" className="btn glass sm">Open inbox</Link>
        <Link to="/app/quotes/new" className="btn cta sm">New quotation</Link>
      </PageHead>
      <div className="grid g4">
        <div className="card kpi"><span className="label">New enquiries · 7d</span><div className="v" data-testid="kpi-new">{last7.length}</div><div className="d">{prev7.length ? `${last7.length >= prev7.length ? '+' : ''}${last7.length - prev7.length} vs previous 7 days` : 'First week of data'}</div></div>
        <div className="card kpi"><span className="label">First human reply</span><div className="v">{avgResp ? fmtDur(avgResp) : '—'}</div><div className="d">AI answers instantly · {aiHandled} chats handled by AI only</div></div>
        <div className="card kpi"><span className="label">Conversion</span><div className="v">{conv}%</div><div className="d">{won.length} won · {lost.length} lost · {leads.length} total</div></div>
        <div className="card kpi"><span className="label">Open pipeline</span><div className="v">{nairaShort(pipeline)}</div><div className="d">{open.length} open leads · won {nairaShort(won.reduce((a, l) => a + l.value, 0))}</div></div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)' }}>
        <div className="card">
          <div className="spread"><span className="label">Enquiries · last 14 days</span><span className="xs muted">today in red</span></div>
          <div className="bars">{days.map((d, i) => <div key={d.k} className="b" title={`${d.k}: ${d.n}`}><span className="xs num" style={{ fontSize: 10, color: 'var(--mut)', height: 'auto', background: 'none' }}>{d.n || ''}</span><span className={i === 13 ? 'today' : ''} style={{ height: `${Math.max(3, d.n / maxD * 110)}px` }} /><em>{d.l}</em></div>)}</div>
        </div>
        <div className="card">
          <span className="label">Pipeline by stage</span>
          <div className="funnel" style={{ marginTop: 14 }}>{STAGES.map(s => { const ls = leads.filter(l => l.stage === s.id); return <div key={s.id} className="st" onClick={() => nav('/app/pipeline')} style={{ cursor: 'pointer' }}><span className="row" style={{ gap: 8 }}><Badge kind={stageBadge(s.id)}>{s.label}</Badge><span className="num">{ls.length}</span></span><span className="num small muted">{nairaShort(ls.reduce((a, l) => a + l.value, 0))}</span></div> })}</div>
        </div>
      </div>
      <div className="grid g3">
        <div className="card"><span className="label">Enquiries by source</span><div style={{ marginTop: 12 }}>{bySource.map(([k, v]) => <div key={k} className="hbar"><span>{k}</span><div className="t"><span style={{ width: `${v / leads.length * 100}%` }} /></div><span className="num small muted" style={{ textAlign: 'right' }}>{v}</span></div>)}</div></div>
        <div className="card"><span className="label">Most requested</span><div style={{ marginTop: 12 }}>{byProduct.map(([k, v]) => <div key={k} className="hbar" style={{ gridTemplateColumns: '1fr 70px 24px' }}><span className="small" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k}</span><div className="t"><span style={{ width: `${v / byProduct[0][1] * 100}%`, background: '#3d5a99' }} /></div><span className="num small muted" style={{ textAlign: 'right' }}>{v}</span></div>)}</div></div>
        <div className="card"><span className="label">Team</span>
          <table className="table" style={{ marginTop: 6 }}><thead><tr><th>Staff</th><th className="r">Open</th><th className="r">Won</th></tr></thead><tbody>
            {sales.map(s => <tr key={s.id}><td className="small">{s.name}</td><td className="r">{leads.filter(l => l.assignee === s.id && !['won', 'lost'].includes(l.stage)).length}</td><td className="r">{leads.filter(l => l.assignee === s.id && l.stage === 'won').length}</td></tr>)}
          </tbody></table>
        </div>
      </div>
      <div className="card flush">
        <div className="spread" style={{ padding: '20px 24px 6px' }}><span className="label">Recent enquiries</span><Link className="link small" to="/app/pipeline">View pipeline →</Link></div>
        <div style={{ overflowX: 'auto' }}><table className="table"><thead><tr><th>Customer</th><th>Interest</th><th>Source</th><th>Owner</th><th>Status</th><th className="r">Value</th></tr></thead><tbody>
          {recent.map(l => <tr key={l.id} className="click" onClick={() => nav(`/app/leads/${l.id}`)}><td><div>{l.name}</div><div className="xs muted">{l.city} · {ago(l.createdAt)}</div></td><td className="small">{l.interest}</td><td className="small">{l.source}{l.refCode && <span className="xs muted"> · {l.refCode}</span>}</td><td className="small">{ws.staff.find(s => s.id === l.assignee)?.name.split(' ')[0] || '—'}</td><td><Badge kind={stageBadge(l.stage)}>{l.stage}</Badge></td><td className="r num">{naira(l.value)}</td></tr>)}
        </tbody></table></div>
      </div>
    </>
  )
}
