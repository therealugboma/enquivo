import type { Conversation, Lead, Workspace, ConvCtx } from './types'
import { getWs, updateWs, uid } from './store'
import { respond, summarise, type Reply } from './engine'
import { aiAnswer, aiEnabled } from './ai'

export function startConversation(wsId: string, channel: Conversation['channel'], page: string, ref?: string): string {
  const id = uid('cv')
  updateWs(wsId, w => {
    const now = Date.now()
    w.conversations.unshift({ id, channel, page, status: 'ai', createdAt: now, updatedAt: now, unread: 0, ctx: { ref, topics: [] }, messages: [{ id: uid('m'), from: 'bot', text: w.widget.greeting, at: now, chips: w.widget.quickReplies }] })
  })
  return id
}

function pickAssignee(w: Workspace, ctx: ConvCtx) {
  const ref = w.referrers.find(r => r.code === ctx.ref)
  if (ref?.type === 'Staff') { const s = w.staff.find(s => s.name === ref.name); if (s) return s.id }
  const city = (ctx.city || '').toLowerCase()
  const sales = w.staff.filter(s => s.role === 'Salesperson' && s.active)
  const local = sales.find(s => s.showroom && city && s.showroom.toLowerCase().includes(city.split(' ')[0]))
  if (local) return local.id
  if (city.startsWith('lagos')) return sales[0]?.id
  return w.staff.find(s => s.role === 'Manager')?.id || sales[0]?.id
}

export function visitorSay(wsId: string, convId: string, text: string) {
  updateWs(wsId, w => {
    const c = w.conversations.find(c => c.id === convId); if (!c) return
    c.messages.push({ id: uid('m'), from: 'visitor', text, at: Date.now() })
    c.updatedAt = Date.now(); c.unread += 1
  })
}

/** Runs the assistant for the latest visitor message. Returns false if a human has taken over. */
export async function botTurn(wsId: string, convId: string): Promise<boolean> {
  const w0 = getWs(wsId); const c0 = w0.conversations.find(c => c.id === convId)
  if (!c0) return false
  if (c0.status === 'human') return false
  const last = [...c0.messages].reverse().find(m => m.from === 'visitor'); if (!last) return false
  const res = respond(w0, c0.ctx, last.text)
  let replies: Reply[] = res.replies
  if (res.fallback && aiEnabled()) {
    const ai = await aiAnswer(w0, c0.messages).catch(() => null)
    if (ai) replies = [{ text: ai, chips: ['Get a quote', 'Talk to a person'] }, ...replies.slice(1)]
  }
  updateWs(wsId, w => {
    const c = w.conversations.find(c => c.id === convId)!; const now = Date.now()
    c.ctx = res.ctx
    replies.forEach((r, i) => c.messages.push({ id: uid('m'), from: 'bot', text: r.text, chips: r.chips, at: now + i }))
    if (res.handoff && c.status === 'ai') { c.status = 'needs-human'; c.messages.push({ id: uid('m'), from: 'system', text: 'Handoff requested — team notified', at: now + 5 }) }
    c.updatedAt = now
    syncLead(w, c, res.handoff)
  })
  return true
}

