import { useSyncExternalStore } from 'react'
import type { Workspace } from './types'
import { seedAll } from './seed'

const P = 'enquivo.v1.'
export const WS_IDS = ['emrad', 'kora'] as const
const listeners = new Set<() => void>()
const cache = new Map<string, { raw: string | null; val: any }>()

export function ensureSeed(force = false) {
  if (!force && localStorage.getItem(P + 'seeded')) return
  const all = seedAll()
  for (const k of Object.keys(all)) localStorage.setItem(P + 'ws.' + k, JSON.stringify(all[k]))
  localStorage.setItem(P + 'seeded', String(Date.now()))
  if (!localStorage.getItem(P + 'active') || force) localStorage.setItem(P + 'active', 'emrad')
  emit()
}
export function resetDemo() {
  Object.keys(localStorage).filter(k => k.startsWith(P)).forEach(k => localStorage.removeItem(k))
  sessionStorage.clear()
  ensureSeed(true)
}
function emit() { listeners.forEach(l => l()) }
function read<T>(key: string): T | null {
  const raw = localStorage.getItem(P + key)
  const c = cache.get(key)
  if (c && c.raw === raw) return c.val
  const val = raw ? JSON.parse(raw) : null
  cache.set(key, { raw, val })
  return val
}
function subscribe(cb: () => void) {
  listeners.add(cb)
  const onStorage = (e: StorageEvent) => { if (!e.key || e.key.startsWith(P)) cb() }
  window.addEventListener('storage', onStorage)
  return () => { listeners.delete(cb); window.removeEventListener('storage', onStorage) }
}
export function getWs(id: string): Workspace { ensureSeed(); return read<Workspace>('ws.' + id)! }
export function updateWs(id: string, fn: (w: Workspace) => void) {
  const w: Workspace = structuredClone(getWs(id))
  fn(w)
  localStorage.setItem(P + 'ws.' + id, JSON.stringify(w))
  emit()
}
export function useWs(id: string): Workspace { return useSyncExternalStore(subscribe, () => getWs(id)) }
export function getActive(): string { return localStorage.getItem(P + 'active') || 'emrad' }
export function setActive(id: string) { localStorage.setItem(P + 'active', id); emit() }
export function useActive(): string { return useSyncExternalStore(subscribe, getActive) }
export function getPref(k: string, d = '') { return localStorage.getItem(P + 'pref.' + k) ?? d }
export function setPref(k: string, v: string) { localStorage.setItem(P + 'pref.' + k, v); emit() }
export function usePref(k: string, d = '') { return useSyncExternalStore(subscribe, () => getPref(k, d)) }
export function nextSeq(w: Workspace) { w.seq += 1; return w.seq }
export const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
export function wsBySlug(slug: string): string | null {
  for (const id of WS_IDS) { const w = getWs(id); if (w?.profile.slug === slug) return id }
  return null
}
