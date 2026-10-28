import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useApp, PageHead } from './Layout'
import { naira, dateStr, quoteTotals } from '../../lib/fmt'
import { Badge, Icon, Mark, quoteBadge } from '../../components/ui'
import { saveQuote, setQuoteStatus, convertToWorkOrder } from '../../lib/ops'
import { uid } from '../../lib/store'
import type { Quote } from '../../lib/types'

export function QuotesList() {
  const { ws, leads } = useApp(); const nav = useNavigate()
  const qs = ws.quotes.filter(q => leads.some(l => l.id === q.leadId))
  const sum = (s: string) => qs.filter(q => q.status === s).reduce((a, q) => a + quoteTotals(q).total, 0)
  return (
    <>
      <PageHead label="Sales" title="Quotations"><Link className="btn cta sm" to="/app/quotes/new" data-testid="new-quote"><Icon n="plus" s={14} />New quotation</Link></PageHead>
      <div className="grid g4">{(['draft', 'sent', 'accepted', 'declined'] as const).map(s => <div key={s} className="card kpi tight"><span className="label">{s}</span><div className="v">{qs.filter(q => q.status === s).length}</div><div className="d num">{naira(sum(s))}</div></div>)}</div>
      <div className="card flush"><div style={{ overflowX: 'auto' }}><table className="table"><thead><tr><th>Number</th><th>Customer</th><th>Items</th><th>Created</th><th>Status</th><th>Work order</th><th className="r">Total</th></tr></thead><tbody>
        {qs.map(q => { const l = ws.leads.find(l => l.id === q.leadId); return <tr key={q.id} className="click" onClick={() => nav(`/app/quotes/${q.id}`)}><td className="mono small">{q.number}</td><td>{l?.name}<div className="xs muted">{l?.city}</div></td><td className="small">{q.lines[0]?.name}{q.lines.length > 1 && <span className="muted"> +{q.lines.length - 1}</span>}</td><td className="small">{dateStr(q.createdAt)}</td><td><Badge kind={quoteBadge(q.status)}>{q.status}</Badge></td><td className="small mono">{ws.workOrders.find(w => w.id === q.workOrderId)?.number || '—'}</td><td className="r num">{naira(quoteTotals(q).total)}</td></tr> })}
      </tbody></table>{!qs.length && <div className="empty">No quotations yet.</div>}</div></div>
    </>
  )
}

