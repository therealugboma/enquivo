import { updateWs, uid, nextSeq } from './store'
import type { Stage, Lead, Quote } from './types'
import { STAGES } from './types'

const who = (w: any) => w.staff.find((s: any) => s.id === w.currentUser)?.name
export function moveStage(wsId: string, leadId: string, stage: Stage) {
  updateWs(wsId, w => {
    const l = w.leads.find(l => l.id === leadId); if (!l || l.stage === stage) return
    l.stage = stage; l.updatedAt = Date.now()
    l.timeline.push({ id: uid('t'), at: Date.now(), kind: 'stage', text: `Moved to ${STAGES.find(s => s.id === stage)!.label}`, by: who(w) })
  })
}
export function assignLead(wsId: string, leadId: string, staffId: string) {
  updateWs(wsId, w => { const l = w.leads.find(l => l.id === leadId)!; l.assignee = staffId; l.owner = staffId; l.timeline.push({ id: uid('t'), at: Date.now(), kind: 'assign', text: `Assigned to ${w.staff.find(s => s.id === staffId)?.name}`, by: who(w) }) })
}
export function addNote(wsId: string, leadId: string, text: string) {
  updateWs(wsId, w => { const l = w.leads.find(l => l.id === leadId)!; l.notes.unshift(text); l.timeline.push({ id: uid('t'), at: Date.now(), kind: 'note', text, by: who(w) }) })
}
export function setFollowUp(wsId: string, leadId: string, date: string, note: string) {
  updateWs(wsId, w => { const l = w.leads.find(l => l.id === leadId)!; l.followUp = date || undefined; l.followUpNote = note; l.timeline.push({ id: uid('t'), at: Date.now(), kind: 'followup', text: date ? `Follow-up set for ${date}${note ? ` — ${note}` : ''}` : 'Follow-up cleared', by: who(w) }) })
}
export function logContact(wsId: string, leadId: string, channel: string) {
  updateWs(wsId, w => {
    const l = w.leads.find(l => l.id === leadId)!; l.timeline.push({ id: uid('t'), at: Date.now(), kind: 'contact', text: `Contacted via ${channel}`, by: who(w) })
    if (l.stage === 'new') { l.stage = 'contacted'; l.timeline.push({ id: uid('t'), at: Date.now() + 1, kind: 'stage', text: 'Moved to Contacted', by: who(w) }) }
    const d = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10); l.followUp = d; l.followUpNote = 'Check in after contact'
  })
}
export function createLead(wsId: string, d: Partial<Lead>) {
  const id = uid('ld')
  updateWs(wsId, w => {
    const now = Date.now()
    w.leads.unshift({ id, name: d.name || 'New customer', phone: d.phone || '', city: d.city || '', interest: d.interest || '', budget: d.budget, value: d.value || 0, source: d.source || 'Walk-in', stage: 'new', assignee: d.assignee, owner: d.assignee, createdAt: now, updatedAt: now, summary: d.summary || 'Logged manually.', intent: 'Exploring', notes: [], timeline: [{ id: uid('t'), at: now, kind: 'created', text: `Lead added manually (${d.source || 'Walk-in'})`, by: who(w) }] })
  })
  return id
}
export function saveQuote(wsId: string, q: Quote) {
  let out = q
  updateWs(wsId, w => {
    const i = w.quotes.findIndex(x => x.id === q.id)
    if (i >= 0) w.quotes[i] = q
    else {
      out = { ...q, number: `${w.profile.slug.toUpperCase().slice(0, 3)}-Q-${nextSeq(w)}` }; w.quotes.unshift(out)
      const l = w.leads.find(l => l.id === q.leadId); if (l) l.timeline.push({ id: uid('t'), at: Date.now(), kind: 'quote', text: `Quotation ${out.number} created`, by: who(w) })
    }
  })
  return out
}
export function setQuoteStatus(wsId: string, qid: string, status: Quote['status']) {
  updateWs(wsId, w => {
    const q = w.quotes.find(q => q.id === qid)!; q.status = status
    const l = w.leads.find(l => l.id === q.leadId)
    if (l) {
      l.timeline.push({ id: uid('t'), at: Date.now(), kind: 'quote', text: `Quotation ${q.number} marked ${status}`, by: who(w) })
      if (status === 'sent' && ['new', 'contacted'].includes(l.stage)) { l.stage = 'quoted'; l.timeline.push({ id: uid('t'), at: Date.now() + 1, kind: 'stage', text: 'Moved to Quoted' }) }
      if (status === 'accepted' && l.stage !== 'won') { l.stage = 'won'; l.timeline.push({ id: uid('t'), at: Date.now() + 1, kind: 'stage', text: 'Marked as Won' }) }
    }
  })
}
export function convertToWorkOrder(wsId: string, qid: string): string {
  const id = uid('wo')
  updateWs(wsId, w => {
    const q = w.quotes.find(q => q.id === qid)!; if (q.workOrderId) return
    const l = w.leads.find(l => l.id === q.leadId)
    const main = q.lines[0]
    const ops = w.staff.find(s => s.role === 'Operations')
    const due = new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10)
    w.workOrders.unshift({ id, number: `${w.profile.slug.toUpperCase().slice(0, 3)}-WO-${nextSeq(w)}`, quoteId: q.id, leadId: q.leadId, title: main?.name || 'Order', spec: q.lines.map(x => `${x.qty}× ${x.name}`).join(' · '), stages: w.woStages.map(s => ({ name: s, done: false })), assignee: ops?.id, due, notes: q.notes, createdAt: Date.now(), priority: 'Normal' })
    q.workOrderId = id; if (q.status !== 'accepted') q.status = 'accepted'
    if (l) { l.timeline.push({ id: uid('t'), at: Date.now(), kind: 'workorder', text: `Work order created from ${q.number} — sent to workshop`, by: who(w) }); if (l.stage !== 'won') { l.stage = 'won'; l.timeline.push({ id: uid('t'), at: Date.now() + 1, kind: 'stage', text: 'Marked as Won' }) } }
  })
  return id
}
