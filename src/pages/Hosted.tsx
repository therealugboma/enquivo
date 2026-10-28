import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useWs, wsBySlug, updateWs } from '../lib/store'
import { submitForm } from '../lib/chat'
import ChatWidget from '../components/ChatWidget'
import { Mark, Icon, ctaMove } from '../components/ui'
import { waLink } from '../lib/engine'

export default function HostedRoute() {
  const { slug = '' } = useParams()
  const id = wsBySlug(slug)
  if (!id) return <div className="wrap" style={{ padding: 80 }}><h2>No enquiry page at /e/{slug}</h2><p className="muted" style={{ marginTop: 8 }}>Try <Link className="link" to="/e/emrad">/e/emrad</Link> or <Link className="link" to="/e/kora">/e/kora</Link>.</p></div>
  return <Hosted wsId={id} />
}

function Hosted({ wsId }: { wsId: string }) {
  const ws = useWs(wsId)
  const [sp] = useSearchParams()
  const ref = (sp.get('ref') || sessionStorage.getItem('enquivo.ref.' + wsId) || '').toUpperCase() || undefined
  const referrer = ws.referrers.find(r => r.code === ref)
  const [tab, setTab] = useState<'chat' | 'form'>('chat')
  const [sent, setSent] = useState(false)
  const [f, setF] = useState({ name: '', phone: '', city: '', interest: ws.products[0]?.name || '', budget: '', message: '' })

  useEffect(() => {
    if (!ref) return
    sessionStorage.setItem('enquivo.ref.' + wsId, ref)
    const k = 'enquivo.refclick.' + wsId + ref
    if (!sessionStorage.getItem(k) && referrer) { sessionStorage.setItem(k, '1'); updateWs(wsId, w => { const r = w.referrers.find(r => r.code === ref); if (r) r.clicks = (r.clicks || 0) + 1 }) }
  }, [ref, wsId, referrer])

  const initials = ws.profile.name.split(' ').map(w => w[0]).join('').slice(0, 2)
  return (
    <div className="hosted dots">
      <div className="h-info">
        <div className="row" style={{ gap: 12 }}>
          <div className="av ink lg">{initials}</div>
          <div><div style={{ fontSize: 20, fontWeight: 500 }}>{ws.profile.name}</div><div className="small muted">{ws.profile.tagline}</div></div>
        </div>
        {referrer && <div className="card tight" style={{ marginTop: 18, display: 'flex', gap: 10, alignItems: 'center', padding: 14 }}><span className="badge ok">Referred</span><span className="small">You were invited by <b style={{ fontWeight: 500 }}>{referrer.name}</b></span></div>}
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', marginTop: 26 }}>Ask us anything. We reply in seconds.</h1>
        <p className="lead" style={{ marginTop: 10 }}>Chat with our assistant about tables, sizes, prices, delivery and showroom visits — or leave your details and a person will call you.</p>
        <div className="grid g2 h-facts" style={{ marginTop: 22, gap: 10 }}>
          <div className="card tight"><span className="label">Hours</span><p className="small" style={{ marginTop: 6 }}>{ws.profile.hours}</p></div>
          <div className="card tight"><span className="label">Showrooms</span><p className="small" style={{ marginTop: 6 }}>{ws.profile.showrooms.join(' · ')}</p></div>
        </div>
        <div className="row wrap h-btns" style={{ marginTop: 18 }}>
          <a className="btn glass sm" href={`tel:${ws.profile.phone.replace(/\s/g, '')}`}><Icon n="phone" s={14} />Call {ws.profile.phone}</a>
          <a className="btn glass sm" href={waLink(ws, { ref })} target="_blank" rel="noreferrer">WhatsApp us</a>
        </div>
        <div className="label row h-power" style={{ marginTop: 'auto', paddingTop: 28, gap: 8 }}><Mark s={14} />Powered by Enquivo · Every enquiry deserves a response.</div>
      </div>
      <div className="h-chat">
        <div className="tabs" style={{ marginBottom: 12 }}>
          <button className={tab === 'chat' ? 'on' : ''} onClick={() => setTab('chat')}>Chat with assistant</button>
          <button className={tab === 'form' ? 'on' : ''} onClick={() => setTab('form')}>Prefer a form</button>
        </div>
        {tab === 'chat' ? <div className="h-chatbox"><ChatWidget wsId={wsId} mode="embedded" channel="Hosted page" page={`/e/${ws.profile.slug}`} refCode={referrer ? ref : undefined} /></div> : (
          <div className="card">
            {sent ? <div className="stack" style={{ alignItems: 'flex-start' }}><span className="badge ok">Received</span><h2>Thank you, {f.name.split(' ')[0]}.</h2><p className="muted">Our team will contact you on {f.phone} shortly.</p><button className="btn ghost sm" onClick={() => { setSent(false); setF({ ...f, name: '', phone: '', message: '' }) }}>Send another</button></div> : (
              <form className="stack" style={{ gap: 14 }} onSubmit={e => { e.preventDefault(); submitForm(wsId, { ...f, ref: referrer ? ref : undefined }); setSent(true) }}>
                <span className="label">Your enquiry · we'll call you back</span>
                <div className="grid g2"><label className="field"><span>Name *</span><input required className="input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></label>
                  <label className="field"><span>Phone / WhatsApp *</span><input required className="input" placeholder="+234 800 000 0000" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></label></div>
                <div className="grid g2"><label className="field"><span>City *</span><input required className="input" value={f.city} onChange={e => setF({ ...f, city: e.target.value })} /></label>
                  <label className="field"><span>Budget</span><select className="select" value={f.budget} onChange={e => setF({ ...f, budget: e.target.value })}><option value="">Not sure</option><option>Under ₦2m</option><option>₦2m – ₦4m</option><option>Above ₦4m</option></select></label></div>
                <label className="field"><span>Interested in</span><select className="select" value={f.interest} onChange={e => setF({ ...f, interest: e.target.value })}>{ws.products.map(p => <option key={p.id}>{p.name}</option>)}</select></label>
                <label className="field"><span>Message</span><textarea className="textarea" value={f.message} onChange={e => setF({ ...f, message: e.target.value })} /></label>
                <p className="xs muted">We use these details only to respond to your enquiry.</p>
                <button className="btn cta" onMouseMove={ctaMove}>Send enquiry ↗</button>
              </form>)}
          </div>)}
      </div>
    </div>
  )
}