export function QuoteEditor() {
  const { id } = useParams(); const [sp] = useSearchParams(); const nav = useNavigate()
  const { ws, wsId, me, leads } = useApp()
  const existing = ws.quotes.find(q => q.id === id)
  const blank = (): Quote => ({ id: uid('q'), number: 'Draft', leadId: sp.get('lead') || leads.find(l => !['won', 'lost'].includes(l.stage))?.id || '', lines: [], delivery: 80000, discount: 0, vatRate: ws.profile.vatRate, status: 'draft', createdAt: Date.now(), validDays: 14, notes: '', createdBy: me.id })
  const [q, setQ] = useState<Quote>(() => existing ? structuredClone(existing) : blank())
  const [dirty, setDirty] = useState(!existing)
  useEffect(() => { if (existing && !dirty) setQ(structuredClone(existing)) }, [existing, dirty])
  useEffect(() => { if (!existing && q.lines.length === 0) draftFromLead(q.leadId) }, []) // eslint-disable-line
  const lead = ws.leads.find(l => l.id === q.leadId)
  const t = quoteTotals(q)
  const wo = ws.workOrders.find(w => w.id === q.workOrderId)
  const cats = useMemo(() => [...new Set(ws.products.map(p => p.category))], [ws.products])
  const set = (p: Partial<Quote>) => { setQ({ ...q, ...p }); setDirty(true) }
  function draftFromLead(leadId: string) {
    const l = ws.leads.find(l => l.id === leadId); if (!l) return
    const p = ws.products.find(p => p.name === l.interest)
    const extras = p?.category.includes('tables') ? ws.products.filter(x => ['Accessories'].includes(x.category)).slice(0, 1) : []
    setQ(cur => ({ ...cur, leadId, lines: [...(p ? [p] : []), ...extras].map(x => ({ id: uid('ql'), productId: x.id, name: x.name, qty: 1, unit: x.price })), notes: p ? `Prepared from ${l.name.split(' ')[0]}'s enquiry: ${l.summary}`.slice(0, 220) : cur.notes }))
    setDirty(true)
  }
  const addProduct = (pid: string) => { const p = ws.products.find(p => p.id === pid)!; set({ lines: [...q.lines, { id: uid('ql'), productId: p.id, name: p.name, qty: 1, unit: p.price }] }) }
  const save = () => { const s = saveQuote(wsId, q); setDirty(false); if (!existing) nav(`/app/quotes/${s.id}`, { replace: true }); return s }
  const status = (st: Quote['status']) => { const s = dirty ? save() : q; setQuoteStatus(wsId, s.id, st); setDirty(false) }
  const toWO = () => { const s = dirty ? save() : q; const wid = convertToWorkOrder(wsId, s.id); setDirty(false); nav(`/app/work-orders?open=${wid}`) }
  const valid = new Date(q.createdAt + q.validDays * 86400000)
  return (
    <>
      <div className="row xs muted noprint"><Link className="link" to="/app/quotes">Quotations</Link> / {existing ? q.number : 'New'}</div>
      <div className="grid quote-grid">
        <div className="stack noprint" style={{ gap: 16 }}>
          <div className="card">
            <div className="spread"><span className="label">Customer</span>{existing && <Badge kind={quoteBadge(q.status)}>{q.status}</Badge>}</div>
            <select className="select" style={{ marginTop: 12 }} value={q.leadId} onChange={e => { set({ leadId: e.target.value }) }} data-testid="quote-lead">{leads.map(l => <option key={l.id} value={l.id}>{l.name} — {l.interest}</option>)}</select>
            {lead && <button className="btn soft sm" style={{ marginTop: 10 }} onClick={() => draftFromLead(q.leadId)}>✦ Draft from enquiry</button>}
          </div>
          <div className="card">
            <span className="label">Line items</span>
            <div className="lines stack" style={{ marginTop: 12, gap: 8 }}>
              {q.lines.map((ln, i) => { const upd = (p: Partial<typeof ln>) => { const lines = [...q.lines]; lines[i] = { ...ln, ...p }; set({ lines }) }; return <div key={ln.id} className="qline">
                <div className="stack" style={{ gap: 6 }}>
                  <input className="input" value={ln.name} onChange={e => upd({ name: e.target.value })} aria-label="Item" />
                  <div className="nums"><input className="input num" type="number" min={1} value={ln.qty} onChange={e => upd({ qty: +e.target.value || 1 })} aria-label="Quantity" /><input className="input num" type="number" value={ln.unit} onChange={e => upd({ unit: +e.target.value || 0 })} aria-label="Unit price" /><span className="small num muted" style={{ minWidth: 92, textAlign: 'right' }}>{naira(ln.qty * ln.unit)}</span></div>
                </div>
                <button className="icon-btn" onClick={() => set({ lines: q.lines.filter(x => x.id !== ln.id) })} aria-label="Remove"><Icon n="x" s={14} /></button>
              </div> })}
              {!q.lines.length && <p className="xs muted">Add products from the catalogue below.</p>}
            </div>
            <select className="select" style={{ marginTop: 12 }} value="" onChange={e => e.target.value && addProduct(e.target.value)} data-testid="add-product">
              <option value="">+ Add from catalogue…</option>
              {cats.map(c => <optgroup key={c} label={c}>{ws.products.filter(p => p.category === c).map(p => <option key={p.id} value={p.id}>{p.name} — {naira(p.price)}</option>)}</optgroup>)}
            </select>
            <button className="link xs" style={{ marginTop: 8 }} onClick={() => set({ lines: [...q.lines, { id: uid('ql'), name: 'Custom item', qty: 1, unit: 0 }] })}>+ Custom line</button>
          </div>
          <div className="card">
            <span className="label">Charges</span>
            <div className="grid g2" style={{ marginTop: 12, gap: 10 }}>
              <label className="field"><span>Delivery & install (₦)</span><input className="input num" type="number" value={q.delivery} onChange={e => set({ delivery: +e.target.value })} /></label>
              <label className="field"><span>Discount (₦)</span><input className="input num" type="number" value={q.discount} onChange={e => set({ discount: +e.target.value })} /></label>
              <label className="field"><span>VAT %</span><input className="input num" type="number" step="0.5" value={q.vatRate} onChange={e => set({ vatRate: +e.target.value })} /></label>
              <label className="field"><span>Valid for (days)</span><input className="input num" type="number" value={q.validDays} onChange={e => set({ validDays: +e.target.value })} /></label>
            </div>
            <label className="field" style={{ marginTop: 10 }}><span>Notes to customer</span><textarea className="textarea" value={q.notes} onChange={e => set({ notes: e.target.value })} /></label>
          </div>
          <div className="card stack" style={{ gap: 8 }}>
            <span className="label">Actions</span>
            <div className="row wrap" style={{ gap: 8 }}>
              <button className="btn ghost sm" onClick={save} disabled={!dirty || !q.leadId} data-testid="save-quote">{existing ? 'Save changes' : 'Save draft'}</button>
              <button className="btn ghost sm" onClick={() => status('sent')} disabled={!q.lines.length} data-testid="mark-sent">Mark as sent</button>
              <button className="btn ghost sm" onClick={() => status('accepted')} disabled={!q.lines.length} data-testid="mark-accepted">Customer accepted</button>
              <button className="btn ghost sm" onClick={() => status('declined')} disabled={!existing}>Declined</button>
              <button className="btn ghost sm" onClick={() => print()}><Icon n="print" s={14} />Print / PDF</button>
            </div>
            {wo ? <Link className="btn soft" to={`/app/work-orders?open=${wo.id}`}>View work order {wo.number} →</Link>
              : <button className="btn cta" onClick={toWO} disabled={q.status !== 'accepted'} data-testid="to-wo">Convert to work order</button>}
            <p className="xs muted">Final prices follow your approved price list. Enquivo never confirms payment — accounts mark deposits manually.</p>
          </div>
        </div>
        <div className="doc" data-testid="quote-doc">
          <div className="spread" style={{ alignItems: 'flex-start' }}>
            <div><div style={{ fontSize: 22, fontWeight: 500 }}>{ws.profile.name}</div><div className="xs muted" style={{ marginTop: 4, lineHeight: 1.6 }}>{ws.profile.legalName}<br />{ws.profile.address}<br />{ws.profile.phone} · {ws.profile.email}</div></div>
            <div style={{ textAlign: 'right' }}><div className="label">Quotation</div><div className="mono" style={{ fontSize: 18, marginTop: 6 }}>{existing ? q.number : 'DRAFT'}</div><div className="xs muted" style={{ marginTop: 4 }}>Date {dateStr(q.createdAt)}<br />Valid until {dateStr(valid.getTime())}</div></div>
          </div>
          <div className="hr" style={{ margin: '24px 0' }} />
          <div className="grid g2"><div><div className="label">Prepared for</div><div style={{ marginTop: 6 }}>{lead?.name}</div><div className="xs muted">{lead?.city} · {lead?.phone}</div></div><div><div className="label">Prepared by</div><div style={{ marginTop: 6 }}>{ws.staff.find(s => s.id === q.createdBy)?.name || me.name}</div><div className="xs muted">{ws.profile.website}</div></div></div>
          <table><thead><tr><th>Item</th><th className="r">Qty</th><th className="r">Unit</th><th className="r">Amount</th></tr></thead><tbody>
            {q.lines.map(l => <tr key={l.id}><td>{l.name}{ws.products.find(p => p.id === l.productId)?.size && <div className="xs muted">{ws.products.find(p => p.id === l.productId)?.size} · {ws.products.find(p => p.id === l.productId)?.bed}</div>}</td><td className="r">{l.qty}</td><td className="r">{naira(l.unit)}</td><td className="r">{naira(l.qty * l.unit)}</td></tr>)}
          </tbody></table>
          <div className="totals num">
            <div><span className="muted">Subtotal</span><span>{naira(t.sub)}</span></div>
            {q.discount > 0 && <div><span className="muted">Discount</span><span>−{naira(q.discount)}</span></div>}
            <div><span className="muted">Delivery & installation</span><span>{naira(q.delivery)}</span></div>
            <div><span className="muted">VAT {q.vatRate}%</span><span>{naira(t.vat)}</span></div>
            <div className="grand"><span>Total</span><span data-testid="quote-total">{naira(t.total)}</span></div>
          </div>
          {q.notes && <p className="small" style={{ marginTop: 22, color: 'var(--ink-3)' }}>{q.notes}</p>}
          <div className="hr" style={{ margin: '24px 0 14px' }} />
          <p className="xs muted">Terms: 60% deposit to start production, balance before delivery. Prices are examples for demonstration only. Payment details are shared by our accounts team directly.</p>
          <div className="row xs muted" style={{ marginTop: 18, gap: 6 }}><Mark s={12} />Prepared with Enquivo</div>
        </div>
      </div>
    </>
  )
}
