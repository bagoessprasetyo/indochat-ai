'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRightIcon, ChatBubbleLeftRightIcon, SparklesIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 py-20 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              <SparklesIcon className="mr-2 h-4 w-4" />
              AI-Powered WhatsApp Assistant
            </Badge>
          </div>
          
          {/* Main heading */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Otomatisasi{' '}
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Customer Service
            </span>{' '}
            WhatsApp Anda
          </h1>
          
          {/* Subheading */}
          <p className="mt-6 text-lg leading-8 text-gray-600">
            IndoChat AI membantu UMKM Indonesia melayani pelanggan 24/7 dengan AI yang memahami bahasa dan budaya lokal. 
            Tingkatkan penjualan dan kepuasan pelanggan dengan otomatisasi cerdas.
          </p>
          
          {/* CTA buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth/register">
              <Button size="lg" className="px-8 py-3">
                Mulai Gratis
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="#demo">
              <Button variant="outline" size="lg" className="px-8 py-3">
                <ChatBubbleLeftRightIcon className="mr-2 h-4 w-4" />
                Lihat Demo
              </Button>
            </Link>
          </div>
          
          {/* Social proof */}
          <div className="mt-12">
            <p className="text-sm font-semibold text-gray-900">
              Dipercaya oleh 500+ UMKM di Indonesia
            </p>
            <div className="mt-6 flex items-center justify-center gap-x-8 opacity-60">
              {/* Placeholder for customer logos */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100" />
                <span className="text-sm font-medium text-gray-600">Warung Makan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-100" />
                <span className="text-sm font-medium text-gray-600">Toko Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-100" />
                <span className="text-sm font-medium text-gray-600">Jasa Service</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero image/demo */}
        <div className="mt-16 flow-root sm:mt-24">
          <div className="relative -m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
            <div className="aspect-video rounded-md bg-white shadow-2xl ring-1 ring-gray-900/10">
              {/* Placeholder for demo video/screenshot */}
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="mx-auto h-16 w-16 text-gray-400" />
                  <p className="mt-4 text-lg font-medium text-gray-600">
                    Demo WhatsApp Chat Interface
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Lihat bagaimana AI kami melayani pelanggan dalam bahasa Indonesia
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6" aria-hidden="true">
        <div
          className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </section>
  )
}