export type Stage = 'new' | 'contacted' | 'quoted' | 'won' | 'lost'
export const STAGES: { id: Stage; label: string }[] = [
  { id: 'new', label: 'New' }, { id: 'contacted', label: 'Contacted' }, { id: 'quoted', label: 'Quoted' },
  { id: 'won', label: 'Won' }, { id: 'lost', label: 'Lost' },
]
export type Role = 'Owner' | 'Manager' | 'Salesperson' | 'Operations'
export interface Staff { id: string; name: string; role: Role; email: string; phone: string; showroom?: string; active: boolean }
export interface Product { id: string; name: string; category: string; size?: string; bed?: string; price: number; description: string; keywords: string[] }
export interface KBEntry { id: string; topic: string; question: string; keywords: string[]; answer: string; chips?: string[] }
export interface Referrer { id: string; code: string; name: string; type: 'Staff' | 'Distributor' | 'Partner'; commission: number; city: string; clicks?: number }
export type MsgFrom = 'visitor' | 'bot' | 'agent' | 'system'
export interface Message { id: string; from: MsgFrom; text: string; at: number; author?: string; chips?: string[] }
export interface ConvCtx { name?: string; phone?: string; email?: string; city?: string; interest?: string; budget?: string; bed?: string; awaiting?: 'name' | 'phone' | 'city' | 'interest' | 'budget' | null; capture?: boolean; intent?: string; ref?: string; topics?: string[]; answered?: number; leadCreated?: boolean; done?: boolean; misses?: number }
export interface Conversation { id: string; channel: 'Website widget' | 'Hosted page'; page?: string; status: 'ai' | 'needs-human' | 'human' | 'closed'; createdAt: number; updatedAt: number; unread: number; leadId?: string; ctx: ConvCtx; messages: Message[] }
export interface TimelineItem { id: string; at: number; kind: 'created' | 'stage' | 'note' | 'assign' | 'message' | 'quote' | 'followup' | 'workorder' | 'contact'; text: string; by?: string }
export interface Lead {
  id: string; name: string; phone: string; email?: string; city: string; interest: string; budget?: string; value: number
  source: 'Website widget' | 'Hosted page' | 'Referral link' | 'Walk-in' | 'Phone call'; refCode?: string
  stage: Stage; assignee?: string; owner?: string; createdAt: number; updatedAt: number; summary: string
  intent: 'Exploring' | 'Comparing' | 'Quote request' | 'Showroom visit' | 'Ready to buy' | 'Later'
  conversationId?: string; followUp?: string; followUpNote?: string; notes: string[]; timeline: TimelineItem[]; lostReason?: string
}
export interface QuoteLine { id: string; productId?: string; name: string; qty: number; unit: number }
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined'
export interface Quote { id: string; number: string; leadId: string; lines: QuoteLine[]; delivery: number; discount: number; vatRate: number; status: QuoteStatus; createdAt: number; validDays: number; notes: string; createdBy?: string; workOrderId?: string }
export interface WOStage { name: string; done: boolean; doneAt?: number }
export interface WorkOrder { id: string; number: string; quoteId: string; leadId: string; title: string; spec: string; stages: WOStage[]; assignee?: string; due: string; notes: string; createdAt: number; priority: 'Normal' | 'Rush' }
export interface Profile { name: string; legalName: string; slug: string; website: string; industry: string; phone: string; whatsapp: string; email: string; hours: string; address: string; showrooms: string[]; currency: string; vatRate: number; tagline: string }
export interface WidgetCfg { title: string; greeting: string; accent: 'ink' | 'red'; position: 'right' | 'left'; captureMode: 'smart' | 'early'; quickReplies: string[]; enabled: boolean }
export interface Workspace {
  id: string; plan: string; profile: Profile; widget: WidgetCfg; staff: Staff[]; products: Product[]; kb: KBEntry[]; referrers: Referrer[]
  conversations: Conversation[]; leads: Lead[]; quotes: Quote[]; workOrders: WorkOrder[]; woStages: string[]; currentUser: string; seq: number
}
