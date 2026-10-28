// Enquivo offline assistant: intent rules + keyword/fuzzy matching over the workspace knowledge base.
import type { ConvCtx, Workspace, Product, Lead } from './types'
import { naira } from './fmt'

export interface Reply { text: string; chips?: string[] }
export interface EngineResult { replies: Reply[]; ctx: ConvCtx; handoff?: boolean; fallback?: boolean; leadIntent?: Lead['intent'] }

const CITIES = ['lagos', 'abuja', 'port harcourt', 'ph', 'ibadan', 'kano', 'kaduna', 'enugu', 'benin', 'benin city', 'uyo', 'calabar', 'owerri', 'warri', 'jos', 'ilorin', 'abeokuta', 'onitsha', 'asaba', 'akure', 'lekki', 'ikeja', 'ikoyi', 'victoria island', 'yaba', 'ajah', 'surulere', 'maitama', 'wuse', 'gwarinpa', 'asokoro', 'osogbo', 'sokoto', 'maiduguri', 'yola', 'bauchi', 'makurdi', 'lokoja', 'minna', 'awka', 'umuahia', 'aba', 'ado ekiti', 'ibeju']
const CITY_NORM: Record<string, string> = { ph: 'Port Harcourt', lekki: 'Lagos (Lekki)', ikeja: 'Lagos (Ikeja)', ikoyi: 'Lagos (Ikoyi)', 'victoria island': 'Lagos (VI)', yaba: 'Lagos (Yaba)', ajah: 'Lagos (Ajah)', surulere: 'Lagos (Surulere)', ibeju: 'Lagos (Ibeju)', maitama: 'Abuja (Maitama)', wuse: 'Abuja (Wuse)', gwarinpa: 'Abuja (Gwarinpa)', asokoro: 'Abuja (Asokoro)' }
const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'do', 'does', 'you', 'your', 'i', 'me', 'my', 'we', 'to', 'of', 'for', 'and', 'or', 'in', 'on', 'it', 'what', 'can', 'how', 'have', 'has', 'with', 'there', 'this', 'that', 'be', 'please', 'want', 'like', 'would', 'about', 'any', 'get', 'need', 'much', 'pls', 'u', 'ur', 'so', 'if', 'at'])
const NOT_NAMES = new Set(['interested', 'looking', 'not', 'just', 'here', 'fine', 'good', 'ok', 'okay', 'in', 'from', 'based', 'ready', 'yes', 'no', 'sure', 'thinking', 'hoping', 'trying', 'a', 'an', 'the', 'buying', 'checking'])

