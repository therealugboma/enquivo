# Enquivo by VUG — clickable demo

*Every enquiry deserves a response.* This is a front-end-only pitch demo of Enquivo (VUG Products). The sample customer is **Emerald Billiards (EMRAD)**, a Nigerian maker of snooker and pool tables. All people, phone numbers and prices are fictional examples.

## Run it

```bash
npm install
npm run dev          # http://localhost:4190 (hot reload)
# or a production build:
npm run build && npx vite preview --port 4190 --host 127.0.0.1
```

To run the end-to-end check, start the preview server first, then run `npm run verify`. It uses Playwright and Chromium and writes its screenshots to `screenshots/`.

## Routes

The app uses hash routing, so it works on any static host. Pretty paths such as `/e/emrad?ref=PH-CLUB` are redirected to `/#/e/emrad?ref=PH-CLUB` automatically.

| Route | What it is |
|---|---|
| `#/` | Enquivo landing page: pitch, how it works, example pricing tiers, and the "See the live demo" button |
| `#/site/emrad` | Mock EMRAD website with the Enquivo chat widget (bubble at the bottom right) |
| `#/e/emrad` · `#/e/kora` | Hosted enquiry page (chat or a form). Add `?ref=CODE` for referral tracking, e.g. `NGOZI`, `ABJ-DIST1`, `PH-CLUB`, `INTERIORS22` |
| `#/app` | Team dashboard. Pages: Overview, Inbox, Leads (pipeline and lead detail), Follow-ups, Quotations, Work orders, Referrals, Knowledge base, Team, Settings |

## How to present it (about 8 minutes)

Click **Demo tour** (bottom left) for a 12-step guided script. Each step has a "Say" line. The short version:

1. Open the dashboard (`#/app/inbox`) in one tab and the EMRAD site (`#/site/emrad`) in another, side by side.
2. On the site, open the bubble. Tap **Wood or marble?**, then ask "how much is the 8ft marble table?".
3. Tap **Get a quote** and give a name, `+234 800 000 0123`, **Lagos**, and a budget chip. The assistant summarises the enquiry and offers **Continue on WhatsApp**, which opens a wa.me link with the summary pre-filled.
4. In the dashboard tab, a toast appears, the inbox badge goes up and a new lead is auto-assigned to the Lagos salesperson. Reply from the inbox. The reply appears in the customer's chat.
5. Go to **Leads**. Drag the card across the board, then open it to see the AI summary, timeline, owner, follow-up date and notes.
6. Click **Create quotation**, then **Draft from enquiry**. Add a light canopy, click **Mark as sent**, then **Customer accepted**, then **Convert to work order**.
7. In **Work orders**, click through the stages (Timber & slate prep → Cutting → Assembly → Cloth fitting → QC → Delivery).
8. Show **Referrals**, **Knowledge base** (edit an answer and ask the tester), **Settings → Widget & embed** (embed code) and **Channels**.
9. Use the workspace switcher (top left) to open **Kora Living**, which has completely separate data. Use **Viewing as** (top right) and pick a salesperson to see the restricted view.

Use **Reset demo data** (sidebar) before each pitch.

## Changing the business data and knowledge base

- **In the app:** go to **Knowledge base**. You can add or edit Q&A answers (with trigger words and quick replies) and products and prices. Business profile, hours, showrooms and the widget greeting are in **Settings**. Changes are saved to localStorage and the widget uses them straight away.
- **In code, as the seed defaults:** edit `src/lib/seed.ts`. It holds the `emrad()` and `kora()` workspaces (staff, products, KB, referrers, leads, quotes and work orders). Then click **Reset demo data** in the app, or clear localStorage.
- **Assistant logic:** `src/lib/engine.ts` does intent rules, typo-tolerant keyword matching, product matching, lead-detail capture (name, phone, city, interest, budget) and the WhatsApp hand-off link. `src/lib/chat.ts` creates leads, auto-routes them by city or referrer, and handles agent replies.
- **Optional OpenAI fallback:** copy `.env.example` to `.env` and set `VITE_OPENAI_API_KEY`, or paste a key in **Settings → AI**. It is only used for questions the offline engine can't match, and it is grounded in the KB. Leave it empty to stay fully offline (the default). Keys in the browser are for private local demos only.

## What's real and what's mocked

**Works in the demo:**
- The offline assistant, lead capture and the knowledge-base editing that drives it
- Live sync across tabs (localStorage plus `storage` events)
- Pipeline drag-and-drop, lead timeline, assignment, notes and follow-ups
- Quotation maths (VAT, delivery, discount) and print/PDF through the browser
- Quote → work order conversion and stage tracking
- Referral attribution and click counting
- Role-filtered "Viewing as"
- Two separate workspaces
- wa.me, tel: and mailto: links
- QR code for the hosted page

**Mocked:**
- No backend, auth or database. Data lives in this browser's localStorage. In the product, workspace separation and permissions are enforced on the server, not in the browser.
- The embed `<script>` and CDN URL are illustrative only.
- Team invites send nothing.
- WhatsApp Business API, webhooks and email notifications are shown as "coming soon" or "planned".
- Pricing tiers, analytics history and all sample people, phone numbers (+234 800 000 0xxx) and Naira prices are examples.
- The "AI summary" is generated from a template over the captured fields.

## Stack

Vite, React 18, TypeScript and React Router (hash). The VUG design tokens are in `src/styles/tokens.css`, and the self-hosted Aspekta and DM Mono fonts are in `src/assets/fonts`. The only other runtime dependency is `qrcode`.
