import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

// Initialize AI clients
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export interface AIResponse {
  content: string
  model: 'gemini' | 'openai'
  tokensUsed?: number
  cost?: number
}

export interface AIServiceConfig {
  model: 'gemini' | 'openai'
  maxTokens?: number
  temperature?: number
  tone?: 'formal' | 'casual' | 'friendly'
}

// Cost per 1K tokens (in IDR)
const COSTS = {
  gemini: 0.5, // Gemini Flash is very cost-effective
  openai: 2.0, // GPT-4o-mini
}

/**
 * Generate AI response with fallback mechanism
 * Primary: Gemini Flash (cost-effective)
 * Fallback: OpenAI GPT-4o-mini
 */
export async function generateAIResponse(
  prompt: string,
  context: string = '',
  config: AIServiceConfig = { model: 'gemini' }
): Promise<AIResponse> {
  const fullPrompt = context ? `Context: ${context}\n\nUser: ${prompt}` : prompt
  
  try {
    if (config.model === 'gemini') {
      return await generateGeminiResponse(fullPrompt, config)
    } else {
      return await generateOpenAIResponse(fullPrompt, config)
    }
  } catch (error) {
    console.error(`${config.model} failed:`, error)
    
    // Fallback to alternative model
    if (config.model === 'gemini') {
      console.log('Falling back to OpenAI...')
      return await generateOpenAIResponse(fullPrompt, { ...config, model: 'openai' })
    } else {
      console.log('Falling back to Gemini...')
      return await generateGeminiResponse(fullPrompt, { ...config, model: 'gemini' })
    }
  }
}

/**
 * Generate response using Gemini Flash
 */
async function generateGeminiResponse(
  prompt: string,
  config: AIServiceConfig
): Promise<AIResponse> {
  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const systemPrompt = getSystemPrompt(config.tone || 'friendly')
  const fullPrompt = `${systemPrompt}\n\n${prompt}`
  
  const result = await model.generateContent(fullPrompt)
  const response = await result.response
  const content = response.text()
  
  // Estimate tokens (rough approximation)
  const tokensUsed = Math.ceil(content.length / 4)
  const cost = (tokensUsed / 1000) * COSTS.gemini
  
  return {
    content: content.trim(),
    model: 'gemini',
    tokensUsed,
    cost
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
  config: AIServiceConfig = { model: 'gemini' }
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
  config: AIServiceConfig = { model: 'gemini' }
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