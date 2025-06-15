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
}

export interface AIServiceConfig {
  model?: 'openai'
  maxTokens?: number
  temperature?: number
  tone?: 'formal' | 'casual' | 'friendly'
}

// Cost per 1K tokens (in IDR)
const COSTS = {
  openai: 2.0, // GPT-4o-mini
}

/**
 * Generate AI response using OpenAI
 */
export async function generateAIResponse(
  prompt: string,
  context: string = '',
  config: AIServiceConfig = {}
): Promise<AIResponse> {
  const fullPrompt = context ? `Context: ${context}\n\nUser: ${prompt}` : prompt
  
  try {
    return await generateOpenAIResponse(fullPrompt, config)
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