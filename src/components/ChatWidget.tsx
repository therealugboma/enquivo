import { useEffect, useRef, useState } from 'react'
import { useWs } from '../lib/store'
import { startConversation, visitorSay, botTurn } from '../lib/chat'
import { waLink } from '../lib/engine'
import type { Conversation } from '../lib/types'
import { Icon, Mark, WaIcon } from './ui'

interface Props { wsId: string; mode?: 'floating' | 'embedded'; channel?: Conversation['channel']; page?: string; refCode?: string; teaser?: boolean }

export default function ChatWidget({ wsId, mode = 'floating', channel = 'Website widget', page = '', refCode, teaser = true }: Props) {
  const ws = useWs(wsId)
  const key = `enquivo.conv.${wsId}.${channel}`
  const [convId, setConvId] = useState<string | null>(() => sessionStorage.getItem(key))
  const [open, setOpen] = useState(mode === 'embedded')
  const [showTeaser, setShowTeaser] = useState(false)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inRef = useRef<HTMLInputElement>(null)
  const conv = ws.conversations.find(c => c.id === convId)
  const seenAgent = useRef(0)

  useEffect(() => { if (convId && !conv) { sessionStorage.removeItem(key); setConvId(null) } }, [convId, conv, key])
  useEffect(() => { if (mode === 'floating' && teaser) { const t = setTimeout(() => setShowTeaser(true), 2500); return () => clearTimeout(t) } }, [mode, teaser])
  useEffect(() => { bodyRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }) }, [conv?.messages.length, typing, open])
  const agentCount = conv?.messages.filter(m => m.from === 'agent').length || 0
  const unseen = open ? 0 : Math.max(0, agentCount - seenAgent.current)
  useEffect(() => { if (open) seenAgent.current = agentCount }, [open, agentCount])

  function ensureConv() {
    if (conv) return conv.id
    const id = startConversation(wsId, channel, page, refCode)
    sessionStorage.setItem(key, id); setConvId(id); return id
  }
  function openPanel() { setOpen(true); setShowTeaser(false); ensureConv(); setTimeout(() => inRef.current?.focus(), 300) }
  async function send(t: string) {
    const msg = t.trim(); if (!msg || typing) return
    const id = ensureConv(); setText('')
    visitorSay(wsId, id, msg)
    setTyping(true)
    await new Promise(r => setTimeout(r, 650 + Math.min(900, msg.length * 12)))
    const ok = await botTurn(wsId, id)
    setTyping(false)
    if (!ok) { /* human has the conversation — agent replies arrive live */ }
  }
  function chip(c: string) {
    if (c === 'Ask another question') { inRef.current?.focus(); return }
    send(c === 'Other city' ? 'Other city' : c)
  }

  const msgs = conv?.messages || [{ id: 'g', from: 'bot' as const, text: ws.widget.greeting, at: Date.now(), chips: ws.widget.quickReplies }]
  const lastBotIdx = msgs.map(m => m.from).lastIndexOf('bot')
  const status = conv?.status === 'human' ? 'A person from the team is here' : conv?.status === 'needs-human' ? 'Connecting you to the team…' : 'Answers instantly · team on hand'

  const panel = (
    <div className="ew-panel" role="dialog" aria-label={`${ws.widget.title} chat`}>
      <div className="ew-head">
        <div className="av ink" style={{ width: 38, height: 38 }}>{ws.profile.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t">{ws.widget.title}</div>
          <div className="s"><span className="pulse" />{status}</div>
        </div>
        <a className="icon-btn" href={waLink(ws, conv?.ctx || {})} target="_blank" rel="noreferrer" title="Continue on WhatsApp" style={{ color: '#1f9d55' }}><WaIcon s={18} /></a>
        {mode === 'floating' && <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close chat"><Icon n="x" /></button>}
      </div>
      <div className="ew-body" ref={bodyRef}>
        {msgs.map((m, i) => m.from === 'system' ? <div key={m.id} className="sysm">{m.text}</div> : (
          <div key={m.id} style={{ display: 'contents' }}>
            <div className={`msg fade-in ${m.from === 'visitor' ? 'v' : m.from === 'agent' ? 'a' : 'b'}`}>
              {m.from === 'agent' && <span className="who">{ws.staff.find(s => s.id === m.author)?.name.split(' ')[0] || 'Team'} · {ws.profile.name}</span>}
              {m.text}
            </div>
            {i === lastBotIdx && !typing && m.chips && m.chips.length > 0 && (
              <div className="ew-chips fade-in">
                {m.chips.map(c => c === 'Continue on WhatsApp'
                  ? <a key={c} className="chip" href={waLink(ws, conv?.ctx || {})} target="_blank" rel="noreferrer"><WaIcon s={13} />&nbsp;Continue on WhatsApp</a>
                  : <button key={c} className="chip" onClick={() => chip(c)}>{c}</button>)}
              </div>
            )}
          </div>
        ))}
        {typing && <div className="typing" aria-label="Assistant is typing"><i /><i /><i /></div>}
      </div>
      <div className="ew-foot">
        <form className="ew-in" onSubmit={e => { e.preventDefault(); send(text) }}>
          <input ref={inRef} value={text} onChange={e => setText(e.target.value)} placeholder="Ask about tables, prices, delivery…" aria-label="Type your message" />
          <button className="ew-send" type="submit" aria-label="Send"><Icon n="send" s={16} /></button>
        </form>
        <div className="ew-legal">Details you share are used only to answer your enquiry. <b>Enquivo</b> by VUG</div>
      </div>
    </div>
  )
  if (mode === 'embedded') return <div className="ew embedded" style={{ height: '100%' }}>{panel}</div>
  return (
    <div className={`ew ${ws.widget.position} ${ws.widget.accent === 'red' ? 'red' : ''}`}>
      {open && panel}
      {!open && showTeaser && <div className="ew-teaser" onClick={openPanel}>👋 Questions about a table? Ask here — we answer in seconds.</div>}
      {!open && <button className="ew-bubble" onClick={open ? () => setOpen(false) : openPanel} aria-label="Open chat" data-testid="widget-bubble">
        <Icon n="chat" s={26} />
        {unseen > 0 && <span style={{ position: 'absolute', top: -2, right: -2 }} className="dot-red" />}
      </button>}
    </div>
  )
}
export { Mark }
