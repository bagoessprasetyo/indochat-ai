# 🚀 IndoChat AI - AI-Powered WhatsApp Automation for Indonesian SMEs

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)]()
[![Status](https://img.shields.io/badge/status-in_development-yellow.svg)]()

**IndoChat AI** is an AI-powered WhatsApp customer service and business workflow automation platform specifically designed for Indonesian Small & Medium Enterprises (SMEs). 

## 🎯 Project Overview

**Target Market**: 64 million Indonesian MSMEs  
**Core Value Proposition**: AI-powered WhatsApp customer service + complete business workflow automation at 1/10th enterprise cost  
**Primary Revenue Model**: Monthly SaaS subscriptions (Rp 200K - 1.5M/month)  
**Target Revenue**: Rp 25M/month ($1,600) by month 12  

### Key Features
- 🤖 **AI Chatbot**: Gemini Flash + OpenAI fallback for cost-effective responses
- 📱 **WhatsApp Integration**: Full WhatsApp Business API integration
- 🛍️ **Product Management**: Complete e-commerce catalog system
- 📊 **Analytics Dashboard**: Real-time business insights
- 🔄 **Workflow Automation**: n8n-powered business process automation
- 💳 **Payment Processing**: Midtrans integration for Indonesian payments
- 🇮🇩 **Indonesian First**: Complete Bahasa Indonesia localization

## 📋 Current Implementation Status

### ✅ **COMPLETED (Week 1 Foundation)**
1. **Database Setup** - ✅ DONE
   - Supabase project created: `pbjivlwgygykaynkbwht`
   - Complete database schema with 10 tables
   - Row Level Security (RLS) policies configured
   - Database functions and triggers
   - Sample data populated

2. **Project Configuration** - ✅ DONE
   - Next.js 14 project structure defined
   - All dependencies specified
   - TypeScript configuration
   - Tailwind CSS design system
   - Environment variables template

3. **Core Libraries** - ✅ DONE
   - Supabase client configuration
   - AI service (Gemini + OpenAI integration)
   - WhatsApp Business API client
   - n8n workflow automation client
   - Database TypeScript types generated

4. **Chatbot Management System** - ✅ DONE
   - Complete CRUD operations for chatbots
   - Supabase integration with real-time data
   - Form validation using Zod schema
   - Loading states and error handling
   - Toast notifications for user feedback
   - RLS policies fixed for proper data access

### 🚧 **IN PROGRESS (Week 1-2)**
- UI Components library (started)
- Authentication system
- Landing page
- Onboarding flow

### 📅 **UPCOMING (Week 2-8)**
- WhatsApp webhook handling
- AI response generation
- Dashboard components
- Product management
- Order processing workflows
- Payment integration
- Analytics system

## 🛠️ Technical Stack

```yaml
Frontend:
  - Framework: Next.js 14 + TypeScript
  - Styling: Tailwind CSS
  - UI Components: Headless UI + Custom Design System
  - State Management: Zustand
  - Internationalization: next-intl

Backend:
  - Runtime: Next.js API Routes
  - Database: PostgreSQL (Supabase)
  - Authentication: Supabase Auth
  - File Storage: Supabase Storage

AI & Automation:
  - Primary AI: Google Gemini Flash (cost-effective)
  - Fallback AI: OpenAI GPT-4o-mini
  - Workflow Engine: n8n (self-hosted)

Integrations:
  - Messaging: WhatsApp Business API
  - Payments: Midtrans (Indonesian gateway)
  - Analytics: PostHog

Infrastructure:
  - Hosting: AWS Asia Pacific (Jakarta)
  - CDN: CloudFront
  - Monitoring: Sentry
```

## 🗃️ Database Schema

### Core Tables Created:
- **`profiles`** - User business profiles
- **`chatbots`** - WhatsApp chatbot configurations
- **`conversations`** - Customer conversations
- **`messages`** - Individual messages
- **`knowledge_base`** - AI training Q&A data
- **`products`** - E-commerce product catalog
- **`orders`** - Order management
- **`workflows`** - n8n automation workflows
- **`conversation_analytics`** - Business metrics
- **`usage_tracking`** - Feature usage analytics

### Database Details:
- **Project ID**: `pbjivlwgygykaynkbwht`
- **URL**: `https://pbjivlwgygykaynkbwht.supabase.co`
- **Region**: `ap-southeast-1` (Singapore - optimal for Indonesia)
- **Cost**: $10/month

## 🔧 Environment Variables

Create `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://pbjivlwgygykaynkbwht.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiaml2bHdneWd5a2F5bmtid2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NzE3NTUsImV4cCI6MjA2NTU0Nzc1NX0.ApNSJo60m0NIZkJFer-Y6VQ0-KK9UNXuoyVRCI7hVtw

# AI Services (NEED TO GET)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# WhatsApp Business API (NEED TO SETUP)
WHATSAPP_VERIFY_TOKEN=indochat_ai_verify_token_2025
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here

# n8n Workflow Automation (NEED TO SETUP)
N8N_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key_here

# Payment Gateway - Midtrans (NEED TO SETUP)
MIDTRANS_SERVER_KEY=your_midtrans_server_key_here
MIDTRANS_CLIENT_KEY=your_midtrans_client_key_here
MIDTRANS_IS_PRODUCTION=false

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key_here
```

## 📁 Project Structure

```
indochat-ai/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API endpoints
│   │   │   ├── webhooks/whatsapp/    # WhatsApp webhook
│   │   │   └── auth/                 # Authentication APIs
│   │   ├── dashboard/                # Dashboard pages
│   │   ├── onboarding/               # Onboarding flow
│   │   └── (auth)/                   # Auth pages
│   ├── components/
│   │   ├── ui/                       # Reusable UI components
│   │   ├── dashboard/                # Dashboard-specific components
│   │   └── onboarding/               # Onboarding components
│   ├── lib/
│   │   ├── supabase.ts              # ✅ Supabase client config
│   │   ├── ai-service.ts            # ✅ AI integration (Gemini/OpenAI)
│   │   ├── whatsapp-client.ts       # ✅ WhatsApp Business API
│   │   └── n8n-client.ts            # ✅ n8n workflow automation
│   ├── types/
│   │   ├── database.ts              # ✅ Generated DB types
│   │   └── whatsapp.ts              # WhatsApp API types
│   └── hooks/                       # Custom React hooks
├── public/                          # Static assets
├── .env.local                       # Environment variables
├── package.json                     # Dependencies
├── tailwind.config.js              # Tailwind configuration
├── next.config.js                  # Next.js configuration
└── tsconfig.json                   # TypeScript configuration
```

## 🚀 Quick Start

### 1. Clone and Setup
```bash
# Create Next.js project
npx create-next-app@latest indochat-ai --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd indochat-ai

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @headlessui/react @heroicons/react
npm install zod react-hook-form @hookform/resolvers
npm install framer-motion zustand next-intl
npm install @google/generative-ai openai axios
npm install clsx tailwind-merge lucide-react recharts
```

### 2. Environment Setup
- Copy the environment variables above into `.env.local`
- Get API keys for Gemini and OpenAI
- Set up WhatsApp Business API account
- Install and configure n8n instance

### 3. Database Connection
The database is already set up and ready to use:
- All tables created with sample data
- RLS policies configured
- Generated TypeScript types available

### 4. Development Server
```bash
npm run dev
```

## 📅 8-Week Development Timeline

### **Week 1-2: Foundation** ✅ MOSTLY COMPLETE
- [x] Project setup and configuration
- [x] Database schema and setup
- [x] Core library integrations
- [x] Chatbot management system with full CRUD
- [x] RLS policies configuration and fixes
- [ ] UI component library (in progress)
- [ ] Authentication system
- [ ] Basic landing page

### **Week 3: WhatsApp + AI Core**
- [ ] WhatsApp Business API webhook
- [ ] AI response generation with Gemini
- [ ] Basic conversation handling
- [ ] Message storage and retrieval

### **Week 4: Dashboard Foundation**
- [ ] Product catalog management
- [ ] Conversation dashboard
- [ ] Basic order creation
- [ ] Customer management

### **Week 5: n8n Workflows**
- [ ] Order processing automation
- [ ] Payment follow-up workflows
- [ ] Customer support escalation
- [ ] Inventory management

### **Week 6: Payment Integration**
- [ ] Midtrans payment gateway
- [ ] Payment link generation
- [ ] Order status tracking
- [ ] Indonesian payment methods

### **Week 7: Analytics + Mobile**
- [ ] Business analytics dashboard
- [ ] Revenue tracking
- [ ] Customer insights
- [ ] Mobile optimization

### **Week 8: Testing + Launch**
- [ ] End-to-end testing
- [ ] Beta customer onboarding
- [ ] Performance optimization
- [ ] Production deployment

## 🎯 Key Success Metrics

### Business Goals
- **Revenue**: Rp 25M+ monthly recurring revenue by month 12
- **Customers**: 1,000+ paying customers by month 12
- **Retention**: <10% monthly churn rate
- **Market Position**: #1 SME automation platform in Indonesia

### Technical Goals
- **Uptime**: >99.5%
- **Response Time**: <3 seconds for AI responses
- **WhatsApp Delivery**: >99% message delivery rate
- **Cost Efficiency**: <30% of revenue on AI/infrastructure costs

## 🔄 Latest Development Progress

### Recently Completed:
- **Chatbot Management Dashboard**: Full CRUD operations with Supabase integration
- **Database Integration**: Real-time data fetching, creation, updates, and deletion
- **Form Validation**: Zod schema validation for chatbot creation
- **User Experience**: Loading states, error handling, and toast notifications
- **RLS Security**: Fixed Row Level Security policies for proper data access

### Current Issues Resolved:
- ✅ RLS policy violations during chatbot creation
- ✅ Function name mismatches in event handlers
- ✅ Icon import errors and component references
- ✅ Form validation and error display

## 🔄 Next Steps for Development

### Immediate Priority (Continue in Next Chat):
1. **Complete Authentication System**
   - Supabase Auth integration
   - Profile creation flow
   - Session management
   - Protected routes implementation

2. **Enhance Dashboard Features**
   - Conversation management page
   - Knowledge base management
   - Analytics dashboard
   - Product catalog management

3. **WhatsApp Integration**
   - Webhook endpoint setup
   - Message handling and storage
   - AI response generation
   - Real-time conversation updates

4. **Landing Page**
   - Indonesian market messaging
   - Value proposition showcase
   - Call-to-action optimization

### API Keys Needed:
- **Gemini API**: Get from Google AI Studio
- **OpenAI API**: Get from OpenAI dashboard
- **WhatsApp Business**: Apply for Meta Business account
- **Midtrans**: Register for Indonesian payment gateway

### External Services Setup:
- **n8n Instance**: Deploy workflow automation server
- **AWS Account**: For production hosting (Jakarta region)
- **Domain**: Register indochat.ai or similar

## 📞 WhatsApp Business API Setup Guide

1. **Create Meta Business Account**
2. **Apply for WhatsApp Business API**
3. **Get Phone Number ID and Access Token**
4. **Set up Webhook URL**: `https://your-domain.com/api/webhooks/whatsapp`
5. **Configure Verify Token**: Use `indochat_ai_verify_token_2025`

## 💡 Development Tips

### Indonesian Market Considerations:
- **Mobile-First**: 96.4% of users are mobile-only
- **Payment Methods**: Focus on bank transfer, e-wallets (GoPay, OVO, DANA)
- **Language**: All UI must be in Bahasa Indonesia
- **Business Hours**: Consider Indonesian time zones
- **Cultural Sensitivity**: Polite, respectful tone in AI responses

### Cost Optimization:
- **AI Costs**: Use Gemini Flash as primary (cheaper than OpenAI)
- **WhatsApp Costs**: Optimize message templates
- **Database**: Proper indexing for large scale
- **CDN**: Use Jakarta edge locations

## 📚 Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Google Gemini API](https://ai.google.dev/docs)
- [Midtrans Payment Gateway](https://docs.midtrans.com/)
- [n8n Workflow Automation](https://docs.n8n.io/)

## 🤝 Contributing

This is a commercial project in active development. Once MVP is complete, we'll open source core components for the Indonesian developer community.

## 📄 License

Proprietary - All rights reserved (will be updated to MIT for open source components)

---

**Ready to continue development?** Pick up from Week 1-2 tasks and start building the UI components and authentication system! 🚀

**Database is ready** ✅  
**Core libraries configured** ✅  
**Development environment prepared** ✅  

**Next: Create UI components and authentication flow** 🎯