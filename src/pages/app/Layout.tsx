import { useEffect, useRef, useState, createContext, useContext } from 'react'
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useWs, useActive, setActive, WS_IDS, getWs, updateWs, resetDemo, usePref, setPref } from '../../lib/store'
import type { Workspace, Lead } from '../../lib/types'
import { Icon, Mark, Modal } from '../../components/ui'
import { ago, today, initials } from '../../lib/fmt'

export const WsCtx = createContext<{ ws: Workspace; wsId: string; me: Workspace['staff'][number]; leads: Lead[] }>(null as any)
export const useApp = () => useContext(WsCtx)
export function visibleLeads(ws: Workspace) {
  const me = ws.staff.find(s => s.id === ws.currentUser)
  return me?.role === 'Salesperson' ? ws.leads.filter(l => l.assignee === me.id) : ws.leads
}

interface Toast { id: string; title: string; body: string; to: string }

export default function Layout() {
  const wsId = useActive()
  const ws = useWs(wsId)
  const me = ws.staff.find(s => s.id === ws.currentUser) || ws.staff[0]
  const leads = visibleLeads(ws)
  const [menu, setMenu] = useState(false)
  const [bell, setBell] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const loc = useLocation(); const nav = useNavigate()
  const seenAt = Number(usePref('seenAt.' + wsId, '0'))
  useEffect(() => { setDrawer(false); setBell(false); setMenu(false) }, [loc.pathname])

  // live watcher → toasts
  const known = useRef<{ ws: string; leads: Set<string>; msgs: Map<string, number> } | null>(null)
  useEffect(() => {
    const k = known.current
    const msgs = new Map(ws.conversations.map(c => [c.id, c.messages.filter(m => m.from === 'visitor').length]))
    if (!k || k.ws !== wsId) { known.current = { ws: wsId, leads: new Set(ws.leads.map(l => l.id)), msgs }; return }
    const add: Toast[] = []
    for (const l of ws.leads) if (!k.leads.has(l.id)) add.push({ id: l.id, title: 'New lead', body: `${l.name}${l.city && l.city !== '—' ? ' · ' + l.city : ''} — ${l.interest}`, to: `/app/leads/${l.id}` })
    for (const c of ws.conversations) {
      const prev = k.msgs.get(c.id) ?? 0, now = msgs.get(c.id)!
      if (now > prev && !add.length && c.status !== 'ai' && !add.some(a => a.id.startsWith(c.id))) { const last = [...c.messages].reverse().find(m => m.from === 'visitor'); add.push({ id: c.id + now, title: c.ctx.name ? `Message · ${c.ctx.name}` : 'New website visitor', body: last?.text.slice(0, 80) || '', to: `/app/inbox/${c.id}` }) }
    }
    known.current = { ws: wsId, leads: new Set(ws.leads.map(l => l.id)), msgs }
    if (add.length) {
      setToasts(t => [...add.slice(0, 2), ...t].slice(0, 3))
      add.forEach(a => setTimeout(() => setToasts(t => t.filter(x => x.id !== a.id)), 6500))
      try { const a = new AudioContext(); const o = a.createOscillator(); const g = a.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(.04, a.currentTime); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + .35); o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + .36) } catch { /* sound optional */ }
    }
  }, [ws, wsId])

  const unread = ws.conversations.filter(c => c.unread > 0 && (me.role !== 'Salesperson' || leads.some(l => l.id === c.leadId))).length
  const newLeads = leads.filter(l => l.stage === 'new').length
  const due = leads.filter(l => l.followUp && l.followUp <= today() && !['won', 'lost'].includes(l.stage)).length
  const notifs = [
    ...ws.conversations.filter(c => c.status === 'needs-human').map(c => ({ at: c.updatedAt, t: `${c.ctx.name || 'A visitor'} asked for a person`, to: `/app/inbox/${c.id}`, k: 'acc' })),
    ...leads.filter(l => l.stage === 'new').map(l => ({ at: l.createdAt, t: `New lead: ${l.name} · ${l.interest}`, to: `/app/leads/${l.id}`, k: '' })),
    ...leads.filter(l => l.followUp && l.followUp < today() && !['won', 'lost'].includes(l.stage)).map(l => ({ at: l.updatedAt, t: `Overdue follow-up: ${l.name}`, to: `/app/leads/${l.id}`, k: 'warn' })),
  ].sort((a, b) => b.at - a.at).slice(0, 8)
  const bellCount = notifs.filter(n => n.at > seenAt).length

  const nl = (to: string, icon: string, label: string, cnt?: number, neutral?: boolean) => (
    <NavLink to={to} end={to === '/app'} className={({ isActive }) => `navl ${isActive ? 'active' : ''}`} data-nav={label}>
      <Icon n={icon} />{label}{cnt ? <span className={`cnt ${neutral ? 'n' : ''}`}>{cnt}</span> : null}
    </NavLink>
  )
  return (
    <WsCtx.Provider value={{ ws, wsId, me, leads }}>
      <div className="app">
        {drawer && <div className="scrim" onClick={() => setDrawer(false)} />}
        <aside className={`side ${drawer ? 'open' : ''}`}>
          <div style={{ padding: '2px 6px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/" className="row" style={{ gap: 8, textDecoration: 'none' }}><Mark s={20} /><b style={{ fontWeight: 500 }}>Enquivo</b><small className="muted" style={{ fontSize: 11 }}>by VUG</small></Link>
          </div>
          <div className="wsw">
            <button onClick={() => setMenu(!menu)} data-testid="ws-switch">
              <span className={`wslogo ${wsId === 'kora' ? 'k' : ''}`}>{initials(ws.profile.name)}</span>
              <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>{ws.profile.name}</span><span className="xs muted">{ws.plan}</span></span>
              <Icon n="chev" />
            </button>
            {menu && <div className="menu">
              <div className="label" style={{ padding: '6px 8px' }}>Workspaces · data kept separate</div>
              {WS_IDS.map(id => { const w = getWs(id); return (
                <button key={id} onClick={() => { setActive(id); setMenu(false); nav('/app') }}>
                  <span className={`wslogo ${id === 'kora' ? 'k' : ''}`}>{initials(w.profile.name)}</span>
                  <span style={{ flex: 1 }}><span style={{ display: 'block', fontSize: 14 }}>{w.profile.name}</span><span className="xs muted">{w.leads.length} leads · {w.profile.industry.split('—')[0]}</span></span>
                  {id === wsId && <Icon n="check" />}
                </button>) })}
            </div>}
          </div>
          <div className="label grp">Workspace</div>
          {nl('/app', 'home', 'Overview')}
          {nl('/app/inbox', 'inbox', 'Inbox', unread)}
          {nl('/app/pipeline', 'pipe', 'Leads', newLeads, true)}
          {nl('/app/followups', 'clock', 'Follow-ups', due)}
          <div className="label grp">Sales & operations</div>
          {nl('/app/quotes', 'quote', 'Quotations')}
          {nl('/app/work-orders', 'wrench', 'Work orders')}
          {nl('/app/referrals', 'share', 'Referrals')}
          <div className="label grp">Setup</div>
          {nl('/app/knowledge', 'book', 'Knowledge base')}
          {nl('/app/team', 'users', 'Team')}
          {nl('/app/settings', 'gear', 'Settings')}
          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <div className="card" style={{ background: 'var(--bg)', padding: 12, borderRadius: 16 }}>
              <div className="label">Preview links</div>
              <Link className="link small" to={wsId === 'emrad' ? '/site/emrad' : `/e/${ws.profile.slug}`} target="_blank" style={{ display: 'block', marginTop: 8 }}>{wsId === 'emrad' ? 'Website + widget ↗' : 'Hosted page ↗'}</Link>
              <Link className="link small" to={`/e/${ws.profile.slug}`} target="_blank" style={{ display: 'block', marginTop: 4 }}>/e/{ws.profile.slug} ↗</Link>
              <button className="small muted" style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center' }} onClick={() => setConfirmReset(true)} data-testid="reset"><Icon n="refresh" s={13} />Reset demo data</button>
            </div>
          </div>
        </aside>
        <main className="main">
          <div className="topbar noprint" style={{ justifyContent: 'flex-end' }}>
            <button className="bell mobnav" style={{ marginRight: 'auto' }} onClick={() => setDrawer(true)} aria-label="Menu"><Icon n="menu" /></button>
            <label className="row small" style={{ gap: 8 }} title="Switch user to see role-based views">
              <span className="label">Viewing as</span>
              <select className="select" style={{ minHeight: 36, height: 36, padding: '0 10px', width: 'auto', borderRadius: 999, background: 'var(--card)', border: 0 }} value={me.id} onChange={e => updateWs(wsId, w => { w.currentUser = e.target.value })}>
                {ws.staff.map(s => <option key={s.id} value={s.id}>{s.name} · {s.role}</option>)}
              </select>
            </label>
            <div style={{ position: 'relative' }}>
              <button className="bell" onClick={() => { setBell(!bell); setPref('seenAt.' + wsId, String(Date.now())) }} aria-label="Notifications" data-testid="bell"><Icon n="bell" />{bellCount > 0 && <i>{bellCount}</i>}</button>
              {bell && <div className="pop">
                <div className="label" style={{ padding: '8px 10px' }}>Notifications</div>
                {notifs.length ? notifs.map((n, i) => <Link key={i} to={n.to}><span className={`badge ${n.k}`} style={{ padding: '0 6px' }} /><span style={{ flex: 1 }}>{n.t}<span className="xs muted" style={{ display: 'block' }}>{ago(n.at)}</span></span></Link>) : <div className="empty">All caught up.</div>}
              </div>}
            </div>
            <div className="av ink" title={me.name}>{initials(me.name)}</div>
          </div>
          {me.role === 'Salesperson' && <div className="card tight row small" style={{ padding: '10px 16px', gap: 10 }}><span className="badge blue">Salesperson view</span>You're seeing only leads assigned to {me.name.split(' ')[0]}. Permissions are enforced per role.</div>}
          <Outlet />
        </main>
        <div className="toasts">{toasts.map(t => <Link key={t.id} to={t.to} className="toast" onClick={() => setToasts(x => x.filter(y => y.id !== t.id))}><span className="dot-red" style={{ marginTop: 6 }} /><span><span className="label">{t.title}</span><p>{t.body}</p></span></Link>)}</div>
        {confirmReset && <Modal onClose={() => setConfirmReset(false)}>
          <span className="label">Reset demo data</span>
          <h2 style={{ marginTop: 10 }}>Start the demo fresh?</h2>
          <p className="muted" style={{ marginTop: 8 }}>This clears every change in this browser and restores the sample data for both workspaces.</p>
          <div className="row" style={{ marginTop: 20, justifyContent: 'flex-end' }}><button className="btn ghost" onClick={() => setConfirmReset(false)}>Cancel</button><button className="btn cta" onClick={() => { resetDemo(); setConfirmReset(false); nav('/app') }}>Reset data</button></div>
        </Modal>}
      </div>
    </WsCtx.Provider>
  )
}

export function PageHead({ title, label, children }: { title: string; label?: string; children?: React.ReactNode }) {
  return <div className="spread" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}><div>{label && <span className="label">{label}</span>}<h1 style={{ fontSize: 30, lineHeight: 1.15, marginTop: label ? 6 : 0, maxWidth: 'none' }}>{title}</h1></div><div className="row wrap">{children}</div></div>
}
