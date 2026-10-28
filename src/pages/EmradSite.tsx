import { Link } from 'react-router-dom'
import { useWs } from '../lib/store'
import ChatWidget from '../components/ChatWidget'
import { naira } from '../lib/fmt'

export function TableArt({ cloth = '#1f6b4a', wood = '#5a3220', w = 520 }: { cloth?: string; wood?: string; w?: number }) {
  const balls = [[300, 120, '#f2c94c'], [318, 110, '#d5001c'], [318, 130, '#2d4fa0'], [336, 100, '#111'], [336, 120, '#e07a1f'], [336, 140, '#6b2a8c'], [140, 120, '#fafafa']]
  return (
    <svg viewBox="0 0 440 240" width="100%" style={{ maxWidth: w, filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.35))' }} aria-label="Illustration of a pool table">
      <rect x="4" y="4" width="432" height="232" rx="22" fill={wood} />
      <rect x="12" y="12" width="416" height="216" rx="16" fill="none" stroke="rgba(255,255,255,.12)" />
      <rect x="30" y="30" width="380" height="180" rx="6" fill={cloth} />
      <rect x="30" y="30" width="380" height="180" rx="6" fill="url(#sheen)" />
      <defs><radialGradient id="sheen" cx="50%" cy="45%" r="65%"><stop offset="0" stopColor="#fff" stopOpacity=".14" /><stop offset="1" stopColor="#000" stopOpacity=".18" /></radialGradient></defs>
      {[[30, 30], [220, 26], [410, 30], [30, 210], [220, 214], [410, 210]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="11" fill="#0b0b0b" />)}
      <line x1="130" y1="30" x2="130" y2="210" stroke="rgba(255,255,255,.18)" />
      {balls.map(([x, y, c], i) => <circle key={i} cx={x as number} cy={y as number} r="8" fill={c as string} stroke="rgba(0,0,0,.25)" />)}
      <line x1="40" y1="160" x2="132" y2="124" stroke="#d9b98c" strokeWidth="4" strokeLinecap="round" />
      {[80, 150, 290, 360].map(x => <circle key={x} cx={x} cy="17" r="2.5" fill="#e8d6b0" />)}
    </svg>
  )
}

