export type CustomerStatus = 'lead' | 'following' | 'high_intent' | 'closed' | 'lost'

export type InteractionType = 'phone' | 'wechat' | 'meeting' | 'email' | 'other'

export interface Customer {
  id: string
  name: string
  phone: string | null
  company: string | null
  source: string | null
  status: CustomerStatus
  owner_id: string | null
  ai_score: number
  last_contact_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  is_public: boolean
}

export interface Interaction {
  id: string
  customer_id: string
  user_id: string
  content: string
  type: InteractionType
  ai_suggested_reply: string | null
  created_at: string
}

export interface CustomerWithInteractions extends Customer {
  interactions: Interaction[]
}

export interface PublicPoolCustomer {
  id: string
  name: string
  phone: string | null
  company: string | null
  source: string | null
  ai_score: number
  last_contact_at: string | null
  created_at: string
}

export interface AICoachRequest {
  customer_id: string
  last_interaction: string
}

export interface AICoachResponse {
  customer_intent: string
  suggested_script: string
  next_action: string
  confidence: number
}

export interface KanbanColumn {
  id: CustomerStatus
  title: string
  customers: Customer[]
}
