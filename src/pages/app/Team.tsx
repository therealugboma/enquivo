import { useState } from 'react'
import { useApp, PageHead } from './Layout'
import { updateWs, uid } from '../../lib/store'
import { initials } from '../../lib/fmt'
import { Badge, Icon, Modal } from '../../components/ui'
import type { Role } from '../../lib/types'

const PERMS: [string, Role[]][] = [
  ['See all leads & conversations', ['Owner', 'Manager']],
  ['See own assigned leads', ['Owner', 'Manager', 'Salesperson']],
  ['Reply to customers', ['Owner', 'Manager', 'Salesperson']],
  ['Create quotations', ['Owner', 'Manager', 'Salesperson']],
  ['Approve discounts & accept quotes', ['Owner', 'Manager']],
  ['Work orders (update stages)', ['Owner', 'Manager', 'Operations']],
  ['Edit knowledge base', ['Owner', 'Manager']],
  ['Workspace settings & billing', ['Owner']],
]
const ROLES: Role[] = ['Owner', 'Manager', 'Salesperson', 'Operations']

export default function Team() {
  const { ws, wsId } = useApp()
  const [inv, setInv] = useState(false)
  const [d, setD] = useState({ name: '', email: '', role: 'Salesperson' as Role, showroom: ws.profile.showrooms[0] })
  return (
    <>
      <PageHead label="Workspace" title="Team"><button className="btn cta sm" onClick={() => setInv(true)}><Icon n="plus" s={14} />Invite member</button></PageHead>
      <div className="card flush"><div style={{ overflowX: 'auto' }}><table className="table"><thead><tr><th>Member</th><th>Role</th><th>Location</th><th className="r">Open leads</th><th className="r">Won</th><th>Status</th></tr></thead><tbody>
        {ws.staff.map(s => <tr key={s.id}>
          <td><div className="row" style={{ gap: 10 }}><span className="av">{initials(s.name)}</span><div>{s.name}<div className="xs muted">{s.email} · {s.phone}</div></div></div></td>
          <td><select className="select" style={{ minHeight: 34, height: 34, padding: '0 8px', width: 'auto' }} value={s.role} disabled={s.role === 'Owner'} onChange={e => updateWs(wsId, w => { w.staff.find(x => x.id === s.id)!.role = e.target.value as Role })}>{ROLES.map(r => <option key={r}>{r}</option>)}</select></td>
          <td className="small">{s.showroom}</td>
          <td className="r">{ws.leads.filter(l => l.assignee === s.id && !['won', 'lost'].includes(l.stage)).length}</td>
          <td className="r">{ws.leads.filter(l => l.assignee === s.id && l.stage === 'won').length}</td>
          <td>{s.active ? <Badge kind="ok">Active</Badge> : <Badge kind="warn">Invited</Badge>}</td>
        </tr>)}
      </tbody></table></div></div>
      <div className="card flush">
        <div style={{ padding: '20px 24px 4px' }}><span className="label">Roles & permissions</span><p className="xs muted" style={{ marginTop: 4 }}>In the product these are enforced on the server, per workspace. In this demo, use "Viewing as" (top right) to see a salesperson's restricted view.</p></div>
        <div style={{ overflowX: 'auto' }}><table className="table"><thead><tr><th>Permission</th>{ROLES.map(r => <th key={r} style={{ textAlign: 'center' }}>{r}</th>)}</tr></thead><tbody>
          {PERMS.map(([p, rs]) => <tr key={p}><td className="small">{p}</td>{ROLES.map(r => <td key={r} style={{ textAlign: 'center' }}>{rs.includes(r) ? <Icon n="check" s={15} /> : <span className="muted">—</span>}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      {inv && <Modal onClose={() => setInv(false)}>
        <span className="label">Invite</span><h2 style={{ margin: '8px 0 18px' }}>Add a team member</h2>
        <form className="stack" onSubmit={e => { e.preventDefault(); updateWs(wsId, w => { w.staff.push({ id: uid('st'), name: d.name, email: d.email, phone: '+234 800 000 0099', role: d.role, showroom: d.showroom, active: false }) }); setInv(false) }}>
          <label className="field"><span>Full name</span><input required className="input" value={d.name} onChange={e => setD({ ...d, name: e.target.value })} /></label>
          <label className="field"><span>Email</span><input required type="email" className="input" placeholder="name@example.com" value={d.email} onChange={e => setD({ ...d, email: e.target.value })} /></label>
          <div className="grid g2"><label className="field"><span>Role</span><select className="select" value={d.role} onChange={e => setD({ ...d, role: e.target.value as Role })}>{ROLES.filter(r => r !== 'Owner').map(r => <option key={r}>{r}</option>)}</select></label><label className="field"><span>Location</span><select className="select" value={d.showroom} onChange={e => setD({ ...d, showroom: e.target.value })}>{ws.profile.showrooms.map(s => <option key={s}>{s}</option>)}</select></label></div>
          <p className="xs muted">Demo only — no email is sent. Each member gets their own login in the product.</p>
          <div className="row" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn ghost" onClick={() => setInv(false)}>Cancel</button><button className="btn cta">Send invite</button></div>
        </form>
      </Modal>}
    </>
  )
}
