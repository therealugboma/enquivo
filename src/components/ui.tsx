import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

const P: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  inbox: 'M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z',
  pipe: 'M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v6h-4z',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  quote: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  wrench: 'M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 6.2-6.2a4 4 0 0 1-5-5L13 5z M3 21l5-5',
  share: 'M18 8a3 3 0 1 0-3-3M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  book: 'M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5zM4 19.5A1.5 1.5 0 0 0 5.5 21H20',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z',
  x: 'M6 6l12 12M18 6 6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  ext: 'M7 17 17 7M8 7h9v9',
  plus: 'M12 5v14M5 12h14',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',
  mail: 'M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM3 6l9 7 9-7',
  play: 'M7 4v16l13-8z',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
  check: 'M5 12l5 5L20 7',
  chev: 'M8 10l4 4 4-4',
  print: 'M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2M6 14h12v7H6z',
  refresh: 'M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5',
}
export function Icon({ n, s = 16, sw = 1.6 }: { n: keyof typeof P | string; s?: number; sw?: number }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={P[n]} /></svg>
}
export function WaIcon({ s = 16 }: { s?: number }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.7 15l-1.3 5 5.1-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.2z" /></svg>
}
export function Mark({ s = 20 }: { s?: number }) {
  return <svg width={s} height={s} viewBox="0 0 64 64" fill="none" aria-hidden><path d="M9 14h11l12 29 12-29h11L35.6 54h-7.2z" fill="currentColor" /><path d="M27 14h10l-5 13z" fill="#d5001c" /></svg>
}
export function Lockup({ to = '/' }: { to?: string }) {
  return <Link to={to} className="lockup glass" aria-label="Enquivo by VUG"><Mark /><b>Enquivo</b><small>by VUG</small></Link>
}
export function Modal({ children, onClose, wide }: { children: ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [onClose])
  return <div className="modal-bg" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="modal" style={wide ? { width: 'min(760px,100%)' } : undefined}>{children}</div></div>
}
export function Badge({ kind, children }: { kind?: 'ok' | 'warn' | 'acc' | 'blue' | ''; children: ReactNode }) { return <span className={`badge ${kind || ''}`}>{children}</span> }
export const stageBadge = (s: string) => ({ new: 'acc', contacted: 'warn', quoted: 'blue', won: 'ok', lost: '' } as Record<string, any>)[s]
export const quoteBadge = (s: string) => ({ draft: '', sent: 'warn', accepted: 'ok', declined: 'acc' } as Record<string, any>)[s]
/** CTA ripple origin follows pointer, per design system */
export function ctaMove(e: React.MouseEvent<HTMLElement>) { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--bx', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--by', `${e.clientY - r.top}px`) }
