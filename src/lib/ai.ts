// OPTIONAL: OpenAI fallback for questions the offline engine can't match. Off unless a key is configured.
import type { Workspace, Message } from './types'
const envKey = (import.meta.env.VITE_OPENAI_API_KEY as string | undefined) || ''
export const aiKey = () => localStorage.getItem('enquivo.v1.pref.openaiKey') || envKey
export const aiEnabled = () => !!aiKey()
export async function aiAnswer(ws: Workspace, history: Message[]): Promise<string | null> {
  const kb = ws.kb.map(k => `Q: ${k.question}\nA: ${k.answer}`).join('\n\n')
  const products = ws.products.map(p => `${p.name} — ₦${p.price} (example) — ${p.description}`).join('\n')
  const sys = `You are the website assistant for ${ws.profile.name}. Answer ONLY from the approved information below. If the answer is not there, say you don't have confirmed information and offer to pass the question to the team. Never confirm payments or invent prices. Keep replies under 70 words, calm and plain.\n\nHours: ${ws.profile.hours}\nShowrooms: ${ws.profile.showrooms.join(', ')}\n\nPRODUCTS\n${products}\n\nFAQ\n${kb}`
  const msgs = history.filter(m => m.from !== 'system').slice(-10).map(m => ({ role: m.from === 'visitor' ? 'user' : 'assistant', content: m.text }))
  const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aiKey()}` }, body: JSON.stringify({ model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'system', content: sys }, ...msgs], temperature: 0.2 }) })
  if (!r.ok) return null
  const j = await r.json(); return j.choices?.[0]?.message?.content?.trim() || null
}
