import { Link } from 'react-router-dom'
import { Lockup, Icon, Mark, ctaMove } from '../components/ui'

const steps = [
  ['01', 'A customer asks', 'On your website, a shared link or a QR code. Any hour.'],
  ['02', 'Enquivo answers', 'Using only the information your business has approved.'],
  ['03', 'Details are collected', 'Name, number, city, interest and budget — with permission.'],
  ['04', 'A lead is created', 'Routed to the right person, with a short summary.'],
  ['05', 'Work gets done', 'Follow-ups, quotations and work orders, tracked to delivery.'],
]
const features = [
  ['Business-specific assistant', 'Trained on your products, prices, policies and hours. It says so when it doesn\'t know.'],
  ['Automatic lead capture', 'Every conversation becomes a structured record, not a lost chat.'],
  ['Pipeline & follow-ups', 'New → Contacted → Quoted → Won. Reminders for anything that goes quiet.'],
  ['Quotations', 'Build itemised quotes from your catalogue, with VAT and delivery, in a minute.'],
  ['Quote-to-operations', 'An accepted quote becomes a work order your workshop can follow.'],
  ['Referral tracking', 'Links for staff, distributors and partners. Clear ownership, fair commission.'],
  ['Team workspaces', 'Owners, managers, sales and operations — each sees what they should.'],
  ['Human handoff', 'One tap to a person, or continue on WhatsApp with the summary pre-filled.'],
]
const tiers = [
  { n: 'Starter', p: '₦25,000', d: 'For a single shop or service.', f: ['1 workspace · 2 team members', '500 AI conversations / month', 'Website widget + hosted page', 'Leads & follow-ups'] },
  { n: 'Growth', p: '₦65,000', d: 'For teams with a sales process.', f: ['Up to 10 team members', '3,000 AI conversations / month', 'Quotations & referral links', 'Pipeline analytics'], hot: true },
  { n: 'Business', p: '₦150,000', d: 'For makers and multi-branch teams.', f: ['Unlimited team members', '10,000 AI conversations / month', 'Work orders & custom stages', 'API, webhooks, priority support'] },
]