export default function EmradSite() {
  const ws = useWs('emrad')
  const tables = ws.products.filter(p => p.category.includes('tables'))
  const G = '#0f3d2e'
  return (
    <div style={{ background: '#f7f5f0', minHeight: '100vh', color: '#1b1b1b' }}>
      <div className="noprint" style={{ background: 'var(--inv-bg)', color: 'var(--inv-ink3)', fontSize: 12.5, padding: '8px 16px', display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span><span className="label" style={{ color: 'var(--inv-acc)' }}>Demo</span> &nbsp;A mock customer website for Emerald Billiards (sample data). The chat bubble is Enquivo.</span>
        <Link to="/app/inbox" target="_blank" style={{ color: '#fff' }}>Open dashboard in new tab ↗</Link>
        <Link to="/" style={{ color: 'var(--inv-mut)' }}>Enquivo home</Link>
      </div>
      <header style={{ background: G, color: '#fff' }}>
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: '#3fae7a', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13, color: G }}>E</div>
            <div style={{ lineHeight: 1.1 }}><div style={{ fontWeight: 600, letterSpacing: '.12em', fontSize: 14 }}>EMRAD</div><div style={{ fontSize: 11, opacity: .7 }}>Emerald Billiards</div></div>
          </div>
          <nav className="emnav" style={{ display: 'flex', gap: 24, fontSize: 14, opacity: .9 }}><a href="#tables">Tables</a><a href="#acc">Accessories</a><a href="#showrooms">Showrooms</a><a href="#tables">Custom builds</a></nav>
          <a href="#showrooms" style={{ fontSize: 13, border: '1px solid rgba(255,255,255,.35)', borderRadius: 999, padding: '8px 14px', textDecoration: 'none' }}>+234 800 000 0000</a>
        </div>
      </header>
      <section style={{ background: `linear-gradient(180deg, ${G}, #0b2c21)`, color: '#fff' }}>
        <div className="wrap em-hero">
          <div>
            <div style={{ fontSize: 12, letterSpacing: '.18em', opacity: .7, textTransform: 'uppercase' }}>Made in Nigeria · since 2012 (sample)</div>
            <h1 style={{ fontWeight: 500, marginTop: 14, fontSize: 'clamp(34px,4.4vw,56px)', lineHeight: 1.05 }}>Snooker & pool tables, built to last a lifetime.</h1>
            <p style={{ opacity: .8, marginTop: 16, maxWidth: '46ch', fontSize: 16 }}>Solid hardwood bodies. Wood or marble playing beds. Delivered and levelled in your home, club or hotel.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 26, flexWrap: 'wrap' }}>
              <a href="#tables" style={{ background: '#3fae7a', color: G, padding: '13px 22px', borderRadius: 999, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>Browse tables</a>
              <a href="#showrooms" style={{ border: '1px solid rgba(255,255,255,.4)', padding: '13px 22px', borderRadius: 999, textDecoration: 'none', fontSize: 14 }}>Visit a showroom</a>
            </div>
          </div>
          <div style={{ display: 'grid', placeItems: 'center' }}><TableArt /></div>
        </div>
      </section>
      <section id="tables" className="wrap" style={{ padding: '56px 16px' }}>
        <h2 style={{ fontWeight: 500 }}>Our tables</h2>
        <p style={{ color: '#666', marginTop: 6 }}>Prices shown are examples for this demo.</p>
        <div className="grid g3" style={{ marginTop: 22 }}>
          {tables.map((p, i) => (
            <div key={p.id} style={{ background: '#fff', borderRadius: 18, padding: 18, border: '1px solid #ebe7de' }}>
              <div style={{ background: i % 2 ? '#eef3ef' : '#f3efe8', borderRadius: 12, padding: 18 }}><TableArt cloth={['#1f6b4a', '#24508f', '#1f6b4a', '#6b1f2e', '#1f6b4a', '#2f3b46'][i]} wood={['#7a4a2a', '#4a2a18', '#5a3220', '#3a2216', '#7a4a2a', '#4a2a18'][i]} /></div>
              <div style={{ fontWeight: 600, marginTop: 14 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{p.size} · {p.bed}</div>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 600, color: G }} className="num">{naira(p.price)}</span><span style={{ fontSize: 11, color: '#999' }}>example price</span></div>
            </div>
          ))}
        </div>
      </section>
      <section id="acc" style={{ background: '#efebe3' }}>
        <div className="wrap" style={{ padding: '48px 16px' }}>
          <h2 style={{ fontWeight: 500 }}>Accessories & services</h2>
          <div className="grid g4" style={{ marginTop: 18 }}>
            {ws.products.filter(p => !p.category.includes('tables')).slice(0, 8).map(p => <div key={p.id} style={{ background: '#fff', borderRadius: 14, padding: 16 }}><div style={{ fontWeight: 500, fontSize: 14 }}>{p.name}</div><div style={{ fontSize: 13, color: G, marginTop: 6 }}>{naira(p.price)}</div></div>)}
          </div>
        </div>
      </section>
      <section id="showrooms" className="wrap" style={{ padding: '56px 16px 120px' }}>
        <h2 style={{ fontWeight: 500 }}>Showrooms</h2>
        <p style={{ color: '#666', marginTop: 6 }}>{ws.profile.hours}</p>
        <div className="grid g4" style={{ marginTop: 18 }}>
          {ws.profile.showrooms.map(s => <div key={s} style={{ background: '#fff', borderRadius: 14, padding: 18, border: '1px solid #ebe7de' }}><div style={{ fontWeight: 600 }}>{s}</div><div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Sample address · Play before you buy</div></div>)}
        </div>
      </section>
      <footer style={{ background: G, color: 'rgba(255,255,255,.7)', fontSize: 13, padding: '24px 16px', textAlign: 'center' }}>© Emerald Billiards (EMRAD) — fictional sample site for an Enquivo demo · emrad.ng</footer>
      <ChatWidget wsId="emrad" page="emrad.ng/tables" />
    </div>
  )
}
