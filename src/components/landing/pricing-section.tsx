'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const plans = [
  {
    name: 'Starter',
    description: 'Cocok untuk warung dan toko kecil',
    price: 'Gratis',
    period: 'selamanya',
    features: [
      '100 pesan per bulan',
      '1 nomor WhatsApp',
      'AI chat dasar',
      'Template pesan',
      'Dashboard sederhana',
      'Support email',
    ],
    limitations: [
      'Tanpa integrasi payment',
      'Tanpa workflow automation',
      'Tanpa analytics lanjutan',
    ],
    cta: 'Mulai Gratis',
    popular: false,
    color: 'border-gray-200',
  },
  {
    name: 'Professional',
    description: 'Untuk UMKM yang sedang berkembang',
    price: 'Rp 299.000',
    period: 'per bulan',
    features: [
      '2.000 pesan per bulan',
      '3 nomor WhatsApp',
      'AI chat advanced',
      'Katalog produk (100 item)',
      'Integrasi payment gateway',
      'Workflow automation',
      'Analytics & reports',
      'Multi-bahasa',
      'Support prioritas',
    ],
    limitations: [],
    cta: 'Pilih Professional',
    popular: true,
    color: 'border-blue-500 ring-2 ring-blue-500',
  },
  {
    name: 'Enterprise',
    description: 'Untuk bisnis besar dan franchise',
    price: 'Rp 999.000',
    period: 'per bulan',
    features: [
      'Unlimited pesan',
      'Unlimited nomor WhatsApp',
      'AI chat premium + custom training',
      'Katalog produk unlimited',
      'Semua integrasi payment',
      'Advanced workflow automation',
      'Advanced analytics & BI',
      'Multi-bahasa + dialek custom',
      'API access',
      'Dedicated account manager',
      'Custom branding',
      'SLA 99.9% uptime',
    ],
    limitations: [],
    cta: 'Hubungi Sales',
    popular: false,
    color: 'border-purple-500',
  },
]

const faqs = [
  {
    question: 'Apakah ada biaya setup atau instalasi?',
    answer: 'Tidak ada biaya setup. Anda bisa langsung mulai menggunakan IndoChat AI setelah mendaftar.',
  },
  {
    question: 'Bagaimana cara menghubungkan WhatsApp Business saya?',
    answer: 'Kami akan membantu Anda setup WhatsApp Business API melalui panduan step-by-step yang mudah diikuti.',
  },
  {
    question: 'Apakah data pelanggan saya aman?',
    answer: 'Ya, semua data dienkripsi dan disimpan sesuai standar keamanan internasional. Kami tidak akan membagikan data Anda.',
  },
  {
    question: 'Bisakah AI memahami bahasa daerah?',
    answer: 'Ya, AI kami dilatih khusus untuk memahami bahasa Indonesia, Jawa, Sunda, dan berbagai dialek daerah.',
  },
  {
    question: 'Bagaimana jika saya ingin upgrade atau downgrade paket?',
    answer: 'Anda bisa mengubah paket kapan saja melalui dashboard. Perubahan akan berlaku di periode billing berikutnya.',
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">
            Harga Terjangkau
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Paket yang Sesuai untuk Setiap Tahap Bisnis
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Mulai gratis dan upgrade sesuai kebutuhan bisnis Anda. 
            Semua paket sudah termasuk dukungan teknis dalam bahasa Indonesia.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.color} ${plan.popular ? 'scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    Paling Populer
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-6">
                <CardTitle className="text-lg font-semibold leading-8 text-gray-900">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-gray-600">
                  {plan.description}
                </CardDescription>
                <div className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm font-semibold leading-6 text-gray-600">
                      /{plan.period}
                    </span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 text-sm leading-6 text-gray-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon className="h-6 w-5 flex-none text-blue-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <li key={limitation} className="flex gap-x-3 opacity-60">
                      <span className="h-6 w-5 flex-none text-gray-400">×</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  {plan.name === 'Enterprise' ? (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/contact">{plan.cta}</Link>
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href="/auth/register">{plan.cta}</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Money back guarantee */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <div className="rounded-2xl bg-green-50 px-6 py-8">
            <h3 className="text-lg font-semibold text-green-900">
              Garansi 30 Hari Uang Kembali
            </h3>
            <p className="mt-2 text-sm text-green-700">
              Tidak puas dengan layanan kami? Dapatkan refund 100% dalam 30 hari pertama.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mt-24 max-w-2xl">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 text-center mb-12">
            Pertanyaan yang Sering Diajukan
          </h3>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h4>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact for custom needs */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p className="text-lg text-gray-600">
            Butuh paket khusus atau integrasi custom?{' '}
            <Link href="/contact" className="font-semibold text-blue-600 hover:text-blue-500">
              Hubungi tim sales kami
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}