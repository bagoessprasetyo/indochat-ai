# Knowledge Base Module for IndoChat AI

This document describes the implementation of the Knowledge Base module for the chatbot system.

## Overview

The Knowledge Base module allows chatbots to store and retrieve Q&A pairs, providing more accurate and consistent responses to customer inquiries. The system uses text similarity matching and keyword search to find relevant answers.

## Features

### 1. Knowledge Management Interface (`/dashboard/knowledge`)
- **CRUD Operations**: Create, read, update, and delete Q&A pairs
- **Chatbot Selection**: Manage knowledge for specific chatbots
- **Search & Filter**: Find knowledge items by question, answer, or category
- **Category Management**: Organize knowledge items by categories
- **Status Toggle**: Enable/disable specific knowledge items
- **Bulk Operations**: Delete multiple items at once
- **Usage Analytics**: Track how often knowledge items are used

### 2. Knowledge Base API (`/api/knowledge`)
- **GET**: Fetch knowledge items with filtering and pagination
- **POST**: Create new knowledge items
- **PUT**: Update existing knowledge items
- **DELETE**: Remove knowledge items
- **Authentication**: Ensures users can only manage their own chatbot knowledge

### 3. Knowledge Search API (`/api/knowledge/search`)
- **Text Similarity**: Calculate similarity between user queries and stored questions
- **Keyword Matching**: Match user queries with stored keywords
- **Scoring System**: Rank results by relevance
- **Usage Tracking**: Update usage count for retrieved items
- **Threshold Filtering**: Only return results above similarity threshold

### 4. AI Service Integration
- **Enhanced AI Response**: Integrate knowledge base search into AI responses
- **Smart Fallback**: Use knowledge base for high-confidence matches, AI generation for others
- **Context Enhancement**: Use knowledge items as context for AI generation
- **Usage Tracking**: Track when knowledge base is used vs. AI generation

### 5. WhatsApp Integration
- **Automatic Knowledge Search**: Search knowledge base for incoming messages
- **Seamless Integration**: Knowledge base responses appear natural in conversation
- **Metadata Tracking**: Store knowledge usage information in conversation logs

## Database Schema

The `knowledge_base` table includes:
- `id`: Unique identifier
- `chatbot_id`: Foreign key to chatbots table
- `question`: The question or trigger phrase
- `answer`: The response to provide
- `category`: Optional categorization
- `keywords`: Array of keywords for matching
- `is_active`: Enable/disable status
- `usage_count`: Track how often the item is used
- `created_at` & `updated_at`: Timestamps

## How It Works

### 1. Knowledge Search Process
1. User sends a message to the chatbot
2. System searches knowledge base for similar questions
3. Calculates similarity scores using text comparison
4. Matches keywords if available
5. Returns top matches above threshold (default: 0.2)

### 2. Response Generation
1. **High Confidence (>0.7)**: Return knowledge base answer directly
2. **Medium Confidence (0.2-0.7)**: Use knowledge as context for AI generation
3. **Low Confidence (<0.2)**: Use standard AI generation without knowledge

### 3. Usage Analytics
- Track which knowledge items are used most frequently
- Monitor knowledge base effectiveness
- Identify gaps in knowledge coverage

## Configuration

### Environment Variables
- `NEXT_PUBLIC_APP_URL`: Base URL for API calls (defaults to localhost:3000)

### AI Service Configuration
```typescript
const config: AIServiceConfig = {
  chatbotId: 'your-chatbot-id',
  useKnowledgeBase: true,
  // ... other AI config
}
```

## Usage Examples

### Creating Knowledge Items
```typescript
const knowledgeItem = {
  question: "What are your business hours?",
  answer: "We are open Monday to Friday, 9 AM to 5 PM.",
  category: "Business Info",
  keywords: ["hours", "open", "time", "schedule"]
}
```

### Searching Knowledge Base
```typescript
const results = await searchKnowledgeBase(
  'chatbot-id',
  'What time do you open?',
  3 // limit
)
```

### AI Response with Knowledge
```typescript
const response = await generateAIResponse(
  'What are your hours?',
  businessContext,
  {
    chatbotId: 'your-chatbot-id',
    useKnowledgeBase: true
  }
)
```

## Best Practices

### 1. Knowledge Item Creation
- Write clear, specific questions
- Provide comprehensive answers
- Use relevant keywords
- Categorize items logically
- Keep answers concise but informative

### 2. Category Organization
- Use consistent category names
- Group related topics together
- Consider your business structure
- Examples: "Products", "Pricing", "Support", "Business Info"

### 3. Keyword Strategy
- Include variations of key terms
- Consider common misspellings
- Use both formal and informal language
- Include synonyms and related terms

### 4. Maintenance
- Regularly review usage analytics
- Update outdated information
- Add new knowledge items based on common questions
- Remove or update low-performing items

## Security

- **Authentication Required**: All knowledge management requires user authentication
- **Ownership Verification**: Users can only manage knowledge for their own chatbots
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: API endpoints include appropriate rate limiting

## Performance Considerations

- **Similarity Calculation**: Uses efficient text comparison algorithms
- **Database Indexing**: Proper indexing on frequently queried fields
- **Caching**: Consider implementing caching for frequently accessed knowledge
- **Pagination**: Large knowledge bases are paginated for performance

## Future Enhancements

1. **Machine Learning**: Implement ML-based similarity matching
2. **Auto-categorization**: Automatically categorize new knowledge items
3. **Bulk Import**: CSV/Excel import functionality
4. **Knowledge Analytics**: Advanced analytics and insights
5. **Multi-language Support**: Support for multiple languages
6. **Knowledge Suggestions**: Suggest new knowledge items based on unanswered queries

## Troubleshooting

### Common Issues
1. **Knowledge not found**: Check if items are active and properly categorized
2. **Low similarity scores**: Review question phrasing and keywords
3. **API errors**: Verify authentication and chatbot ownership
4. **Performance issues**: Check database indexing and query optimization

### Debug Information
The system logs detailed information about:
- Knowledge search queries and results
- Similarity scores and matching logic
- API request/response details
- Error messages and stack traces