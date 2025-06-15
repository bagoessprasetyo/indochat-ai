import axios from 'axios'

export interface WhatsAppMessage {
  id: string
  from: string
  timestamp: string
  type: 'text' | 'image' | 'document' | 'audio' | 'video'
  text?: {
    body: string
  }
  image?: {
    id: string
    mime_type: string
    sha256: string
    caption?: string
  }
  document?: {
    id: string
    filename: string
    mime_type: string
    sha256: string
    caption?: string
  }
  audio?: {
    id: string
    mime_type: string
    sha256: string
  }
  video?: {
    id: string
    mime_type: string
    sha256: string
    caption?: string
  }
}

export interface WhatsAppContact {
  profile: {
    name: string
  }
  wa_id: string
}

export interface WhatsAppWebhookPayload {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        contacts?: WhatsAppContact[]
        messages?: WhatsAppMessage[]
        statuses?: Array<{
          id: string
          status: 'sent' | 'delivered' | 'read' | 'failed'
          timestamp: string
          recipient_id: string
        }>
      }
      field: string
    }>
  }>
}

export interface SendMessageOptions {
  to: string
  type: 'text' | 'template' | 'interactive'
  text?: {
    body: string
    preview_url?: boolean
  }
  template?: {
    name: string
    language: {
      code: string
    }
    components?: Array<{
      type: string
      parameters: Array<{
        type: string
        text: string
      }>
    }>
  }
  interactive?: {
    type: 'button' | 'list'
    body: {
      text: string
    }
    action: {
      buttons?: Array<{
        type: 'reply'
        reply: {
          id: string
          title: string
        }
      }>
      sections?: Array<{
        title: string
        rows: Array<{
          id: string
          title: string
          description?: string
        }>
      }>
    }
  }
}

class WhatsAppClient {
  private accessToken: string
  private phoneNumberId: string
  private baseUrl: string

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || ''
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || ''
    this.baseUrl = 'https://graph.facebook.com/v18.0'
    
    if (!this.accessToken || !this.phoneNumberId) {
      console.warn('WhatsApp credentials not configured')
    }
  }

  /**
   * Send a message via WhatsApp Business API
   */
  async sendMessage(options: SendMessageOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          ...options
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return {
        success: true,
        messageId: response.data.messages[0]?.id
      }
    } catch (error: any) {
      console.error('WhatsApp send message error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      }
    }
  }

  /**
   * Send a simple text message
   */
  async sendTextMessage(to: string, text: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendMessage({
      to,
      type: 'text',
      text: {
        body: text,
        preview_url: true
      }
    })
  }

  /**
   * Send an interactive button message
   */
  async sendButtonMessage(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendMessage({
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: bodyText
        },
        action: {
          buttons: buttons.map(btn => ({
            type: 'reply' as const,
            reply: {
              id: btn.id,
              title: btn.title
            }
          }))
        }
      }
    })
  }

  /**
   * Send a list message
   */
  async sendListMessage(
    to: string,
    bodyText: string,
    sections: Array<{
      title: string
      rows: Array<{ id: string; title: string; description?: string }>
    }>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendMessage({
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: {
          text: bodyText
        },
        action: {
          sections
        }
      }
    })
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = 'id',
    components?: Array<{
      type: string
      parameters: Array<{ type: string; text: string }>
    }>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendMessage({
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        components
      }
    })
  }

  /**
   * Mark a message as read
   */
  async markAsRead(messageId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return { success: true }
    } catch (error: any) {
      console.error('WhatsApp mark as read error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      }
    }
  }

  /**
   * Get media URL from media ID
   */
  async getMediaUrl(mediaId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      )

      return {
        success: true,
        url: response.data.url
      }
    } catch (error: any) {
      console.error('WhatsApp get media URL error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      }
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhook(signature: string, payload: string, verifyToken: string): boolean {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', verifyToken)
      .update(payload)
      .digest('hex')
    
    return signature === `sha256=${expectedSignature}`
  }

  /**
   * Parse incoming webhook payload
   */
  static parseWebhookPayload(payload: WhatsAppWebhookPayload): {
    messages: WhatsAppMessage[]
    contacts: WhatsAppContact[]
    phoneNumberId: string
  } {
    const messages: WhatsAppMessage[] = []
    const contacts: WhatsAppContact[] = []
    let phoneNumberId = ''

    payload.entry.forEach(entry => {
      entry.changes.forEach(change => {
        if (change.field === 'messages') {
          phoneNumberId = change.value.metadata.phone_number_id
          
          if (change.value.messages) {
            messages.push(...change.value.messages)
          }
          
          if (change.value.contacts) {
            contacts.push(...change.value.contacts)
          }
        }
      })
    })

    return { messages, contacts, phoneNumberId }
  }
}

// Export singleton instance
export const whatsappClient = new WhatsAppClient()
export default WhatsAppClient