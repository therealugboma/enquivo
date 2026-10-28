import type { Workspace, Lead, Conversation, Quote, WorkOrder, Message, Stage } from './types'

const H = 3600_000, D = 24 * H
const iso = (t: number) => new Date(t).toISOString().slice(0, 10)
let n = 0
const id = (p: string) => `${p}_${(++n).toString(36)}${Math.random().toString(36).slice(2, 6)}`

export const WO_STAGES_EMRAD = ['Timber & slate prep', 'Cutting', 'Assembly', 'Cloth fitting', 'QC & levelling', 'Delivery & install']

function emrad(): Workspace {
  const now = Date.now()
  const staff = [
    { id: 'st_ada', name: 'Adaeze Okafor', role: 'Owner' as const, email: 'adaeze@example.com', phone: '+234 800 000 0001', showroom: 'Lekki, Lagos', active: true },
    { id: 'st_tunde', name: 'Tunde Bakare', role: 'Manager' as const, email: 'tunde@example.com', phone: '+234 800 000 0002', showroom: 'Ikeja, Lagos', active: true },
    { id: 'st_ngozi', name: 'Ngozi Eze', role: 'Salesperson' as const, email: 'ngozi@example.com', phone: '+234 800 000 0003', showroom: 'Lekki, Lagos', active: true },
    { id: 'st_musa', name: 'Musa Ibrahim', role: 'Salesperson' as const, email: 'musa@example.com', phone: '+234 800 000 0004', showroom: 'Wuse 2, Abuja', active: true },
    { id: 'st_ife', name: 'Ifeoma Nwosu', role: 'Salesperson' as const, email: 'ifeoma@example.com', phone: '+234 800 000 0005', showroom: 'GRA, Port Harcourt', active: true },
    { id: 'st_seun', name: 'Seun Adeyemi', role: 'Operations' as const, email: 'seun@example.com', phone: '+234 800 000 0006', showroom: 'Workshop, Ikorodu', active: true },
  ]
  const products = [
    { id: 'p_pool7w', name: '7ft Pool Table — Wood bed', category: 'Pool tables', size: '7ft (213 × 122 cm)', bed: 'Wood (MDF composite)', price: 1450000, description: 'Home-friendly pool table with a solid hardwood body and a sealed wood playing bed. Fits rooms from 4.6 × 4 m.', keywords: ['7ft', '7 ft', 'seven', 'small', 'home', 'pool', 'wood'] },
    { id: 'p_pool7m', name: '7ft Pool Table — Marble bed', category: 'Pool tables', size: '7ft (213 × 122 cm)', bed: 'Marble/slate, 3-piece', price: 2350000, description: 'Our 7ft frame with a three-piece marble bed for a truer, faster roll.', keywords: ['7ft', '7 ft', 'seven', 'pool', 'marble', 'slate'] },
    { id: 'p_pool8m', name: '8ft Pool Table — Marble bed', category: 'Pool tables', size: '8ft (244 × 137 cm)', bed: 'Marble/slate, 3-piece', price: 2900000, description: 'The most popular size for lounges and homes. Marble bed, mahogany or iroko body.', keywords: ['8ft', '8 ft', 'eight', 'pool', 'marble', 'lounge'] },
    { id: 'p_pool9m', name: '9ft Tournament Pool Table — Marble bed', category: 'Pool tables', size: '9ft (274 × 152 cm)', bed: 'Marble/slate, 3-piece', price: 3800000, description: 'Full tournament size for clubs, bars and serious players.', keywords: ['9ft', '9 ft', 'nine', 'tournament', 'pool', 'club', 'bar'] },
    { id: 'p_snk10w', name: '10ft Snooker Table — Wood bed', category: 'Snooker tables', size: '10ft (305 × 152 cm)', bed: 'Wood (MDF composite)', price: 3200000, description: 'A compact snooker table for homes and estates. Hardwood body, wood bed.', keywords: ['10ft', '10 ft', 'ten', 'snooker', 'wood'] },
    { id: 'p_snk12m', name: '12ft Full-size Snooker Table — Marble bed', category: 'Snooker tables', size: '12ft (366 × 183 cm)', bed: 'Marble/slate, 5-piece', price: 6500000, description: 'Full-size championship snooker table. Five-piece marble bed, heated-bed option.', keywords: ['12ft', '12 ft', 'twelve', 'full size', 'full-size', 'snooker', 'championship', 'marble'] },
    { id: 'p_cues', name: 'Cue set (4 cues + rack)', category: 'Accessories', price: 85000, description: 'Four ash cues with a wall rack.', keywords: ['cue', 'cues', 'stick', 'rack'] },
    { id: 'p_balls_s', name: 'Snooker ball set (22 balls)', category: 'Accessories', price: 95000, description: 'Tournament-grade resin snooker balls.', keywords: ['snooker balls', 'balls'] },
    { id: 'p_balls_p', name: 'Pool ball set (16 balls)', category: 'Accessories', price: 55000, description: 'Resin pool balls, standard 57 mm.', keywords: ['pool balls', 'balls'] },
    { id: 'p_light', name: 'Table light canopy', category: 'Accessories', price: 140000, description: 'Three-shade LED canopy sized to your table.', keywords: ['light', 'lamp', 'canopy'] },
    { id: 'p_cover', name: 'Fitted table cover', category: 'Accessories', price: 40000, description: 'Dust and spill cover, made to size.', keywords: ['cover'] },
    { id: 'p_recloth', name: 'Re-clothing service', category: 'Services', price: 220000, description: 'New cloth fitted at your location, including cushions.', keywords: ['recloth', 're-cloth', 'cloth', 'felt', 'repair'] },
    { id: 'p_deliv', name: 'Delivery & installation (Lagos)', category: 'Services', price: 80000, description: 'Delivery, assembly and levelling within Lagos.', keywords: ['delivery', 'install'] },
  ]
  const kb = [
    { id: 'kb1', topic: 'Products', question: 'What is the difference between a wood bed and a marble bed?', keywords: ['wood', 'marble', 'slate', 'difference', 'bed', 'vs', 'better', 'which'], answer: 'Both use our solid hardwood bodies. A wood bed is lighter and more affordable, good for family and casual play. A marble (slate) bed is heavier, stays perfectly flat for decades and gives a truer roll, which is what clubs and serious players prefer. Marble adds roughly ₦900,000 on a 7ft table.', chips: ['See prices', 'Which size fits my room?', 'Get a quote'] },
    { id: 'kb2', topic: 'Products', question: 'What sizes do you make?', keywords: ['size', 'sizes', 'dimension', 'dimensions', 'big', 'feet', 'ft', 'how large'], answer: 'Pool tables come in 7ft, 8ft and 9ft. Snooker tables come in 10ft and 12ft (full size). We also build custom sizes on request.', chips: ['Which size fits my room?', 'See prices', 'Wood or marble?'] },
    { id: 'kb3', topic: 'Products', question: 'How much space do I need?', keywords: ['room', 'space', 'fit', 'need', 'area', 'how much space', 'small room'], answer: 'Allow the table plus about 1.5 m of cue room on every side. Roughly: 7ft pool needs 4.6 × 4.0 m, 8ft needs 4.9 × 4.2 m, 9ft needs 5.2 × 4.5 m, and a 12ft snooker table needs 6.7 × 5.1 m. Shorter cues help in tighter rooms.', chips: ['See prices', 'Get a quote'] },
    { id: 'kb4', topic: 'Delivery', question: 'Do you deliver, and how long does it take?', keywords: ['deliver', 'delivery', 'ship', 'shipping', 'long', 'lead time', 'when', 'days', 'weeks', 'install', 'installation'], answer: 'Yes. Tables in stock are delivered within 3–7 days. Made-to-order tables take 2–4 weeks from deposit. Delivery and installation within Lagos is ₦80,000 (example); other states are quoted by distance. Our team assembles and levels the table on site.', chips: ['Get a quote', 'Visit a showroom'] },
    { id: 'kb5', topic: 'Showrooms', question: 'Where are your showrooms?', keywords: ['showroom', 'showrooms', 'location', 'address', 'where', 'visit', 'store', 'shop', 'office', 'lagos', 'abuja', 'port harcourt'], answer: 'We have showrooms in Lekki (Lagos), Ikeja (Lagos), Wuse 2 (Abuja) and GRA (Port Harcourt). All tables are built at our workshop in Ikorodu. You are welcome to visit and play on a table before you decide.', chips: ['Opening hours', 'Book a visit'] },
    { id: 'kb6', topic: 'Hours', question: 'What are your opening hours?', keywords: ['hours', 'open', 'opening', 'close', 'closing', 'time', 'saturday', 'sunday', 'weekend'], answer: 'Showrooms are open Monday to Saturday, 9am – 6pm. On Sundays we take visits by appointment only.', chips: ['Book a visit', 'Showroom locations'] },
    { id: 'kb7', topic: 'Warranty', question: 'Is there a warranty?', keywords: ['warranty', 'guarantee', 'guaranteed', 'broken', 'fault', 'defect', 'after sales'], answer: 'Every table carries a 5-year structural warranty on the body and frame, and 10 years on marble beds. Cloth and cushions are covered for 12 months against manufacturing faults. We also offer paid re-clothing and servicing.', chips: ['Get a quote', 'Talk to a person'] },
    { id: 'kb8', topic: 'Customisation', question: 'Can I customise the wood, cloth colour or logo?', keywords: ['custom', 'customise', 'customize', 'colour', 'color', 'cloth', 'logo', 'finish', 'mahogany', 'iroko', 'personal', 'brand'], answer: 'Yes. Choose a mahogany, iroko or walnut-stain finish, a cloth colour (green, blue, wine, grey or black), and add an engraved name or logo plate. Custom finishes keep the same 2–4 week lead time.', chips: ['Get a quote', 'See prices'] },
    { id: 'kb9', topic: 'Payment', question: 'How do I pay?', keywords: ['pay', 'payment', 'deposit', 'installment', 'instalment', 'transfer', 'card', 'balance'], answer: 'We take bank transfer and card at our showrooms. Made-to-order tables need a 60% deposit, with the balance due before delivery. Our team confirms every payment personally — the assistant never takes payments.', chips: ['Get a quote', 'Talk to a person'] },
    { id: 'kb10', topic: 'Accessories', question: 'Do you sell accessories?', keywords: ['accessories', 'accessory', 'cue', 'cues', 'balls', 'chalk', 'light', 'cover', 'rack'], answer: 'Yes — cue sets, snooker and pool ball sets, table light canopies, fitted covers and cue racks. Every table ships with a starter set of two cues, balls and chalk.', chips: ['See prices', 'Get a quote'] },
    { id: 'kb11', topic: 'Services', question: 'Do you repair or re-cloth tables?', keywords: ['repair', 'recloth', 're-cloth', 'fix', 'service', 'servicing', 'old table', 'refurbish', 'maintenance'], answer: 'Yes. We re-cloth, re-level and repair tables from any maker. Re-clothing starts at ₦220,000 (example) and is done at your location in one day.', chips: ['Get a quote', 'Talk to a person'] },
    { id: 'kb12', topic: 'Company', question: 'Who are Emerald Billiards?', keywords: ['who', 'about', 'company', 'emrad', 'emerald', 'made', 'nigeria', 'local', 'make'], answer: 'Emerald Billiards (EMRAD) designs and builds snooker and pool tables in Nigeria, with solid hardwood bodies and a choice of wood or marble playing beds. We supply homes, estates, hotels, bars and clubs.', chips: ['See prices', 'Showroom locations'] },
  ]
  const referrers = [
    { id: 'rf1', code: 'NGOZI', name: 'Ngozi Eze', type: 'Staff' as const, commission: 3, city: 'Lagos' },
    { id: 'rf2', code: 'ABJ-DIST1', name: 'Capital Leisure Ltd (Abuja)', type: 'Distributor' as const, commission: 7, city: 'Abuja' },
    { id: 'rf3', code: 'PH-CLUB', name: 'Garden City Sports Club', type: 'Partner' as const, commission: 5, city: 'Port Harcourt' },
    { id: 'rf4', code: 'INTERIORS22', name: 'Studio Lagos Interiors', type: 'Partner' as const, commission: 5, city: 'Lagos' },
  ]
  type L = [string, string, string, string, string, number, Lead['source'], string | undefined, Stage, string | undefined, number, Lead['intent'], string]
  const raw: L[] = [
    ['Chinedu Okeke', '+234 800 000 0101', 'Lagos', '8ft Pool Table — Marble bed', '₦2.5m – ₦3m', 2900000, 'Website widget', undefined, 'new', 'st_ngozi', 0.08, 'Quote request', 'Wants an 8ft marble pool table for a home games room in Lekki. Asked about delivery time and cloth colours.'],
    ['Halima Sule', '+234 800 000 0102', 'Abuja', '12ft Full-size Snooker Table — Marble bed', 'Above ₦6m', 6500000, 'Referral link', 'ABJ-DIST1', 'new', 'st_musa', 0.3, 'Showroom visit', 'Club owner in Abuja. Wants to see the 12ft marble snooker table at Wuse 2 before ordering two units.'],
    ['Emeka Nwachukwu', '+234 800 000 0103', 'Port Harcourt', '9ft Tournament Pool Table — Marble bed', '₦3.5m – ₦4m', 3800000, 'Hosted page', 'PH-CLUB', 'contacted', 'st_ife', 1.2, 'Comparing', 'Comparing 9ft vs 8ft for a sports bar. Needs two tables and lights.'],
    ['Folake Adebayo', '+234 800 000 0104', 'Lagos', '7ft Pool Table — Wood bed', 'Under ₦1.5m', 1450000, 'Website widget', undefined, 'contacted', 'st_ngozi', 2.1, 'Exploring', 'Birthday gift for husband. Small living room in Yaba; asked which size fits.'],
    ['Ibrahim Danjuma', '+234 800 000 0105', 'Kano', '10ft Snooker Table — Wood bed', '₦3m – ₦3.5m', 3200000, 'Phone call', undefined, 'quoted', 'st_musa', 4.5, 'Quote request', 'Estate clubhouse. Needs delivery to Kano; quote sent including transport.'],
    ['Grace Etim', '+234 800 000 0106', 'Uyo', 'Re-clothing service', '₦200k – ₦300k', 220000, 'Website widget', undefined, 'won', 'st_ife', 9, 'Ready to buy', 'Re-cloth an old 9ft table in wine colour.'],
    ['Oluwaseun Lawal', '+234 800 000 0107', 'Lagos', '8ft Pool Table — Marble bed', '₦3m', 3040000, 'Referral link', 'INTERIORS22', 'quoted', 'st_ngozi', 3.2, 'Quote request', 'Interior designer client, penthouse in Ikoyi. Wants walnut finish and a name plate.'],
    ['Bisi Ogunleye', '+234 800 000 0108', 'Ibadan', 'Cue set (4 cues + rack)', '₦100k', 85000, 'Website widget', undefined, 'lost', 'st_tunde', 12, 'Later', 'Wanted cues only; chose a cheaper option elsewhere.'],
    ['Kelechi Obi', '+234 800 000 0109', 'Enugu', '7ft Pool Table — Marble bed', '₦2m – ₦2.5m', 2350000, 'Hosted page', undefined, 'new', undefined, 0.02, 'Ready to buy', 'Ready to pay a deposit this week. Asked about delivery to Enugu.'],
    ['Amaka Uzor', '+234 800 000 0110', 'Lagos', '12ft Full-size Snooker Table — Marble bed', 'Above ₦6m', 6500000, 'Walk-in', undefined, 'won', 'st_tunde', 15, 'Ready to buy', 'Private residence, Banana Island. Heated-bed option requested.'],
    ['Yusuf Bello', '+234 800 000 0111', 'Abuja', '9ft Tournament Pool Table — Marble bed', '₦4m', 3800000, 'Referral link', 'ABJ-DIST1', 'contacted', 'st_musa', 1.8, 'Comparing', 'Hotel lounge in Maitama. Wants pricing for 3 tables.'],
    ['Tobi Akinola', '+234 800 000 0112', 'Lagos', 'Table light canopy', '₦150k', 140000, 'Website widget', undefined, 'new', 'st_ngozi', 0.5, 'Exploring', 'Asked about lights for an existing table.'],
    ['Patience Okon', '+234 800 000 0113', 'Port Harcourt', '8ft Pool Table — Marble bed', '₦2.9m', 2900000, 'Referral link', 'PH-CLUB', 'won', 'st_ife', 20, 'Ready to buy', 'Club member, home games room. Delivered.'],
    ['Segun Afolabi', '+234 800 000 0114', 'Lagos', '10ft Snooker Table — Wood bed', '₦3m', 3200000, 'Website widget', 'NGOZI', 'quoted', 'st_ngozi', 6, 'Quote request', 'Estate in Magodo. Considering wood vs marble.'],
  ]
  const leads: Lead[] = []; const convs: Conversation[] = []
  raw.forEach((r, i) => {
    const [name, phone, city, interest, budget, value, source, refCode, stage, assignee, ago, intent, summary] = r
    const created = now - ago * D
    const lid = `ld_${i + 1}`
    let conversationId: string | undefined
    if (source === 'Website widget' || source === 'Hosted page' || (source === 'Referral link' && i % 2 === 1)) {
      const cid = `cv_${i + 1}`
      conversationId = cid
      const m = (from: Message['from'], text: string, dt: number, author?: string): Message => ({ id: id('m'), from, text, at: created + dt * 60_000, author })
      const msgs: Message[] = [
        m('bot', 'Hello 👋 Welcome to Emerald Billiards. I can help with tables, sizes, prices, delivery and showroom visits. What are you looking for?', 0),
        m('visitor', `Hi, I'm interested in the ${interest.toLowerCase()}. How much is it?`, 0.4),
        m('bot', `The ${interest} is ₦${value.toLocaleString('en-NG')} (example price). I can prepare a proper quote for you — may I have your name?`, 0.5),
        m('visitor', name, 0.9),
        m('bot', `Thanks, ${name.split(' ')[0]}. What phone or WhatsApp number should our team use?`, 1),
        m('visitor', phone, 1.4),
        m('bot', 'Got it. Which city are you in?', 1.5),
        m('visitor', city, 1.8),
        m('bot', `Thank you. I've passed your enquiry to our ${city} team — someone will contact you shortly.`, 1.9),
      ]
      if (stage !== 'new') msgs.push(m('agent', `Hi ${name.split(' ')[0]}, this is ${staff.find(s => s.id === assignee)?.name.split(' ')[0] ?? 'the team'} from EMRAD. Thanks for reaching out — when is a good time to call?`, 60, assignee))
      convs.push({ id: cid, channel: source === 'Hosted page' ? 'Hosted page' : 'Website widget', page: source === 'Hosted page' ? '/e/emrad' : 'emrad.ng/tables', status: stage === 'new' ? 'ai' : 'human', createdAt: created, updatedAt: msgs[msgs.length - 1].at, unread: stage === 'new' ? 1 : 0, leadId: lid, ctx: { name, phone, city, interest, budget, ref: refCode }, messages: msgs })
    }
    const timeline = [{ id: id('t'), at: created, kind: 'created' as const, text: `Enquiry captured via ${source}${refCode ? ` (ref ${refCode})` : ''}` }]
    if (assignee) timeline.push({ id: id('t'), at: created + 5 * 60_000, kind: 'assign' as const, text: `Assigned to ${staff.find(s => s.id === assignee)?.name}`, by: 'Auto-routing' } as any)
    if (['contacted', 'quoted', 'won', 'lost'].includes(stage)) timeline.push({ id: id('t'), at: created + 2 * H, kind: 'stage' as const, text: 'Moved to Contacted' } as any)
    if (['quoted', 'won'].includes(stage)) timeline.push({ id: id('t'), at: created + 20 * H, kind: 'stage' as const, text: 'Moved to Quoted' } as any)
    if (stage === 'won') timeline.push({ id: id('t'), at: created + 3 * D, kind: 'stage' as const, text: 'Marked as Won' } as any)
    if (stage === 'lost') timeline.push({ id: id('t'), at: created + 3 * D, kind: 'stage' as const, text: 'Marked as Lost — chose a cheaper option' } as any)
    const fuOffsets: Record<number, number> = { 2: 0, 3: -1, 4: 1, 6: 0, 10: -2, 13: 2 }
    leads.push({ id: lid, name, phone, email: `${name.split(' ')[0].toLowerCase()}@example.com`, city, interest, budget, value, source, refCode, stage, assignee, owner: assignee, createdAt: created, updatedAt: created + H, summary, intent, conversationId, followUp: fuOffsets[i] !== undefined ? iso(now + fuOffsets[i] * D) : undefined, followUpNote: fuOffsets[i] !== undefined ? ['Call to confirm showroom visit', 'Send cloth colour samples', 'Chase quote decision', 'Confirm walnut finish', 'Share 3-table bundle price', 'Follow up on wood vs marble'][Object.keys(fuOffsets).indexOf(String(i))] : undefined, notes: i === 1 ? ['Wants two tables if the club extension is approved. Bring heated-bed spec sheet to the visit.'] : [], timeline, lostReason: stage === 'lost' ? 'Price' : undefined })
  })
  const ql = (pid: string, qty = 1) => { const p = products.find(x => x.id === pid)!; return { id: id('ql'), productId: pid, name: p.name, qty, unit: p.price } }
  const quotes: Quote[] = [
    { id: 'q1', number: 'EMR-Q-1041', leadId: 'ld_5', lines: [ql('p_snk10w'), ql('p_balls_s'), ql('p_light')], delivery: 350000, discount: 0, vatRate: 7.5, status: 'sent', createdAt: now - 4 * D, validDays: 14, notes: 'Delivery to Kano by road, including installation.', createdBy: 'st_musa' },
    { id: 'q2', number: 'EMR-Q-1042', leadId: 'ld_7', lines: [ql('p_pool8m'), { id: id('ql'), name: 'Walnut-stain finish + engraved name plate', qty: 1, unit: 140000 }, ql('p_cover')], delivery: 80000, discount: 50000, vatRate: 7.5, status: 'sent', createdAt: now - 3 * D, validDays: 14, notes: '', createdBy: 'st_ngozi' },
    { id: 'q3', number: 'EMR-Q-1038', leadId: 'ld_10', lines: [ql('p_snk12m'), { id: id('ql'), name: 'Heated bed upgrade', qty: 1, unit: 650000 }, ql('p_light'), ql('p_cues')], delivery: 80000, discount: 200000, vatRate: 7.5, status: 'accepted', createdAt: now - 14 * D, validDays: 14, notes: '60% deposit received (confirmed by accounts).', createdBy: 'st_tunde', workOrderId: 'wo1' },
    { id: 'q4', number: 'EMR-Q-1035', leadId: 'ld_13', lines: [ql('p_pool8m'), ql('p_balls_p')], delivery: 120000, discount: 0, vatRate: 7.5, status: 'accepted', createdAt: now - 19 * D, validDays: 14, notes: '', createdBy: 'st_ife', workOrderId: 'wo2' },
    { id: 'q5', number: 'EMR-Q-1043', leadId: 'ld_14', lines: [ql('p_snk10w'), ql('p_cues')], delivery: 80000, discount: 0, vatRate: 7.5, status: 'draft', createdAt: now - 1 * D, validDays: 14, notes: 'Offer marble upgrade as option.', createdBy: 'st_ngozi' },
  ]
  const workOrders: WorkOrder[] = [
    { id: 'wo1', number: 'EMR-WO-208', quoteId: 'q3', leadId: 'ld_10', title: '12ft Snooker — Marble, heated bed', spec: 'Mahogany body · 5-piece marble bed · green cloth · heated bed · light canopy', stages: WO_STAGES_EMRAD.map((s, i) => ({ name: s, done: i < 3, doneAt: i < 3 ? now - (10 - i * 3) * D : undefined })), assignee: 'st_seun', due: iso(now + 6 * D), notes: 'Access via service lift; 3 installers needed.', createdAt: now - 13 * D, priority: 'Normal' },
    { id: 'wo2', number: 'EMR-WO-205', quoteId: 'q4', leadId: 'ld_13', title: '8ft Pool — Marble bed', spec: 'Iroko body · 3-piece marble bed · blue cloth', stages: WO_STAGES_EMRAD.map((s, i) => ({ name: s, done: true, doneAt: now - (18 - i * 3) * D })), assignee: 'st_seun', due: iso(now - 2 * D), notes: 'Delivered and levelled. Customer signed off.', createdAt: now - 18 * D, priority: 'Normal' },
  ]
  return {
    id: 'emrad', plan: 'Growth (trial)', currentUser: 'st_ada', seq: 1044, woStages: WO_STAGES_EMRAD,
    profile: { name: 'Emerald Billiards', legalName: 'Emerald Billiards Ltd (EMRAD) — sample data', slug: 'emrad', website: 'emrad.ng', industry: 'Manufacturing — snooker & pool tables', phone: '+234 800 000 0000', whatsapp: '2348000000000', email: 'hello@example.com', hours: 'Mon–Sat 9am–6pm · Sun by appointment', address: 'Workshop: Ikorodu, Lagos', showrooms: ['Lekki, Lagos', 'Ikeja, Lagos', 'Wuse 2, Abuja', 'GRA, Port Harcourt'], currency: 'NGN', vatRate: 7.5, tagline: 'Snooker & pool tables, made in Nigeria.' },
    widget: { title: 'EMRAD Assistant', greeting: 'Hello 👋 Welcome to Emerald Billiards. I can help with tables, sizes, prices, delivery and showroom visits. What are you looking for?', accent: 'ink', position: 'right', captureMode: 'smart', quickReplies: ['See prices', 'Wood or marble?', 'Get a quote', 'Showroom locations'], enabled: true },
    staff, products, kb, referrers, conversations: convs, leads, quotes, workOrders,
  }
}

