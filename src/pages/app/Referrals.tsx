import { useState } from 'react'
import { useApp, PageHead } from './Layout'
import { updateWs, uid } from '../../lib/store'
import { naira } from '../../lib/fmt'
import { Badge, Icon, Modal } from '../../components/ui'
import { Link } from 'react-router-dom'

export default function Referrals() {
  const { ws, wsId } = useApp()
  const [add, setAdd] = useState(false)
  const [d, setD] = useState({ name: '', code: '', type: 'Partner', commission: 5, city: '' })
  const [copied, setCopied] = useState('')
  const base = `${location.origin}${location.pathname}#/e/${ws.profile.slug}?ref=`
  const rows = ws.referrers.map(r => {
    const ls = ws.leads.filter(l => l.refCode === r.code); const won = ls.filter(l => l.stage === 'won')
    const rev = won.reduce((a, l) => a + l.value, 0)
    return { r, leads: ls.length, won: won.length, rev, comm: rev * r.commission / 100, pipe: ls.filter(l => !['won', 'lost'].includes(l.stage)).reduce((a, l) => a + l.value, 0) }
  })
  const copy = (code: string) => { navigator.clipboard?.writeText(base + code).catch(() => {}); setCopied(code); setTimeout(() => setCopied(''), 1500) }
  return (
    <>
      <PageHead label="Sales ownership" title="Referrals"><button className="btn cta sm" onClick={() => setAdd(true)}><Icon n="plus" s={14} />New referral link</button></PageHead>
      <div className="grid g4">
        <div className="card kpi tight"><span className="label">Referrers</span><div className="v">{rows.length}</div></div>
        <div className="card kpi tight"><span className="label">Referred leads</span><div className="v">{rows.reduce((a, r) => a + r.leads, 0)}</div></div>
        <div className="card kpi tight"><span className="label">Won revenue</span><div className="v">{naira(rows.reduce((a, r) => a + r.rev, 0))}</div></div>
        <div className="card kpi tight"><span className="label">Commission due</span><div className="v">{naira(rows.reduce((a, r) => a + r.comm, 0))}</div><div className="d">For approval · not paid automatically</div></div>
      </div>
      <div className="card flush"><div style={{ overflowX: 'auto' }}><table className="table"><thead><tr><th>Referrer</th><th>Code & link</th><th className="r">Clicks</th><th className="r">Leads</th><th className="r">Won</th><th className="r">Pipeline</th><th className="r">Revenue</th><th className="r">Commission</th></tr></thead><tbody>
        {rows.map(({ r, leads, won, rev, comm, pipe }) => <tr key={r.id}>
          <td>{r.name}<div className="row" style={{ gap: 6, marginTop: 4 }}><Badge kind={r.type === 'Staff' ? 'blue' : r.type === 'Distributor' ? 'warn' : ''}>{r.type}</Badge><span className="xs muted">{r.city} · {r.commission}%</span></div></td>
          <td><span className="mono small">{r.code}</span><div className="row" style={{ gap: 8, marginTop: 4 }}><button className="link xs" onClick={() => copy(r.code)}>{copied === r.code ? 'Copied ✓' : 'Copy link'}</button><Link className="link xs" to={`/e/${ws.profile.slug}?ref=${r.code}`} target="_blank">Open ↗</Link></div></td>
          <td className="r">{r.clicks || 0}</td><td className="r">{leads}</td><td className="r">{won}</td><td className="r num">{naira(pipe)}</td><td className="r num">{naira(rev)}</td><td className="r num">{naira(comm)}</td>
        </tr>)}
      </tbody></table></div></div>
      <div className="card tight small muted">Enquivo records the <b style={{ fontWeight: 500, color: 'var(--ink)' }}>original referrer</b>, the <b style={{ fontWeight: 500, color: 'var(--ink)' }}>assigned salesperson</b> and the <b style={{ fontWeight: 500, color: 'var(--ink)' }}>current deal owner</b> separately — so credit is clear even when a lead changes hands. Link format: <span className="mono">{ws.profile.website}/?ref=CODE</span> or <span className="mono">/e/{ws.profile.slug}?ref=CODE</span>.</div>
      {add && <Modal onClose={() => setAdd(false)}>
        <span className="label">New referral link</span><h2 style={{ margin: '8px 0 18px' }}>Who is bringing customers?</h2>
        <form className="stack" onSubmit={e => { e.preventDefault(); updateWs(wsId, w => { w.referrers.push({ id: uid('rf'), name: d.name, code: d.code.toUpperCase().replace(/\s/g, '-'), type: d.type as any, commission: +d.commission, city: d.city }) }); setAdd(false) }}>
          <label className="field"><span>Name</span><input required className="input" value={d.name} onChange={e => setD({ ...d, name: e.target.value, code: d.code || e.target.value.split(' ')[0].toUpperCase() })} /></label>
          <div className="grid g3"><label className="field"><span>Code</span><input required className="input mono" value={d.code} onChange={e => setD({ ...d, code: e.target.value.toUpperCase() })} /></label><label className="field"><span>Type</span><select className="select" value={d.type} onChange={e => setD({ ...d, type: e.target.value })}><option>Staff</option><option>Distributor</option><option>Partner</option></select></label><label className="field"><span>Commission %</span><input type="number" className="input" value={d.commission} onChange={e => setD({ ...d, commission: +e.target.value })} /></label></div>
          <label className="field"><span>City</span><input className="input" value={d.city} onChange={e => setD({ ...d, city: e.target.value })} /></label>
          <div className="row" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn ghost" onClick={() => setAdd(false)}>Cancel</button><button className="btn cta">Create link</button></div>
        </form>
      </Modal>}
    </>
  )
}
