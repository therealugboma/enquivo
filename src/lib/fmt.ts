export const naira = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG')
export const nairaShort = (n: number) => n >= 1e6 ? `₦${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}m` : n >= 1e3 ? `₦${Math.round(n / 1e3)}k` : naira(n)
export function ago(t: number) {
  const s = (Date.now() - t) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  const d = Math.floor(s / 86400); return d === 1 ? 'yesterday' : `${d}d ago`
}
export const time = (t: number) => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
export const dateStr = (t: number | string) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
export const today = () => new Date().toISOString().slice(0, 10)
export const initials = (n: string) => n.split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase()
import type { Quote } from './types'
export function quoteTotals(q: Quote) {
  const sub = q.lines.reduce((a, l) => a + l.qty * l.unit, 0)
  const taxable = Math.max(0, sub - q.discount + q.delivery)
  const vat = taxable * q.vatRate / 100
  return { sub, taxable, vat, total: taxable + vat }
}
