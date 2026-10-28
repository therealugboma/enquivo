import { useLocation, useNavigate } from 'react-router-dom'
import { usePref, setPref } from '../lib/store'
import { Icon } from './ui'

const STEPS = [
  { to: '/', t: 'The idea', d: 'Start on the Enquivo page. One line: every enquiry deserves a response — and should become organised work.', say: '"Enquivo turns customer conversations into organised business actions."' },
  { to: '/site/emrad', t: 'A real customer website', d: 'This is a mock EMRAD site. Open the chat bubble (bottom right) and tap "Wood or marble?".', say: '"Answers come only from EMRAD\'s approved information — sizes, beds, delivery, warranty."' },
  { to: '/site/emrad', t: 'Capture the enquiry', d: 'Tap "Get a quote", then give a name, a number like +234 800 000 0000, a city and a budget.', say: '"It asks for details only when there\'s intent, and offers WhatsApp or a person at any time."' },
  { to: '/app/inbox', t: 'It arrives — live', d: 'Open the dashboard in a second tab before step 3 to watch the toast and the new lead appear instantly.', say: '"No copying from chats. The lead is created, summarised and routed to the right showroom."' },
  { to: '/app/inbox', t: 'Reply as a person', d: 'Pick the conversation and send a reply. It shows up in the customer\'s chat window.', say: '"AI handles the repetitive part; people stay in control."' },
  { to: '/app/pipeline', t: 'Pipeline & lead detail', d: 'Drag a card from New to Contacted. Open a lead to see the summary, timeline, owner and follow-up.', say: '"Everyone knows who owns what, and nothing goes quiet."' },
  { to: '/app/followups', t: 'Follow-ups', d: 'Overdue and due-today in one list. One click opens WhatsApp or email with a template.', say: '"Reminders for every lead that might otherwise be forgotten."' },
  { to: '/app/quotes/new', t: 'Quotation in a minute', d: 'Pick the new lead, "Draft from enquiry", adjust delivery, then mark Customer accepted.', say: '"Itemised, VAT included, printable — from the catalogue, not from scratch."' },
  { to: '/app/work-orders', t: 'Quote → workshop', d: 'Convert the accepted quote. The work order moves through Cutting → Assembly → Cloth → Delivery.', say: '"This is where Enquivo goes beyond a chatbot: the sale becomes the work."' },
  { to: '/app/referrals', t: 'Referrals', d: 'Distributor and partner links with leads, revenue and commission. Try /e/emrad?ref=PH-CLUB.', say: '"Clear credit for whoever brought the customer."' },
  { to: '/app/knowledge', t: 'The business teaches it', d: 'Edit an answer, then ask the tester. The website assistant uses the change immediately.', say: '"No engineers needed to keep answers current."' },
  { to: '/app/settings', t: 'Install & separation', d: 'Show the one-line embed code. Then switch workspace (top left) to Kora Living — completely separate data.', say: '"Each business gets its own assistant, data and team. Nothing is shared."' },
]

export default function Tour() {
  const open = usePref('tourOpen', '0') === '1'
  const i = Math.min(STEPS.length - 1, Number(usePref('tourStep', '0')))
  const nav = useNavigate(); const loc = useLocation()
  const s = STEPS[i]
  const go = (n: number) => { setPref('tourStep', String(n)); nav(STEPS[n].to) }
  const hideOnMobile = loc.pathname.startsWith('/e/')
  return (
    <div className={`noprint ${hideOnMobile ? 'tour-hide-m' : ''}`}>
      {open && <div className="tour" role="dialog" aria-label="Demo tour">
        <div className="spread"><span className="label">Demo tour · {i + 1} / {STEPS.length}</span><button className="icon-btn" style={{ color: 'var(--inv-mut)' }} onClick={() => setPref('tourOpen', '0')} aria-label="Close tour"><Icon n="x" /></button></div>
        <h3>{s.t}</h3>
        <p>{s.d}</p>
        <div className="say"><span className="label" style={{ display: 'block', marginBottom: 4 }}>Say</span>{s.say}</div>
        <div className="prog">{STEPS.map((_, j) => <i key={j} className={j <= i ? 'on' : ''} />)}</div>
        <div className="spread">
          <button className="btn glass sm" onClick={() => go(Math.max(0, i - 1))} disabled={i === 0}>Back</button>
          {loc.pathname !== s.to && <button className="btn glass sm" onClick={() => nav(s.to)}>Go to page</button>}
          {i < STEPS.length - 1 ? <button className="btn cta sm" onClick={() => go(i + 1)}>Next step</button> : <button className="btn cta sm" onClick={() => { setPref('tourOpen', '0'); setPref('tourStep', '0') }}>Finish</button>}
        </div>
      </div>}
      <button className="btn cta sm tourfab" onClick={() => setPref('tourOpen', open ? '0' : '1')} data-testid="tour"><Icon n="play" s={12} />Demo tour</button>
    </div>
  )
}
