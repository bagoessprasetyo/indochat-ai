import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export interface AIResponse {
  content: string
  model: 'openai'
  tokensUsed?: number
  cost?: number
  knowledgeUsed?: boolean
  knowledgeSource?: string
}

export interface AIServiceConfig {
  model?: 'openai'
  maxTokens?: number
  temperature?: number
  tone?: 'formal' | 'casual' | 'friendly'
  chatbotId?: string
  useKnowledgeBase?: boolean
}

export interface KnowledgeItem {
  id: string
  question: string
  answer: string
  category: string | null
  keywords: string[] | null
  similarity_score: number
}

// Cost per 1K tokens (in IDR)
const COSTS = {
  openai: 2.0, // GPT-4o-mini
}

/**
 * Search knowledge base for relevant information
 */
export async function searchKnowledgeBase(
  chatbotId: string,
  query: string,
  limit: number = 3
): Promise<KnowledgeItem[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/knowledge/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatbot_id: chatbotId,
        query,
        limit,
        threshold: 0.2
      })
    })

    if (!response.ok) {
      console.error('Knowledge search failed:', response.statusText)
      return []
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Knowledge base search error:', error)
    return []
  }
}

/**
 * Generate AI response using OpenAI with optional knowledge base integration
 */
export async function generateAIResponse(
  prompt: string,
  context: string = '',
  config: AIServiceConfig = {}
): Promise<AIResponse> {
  let knowledgeContext = ''
  let knowledgeUsed = false
  let knowledgeSource = ''

  // Search knowledge base if enabled and chatbotId is provided
  if (config.useKnowledgeBase && config.chatbotId) {
    try {
      const knowledgeItems = await searchKnowledgeBase(config.chatbotId, prompt)
      
      if (knowledgeItems.length > 0) {
        knowledgeUsed = true
        knowledgeSource = knowledgeItems[0].question
        
        // Use the best matching knowledge item
        const bestMatch = knowledgeItems[0]
        
        // If similarity is very high (>0.7), return the knowledge base answer directly
        if (bestMatch.similarity_score > 0.7) {
          return {
            content: bestMatch.answer,
            model: 'openai',
            knowledgeUsed: true,
            knowledgeSource: bestMatch.question,
            tokensUsed: 0,
            cost: 0
          }
        }
        
        // Otherwise, use knowledge as context for AI generation
        knowledgeContext = knowledgeItems.map(item => 
          `Q: ${item.question}\nA: ${item.answer}`
        ).join('\n\n')
      }
    } catch (error) {
      console.error('Knowledge base search failed:', error)
      // Continue without knowledge base
    }
  }

  // Combine all context
  const fullContext = [context, knowledgeContext].filter(Boolean).join('\n\n')
  const fullPrompt = fullContext ? `Context: ${fullContext}\n\nUser: ${prompt}` : prompt
  
  try {
    const response = await generateOpenAIResponse(fullPrompt, config)
    return {
      ...response,
      knowledgeUsed,
      knowledgeSource
    }
  } catch (error) {
    console.error('OpenAI failed:', error)
    throw new Error(`AI service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}



/**
 * Generate response using OpenAI GPT-4o-mini
 */
async function generateOpenAIResponse(
  prompt: string,
  config: AIServiceConfig
): Promise<AIResponse> {
  const systemPrompt = getSystemPrompt(config.tone || 'friendly')
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    max_tokens: config.maxTokens || 500,
    temperature: config.temperature || 0.7,
  })
  
  const content = completion.choices[0]?.message?.content || ''
  const tokensUsed = completion.usage?.total_tokens || 0
  const cost = (tokensUsed / 1000) * COSTS.openai
  
  return {
    content: content.trim(),
    model: 'openai',
    tokensUsed,
    cost
  }
}

/**
 * Get system prompt based on tone and Indonesian context
 */
function getSystemPrompt(tone: 'formal' | 'casual' | 'friendly'): string {
  const basePrompt = `Anda adalah asisten AI untuk layanan pelanggan WhatsApp yang membantu UMKM Indonesia. 
Anda harus merespons dalam Bahasa Indonesia yang sopan dan membantu.`
  
  const tonePrompts = {
    formal: `${basePrompt} Gunakan bahasa formal dan profesional.`,
    casual: `${basePrompt} Gunakan bahasa yang santai namun tetap sopan.`,
    friendly: `${basePrompt} Gunakan bahasa yang ramah dan hangat, seperti berbicara dengan teman.`
  }
  
  return tonePrompts[tone] + `\n\nSelalu berikan respons yang:
- Membantu dan informatif
- Sesuai dengan konteks bisnis Indonesia
- Mendorong pelanggan untuk bertindak (jika relevan)
- Maksimal 200 kata kecuali diminta lebih detail`
}

/**
 * Generate product recommendation based on customer query
 */
export async function generateProductRecommendation(
  customerQuery: string,
  products: Array<{ name: string; description: string; price: number }>,
  config: AIServiceConfig = {}
): Promise<AIResponse> {
  const productsContext = products.map(p => 
    `- ${p.name}: ${p.description} (Rp ${p.price.toLocaleString('id-ID')})`
  ).join('\n')
  
  const prompt = `Pelanggan bertanya: "${customerQuery}"

Produk yang tersedia:
${productsContext}

Berikan rekomendasi produk yang paling sesuai dengan pertanyaan pelanggan. Jelaskan mengapa produk tersebut cocok dan sertakan harga.`
  
  return generateAIResponse(prompt, '', config)
}

/**
 * Generate order confirmation message
 */
export async function generateOrderConfirmation(
  customerName: string,
  orderDetails: {
    items: Array<{ name: string; quantity: number; price: number }>
    total: number
    deliveryAddress?: string
  },
  config: AIServiceConfig = {}
): Promise<AIResponse> {
  const itemsList = orderDetails.items.map(item => 
    `- ${item.name} x${item.quantity} = Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`
  ).join('\n')
  
  const prompt = `Buat pesan konfirmasi pesanan untuk pelanggan bernama ${customerName}.

Detail pesanan:
${itemsList}

Total: Rp ${orderDetails.total.toLocaleString('id-ID')}
${orderDetails.deliveryAddress ? `Alamat pengiriman: ${orderDetails.deliveryAddress}` : ''}

Buat pesan yang ramah dan profesional yang mengkonfirmasi pesanan dan menjelaskan langkah selanjutnya.`
  
  return generateAIResponse(prompt, '', config)
}

export { COSTS }