function kora(): Workspace {
  const now = Date.now()
  return {
    id: 'kora', plan: 'Starter (trial)', currentUser: 'k_st1', seq: 210, woStages: ['Design sign-off', 'Frame', 'Upholstery', 'Finishing', 'Delivery'],
    profile: { name: 'Kora Living', legalName: 'Kora Living Furniture — sample data', slug: 'kora', website: 'koraliving.example', industry: 'Furniture — sofas & dining', phone: '+234 800 000 0900', whatsapp: '2348000000900', email: 'hello@kora.example', hours: 'Mon–Fri 10am–6pm', address: 'Showroom: Jabi, Abuja', showrooms: ['Jabi, Abuja'], currency: 'NGN', vatRate: 7.5, tagline: 'Made-to-measure sofas and dining sets.' },
    widget: { title: 'Kora Assistant', greeting: 'Hi! I can help with sofas, dining sets, fabrics and delivery. What are you furnishing?', accent: 'ink', position: 'right', captureMode: 'smart', quickReplies: ['Sofa prices', 'Fabric options', 'Get a quote'], enabled: true },
    staff: [
      { id: 'k_st1', name: 'Zainab Yusuf', role: 'Owner', email: 'zainab@kora.example', phone: '+234 800 000 0901', showroom: 'Jabi, Abuja', active: true },
      { id: 'k_st2', name: 'David Okon', role: 'Salesperson', email: 'david@kora.example', phone: '+234 800 000 0902', showroom: 'Jabi, Abuja', active: true },
    ],
    products: [
      { id: 'k_p1', name: '3-seater sofa (fabric)', category: 'Sofas', price: 650000, description: 'Hardwood frame, high-density foam, choice of 12 fabrics.', keywords: ['sofa', 'couch', '3 seater', 'three seater'] },
      { id: 'k_p2', name: 'L-shaped sectional', category: 'Sofas', price: 1250000, description: 'Made to your room measurements.', keywords: ['sectional', 'l-shape', 'l shaped', 'corner'] },
      { id: 'k_p3', name: '6-seater dining set', category: 'Dining', price: 980000, description: 'Solid wood table with six upholstered chairs.', keywords: ['dining', 'table', 'chairs'] },
    ],
    kb: [
      { id: 'kkb1', topic: 'Fabrics', question: 'What fabrics do you offer?', keywords: ['fabric', 'fabrics', 'leather', 'velvet', 'colour', 'color'], answer: 'We offer linen, velvet, boucle and faux leather in 12 colours. Samples are available at our Jabi showroom.' },
      { id: 'kkb2', topic: 'Delivery', question: 'How long does delivery take?', keywords: ['delivery', 'deliver', 'long', 'weeks'], answer: 'Made-to-measure pieces take 3 weeks. Delivery within Abuja is free (example).' },
    ],
    referrers: [{ id: 'k_rf1', code: 'KORA-ARCH', name: 'Plan & Form Architects', type: 'Partner', commission: 5, city: 'Abuja' }],
    conversations: [],
    leads: [
      { id: 'k_ld1', name: 'Hauwa Garba', phone: '+234 800 000 0951', city: 'Abuja', interest: 'L-shaped sectional', budget: '₦1.2m', value: 1250000, source: 'Website widget', stage: 'new', assignee: 'k_st2', owner: 'k_st2', createdAt: now - 0.2 * D, updatedAt: now, summary: 'Needs a sectional for a 5m living room wall, grey boucle.', intent: 'Quote request', notes: [], timeline: [{ id: 'kt1', at: now - 0.2 * D, kind: 'created', text: 'Enquiry captured via Website widget' }] },
      { id: 'k_ld2', name: 'Peter Adah', phone: '+234 800 000 0952', city: 'Abuja', interest: '6-seater dining set', budget: '₦1m', value: 980000, source: 'Referral link', refCode: 'KORA-ARCH', stage: 'contacted', assignee: 'k_st2', owner: 'k_st2', createdAt: now - 3 * D, updatedAt: now, summary: 'Architect client, new duplex in Guzape.', intent: 'Comparing', notes: [], timeline: [{ id: 'kt2', at: now - 3 * D, kind: 'created', text: 'Enquiry captured via Referral link (ref KORA-ARCH)' }] },
      { id: 'k_ld3', name: 'Rita Ekpo', phone: '+234 800 000 0953', city: 'Abuja', interest: '3-seater sofa (fabric)', budget: '₦700k', value: 650000, source: 'Walk-in', stage: 'won', assignee: 'k_st1', owner: 'k_st1', createdAt: now - 9 * D, updatedAt: now, summary: 'Velvet green sofa.', intent: 'Ready to buy', notes: [], timeline: [{ id: 'kt3', at: now - 9 * D, kind: 'created', text: 'Walk-in enquiry logged' }] },
    ],
    quotes: [], workOrders: [],
  }
}

export function seedAll(): Record<string, Workspace> { return { emrad: emrad(), kora: kora() } }
