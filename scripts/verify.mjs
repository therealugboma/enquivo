// End-to-end check + screenshots. Usage: npm run build && npx vite preview --port 4190 & then: node scripts/verify.mjs
import { chromium, devices } from 'playwright'
import { mkdirSync } from 'fs'
const BASE = process.env.BASE || 'http://127.0.0.1:4190/'
const OUT = new URL('../screenshots/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); process.exitCode = 1 } else console.log('ok -', m) }
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const shot = async (p, n, o = {}) => { if (!o.keepScroll) await p.evaluate(() => scrollTo(0, 0)).catch(() => {}); await p.evaluate(() => document.querySelectorAll('.toast').forEach(t => { t.style.display = 'none' })).catch(() => {}); return p.screenshot({ path: OUT + n, ...o }) }

const landing = await ctx.newPage()
await landing.goto(BASE + '#/')
await landing.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
await landing.reload(); await landing.waitForTimeout(600)
await shot(landing, '01-landing.png')
await shot(landing, '01b-landing-full.png', { fullPage: true })

// Dashboard open in a second tab (to prove live updates across tabs)
const dash = await ctx.newPage()
await dash.goto(BASE + '#/app/inbox'); await dash.waitForSelector('[data-testid=conv-item]')
const leadsBefore = await dash.evaluate(() => JSON.parse(localStorage.getItem('enquivo.v1.ws.emrad')).leads.length)

// Widget conversation on the mock EMRAD site
const site = await ctx.newPage()
await site.goto(BASE + '#/site/emrad')
await site.click('[data-testid=widget-bubble]')
const bot = async (re) => { await site.waitForFunction((src) => [...document.querySelectorAll('.ew-body .msg.b')].some(e => new RegExp(src, 'i').test(e.textContent)), re.source, { timeout: 10000 }) }
const chip = async (t) => { await site.locator('.ew-chips .chip', { hasText: t }).last().click() }
const say = async (t) => { await site.fill('.ew-in input', t); await site.press('.ew-in input', 'Enter') }
await chip('Wood or marble?'); await bot(/truer roll/)
await say('How much is the 8ft marble pool table?'); await bot(/2,900,000/)
await chip('Get a quote'); await bot(/may I have your name/)
await say('Chinedu Okafor'); await bot(/phone or WhatsApp/)
await say('+234 800 000 0123'); await bot(/Which city/)
await chip('Lagos'); await bot(/rough budget/)
await chip('₦2m – ₦4m'); await bot(/passed to our team/)
await site.waitForTimeout(500)
await shot(site, '02-widget-conversation.png', { keepScroll: true })
ok(await site.locator('.ew-chips a.chip[href*="wa.me"]').count() > 0, 'WhatsApp continue link offered')

// (b) lead appears in dashboard live (other tab, storage event)
await dash.bringToFront()
await dash.waitForSelector('.toast', { timeout: 8000 }).catch(() => {})
ok(await dash.locator('.toast').count() > 0, 'toast shown in dashboard tab')
await dash.screenshot({ path: OUT + '03a-live-toast.png' })
await dash.waitForFunction(() => [...document.querySelectorAll('[data-testid=conv-item]')].some(e => e.textContent.includes('Chinedu Okafor')), null, { timeout: 8000 })
ok(true, 'conversation appears live in dashboard inbox')
const lead = await dash.evaluate(() => JSON.parse(localStorage.getItem('enquivo.v1.ws.emrad')).leads.find(l => l.name === 'Chinedu Okafor'))
ok(lead && lead.phone.includes('0123') && lead.city === 'Lagos' && lead.budget, 'lead created with name/phone/city/budget')
ok((await dash.evaluate(() => JSON.parse(localStorage.getItem('enquivo.v1.ws.emrad')).leads.length)) === leadsBefore + 1, 'exactly one new lead')
await dash.locator('[data-testid=conv-item]', { hasText: 'Chinedu Okafor' }).click()
await dash.fill('[data-testid=agent-input]', 'Hi Chinedu, Ngozi here from EMRAD. I can send cloth samples today — what colour do you like?')
await dash.keyboard.press('Enter'); await dash.waitForTimeout(400)
await shot(dash, '03-dashboard-inbox.png')
await site.waitForFunction(() => [...document.querySelectorAll('.ew-body .msg.a')].some(e => e.textContent.includes('cloth samples')), null, { timeout: 8000 })
ok(true, 'agent reply delivered to customer widget live')

await dash.goto(BASE + '#/app'); await dash.waitForTimeout(700)
await shot(dash, '04-dashboard-overview.png')
await dash.goto(BASE + '#/app/pipeline'); await dash.waitForTimeout(400)
ok(await dash.locator('[data-stage=contacted] [data-testid=kcard]', { hasText: 'Chinedu Okafor' }).count() === 1, 'new lead in pipeline (auto-moved to Contacted after agent reply)')
await shot(dash, '05-pipeline.png')
await dash.goto(BASE + `#/app/leads/${lead.id}`); await dash.waitForTimeout(400)
await dash.setViewportSize({ width: 1440, height: 1100 }); await shot(dash, '06-lead-detail.png'); await dash.setViewportSize({ width: 1440, height: 900 })

// (c) quote → accepted → work order
await dash.goto(BASE + `#/app/quotes/new?lead=${lead.id}`); await dash.waitForSelector('[data-testid=quote-doc]')
await dash.selectOption('[data-testid=add-product]', 'p_light')
await dash.click('[data-testid=mark-sent]'); await dash.waitForTimeout(300)
await dash.click('[data-testid=mark-accepted]'); await dash.waitForTimeout(300)
const total = await dash.textContent('[data-testid=quote-total]')
ok(/₦/.test(total), 'quote total ' + total)
await dash.setViewportSize({ width: 1440, height: 1180 }); await shot(dash, '07-quotation.png'); await dash.setViewportSize({ width: 1440, height: 900 })
await dash.click('[data-testid=to-wo]'); await dash.waitForURL(/work-orders/)
await dash.waitForTimeout(400)
const wo = await dash.evaluate(() => JSON.parse(localStorage.getItem('enquivo.v1.ws.emrad')).workOrders[0])
ok(wo && wo.leadId === lead.id && wo.stages.length >= 4, 'work order created from quote: ' + wo?.number)
await dash.locator('[data-testid=wo-card]').first().locator('.wos .s').nth(1).click(); await dash.waitForTimeout(200)
await shot(dash, '08-work-orders.png')
const l2 = await dash.evaluate((id) => JSON.parse(localStorage.getItem('enquivo.v1.ws.emrad')).leads.find(l => l.id === id), lead.id)
ok(l2.stage === 'won', 'lead moved to Won after acceptance')

for (const [r, n] of [['knowledge', '09-knowledge-base.png'], ['settings', '10-settings-embed.png'], ['referrals', '11-referrals.png'], ['followups', '12-followups.png'], ['team', '13-team.png'], ['quotes', '14-quotes-list.png']]) {
  await dash.goto(BASE + '#/app/' + r); await dash.waitForTimeout(500); await shot(dash, n)
}
// knowledge base tester
await dash.goto(BASE + '#/app/knowledge'); await dash.fill('[data-testid=kb-test]', 'do you have a warranty?'); await dash.keyboard.press('Enter'); await dash.waitForTimeout(300)
ok((await dash.textContent('.kb-test')).includes('5-year'), 'knowledge base tester answers')
await shot(dash, '09-knowledge-base.png')

// workspace switch → separate data
await dash.goto(BASE + '#/app'); await dash.click('[data-testid=ws-switch]'); await dash.waitForTimeout(200)
await shot(dash, '15-workspace-switcher.png')
await dash.locator('.wsw .menu button', { hasText: 'Kora Living' }).click(); await dash.waitForTimeout(400)
ok(!(await dash.textContent('body')).includes('Chinedu Okafor'), 'Kora workspace does not show EMRAD data')
await dash.evaluate(() => localStorage.setItem('enquivo.v1.active', 'emrad'))

// tour
await dash.goto(BASE + '#/app/pipeline'); await dash.click('[data-testid=tour]'); await dash.waitForTimeout(300)
await shot(dash, '16-demo-tour.png')
await dash.click('[data-testid=tour]')

// hosted page on mobile with referral
const m = await browser.newContext({ ...devices['iPhone 13'] })
const mp = await m.newPage()
await mp.goto(BASE + 'e/emrad?ref=PH-CLUB'); await mp.waitForSelector('.ew-panel')
ok(mp.url().includes('#/e/emrad?ref=PH-CLUB'), 'pretty path /e/emrad redirects to hash route')
ok((await mp.textContent('body')).includes('Garden City Sports Club'), 'referral attribution banner')
await mp.locator('.ew-chips .chip', { hasText: 'Showroom locations' }).click()
await mp.waitForFunction(() => document.querySelectorAll('.ew-body .msg.b').length >= 2, null, { timeout: 8000 })
await mp.waitForTimeout(400)
await shot(mp, '17-hosted-page-mobile.png')
await mp.goto(BASE + '#/site/emrad'); await mp.waitForTimeout(300); await mp.click('[data-testid=widget-bubble]'); await mp.waitForTimeout(500)
await shot(mp, '18-widget-mobile.png')
await m.close()

// laptop size dashboard
const lap = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await lap.goto(BASE + '#/app/pipeline'); await lap.waitForTimeout(400); await shot(lap, '19-pipeline-laptop.png')
await browser.close()
console.log(process.exitCode ? 'SOME CHECKS FAILED' : 'ALL CHECKS PASSED')
