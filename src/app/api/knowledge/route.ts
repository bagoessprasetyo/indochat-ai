import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get('chatbot_id')
    const query = searchParams.get('query')
    const category = searchParams.get('category')

    if (!chatbotId) {
      return NextResponse.json({ error: 'Chatbot ID is required' }, { status: 400 })
    }

    // Verify chatbot ownership
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('id')
      .eq('id', chatbotId)
      .eq('user_id', user.id)
      .single()

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found or access denied' }, { status: 404 })
    }

    let queryBuilder = supabase
      .from('knowledge_base')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (query) {
      queryBuilder = queryBuilder.or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
    }

    if (category && category !== 'all') {
      queryBuilder = queryBuilder.eq('category', category)
    }

    const { data, error } = await queryBuilder

    if (error) {
      console.error('Error fetching knowledge base:', error)
      return NextResponse.json({ error: 'Failed to fetch knowledge base' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Knowledge base API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { chatbot_id, question, answer, category, keywords } = body

    if (!chatbot_id || !question || !answer) {
      return NextResponse.json({ 
        error: 'Chatbot ID, question, and answer are required' 
      }, { status: 400 })
    }

    // Verify chatbot ownership
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('id')
      .eq('id', chatbot_id)
      .eq('user_id', user.id)
      .single()

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found or access denied' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('knowledge_base')
      .insert({
        chatbot_id,
        question: question.trim(),
        answer: answer.trim(),
        category: category || null,
        keywords: keywords || null,
        is_active: true,
        usage_count: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating knowledge item:', error)
      return NextResponse.json({ error: 'Failed to create knowledge item' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Knowledge base API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, question, answer, category, keywords, is_active } = body

    if (!id) {
      return NextResponse.json({ error: 'Knowledge item ID is required' }, { status: 400 })
    }

    // Verify ownership through chatbot
    const { data: knowledgeItem, error: fetchError } = await supabase
      .from('knowledge_base')
      .select(`
        id,
        chatbots!inner(
          id,
          user_id
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !knowledgeItem || !knowledgeItem.chatbots || knowledgeItem.chatbots[0]?.user_id !== user.id) {
      return NextResponse.json({ error: 'Knowledge item not found or access denied' }, { status: 404 })
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (question !== undefined) updateData.question = question.trim()
    if (answer !== undefined) updateData.answer = answer.trim()
    if (category !== undefined) updateData.category = category || null
    if (keywords !== undefined) updateData.keywords = keywords || null
    if (is_active !== undefined) updateData.is_active = is_active

    const { data, error } = await supabase
      .from('knowledge_base')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating knowledge item:', error)
      return NextResponse.json({ error: 'Failed to update knowledge item' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Knowledge base API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Knowledge item ID is required' }, { status: 400 })
    }

    // Verify ownership through chatbot
    const { data: knowledgeItem, error: fetchError } = await supabase
      .from('knowledge_base')
      .select(`
        id,
        chatbots!inner(
          id,
          user_id
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !knowledgeItem || knowledgeItem.chatbots[0].user_id !== user.id) {
      return NextResponse.json({ error: 'Knowledge item not found or access denied' }, { status: 404 })
    }

    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting knowledge item:', error)
      return NextResponse.json({ error: 'Failed to delete knowledge item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Knowledge base API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}