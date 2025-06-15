// WhatsApp Business API Types for IndoChat AI

export interface WhatsAppWebhookEntry {
  id: string
  changes: WhatsAppChange[]
}

export interface WhatsAppChange {
  value: WhatsAppChangeValue
  field: string
}

export interface WhatsAppChangeValue {
  messaging_product: string
  metadata: WhatsAppMetadata
  contacts?: WhatsAppContact[]
  messages?: WhatsAppMessage[]
  statuses?: WhatsAppStatus[]
}

export interface WhatsAppMetadata {
  display_phone_number: string
  phone_number_id: string
}

export interface WhatsAppContact {
  profile: {
    name: string
  }
  wa_id: string
}

export interface WhatsAppMessage {
  id: string
  from: string
  timestamp: string
  type: WhatsAppMessageType
  context?: {
    from: string
    id: string
    referred_product?: {
      catalog_id: string
      product_retailer_id: string
    }
  }
  text?: WhatsAppTextMessage
  image?: WhatsAppMediaMessage
  document?: WhatsAppDocumentMessage
  audio?: WhatsAppMediaMessage
  video?: WhatsAppMediaMessage
  voice?: WhatsAppMediaMessage
  location?: WhatsAppLocationMessage
  contacts?: WhatsAppContactMessage[]
  interactive?: WhatsAppInteractiveMessage
  button?: WhatsAppButtonMessage
  order?: WhatsAppOrderMessage
  system?: WhatsAppSystemMessage
}

export type WhatsAppMessageType = 
  | 'text'
  | 'image'
  | 'document'
  | 'audio'
  | 'video'
  | 'voice'
  | 'location'
  | 'contacts'
  | 'interactive'
  | 'button'
  | 'order'
  | 'system'
  | 'unknown'

export interface WhatsAppTextMessage {
  body: string
}

export interface WhatsAppMediaMessage {
  id: string
  mime_type: string
  sha256: string
  caption?: string
}

export interface WhatsAppDocumentMessage extends WhatsAppMediaMessage {
  filename: string
}

export interface WhatsAppLocationMessage {
  latitude: number
  longitude: number
  name?: string
  address?: string
}

export interface WhatsAppContactMessage {
  name: {
    formatted_name: string
    first_name?: string
    last_name?: string
  }
  phones?: Array<{
    phone: string
    type?: string
  }>
  emails?: Array<{
    email: string
    type?: string
  }>
}

export interface WhatsAppInteractiveMessage {
  type: 'button_reply' | 'list_reply'
  button_reply?: {
    id: string
    title: string
  }
  list_reply?: {
    id: string
    title: string
    description?: string
  }
}

export interface WhatsAppButtonMessage {
  text: string
  payload: string
}

export interface WhatsAppOrderMessage {
  catalog_id: string
  product_items: Array<{
    product_retailer_id: string
    quantity: number
    item_price: number
    currency: string
  }>
  text?: string
}

export interface WhatsAppSystemMessage {
  body: string
  type: 'customer_changed_number' | 'customer_identity_changed'
  identity?: string
  wa_id?: string
}

export interface WhatsAppStatus {
  id: string
  status: WhatsAppMessageStatus
  timestamp: string
  recipient_id: string
  conversation?: {
    id: string
    expiration_timestamp?: string
    origin: {
      type: 'marketing' | 'utility' | 'authentication' | 'service'
    }
  }
  pricing?: {
    billable: boolean
    pricing_model: 'CBP' | 'NBP'
    category: 'marketing' | 'utility' | 'authentication' | 'service'
  }
  errors?: Array<{
    code: number
    title: string
    message: string
    error_data?: {
      details: string
    }
  }>
}

export type WhatsAppMessageStatus = 
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'

// Outbound message types
export interface WhatsAppOutboundMessage {
  messaging_product: 'whatsapp'
  recipient_type: 'individual'
  to: string
  type: 'text' | 'template' | 'interactive' | 'image' | 'document' | 'audio' | 'video'
  text?: {
    body: string
    preview_url?: boolean
  }
  template?: WhatsAppTemplate
  interactive?: WhatsAppInteractiveOutbound
  image?: WhatsAppMediaOutbound
  document?: WhatsAppDocumentOutbound
  audio?: WhatsAppMediaOutbound
  video?: WhatsAppMediaOutbound
}

export interface WhatsAppTemplate {
  name: string
  language: {
    code: string
  }
  components?: WhatsAppTemplateComponent[]
}

export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'footer' | 'button'
  sub_type?: 'quick_reply' | 'url' | 'phone_number'
  index?: number
  parameters: WhatsAppTemplateParameter[]
}