export const norm = (s: string) => s.toLowerCase().replace(/\bhwo\b/g, 'how').replace(/\bhw\b/g, 'how').replace(/\bmuch\b|\bmch\b/g, 'much').replace(/[’']/g, "'").replace(/[^a-z0-9₦+@.' -]/g, ' ').replace(/\s+/g, ' ').trim()
const words = (s: string) => norm(s).split(' ').filter(Boolean)
function lev(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 2) return 9
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}
/** true if keyword (may be multi-word) appears in text, tolerating small typos on longer words */
export function hasKw(text: string, kw: string): boolean {
  const t = ' ' + norm(text) + ' ', k = norm(kw)
  if (!k) return false
  if (t.includes(' ' + k + ' ') || (k.length > 3 && t.includes(' ' + k))) return true
  if (k.includes(' ')) return false
  if (k.length < 5) return false
  const tol = k.length >= 8 ? 2 : 1
  return words(text).some(w => w.length >= 4 && lev(w, k) <= tol)
}
const any = (text: string, kws: string[]) => kws.some(k => hasKw(text, k))

export function extractPhone(t: string) { const m = t.match(/(\+?\d[\d\s().-]{8,}\d)/); if (!m) return; const d = m[1].replace(/[^\d+]/g, ''); return d.replace(/\D/g, '').length >= 10 ? m[1].trim() : undefined }
export function extractEmail(t: string) { return t.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] }
export function extractCity(t: string) {
  const n = ' ' + norm(t) + ' '
  const hit = CITIES.filter(c => n.includes(' ' + c + ' ')).sort((a, b) => b.length - a.length)[0]
  if (!hit) return
  return CITY_NORM[hit] || hit.replace(/\b\w/g, c => c.toUpperCase())
}
export function extractBudget(t: string, force = false) {
  const n = t.toLowerCase().replace(/,/g, '')
  if (force && /(not sure|no idea|skip|flexible|depends|don'?t know)/.test(n)) return 'Not specified'
  if (/\d/.test(n) && /(under|below|above|over|between|around|about|–|-|to)/.test(n) && n.length < 32 && (force || /₦|m\b|k\b|million/.test(n))) return t.trim().replace(/^(my )?budget( is)?:?\s*/i, '')
  const m = n.match(/(?:₦|ngn|n)?\s*(\d+(?:\.\d+)?)\s*(m\b|mil|million|k\b|thousand)?/)
  if (!m) return
  let v = parseFloat(m[1]); const u = m[2] || ''
  if (u.startsWith('m')) v *= 1e6; else if (u.startsWith('k') || u.startsWith('t')) v *= 1e3
  if (!force && !/(budget|₦|naira|ngn|million|\dm\b|\dk\b)/.test(n)) return
  if (v < 1000) { if (!force) return; v *= 1e6 }
  return '≈ ' + naira(v)
}
function extractName(t: string, awaiting: boolean) {
  const m = t.match(/(?:my name is|my name's|name is|i am|i'm|im|this is|call me)\s+([a-z][a-z'-]+(?:\s+[a-z][a-z'-]+)?)/i)
  if (m && !NOT_NAMES.has(m[1].split(' ')[0].toLowerCase())) return title(m[1])
  if (awaiting) {
    const clean = t.replace(/[^a-zA-Z' -]/g, ' ').trim()
    const w = clean.split(/\s+/).filter(Boolean)
    if (w.length >= 1 && w.length <= 4 && !/\?/.test(t) && !w.some(x => NOT_NAMES.has(x.toLowerCase()) || STOP.has(x.toLowerCase()))) return title(clean)
  }
}
const title = (s: string) => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())

const GENERIC = new Set(['wood', 'marble', 'slate', 'pool', 'snooker', 'small', 'home', 'balls', 'cloth', 'delivery'])
export function matchProduct(ws: Workspace, text: string): Product | undefined {
  let best: Product | undefined, bs = 0
  const n = norm(text)
  for (const p of ws.products) {
    let s = 0, strong = 0
    for (const k of p.keywords) if (hasKw(n, k)) { s += k.length > 4 ? 2 : 1.5; if (!GENERIC.has(k)) strong++ }
    if (!strong) continue
    if (n.includes(norm(p.category).replace(/s$/, ''))) s += 1
    if (/marble|slate/.test(n) && /marble/i.test(p.bed || '')) s += 1.5
    if (/\bwood/.test(n) && /wood/i.test(p.bed || '')) s += 1.5
    if (s > bs) { bs = s; best = p }
  }
  return bs >= 1.5 ? best : undefined
}
export function matchKB(ws: Workspace, text: string) {
  let best = null as null | (typeof ws.kb)[number], bs = 0
  const tw = words(text).filter(w => !STOP.has(w))
  for (const e of ws.kb) {
    let s = 0
    for (const k of e.keywords) if (hasKw(text, k)) s += k.includes(' ') ? 2 : 1
    const qw = new Set(words(e.question).filter(w => !STOP.has(w)))
    s += tw.filter(w => qw.has(w)).length * 0.5
    if (s > bs) { bs = s; best = e }
  }
  return bs >= 1 ? { entry: best!, score: bs } : null
}

function priceList(ws: Workspace) {
  const cats = [...new Set(ws.products.map(p => p.category))]
  return cats.map(c => {
    const ps = ws.products.filter(p => p.category === c)
    const min = Math.min(...ps.map(p => p.price)), max = Math.max(...ps.map(p => p.price))
    return `• ${c}: ${min === max ? naira(min) : `${naira(min)} – ${naira(max)}`}`
  }).join('\n')
}

const ASK: Record<string, (c: ConvCtx, ws: Workspace) => Reply> = {
  name: () => ({ text: 'So the right person can follow up, may I have your name?' }),
  phone: c => ({ text: `Thanks${c.name ? ', ' + c.name.split(' ')[0] : ''}. What phone or WhatsApp number should our team use?` }),
  city: () => ({ text: 'Which city or area should we deliver to?', chips: ['Lagos', 'Abuja', 'Port Harcourt', 'Other city'] }),
  interest: (_c, ws) => ({ text: 'Which product are you most interested in?', chips: [...new Set(ws.products.map(p => p.category))].slice(0, 4) }),
  budget: () => ({ text: 'Last one — do you have a rough budget in mind? (A range is fine, or say "not sure".)', chips: ['Under ₦2m', '₦2m – ₦4m', 'Above ₦4m', 'Not sure'] }),
}
const ORDER: string[] = ['name', 'phone', 'city', 'interest', 'budget']
function nextMissing(c: ConvCtx) { return ORDER.find(k => !(c as any)[k]) as ConvCtx['awaiting'] | undefined }

export function respond(ws: Workspace, ctx0: ConvCtx, input: string): EngineResult {
  const ctx: ConvCtx = { ...ctx0, topics: [...(ctx0.topics || [])] }
  const t = input.trim(), n = norm(t)
  const replies: Reply[] = []
  let handoff = false, fallback = false, leadIntent: Lead['intent'] | undefined
  const firstName = () => ctx.name ? ctx.name.split(' ')[0] : ''
  const isQuestion = /\?/.test(t) || /^(what|how|where|when|which|do|does|can|is|are|why|who|will|price|cost)\b/.test(n)

  // 1) Slot filling (opportunistic + awaited)
  const aw = ctx.awaiting
  const phone = extractPhone(t); if (phone) ctx.phone = phone
  const email = extractEmail(t); if (email) ctx.email = email
  const name = extractName(phone ? t.replace(phone, '').replace(/[,;]/g, ' ') : t, aw === 'name'); if (name && (aw === 'name' || !ctx.name)) ctx.name = name
  const city = extractCity(t); if (city) ctx.city = city
  if (aw === 'city' && !city && !isQuestion && !phone && t.length < 40 && !/other/i.test(t)) ctx.city = title(t.replace(/[^a-zA-Z ,-]/g, '').trim()) || undefined
  const budget = extractBudget(t, aw === 'budget' || /budget/.test(n)); if (budget) ctx.budget = budget
  const gotOther = !!(phone || city || email || (name && aw !== 'name'))
  if (aw === 'budget' && !budget && !isQuestion && !gotOther && t.length < 40 && (/\d/.test(t) || /sure|flexible|depends|open|know|skip/.test(n))) ctx.budget = t
  const prod = matchProduct(ws, t); if (prod) ctx.interest = prod.name
  if (!prod && aw === 'interest') {
    const cat = ws.products.find(p => n.includes(norm(p.category).replace(/s$/, '')))
    if (cat) ctx.interest = cat.category
    else if (!isQuestion && !gotOther && !budget && t.length < 40) ctx.interest = t
    else if ((ctx0 as any).askedInterest >= 1) ctx.interest = 'General enquiry'
  }
  if (/marble|slate/.test(n)) ctx.bed = 'Marble'; else if (/\bwood(en)? bed/.test(n)) ctx.bed = 'Wood'
  const filledAwaited = (aw && ctx[aw] && ctx[aw] !== ctx0[aw]) || (['name', 'phone', 'city', 'budget', 'email'] as const).some(k => ctx[k] !== ctx0[k] && ctx0.done)

  // 2) Intent detection
  const wantsHuman = any(t, ['human', 'person', 'agent', 'someone', 'staff', 'call me', 'speak to', 'talk to', 'sales rep', 'representative', 'real person', 'customer care'])
  const wantsWA = any(t, ['whatsapp', 'whats app', 'wa'])
  const wantsQuote = any(t, ['quote', 'quotation', 'invoice', 'proforma', 'buy', 'order', 'purchase', 'interested', 'deposit', 'get one', 'ready'])
  const wantsVisit = any(t, ['book a visit', 'visit', 'come over', 'come to', 'appointment', 'see it', 'inspect'])
  const wantsPrice = any(t, ['price', 'prices', 'cost', 'how much', 'amount', 'rate', 'expensive', 'cheap', 'fee'])
  const greet = /^(hi|hello|hey|good (morning|afternoon|evening)|hiya|howdy|yo|sup)\b/.test(n) && n.split(' ').length <= 5
  const thanks = /\b(thanks|thank you|thx|ok thanks|great|perfect|cool)\b/.test(n) && n.split(' ').length <= 5
  const later = any(t, ['later', 'next month', 'not now', 'just looking', 'just browsing'])
  if (/deposit|pay now|this week|ready to (buy|pay)/.test(n)) leadIntent = 'Ready to buy'
  else if (wantsVisit) leadIntent = 'Showroom visit'
  else if (wantsQuote) leadIntent = 'Quote request'
  else if (/ vs |versus|compare|difference|better/.test(' ' + n + ' ')) leadIntent = 'Comparing'
  else if (later) leadIntent = 'Later'
  if (leadIntent) ctx.intent = leadIntent

  if (wantsQuote || wantsVisit || wantsHuman || /deposit/.test(n)) ctx.capture = true

  // 3) Compose answer
  let answered = false
  if (wantsHuman) {
    handoff = true; answered = true
    replies.push({ text: `Of course. I've flagged this conversation for our sales team${ws.profile.hours ? ` (${ws.profile.hours})` : ''} — a person will pick it up here.${ctx.phone ? '' : ' If you leave a number, they can call or WhatsApp you too.'}`, chips: ['Continue on WhatsApp'] })
  } else if (wantsWA && !ctx.phone && !filledAwaited) {
    answered = true
    replies.push({ text: 'Sure — you can continue on WhatsApp any time. Tap below and your enquiry summary will be pre-filled so you don\'t have to repeat yourself.', chips: ['Continue on WhatsApp'] })
  } else if (greet && !filledAwaited) {
    answered = true
    replies.push({ text: `Hello${firstName() ? ' ' + firstName() : ''}! How can I help today?`, chips: ws.widget.quickReplies })
  } else if (thanks && !filledAwaited && !isQuestion) {
    answered = true
    replies.push({ text: `You're welcome${firstName() ? ', ' + firstName() : ''}. Anything else I can help with?`, chips: ['Get a quote', 'Continue on WhatsApp'] })
  }
  if (!answered && !(filledAwaited && !isQuestion && !wantsPrice)) {
    if (/which size fits|my room|room size|space/.test(n)) {
      const kb = ws.kb.find(k => /space/i.test(k.question)); if (kb) { replies.push({ text: kb.answer, chips: kb.chips }); answered = true; ctx.topics!.push(kb.topic) }
    }
    if (!answered && wantsPrice) {
      answered = true; ctx.topics!.push('Prices')
      const catHit = !prod && [...new Set(ws.products.map(p => p.category))].find(c => c.includes('tables') && hasKw(n, norm(c).split(' ')[0]))
      if (catHit) replies.push({ text: `Our ${catHit.toLowerCase()} (example prices):\n${ws.products.filter(p => p.category === catHit).map(p => `• ${p.name}: ${naira(p.price)}`).join('\n')}`, chips: ['Get a quote', 'Wood or marble?', 'Which size fits my room?'] })
      else if (prod) replies.push({ text: `The ${prod.name}${prod.size ? ` (${prod.size})` : ''} is ${naira(prod.price)} (example price, before delivery). ${prod.description}`, chips: ['Get a quote', 'Delivery time', 'Wood or marble?'] })
      else replies.push({ text: `Here are our current example prices:\n${priceList(ws)}\n\nTell me the size or product you have in mind and I'll be specific.`, chips: ws.products.filter(p => p.size).slice(2, 5).map(p => p.size!.split(' ')[0] + ' ' + p.category.replace(/ tables?/i, '').toLowerCase()) })
    }
    if (!answered) {
      const kb = matchKB(ws, t)
      if (kb && (kb.score >= 1.5 || !prod)) { answered = true; replies.push({ text: kb.entry.answer, chips: kb.entry.chips }); ctx.topics!.push(kb.entry.topic) }
      else if (prod) { answered = true; replies.push({ text: `${prod.name}: ${prod.description} ${naira(prod.price)} (example price).`, chips: ['Get a quote', 'Wood or marble?'] }); ctx.topics!.push('Products') }
    }
    if (!answered && wantsVisit) {
      const kb = ws.kb.find(k => k.topic === 'Showrooms'); answered = true
      replies.push({ text: (kb?.answer || `You can visit us at ${ws.profile.showrooms.join(', ')}.`) + ' I can arrange a visit for you.' })
    }
    if (!answered && (wantsQuote)) { answered = true; replies.push({ text: `Happy to prepare a quote${ctx.interest ? ` for the ${ctx.interest}` : ''}. I just need a few details.` }) }
    if (!answered && !(aw && ctx[aw])) {
      if (!isQuestion && aw && !filledAwaited && n.split(' ').length <= 4) { /* looks like an answer attempt — just re-ask */ }
      else { fallback = true; ctx.misses = (ctx.misses || 0) + 1
        replies.push({ text: `I don't have confirmed information on that, and I'd rather not guess. I can pass your question to the team${ctx.misses > 1 ? ', or connect you with a person now' : ''}.`, chips: ['Talk to a person', 'See prices', 'Showroom locations'] }) }
    }
  }
  ctx.answered = (ctx.answered || 0) + (answered ? 1 : 0)

  // 4) Lead capture prompts
  if (ctx.capture || (ws.widget.captureMode === 'early' && ctx.answered! >= 1) || (ctx.answered! >= 3 && !ctx.done)) {
    if (!ctx.capture && ctx.answered! >= 3 && !ctx.name) { ctx.capture = true; replies.push({ text: 'Would you like our team to send you a proper quote or hold a showroom slot for you?', chips: ['Get a quote', 'Book a visit', 'Just browsing'] }); ctx.awaiting = null; return { replies, ctx, handoff, fallback, leadIntent } }
    const miss = nextMissing(ctx)
    if (miss) {
      if (miss === 'interest' && ctx.intent === 'Showroom visit') { ctx.interest = 'Showroom visit'; }
      const m2 = nextMissing(ctx)
      if (m2) { ctx.awaiting = m2; if (m2 === 'interest') (ctx as any).askedInterest = ((ctx0 as any).askedInterest || 0) + 1; replies.push(ASK[m2!](ctx, ws)) }
    }
    if (!nextMissing(ctx) && !ctx.done) {
      ctx.done = true; ctx.awaiting = null
      replies.push({ text: `Thank you, ${firstName()}. Here's what I've passed to our team:\n• Interest: ${ctx.interest}${ctx.bed ? ` (${ctx.bed.toLowerCase()} bed)` : ''}\n• City: ${ctx.city}\n• Budget: ${ctx.budget}\n• Contact: ${ctx.phone}\n\nSomeone from our ${ctx.city?.split(' ')[0]} team will reach out shortly${ws.profile.hours ? ` (${ws.profile.hours.split('·')[0].trim()})` : ''}.`, chips: ['Continue on WhatsApp', 'Visit a showroom', 'Ask another question'] })
    }
  } else if (aw && !ctx[aw]) {
    replies.push(ASK[aw](ctx, ws))
  }
  if (!replies.length && ctx0.done && filledAwaited) replies.push({ text: `Thanks${firstName() ? ', ' + firstName() : ''} — I've updated your details for the team.`, chips: ['Continue on WhatsApp', 'Ask another question'] })
  if (!replies.length) replies.push({ text: 'Got it. Anything else you would like to know?', chips: ws.widget.quickReplies })
  if (later && !ctx.done) replies.push({ text: 'No rush at all. If you leave your number, we\'ll only send one gentle reminder when you\'re ready.' })
  return { replies, ctx, handoff, fallback, leadIntent }
}

export function waLink(ws: Workspace, ctx: ConvCtx) {
  const lines = [`Hello ${ws.profile.name}, I'm continuing my enquiry from your website.`]
  if (ctx.name) lines.push(`Name: ${ctx.name}`)
  if (ctx.interest) lines.push(`Interest: ${ctx.interest}${ctx.bed ? ` (${ctx.bed} bed)` : ''}`)
  if (ctx.city) lines.push(`City: ${ctx.city}`)
  if (ctx.budget) lines.push(`Budget: ${ctx.budget}`)
  if (ctx.ref) lines.push(`Ref: ${ctx.ref}`)
  return `https://wa.me/${ws.profile.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`
}

export function summarise(ctx: ConvCtx) {
  const bits = [] as string[]
  if (ctx.interest) bits.push(`Interested in ${ctx.interest}${ctx.bed ? ` with a ${ctx.bed.toLowerCase()} bed` : ''}.`)
  if (ctx.budget && ctx.budget !== 'Not specified') bits.push(`Budget ${ctx.budget}.`)
  if (ctx.city) bits.push(`Based in ${ctx.city}.`)
  const tp = [...new Set(ctx.topics || [])]
  if (tp.length) bits.push(`Asked about ${tp.join(', ').toLowerCase()}.`)
  if (ctx.intent) bits.push(`Intent: ${ctx.intent.toLowerCase()}.`)
  return bits.join(' ') || 'New enquiry from website assistant.'
}
