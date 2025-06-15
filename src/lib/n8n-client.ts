import axios from 'axios'

export interface N8nWorkflow {
  id: string
  name: string
  active: boolean
  nodes: Array<{
    id: string
    name: string
    type: string
    position: [number, number]
    parameters: Record<string, any>
  }>
  connections: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface N8nExecution {
  id: string
  workflowId: string
  mode: 'manual' | 'trigger' | 'webhook'
  status: 'running' | 'success' | 'error' | 'waiting'
  startedAt: string
  finishedAt?: string
  data?: Record<string, any>
  error?: string
}

export interface WorkflowTriggerData {
  workflowId: string
  data: Record<string, any>
}

class N8nClient {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.N8N_URL || 'http://localhost:5678'
    this.apiKey = process.env.N8N_API_KEY || ''
    
    if (!this.apiKey) {
      console.warn('n8n API key not configured')
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * Get all workflows
   */
  async getWorkflows(): Promise<{ success: boolean; workflows?: N8nWorkflow[]; error?: string }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/workflows`,
        { headers: this.getHeaders() }
      )

      return {
        success: true,
        workflows: response.data.data
      }
    } catch (error: any) {
      console.error('n8n get workflows error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
  }

  /**
   * Get a specific workflow
   */
  async getWorkflow(workflowId: string): Promise<{ success: boolean; workflow?: N8nWorkflow; error?: string }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/workflows/${workflowId}`,
        { headers: this.getHeaders() }
      )

      return {
        success: true,
        workflow: response.data
      }
    } catch (error: any) {
      console.error('n8n get workflow error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
  }

  /**
   * Execute a workflow manually
   */
  async executeWorkflow(
    workflowId: string,
    data: Record<string, any> = {}
  ): Promise<{ success: boolean; executionId?: string; result?: any; error?: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/workflows/${workflowId}/execute`,
        { data },
        { headers: this.getHeaders() }
      )

      return {
        success: true,
        executionId: response.data.executionId,
        result: response.data.data
      }
    } catch (error: any) {
      console.error('n8n execute workflow error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
  }

  /**
   * Trigger a workflow via webhook
   */
  async triggerWorkflowWebhook(
    webhookPath: string,
    data: Record<string, any> = {},
    method: 'GET' | 'POST' = 'POST'
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      const url = `${this.baseUrl}/webhook/${webhookPath}`
      
      const response = method === 'GET' 
        ? await axios.get(url, { params: data })
        : await axios.post(url, data)

      return {
        success: true,
        result: response.data
      }
    } catch (error: any) {
      console.error('n8n trigger webhook error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
  }

  /**
   * Get workflow executions
   */
  async getExecutions(
    workflowId?: string,
    limit: number = 20
  ): Promise<{ success: boolean; executions?: N8nExecution[]; error?: string }> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      })
      
      if (workflowId) {
        params.append('workflowId', workflowId)
      }

      const response = await axios.get(
        `${this.baseUrl}/api/v1/executions?${params}`,
        { headers: this.getHeaders() }
      )

      return {
        success: true,
        executions: response.data.data
      }
    } catch (error: any) {
      console.error('n8n get executions error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
  }

  /**
   * Get execution details
   */
  async getExecution(executionId: string): Promise<{ success: boolean; execution?: N8nExecution; error?: string }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/executions/${executionId}`,
        { headers: this.getHeaders() }
      )

      return {
        success: true,
        execution: response.data
      }
    } catch (error: any) {
      console.error('n8n get execution error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
  }

  /**
   * Activate/deactivate a workflow
   */
  async setWorkflowActive(
    workflowId: string,
    active: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await axios.patch(
        `${this.baseUrl}/api/v1/workflows/${workflowId}/activate`,
        { active },
        { headers: this.getHeaders() }
      )

      return { success: true }
    } catch (error: any) {
      console.error('n8n set workflow active error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
  }
}

// Predefined workflow templates for common Indonesian SME use cases
export const WORKFLOW_TEMPLATES = {
  ORDER_PROCESSING: {
    name: 'Order Processing Automation',
    description: 'Automate order confirmation, payment tracking, and delivery updates',
    webhookPath: 'order-processing'
  },
  PAYMENT_FOLLOWUP: {
    name: 'Payment Follow-up',
    description: 'Send payment reminders and confirmations',
    webhookPath: 'payment-followup'
  },
  CUSTOMER_SUPPORT: {
    name: 'Customer Support Escalation',
    description: 'Escalate complex queries to human agents',
    webhookPath: 'support-escalation'
  },
  INVENTORY_ALERT: {
    name: 'Inventory Management',
    description: 'Alert when stock is low or out of stock',
    webhookPath: 'inventory-alert'
  },
  MARKETING_CAMPAIGN: {
    name: 'Marketing Campaign',
    description: 'Send promotional messages and track responses',
    webhookPath: 'marketing-campaign'
  }
}

/**
 * Helper functions for common workflow operations
 */
export class WorkflowHelpers {
  private client: N8nClient

  constructor(client: N8nClient) {
    this.client = client
  }

  /**
   * Process a new order
   */
  async processOrder(orderData: {
    orderId: string
    customerPhone: string
    customerName: string
    items: Array<{ name: string; quantity: number; price: number }>
    total: number
    paymentMethod: string
  }) {
    return this.client.triggerWorkflowWebhook(
      WORKFLOW_TEMPLATES.ORDER_PROCESSING.webhookPath,
      orderData
    )
  }

  /**
   * Send payment follow-up
   */
  async sendPaymentFollowup(paymentData: {
    orderId: string
    customerPhone: string
    amount: number
    dueDate: string
    paymentLink?: string
  }) {
    return this.client.triggerWorkflowWebhook(
      WORKFLOW_TEMPLATES.PAYMENT_FOLLOWUP.webhookPath,
      paymentData
    )
  }

  /**
   * Escalate to human support
   */
  async escalateToSupport(supportData: {
    conversationId: string
    customerPhone: string
    customerName: string
    issue: string
    priority: 'low' | 'medium' | 'high'
  }) {
    return this.client.triggerWorkflowWebhook(
      WORKFLOW_TEMPLATES.CUSTOMER_SUPPORT.webhookPath,
      supportData
    )
  }

  /**
   * Send inventory alert
   */
  async sendInventoryAlert(inventoryData: {
    productId: string
    productName: string
    currentStock: number
    minimumStock: number
    supplierId?: string
  }) {
    return this.client.triggerWorkflowWebhook(
      WORKFLOW_TEMPLATES.INVENTORY_ALERT.webhookPath,
      inventoryData
    )
  }

  /**
   * Launch marketing campaign
   */
  async launchMarketingCampaign(campaignData: {
    campaignId: string
    targetAudience: string[]
    message: string
    offerDetails?: {
      discount: number
      validUntil: string
      promoCode?: string
    }
  }) {
    return this.client.triggerWorkflowWebhook(
      WORKFLOW_TEMPLATES.MARKETING_CAMPAIGN.webhookPath,
      campaignData
    )
  }
}

// Export singleton instance
export const n8nClient = new N8nClient()
export const workflowHelpers = new WorkflowHelpers(n8nClient)
export default N8nClient