export interface WhatsAppTemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video'
  text?: string
  currency?: {
    fallback_value: string
    code: string
    amount_1000: number
  }
  date_time?: {
    fallback_value: string
    day_of_week?: number
    year?: number
    month?: number
    day_of_month?: number
    hour?: number
    minute?: number
    calendar?: 'GREGORIAN'
  }
  image?: {
    id?: string
    link?: string
  }
  document?: {
    id?: string
    link?: string
    filename?: string
  }
  video?: {
    id?: string
    link?: string
  }
}

export interface WhatsAppInteractiveOutbound {
  type: 'button' | 'list' | 'product' | 'product_list'
  header?: {
    type: 'text' | 'image' | 'video' | 'document'
    text?: string
    image?: WhatsAppMediaOutbound
    video?: WhatsAppMediaOutbound
    document?: WhatsAppDocumentOutbound
  }
  body: {
    text: string
  }
  footer?: {
    text: string
  }
  action: WhatsAppInteractiveAction
}

export interface WhatsAppInteractiveAction {
  buttons?: WhatsAppInteractiveButton[]
  button?: string
  sections?: WhatsAppInteractiveSection[]
  catalog_id?: string
  product_retailer_id?: string
}

export interface WhatsAppInteractiveButton {
  type: 'reply'
  reply: {
    id: string
    title: string
  }
}

export interface WhatsAppInteractiveSection {
  title?: string
  rows: WhatsAppInteractiveRow[]
  product_items?: WhatsAppProductItem[]
}

export interface WhatsAppInteractiveRow {
  id: string
  title: string
  description?: string
}

export interface WhatsAppProductItem {
  product_retailer_id: string
}

export interface WhatsAppMediaOutbound {
  id?: string
  link?: string
  caption?: string
}

export interface WhatsAppDocumentOutbound extends WhatsAppMediaOutbound {
  filename?: string
}

// Error types
export interface WhatsAppError {
  code: number
  title: string
  message: string
  error_data?: {
    details: string
  }
  error_subcode?: number
  fbtrace_id?: string
}

// Webhook verification
export interface WhatsAppWebhookVerification {
  'hub.mode': string
  'hub.verify_token': string
  'hub.challenge': string
}

// Business profile types
export interface WhatsAppBusinessProfile {
  messaging_product: 'whatsapp'
  address?: string
  description?: string
  email?: string
  profile_picture_url?: string
  websites?: string[]
  vertical?: string
}

// Phone number types
export interface WhatsAppPhoneNumber {
  verified_name: string
  display_phone_number: string
  id: string
  quality_rating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN'
  platform_type: 'CLOUD_API' | 'ON_PREMISE'
  throughput: {
    level: 'STANDARD' | 'HIGH'
  }
  webhook_configuration?: {
    webhook_url: string
    webhook_events: string[]
  }
}

// Conversation analytics
export interface WhatsAppConversationAnalytics {
  conversation_analytics: {
    phone_number: string
    granularity: 'HALF_HOUR' | 'DAILY' | 'MONTHLY'
    data_points: Array<{
      start: number
      end: number
      conversation_directions: Array<{
        direction: 'BUSINESS_INITIATED' | 'USER_INITIATED'
        conversation_categories: Array<{
          category: 'AUTHENTICATION' | 'MARKETING' | 'UTILITY' | 'SERVICE'
          conversation_types: Array<{
            type: 'REGULAR' | 'FREE_ENTRY_POINT' | 'FREE_TIER'
            conversations: number
          }>
        }>
      }>
    }>
  }
}

// Indonesian-specific types
export interface IndonesianBusinessContext {
  businessType: 'warung' | 'toko' | 'restoran' | 'jasa' | 'online_shop' | 'manufaktur' | 'lainnya'
  paymentMethods: Array<'cash' | 'transfer_bank' | 'gopay' | 'ovo' | 'dana' | 'shopeepay' | 'linkaja'>
  deliveryAreas: string[] // Kecamatan/Kelurahan
  businessHours: {
    open: string // HH:mm format
    close: string // HH:mm format
    timezone: 'Asia/Jakarta' | 'Asia/Makassar' | 'Asia/Jayapura'
    closedDays?: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>
  }
  language: 'id' | 'jv' | 'su' | 'ms' // Indonesian, Javanese, Sundanese, Malay
}

export interface IndonesianCustomerProfile {
  name: string
  phone: string
  preferredLanguage: 'id' | 'jv' | 'su' | 'ms'
  location?: {
    province: string
    city: string
    district?: string
    postalCode?: string
  }
  paymentPreference?: 'cash' | 'transfer_bank' | 'gopay' | 'ovo' | 'dana' | 'shopeepay' | 'linkaja'
  orderHistory: Array<{
    orderId: string
    date: string
    total: number
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  }>
}