export default function Landing() {
  return (
    <div className="dots" style={{ minHeight: '100vh' }}>
      <header className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 16px' }}>
        <Lockup />
        <div className="island" style={{ fontSize: 13 }}><span className="label" style={{ color: 'rgba(255,255,255,.6)' }}>Now</span> Product demo <span style={{ width: 4 }} /></div>
        <Link className="btn cta sm" to="/app" onMouseMove={ctaMove}>Open dashboard</Link>
      </header>

      <section className="wrap hero-grid">
        <div className="stack" style={{ gap: 22 }}>
          <span className="label">VUG Products · Enquivo</span>
          <h1>Every enquiry deserves a response.</h1>
          <p className="lead">Enquivo answers your customers with your own approved information, collects what your team needs, and turns each conversation into a lead, a follow-up, a quotation — and the work that follows.</p>
          <div className="row wrap" style={{ marginTop: 6 }}>
            <Link to="/site/emrad" className="btn cta big" onMouseMove={ctaMove} data-testid="see-demo">See the live demo ↗</Link>
            <a href="#how" className="btn glass">How it works</a>
          </div>
          <div className="row wrap small muted" style={{ gap: 16 }}><span className="badge ok">Widget live</span><span className="badge">Hosted page</span><span className="badge warn">WhatsApp · coming soon</span></div>
        </div>
        <HeroPreview />
      </section>

      <section className="wrap" style={{ padding: '24px 16px 56px' }}>
        <div className="grid g2">
          <div className="card"><span className="label">The usual way</span><p style={{ marginTop: 14, fontSize: 18, lineHeight: 1.5, color: 'var(--ink-3)' }}>The same questions answered by hand. Numbers in a notebook. Quotes typed from scratch. Follow-ups that depend on someone remembering.</p></div>
          <div className="card"><span className="label acc">The Enquivo way</span><p style={{ marginTop: 14, fontSize: 18, lineHeight: 1.5 }}>Customers get an answer in seconds. Your team gets a clear record, an owner and a next step — from first question to delivery.</p></div>
        </div>
      </section>

      <section id="how" className="wrap" style={{ padding: '24px 16px 56px' }}>
        <span className="label">How it works</span>
        <h2 style={{ margin: '10px 0 24px' }}>From first question to finished job.</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))' }}>
          {steps.map(([n, t, d]) => <div key={n} className="card tight"><span className="label">{n}</span><h3 style={{ marginTop: 18 }}>{t}</h3><p className="small muted" style={{ marginTop: 6 }}>{d}</p></div>)}
        </div>
      </section>

      <section className="wrap" style={{ padding: '24px 16px 56px' }}>
        <span className="label">What's inside</span>
        <h2 style={{ margin: '10px 0 24px' }}>Not just a chatbot. A way of working.</h2>
        <div className="grid g4">
          {features.map(([t, d]) => <div key={t} className="card tight"><h3>{t}</h3><p className="small muted" style={{ marginTop: 8 }}>{d}</p></div>)}
        </div>
      </section>

      <section className="wrap" style={{ padding: '24px 16px 56px' }}>
        <span className="label">Three ways to install</span>
        <div className="grid g3" style={{ marginTop: 18 }}>
          <div className="card"><span className="badge ok">Live in demo</span><h3 style={{ marginTop: 16 }}>Website widget</h3><p className="small muted" style={{ marginTop: 6 }}>Paste one line of script. The assistant appears on your existing site.</p><Link className="link small" to="/site/emrad" style={{ display: 'inline-block', marginTop: 14 }}>Open EMRAD site →</Link></div>
          <div className="card"><span className="badge ok">Live in demo</span><h3 style={{ marginTop: 16 }}>Hosted enquiry page</h3><p className="small muted" style={{ marginTop: 6 }}>No website? Share a link on WhatsApp, Instagram or a QR code.</p><Link className="link small" to="/e/emrad?ref=PH-CLUB" style={{ display: 'inline-block', marginTop: 14 }}>Open /e/emrad →</Link></div>
          <div className="card"><span className="badge warn">Planned</span><h3 style={{ marginTop: 16 }}>APIs & webhooks</h3><p className="small muted" style={{ marginTop: 6 }}>Connect online stores, CRMs and internal tools when you're ready.</p></div>
        </div>
      </section>

      <section id="pricing" className="wrap" style={{ padding: '24px 16px 72px' }}>
        <div className="spread"><span className="label">Pricing · example figures</span><span className="small muted">Monthly, excl. VAT. Free 14-day trial.</span></div>
        <div className="grid g3" style={{ marginTop: 18 }}>
          {tiers.map(t => (
            <div key={t.n} className={`card ${t.hot ? 'inv' : ''}`} style={t.hot ? { boxShadow: 'var(--panel)' } : undefined}>
              <div className="spread"><span className={`label ${t.hot ? 'acc' : ''}`}>{t.n}</span>{t.hot && <span className="badge acc">Most teams</span>}</div>
              <div style={{ fontSize: 36, marginTop: 18, letterSpacing: '-.02em' }} className="num">{t.p}<span className="small" style={{ color: 'var(--mut)' }}> /month</span></div>
              <p className="small" style={{ color: 'var(--mut)', marginTop: 4 }}>{t.d}</p>
              <div className="hr" />
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10, fontSize: 14 }}>{t.f.map(f => <li key={f} className="row" style={{ gap: 8 }}><Icon n="check" s={14} />{f}</li>)}</ul>
            </div>
          ))}
        </div>
        <p className="xs muted" style={{ marginTop: 12 }}>Prices are illustrative for this demo and not a commercial offer. Implementation and customisation available from VUG Solutions.</p>
      </section>

      <section className="inv" style={{ padding: '80px 16px' }}>
        <div className="wrap stack" style={{ alignItems: 'flex-start', gap: 18 }}>
          <span className="label acc">See it working</span>
          <h2 style={{ fontSize: 'var(--fs-h1)', lineHeight: 1.1, maxWidth: '18ch' }}>Ask the EMRAD assistant a question. Then watch it arrive.</h2>
          <p className="lead" style={{ color: 'var(--inv-ink3)' }}>Open the customer site in one tab and the dashboard in another. Enquiries appear live.</p>
          <div className="row wrap"><Link to="/site/emrad" className="btn cta big" onMouseMove={ctaMove}>See the live demo ↗</Link><Link to="/app" className="btn glass" style={{ color: 'var(--inv-ink)' }}>Open dashboard</Link></div>
        </div>
      </section>
      <footer className="inv" style={{ borderTop: '1px solid var(--inv-hl)', padding: '22px 16px' }}>
        <div className="wrap spread"><span className="label row" style={{ gap: 8 }}><span style={{ color: '#fff' }}><Mark s={16} /></span>Enquivo is a VUG Technology product</span><span className="label">Every enquiry deserves a response.</span></div>
      </footer>
    </div>
  )
}

function HeroPreview() {
  return (
    <div style={{ position: 'relative', minHeight: 420 }}>
      <div className="card" style={{ position: 'absolute', inset: '0 60px 60px 0', padding: 22, boxShadow: 'var(--pop)' }}>
        <div className="spread"><span className="label">EMRAD Assistant</span><span className="badge ok">Live</span></div>
        <div className="stack" style={{ marginTop: 16, gap: 8 }}>
          <div className="msg b" style={{ alignSelf: 'flex-start', background: 'var(--bg)', border: 0 }}>Hello 👋 What are you looking for?</div>
          <div className="msg a" style={{ alignSelf: 'flex-end' }}>Is marble better than wood for an 8ft pool table?</div>
          <div className="msg b" style={{ alignSelf: 'flex-start', background: 'var(--bg)', border: 0 }}>A marble bed stays flat for decades and rolls truer. The 8ft marble table is ₦2,900,000 (example). Shall I prepare a quote?</div>
          <div className="row" style={{ gap: 6 }}><span className="chip">Get a quote</span><span className="chip">Visit a showroom</span></div>
        </div>
      </div>
      <div className="card inv" style={{ position: 'absolute', right: 0, bottom: 0, width: 280, padding: 20, boxShadow: 'var(--panel)' }}>
        <div className="spread"><span className="label acc">New lead</span><span className="label">just now</span></div>
        <div style={{ fontSize: 18, marginTop: 10 }}>Chinedu O. · Lagos</div>
        <p className="small" style={{ color: 'var(--inv-ink3)', marginTop: 4 }}>8ft Pool Table — Marble bed · ₦2.5m – ₦3m</p>
        <div className="row" style={{ marginTop: 12, gap: 6 }}><span className="badge acc">Quote request</span><span className="badge">→ Ngozi</span></div>
      </div>
    </div>
  )
}