function syncLead(w: Workspace, c: Conversation, handoff?: boolean) {
  const x = c.ctx
  const prod = w.products.find(p => p.name === x.interest)
  if (!c.leadId) {
    if (!(x.name && x.phone)) return
    const id = uid('ld'); const now = Date.now()
    const assignee = pickAssignee(w, x)
    const source: Lead['source'] = x.ref ? 'Referral link' : c.channel
    const lead: Lead = {
      id, name: x.name, phone: x.phone, email: x.email, city: x.city || '—', interest: x.interest || 'General enquiry', budget: x.budget, value: prod?.price || 0,
      source, refCode: x.ref, stage: 'new', assignee, owner: assignee, createdAt: now, updatedAt: now, summary: summarise(x), intent: (x.intent as Lead['intent']) || 'Exploring',
      conversationId: c.id, notes: [], followUp: new Date(now + 86400000).toISOString().slice(0, 10), followUpNote: 'First contact within 24h',
      timeline: [
        { id: uid('t'), at: now, kind: 'created', text: `Enquiry captured via ${c.channel}${x.ref ? ` (ref ${x.ref})` : ''}` },
        { id: uid('t'), at: now + 1, kind: 'assign', text: `Assigned to ${w.staff.find(s => s.id === assignee)?.name || 'unassigned'}`, by: 'Auto-routing' },
      ],
    }
    w.leads.unshift(lead); c.leadId = id; x.leadCreated = true
    c.messages.push({ id: uid('m'), from: 'system', text: `Lead created · assigned to ${w.staff.find(s => s.id === assignee)?.name.split(' ')[0] || 'team'}`, at: now + 10 })
  } else {
    const l = w.leads.find(l => l.id === c.leadId); if (!l) return
    if (x.city) l.city = x.city; if (x.interest) l.interest = x.interest; if (x.budget) l.budget = x.budget; if (x.email) l.email = x.email
    if (prod && !l.value) l.value = prod.price
    if (x.intent) l.intent = x.intent as Lead['intent']
    l.summary = summarise(x); l.updatedAt = Date.now()
    if (handoff) l.timeline.push({ id: uid('t'), at: Date.now(), kind: 'message', text: 'Customer asked to speak to a person' })
  }
}

export function agentSay(wsId: string, convId: string, text: string, staffId: string) {
  updateWs(wsId, w => {
    const c = w.conversations.find(c => c.id === convId); if (!c) return
    const now = Date.now()
    if (c.status !== 'human') c.messages.push({ id: uid('m'), from: 'system', text: `${w.staff.find(s => s.id === staffId)?.name.split(' ')[0]} joined the conversation`, at: now - 1 })
    c.status = 'human'; c.unread = 0
    c.messages.push({ id: uid('m'), from: 'agent', text, at: now, author: staffId })
    c.updatedAt = now
    const l = w.leads.find(l => l.id === c.leadId)
    if (l) { l.timeline.push({ id: uid('t'), at: now, kind: 'message', text: 'Replied in chat', by: w.staff.find(s => s.id === staffId)?.name }); if (l.stage === 'new') { l.stage = 'contacted'; l.timeline.push({ id: uid('t'), at: now + 1, kind: 'stage', text: 'Moved to Contacted' }) } }
  })
}

export function submitForm(wsId: string, f: { name: string; phone: string; city: string; interest: string; budget: string; message: string; ref?: string }) {
  updateWs(wsId, w => {
    const now = Date.now(); const id = uid('ld'); const cid = uid('cv')
    const ctx: ConvCtx = { name: f.name, phone: f.phone, city: f.city, interest: f.interest, budget: f.budget, ref: f.ref, intent: 'Quote request', topics: [] }
    const assignee = pickAssignee(w, ctx)
    const prod = w.products.find(p => p.name === f.interest)
    w.conversations.unshift({ id: cid, channel: 'Hosted page', page: `/e/${w.profile.slug}`, status: 'ai', createdAt: now, updatedAt: now, unread: 1, leadId: id, ctx, messages: [
      { id: uid('m'), from: 'system', text: 'Enquiry form submitted', at: now },
      { id: uid('m'), from: 'visitor', text: f.message || `Enquiry about ${f.interest}`, at: now + 1 },
    ] })
    w.leads.unshift({ id, name: f.name, phone: f.phone, city: f.city, interest: f.interest, budget: f.budget, value: prod?.price || 0, source: f.ref ? 'Referral link' : 'Hosted page', refCode: f.ref, stage: 'new', assignee, owner: assignee, createdAt: now, updatedAt: now,
      summary: `${f.message ? f.message + ' ' : ''}Interested in ${f.interest}. Budget ${f.budget || 'not given'}. Based in ${f.city}.`, intent: 'Quote request', conversationId: cid, notes: [], followUp: new Date(now + 86400000).toISOString().slice(0, 10), followUpNote: 'First contact within 24h',
      timeline: [{ id: uid('t'), at: now, kind: 'created', text: `Form enquiry via Hosted page${f.ref ? ` (ref ${f.ref})` : ''}` }, { id: uid('t'), at: now + 1, kind: 'assign', text: `Assigned to ${w.staff.find(s => s.id === assignee)?.name}`, by: 'Auto-routing' }] })
  })
}
