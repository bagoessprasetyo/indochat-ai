import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Simple text similarity function using word overlap
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/).filter(word => word.length > 2)
  const words2 = text2.toLowerCase().split(/\s+/).filter(word => word.length > 2)
  
  if (words1.length === 0 || words2.length === 0) return 0
  
  const intersection = words1.filter(word => words2.includes(word))
  const union = Array.from(new Set([...words1, ...words2]))
  
  return intersection.length / union.length
}

// Enhanced keyword matching
function matchesKeywords(query: string, keywords: string[]): boolean {
  const queryLower = query.toLowerCase()
  return keywords.some(keyword => 
    queryLower.includes(keyword.toLowerCase()) || 
    keyword.toLowerCase().includes(queryLower)
  )
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const body = await request.json()
    const { chatbot_id, query, limit = 5, threshold = 0.1 } = body

    if (!chatbot_id || !query) {
      return NextResponse.json({ 
        error: 'Chatbot ID and query are required' 
      }, { status: 400 })
    }

    // Fetch all active knowledge base items for the chatbot
    const { data: knowledgeItems, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('chatbot_id', chatbot_id)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching knowledge base:', error)
      return NextResponse.json({ error: 'Failed to search knowledge base' }, { status: 500 })
    }

    if (!knowledgeItems || knowledgeItems.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Calculate similarity scores for each knowledge item
    const scoredItems = knowledgeItems.map(item => {
      let score = 0
      
      // Question similarity (weighted more heavily)
      const questionSimilarity = calculateSimilarity(query, item.question)
      score += questionSimilarity * 0.7
      
      // Answer similarity
      const answerSimilarity = calculateSimilarity(query, item.answer)
      score += answerSimilarity * 0.2
      
      // Keyword matching bonus
      if (item.keywords && item.keywords.length > 0) {
        if (matchesKeywords(query, item.keywords)) {
          score += 0.3
        }
      }
      
      // Exact phrase matching bonus
      const queryLower = query.toLowerCase()
      const questionLower = item.question.toLowerCase()
      const answerLower = item.answer.toLowerCase()
      
      if (questionLower.includes(queryLower) || queryLower.includes(questionLower)) {
        score += 0.4
      }
      
      if (answerLower.includes(queryLower)) {
        score += 0.2
      }
      
      return {
        ...item,
        similarity_score: Math.min(score, 1) // Cap at 1.0
      }
    })

    // Filter by threshold and sort by score
    const relevantItems = scoredItems
      .filter(item => item.similarity_score >= threshold)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit)

    // Update usage count for matched items
    if (relevantItems.length > 0) {
      const updatePromises = relevantItems.map(item => 
        supabase
          .from('knowledge_base')
          .update({ 
            usage_count: (item.usage_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)
      )
      
      await Promise.all(updatePromises)
    }

    return NextResponse.json({ 
      data: relevantItems,
      total_found: relevantItems.length,
      query_processed: query
    })
  } catch (error) {
    console.error('Knowledge search API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint for testing search functionality
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get('chatbot_id')
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '5')
    const threshold = parseFloat(searchParams.get('threshold') || '0.1')

    if (!chatbotId || !query) {
      return NextResponse.json({ 
        error: 'Chatbot ID and query are required' 
      }, { status: 400 })
    }

    // Use the same logic as POST but with GET parameters
    const response = await POST(new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ chatbot_id: chatbotId, query, limit, threshold }),
      headers: { 'Content-Type': 'application/json' }
    }))

    return response
  } catch (error) {
    console.error('Knowledge search GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}