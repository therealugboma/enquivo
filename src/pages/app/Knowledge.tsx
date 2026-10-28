import { useState } from 'react'
import { useApp, PageHead } from './Layout'
import { updateWs, uid } from '../../lib/store'
import { respond, type Reply } from '../../lib/engine'
import { naira } from '../../lib/fmt'
import { Icon, Modal } from '../../components/ui'
import type { KBEntry, Product, ConvCtx } from '../../lib/types'

export default function Knowledge() {
  const { ws, wsId } = useApp()
  const [tab, setTab] = useState<'qa' | 'products'>('qa')
  const [editQ, setEditQ] = useState<KBEntry | null>(null)
  const [editP, setEditP] = useState<Product | null>(null)
  const [q, setQ] = useState('')
  const [test, setTest] = useState('')
  const [log, setLog] = useState<{ q: string; r: Reply[] }[]>([])
  const [ctx, setCtx] = useState<ConvCtx>({})
  const run = (e: React.FormEvent) => { e.preventDefault(); if (!test.trim()) return; const r = respond(ws, ctx, test); setCtx({ ...r.ctx, capture: false, awaiting: null }); setLog([{ q: test, r: r.replies.filter(x => !/may I have your name|phone or WhatsApp/.test(x.text)) }, ...log].slice(0, 4)); setTest('') }
  const kb = ws.kb.filter(k => !q || `${k.question} ${k.answer} ${k.keywords.join(' ')}`.toLowerCase().includes(q.toLowerCase()))
  const saveQ = (k: KBEntry) => updateWs(wsId, w => { const i = w.kb.findIndex(x => x.id === k.id); if (i >= 0) w.kb[i] = k; else w.kb.push(k) })
  const saveP = (p: Product) => updateWs(wsId, w => { const i = w.products.findIndex(x => x.id === p.id); if (i >= 0) w.products[i] = p; else w.products.push(p) })
  return (
    <>
      <PageHead label="Assistant setup" title="Knowledge base">
        <div className="tabs"><button className={tab === 'qa' ? 'on' : ''} onClick={() => setTab('qa')}>Answers ({ws.kb.length})</button><button className={tab === 'products' ? 'on' : ''} onClick={() => setTab('products')}>Products & prices ({ws.products.length})</button></div>
        <button className="btn cta sm" onClick={() => tab === 'qa' ? setEditQ({ id: uid('kb'), topic: 'General', question: '', keywords: [], answer: '' }) : setEditP({ id: uid('p'), name: '', category: 'Accessories', price: 0, description: '', keywords: [] })}><Icon n="plus" s={14} />Add {tab === 'qa' ? 'answer' : 'product'}</button>
      </PageHead>
      <div className="grid kb-grid">
        <div className="stack" style={{ gap: 12 }}>
          <div className="card tight small row" style={{ gap: 12, padding: '14px 20px' }}><Icon n="book" /><p style={{ flex: 1 }}>The assistant answers <b style={{ fontWeight: 500 }}>only</b> from this approved information. When nothing matches, it says so and offers a person — it never guesses prices or policies.</p></div>
          {tab === 'qa' ? <>
            <input className="input" style={{ background: 'var(--card)', border: 0, borderRadius: 999 }} placeholder="Search answers" value={q} onChange={e => setQ(e.target.value)} />
            {kb.map(k => <div key={k.id} className="card tight" style={{ cursor: 'pointer' }} onClick={() => setEditQ(k)} data-testid="kb-item">
              <div className="spread"><span className="label">{k.topic}</span><span className="xs muted">Edit</span></div>
              <h3 style={{ marginTop: 8 }}>{k.question}</h3>
              <p className="small" style={{ marginTop: 6, color: 'var(--ink-3)' }}>{k.answer}</p>
              <div className="row wrap" style={{ gap: 4, marginTop: 10 }}>{k.keywords.slice(0, 8).map(w => <span key={w} className="badge" style={{ paddingLeft: 8 }}>{w}</span>)}</div>
            </div>)}
          </> : <div className="card flush"><table className="table"><thead><tr><th>Product</th><th>Category</th><th>Size · bed</th><th className="r">Price (example)</th></tr></thead><tbody>
            {ws.products.map(p => <tr key={p.id} className="click" onClick={() => setEditP(p)}><td>{p.name}<div className="xs muted" style={{ maxWidth: 340 }}>{p.description}</div></td><td className="small">{p.category}</td><td className="small">{p.size ? `${p.size} · ${p.bed}` : '—'}</td><td className="r num">{naira(p.price)}</td></tr>)}
          </tbody></table></div>}
        </div>
        <div className="card kb-test" style={{ position: 'sticky', top: 16 }}>
          <span className="label">Test the assistant</span>
          <p className="xs muted" style={{ marginTop: 4 }}>Try a question — answers update as soon as you edit the knowledge base.</p>
          <form className="row" style={{ marginTop: 12 }} onSubmit={run}><input className="input" placeholder="e.g. do you deliver to Abuja?" value={test} onChange={e => setTest(e.target.value)} data-testid="kb-test" /><button className="btn cta sm">Ask</button></form>
          <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>{['wood or marble?', 'how much is a 9ft table', 'warranty', 'do you sell cues', 'can you fix my old table'].map(s => <button key={s} className="chip" style={{ height: 28, fontSize: 12 }} onClick={() => setTest(s)}>{s}</button>)}</div>
          <div className="stack" style={{ marginTop: 14, gap: 10 }}>
            {log.map((l, i) => <div key={i} className="stack fade-in" style={{ gap: 6 }}><div className="msg a" style={{ alignSelf: 'flex-end' }}>{l.q}</div>{l.r.map((r, j) => <div key={j} className="msg b" style={{ alignSelf: 'flex-start', maxWidth: '92%' }}>{r.text}</div>)}</div>)}
          </div>
        </div>
      </div>
      {editQ && <Modal onClose={() => setEditQ(null)} wide><EditQ k={editQ} onSave={k => { saveQ(k); setEditQ(null) }} onDelete={() => { updateWs(wsId, w => { w.kb = w.kb.filter(x => x.id !== editQ.id) }); setEditQ(null) }} onClose={() => setEditQ(null)} /></Modal>}
      {editP && <Modal onClose={() => setEditP(null)} wide><EditP p={editP} onSave={p => { saveP(p); setEditP(null) }} onDelete={() => { updateWs(wsId, w => { w.products = w.products.filter(x => x.id !== editP.id) }); setEditP(null) }} onClose={() => setEditP(null)} /></Modal>}
    </>
  )
}
function EditQ({ k, onSave, onDelete, onClose }: { k: KBEntry; onSave: (k: KBEntry) => void; onDelete: () => void; onClose: () => void }) {
  const [d, setD] = useState({ ...k, kw: k.keywords.join(', '), ch: (k.chips || []).join(', ') })
  return <form className="stack" onSubmit={e => { e.preventDefault(); onSave({ id: d.id, topic: d.topic, question: d.question, answer: d.answer, keywords: d.kw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean), chips: d.ch.split(',').map(s => s.trim()).filter(Boolean) }) }}>
    <span className="label">Approved answer</span>
    <div className="grid" style={{ gridTemplateColumns: '1fr 2fr' }}><label className="field"><span>Topic</span><input className="input" value={d.topic} onChange={e => setD({ ...d, topic: e.target.value })} /></label><label className="field"><span>Customer question</span><input required className="input" value={d.question} onChange={e => setD({ ...d, question: e.target.value })} /></label></div>
    <label className="field"><span>Answer</span><textarea required className="textarea" rows={5} value={d.answer} onChange={e => setD({ ...d, answer: e.target.value })} data-testid="kb-answer" /></label>
    <label className="field"><span>Trigger words (comma separated — typos are tolerated)</span><input className="input" value={d.kw} onChange={e => setD({ ...d, kw: e.target.value })} /></label>
    <label className="field"><span>Suggested quick replies</span><input className="input" value={d.ch} onChange={e => setD({ ...d, ch: e.target.value })} /></label>
    <div className="spread"><button type="button" className="btn danger sm" onClick={onDelete}>Delete</button><div className="row"><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn cta">Save answer</button></div></div>
  </form>
}
function EditP({ p, onSave, onDelete, onClose }: { p: Product; onSave: (p: Product) => void; onDelete: () => void; onClose: () => void }) {
  const [d, setD] = useState({ ...p, kw: p.keywords.join(', ') })
  return <form className="stack" onSubmit={e => { e.preventDefault(); const { kw, ...rest } = d; onSave({ ...rest, price: +d.price, keywords: kw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) }) }}>
    <span className="label">Product</span>
    <label className="field"><span>Name</span><input required className="input" value={d.name} onChange={e => setD({ ...d, name: e.target.value })} /></label>
    <div className="grid g3"><label className="field"><span>Category</span><input className="input" value={d.category} onChange={e => setD({ ...d, category: e.target.value })} /></label><label className="field"><span>Size</span><input className="input" value={d.size || ''} onChange={e => setD({ ...d, size: e.target.value })} /></label><label className="field"><span>Playing bed</span><input className="input" value={d.bed || ''} onChange={e => setD({ ...d, bed: e.target.value })} /></label></div>
    <div className="grid" style={{ gridTemplateColumns: '1fr 2fr' }}><label className="field"><span>Price (₦, example)</span><input type="number" className="input num" value={d.price} onChange={e => setD({ ...d, price: +e.target.value })} /></label><label className="field"><span>Match words</span><input className="input" value={d.kw} onChange={e => setD({ ...d, kw: e.target.value })} /></label></div>
    <label className="field"><span>Description</span><textarea className="textarea" value={d.description} onChange={e => setD({ ...d, description: e.target.value })} /></label>
    <div className="spread"><button type="button" className="btn danger sm" onClick={onDelete}>Delete</button><div className="row"><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn cta">Save product</button></div></div>
  </form>
}
