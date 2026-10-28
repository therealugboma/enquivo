import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { useApp, PageHead } from './Layout'
import { updateWs, usePref, setPref } from '../../lib/store'
import { Badge, Icon } from '../../components/ui'
import type { Profile, WidgetCfg } from '../../lib/types'

export default function Settings() {
  const { ws, wsId } = useApp()
  const [tab, setTab] = useState<'widget' | 'profile' | 'channels' | 'ai'>('widget')
  const [p, setP] = useState<Profile>(ws.profile)
  const [w, setW] = useState<WidgetCfg>(ws.widget)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qr, setQr] = useState('')
  const key = usePref('openaiKey', '')
  const hosted = `${location.origin}${location.pathname}#/e/${ws.profile.slug}`
  useEffect(() => { setP(ws.profile); setW(ws.widget) }, [wsId]) // eslint-disable-line
  useEffect(() => { QRCode.toDataURL(hosted, { margin: 1, width: 240, color: { dark: '#08080a', light: '#ffffff' } }).then(setQr).catch(() => {}) }, [hosted])
  const embed = `<!-- Enquivo website widget · ${ws.profile.name} -->
<script src="https://cdn.enquivo.app/widget.js"
  data-workspace="ws_${ws.id}_live"
  data-position="${w.position}"
  data-accent="${w.accent}"
  async></script>`
  const save = () => { updateWs(wsId, x => { x.profile = p; x.widget = w }); setSaved(true); setTimeout(() => setSaved(false), 1600) }
  return (
    <>
      <PageHead label="Workspace" title="Settings">
        <div className="tabs">{([['widget', 'Widget & embed'], ['profile', 'Business profile'], ['channels', 'Channels'], ['ai', 'AI']] as const).map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
        {(tab === 'widget' || tab === 'profile') && <button className="btn cta sm" onClick={save}>{saved ? 'Saved ✓' : 'Save changes'}</button>}
      </PageHead>
      {tab === 'widget' && <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', alignItems: 'start' }}>
        <div className="stack" style={{ gap: 16 }}>
          <div className="card stack">
            <span className="label">Customise</span>
            <label className="field"><span>Assistant name</span><input className="input" value={w.title} onChange={e => setW({ ...w, title: e.target.value })} /></label>
            <label className="field"><span>Greeting</span><textarea className="textarea" value={w.greeting} onChange={e => setW({ ...w, greeting: e.target.value })} /></label>
            <label className="field"><span>Quick replies (comma separated)</span><input className="input" value={w.quickReplies.join(', ')} onChange={e => setW({ ...w, quickReplies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></label>
            <div className="grid g3">
              <label className="field"><span>Bubble colour</span><select className="select" value={w.accent} onChange={e => setW({ ...w, accent: e.target.value as any })}><option value="ink">Ink</option><option value="red">VUG red</option></select></label>
              <label className="field"><span>Position</span><select className="select" value={w.position} onChange={e => setW({ ...w, position: e.target.value as any })}><option value="right">Bottom right</option><option value="left">Bottom left</option></select></label>
              <label className="field"><span>Ask for details</span><select className="select" value={w.captureMode} onChange={e => setW({ ...w, captureMode: e.target.value as any })}><option value="smart">When there's intent</option><option value="early">After first answer</option></select></label>
            </div>
          </div>
          <div className="card" data-testid="embed">
            <div className="spread"><span className="label">Install on your website</span><button className="btn ghost sm" onClick={() => { navigator.clipboard?.writeText(embed).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>{copied ? 'Copied ✓' : 'Copy code'}</button></div>
            <p className="small muted" style={{ marginTop: 6 }}>Paste before <span className="mono">&lt;/body&gt;</span> on every page. Works with WordPress, Wix, Shopify and hand-built sites.</p>
            <pre className="mono" style={{ background: 'var(--inv-bg)', color: 'var(--inv-ink)', padding: 18, borderRadius: 16, fontSize: 12.5, overflowX: 'auto', marginTop: 12, lineHeight: 1.6 }}>{embed}</pre>
            <p className="xs muted" style={{ marginTop: 8 }}>Illustrative snippet — the CDN is not live in this demo.</p>
          </div>
        </div>
        <div className="card" style={{ position: 'sticky', top: 16 }}>
          <span className="label">Live preview</span>
          <div style={{ marginTop: 14, background: 'var(--bg)', borderRadius: 22, padding: 18, minHeight: 420, position: 'relative' }} className="dots">
            <div style={{ width: 300, marginLeft: w.position === 'left' ? 0 : 'auto', background: 'var(--card)', borderRadius: 22, boxShadow: 'var(--pop)', overflow: 'hidden' }}>
              <div className="ew-head" style={{ padding: 14 }}><div className="av ink">{ws.profile.name.split(' ').map(x => x[0]).join('').slice(0, 2)}</div><div><div style={{ fontWeight: 500, fontSize: 14 }}>{w.title}</div><div className="xs muted row" style={{ gap: 6 }}><span className="pulse" />Answers instantly</div></div></div>
              <div style={{ padding: 14 }} className="stack"><div className="msg b" style={{ background: 'var(--bg)', border: 0, maxWidth: '100%', fontSize: 13 }}>{w.greeting}</div><div className="row wrap" style={{ gap: 6 }}>{w.quickReplies.map(c => <span key={c} className="chip" style={{ height: 28, fontSize: 12 }}>{c}</span>)}</div></div>
            </div>
            <div style={{ width: 54, height: 54, borderRadius: 999, background: w.accent === 'red' ? 'var(--acc)' : 'var(--ink)', color: '#fff', display: 'grid', placeItems: 'center', marginTop: 14, marginLeft: w.position === 'left' ? 0 : 'auto', boxShadow: 'var(--float)' }}><Icon n="chat" s={24} /></div>
          </div>
        </div>
      </div>}
      {tab === 'profile' && <div className="card stack" style={{ maxWidth: 820 }}>
        <span className="label">Business profile · used by the assistant and on quotations</span>
        <div className="grid g2"><label className="field"><span>Business name</span><input className="input" value={p.name} onChange={e => setP({ ...p, name: e.target.value })} /></label><label className="field"><span>Legal name</span><input className="input" value={p.legalName} onChange={e => setP({ ...p, legalName: e.target.value })} /></label></div>
        <div className="grid g3"><label className="field"><span>Website</span><input className="input" value={p.website} onChange={e => setP({ ...p, website: e.target.value })} /></label><label className="field"><span>Phone</span><input className="input" value={p.phone} onChange={e => setP({ ...p, phone: e.target.value })} /></label><label className="field"><span>WhatsApp number (intl, digits)</span><input className="input" value={p.whatsapp} onChange={e => setP({ ...p, whatsapp: e.target.value })} /></label></div>
        <div className="grid g3"><label className="field"><span>Email</span><input className="input" value={p.email} onChange={e => setP({ ...p, email: e.target.value })} /></label><label className="field"><span>Hosted page slug</span><input className="input mono" value={p.slug} onChange={e => setP({ ...p, slug: e.target.value })} /></label><label className="field"><span>VAT %</span><input type="number" className="input" value={p.vatRate} onChange={e => setP({ ...p, vatRate: +e.target.value })} /></label></div>
        <label className="field"><span>Opening hours</span><input className="input" value={p.hours} onChange={e => setP({ ...p, hours: e.target.value })} /></label>
        <label className="field"><span>Showrooms / locations (comma separated)</span><input className="input" value={p.showrooms.join(', ')} onChange={e => setP({ ...p, showrooms: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></label>
        <label className="field"><span>Tagline</span><input className="input" value={p.tagline} onChange={e => setP({ ...p, tagline: e.target.value })} /></label>
      </div>}
      {tab === 'channels' && <div className="grid g2">
        <div className="card"><div className="spread"><h3>Website widget</h3><Badge kind="ok">Live</Badge></div><p className="small muted" style={{ marginTop: 8 }}>On {ws.profile.website}. Conversations arrive in the inbox and create leads automatically.</p></div>
        <div className="card"><div className="spread"><h3>Hosted enquiry page</h3><Badge kind="ok">Live</Badge></div><div className="row" style={{ marginTop: 10, alignItems: 'flex-start' }}><div style={{ flex: 1 }}><p className="small muted">Share on Instagram, WhatsApp status, flyers and showroom QR codes.</p><a className="link small mono" href={hosted} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: 10, wordBreak: 'break-all' }}>/e/{ws.profile.slug}</a></div>{qr && <img src={qr} alt="QR code for hosted page" width={110} height={110} style={{ borderRadius: 12 }} />}</div></div>
        <div className="card"><div className="spread"><h3>WhatsApp Business Platform</h3><Badge kind="warn">Coming soon</Badge></div><p className="small muted" style={{ marginTop: 8 }}>Today: one-tap "Continue on WhatsApp" with the enquiry summary pre-filled. Next: a shared WhatsApp inbox inside Enquivo via the official API.</p></div>
        <div className="card"><div className="spread"><h3>API & webhooks</h3><Badge kind="warn">Coming soon</Badge></div><p className="small muted" style={{ marginTop: 8 }}>Send <span className="mono">lead.created</span>, <span className="mono">quote.accepted</span> and <span className="mono">workorder.completed</span> events to your other tools.</p></div>
        <div className="card"><div className="spread"><h3>Email notifications</h3><Badge>Planned</Badge></div><p className="small muted" style={{ marginTop: 8 }}>A short alert to the assigned salesperson — without customer details in the email body.</p></div>
        <div className="card"><div className="spread"><h3>Instagram & Facebook</h3><Badge>Planned</Badge></div><p className="small muted" style={{ marginTop: 8 }}>Bring DMs into the same inbox.</p></div>
      </div>}
      {tab === 'ai' && <div className="card stack" style={{ maxWidth: 720 }}>
        <span className="label">Assistant engine</span>
        <div className="row" style={{ gap: 10 }}><Badge kind={key ? 'blue' : 'ok'}>{key ? 'Offline engine + OpenAI fallback' : 'Offline engine (default)'}</Badge></div>
        <p className="small muted">This demo answers with a built-in matching engine over your knowledge base — no paid AI required, works offline. Optionally, add an OpenAI key and the assistant will use it only for questions the engine can't match, still grounded in your approved information.</p>
        <label className="field"><span>OpenAI API key (optional · stored only in this browser)</span><input className="input mono" type="password" placeholder="sk-…" value={key} onChange={e => setPref('openaiKey', e.target.value.trim())} /></label>
        <p className="xs muted">For private local demos only — in the product, keys are held server-side and never reach the browser.</p>
      </div>}
    </>
  )
}
