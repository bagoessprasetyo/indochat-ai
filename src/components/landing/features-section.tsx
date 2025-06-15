'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  GlobeAsiaAustraliaIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'AI Chat 24/7',
    description: 'Asisten AI yang melayani pelanggan kapan saja dengan pemahaman bahasa Indonesia yang natural.',
    icon: ChatBubbleLeftRightIcon,
    color: 'bg-blue-500',
    benefits: ['Respon instan', 'Bahasa natural', 'Konteks percakapan']
  },
  {
    name: 'Otomatisasi Penjualan',
    description: 'Proses pesanan otomatis dari katalog produk hingga konfirmasi pembayaran.',
    icon: CurrencyDollarIcon,
    color: 'bg-green-500',
    benefits: ['Katalog produk', 'Proses order', 'Payment gateway']
  },
  {
    name: 'Bahasa Lokal',
    description: 'Mendukung bahasa Indonesia, Jawa, Sunda, dan dialek daerah lainnya.',
    icon: GlobeAsiaAustraliaIcon,
    color: 'bg-purple-500',
    benefits: ['Multi bahasa', 'Dialek daerah', 'Konteks budaya']
  },
  {
    name: 'Analytics & Insights',
    description: 'Dashboard lengkap untuk memantau performa chat, penjualan, dan kepuasan pelanggan.',
    icon: ChartBarIcon,
    color: 'bg-orange-500',
    benefits: ['Real-time data', 'Sales report', 'Customer insights']
  },
  {
    name: 'Workflow Automation',
    description: 'Otomatisasi tugas berulang seperti follow-up, reminder, dan notifikasi.',
    icon: CogIcon,
    color: 'bg-indigo-500',
    benefits: ['Auto follow-up', 'Reminder', 'Custom workflow']
  },
  {
    name: 'Keamanan Terjamin',
    description: 'Data pelanggan dan bisnis Anda aman dengan enkripsi end-to-end.',
    icon: ShieldCheckIcon,
    color: 'bg-red-500',
    benefits: ['End-to-end encryption', 'GDPR compliant', 'Data backup']
  },
]

const stats = [
  { name: 'Response Time', value: '<3 detik', description: 'Rata-rata waktu respon AI' },
  { name: 'Akurasi', value: '95%', description: 'Tingkat akurasi pemahaman bahasa' },
  { name: 'Uptime', value: '99.9%', description: 'Ketersediaan layanan' },
  { name: 'Penghematan', value: '70%', description: 'Pengurangan biaya customer service' },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">
            Fitur Lengkap
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Solusi Customer Service Terdepan untuk UMKM Indonesia
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Dengan teknologi AI terbaru yang disesuaikan untuk pasar Indonesia, 
            IndoChat AI memberikan pengalaman pelanggan yang luar biasa.
          </p>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.name} className="flex flex-col gap-y-3 border-l border-gray-900/10 pl-6">
                <dt className="text-sm leading-6 text-gray-600">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">
                  {stat.value}
                </dd>
                <dd className="text-sm leading-6 text-gray-600">{stat.description}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Features grid */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.name} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-x-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.color}`}>
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-lg font-semibold leading-8 tracking-tight text-gray-900">
                      {feature.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="mt-2 text-base leading-7 text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {feature.benefits.map((benefit) => (
                      <Badge key={benefit} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* WhatsApp Integration highlight */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24">
          <div className="rounded-2xl bg-gray-50 px-6 py-16 sm:p-16">
            <div className="mx-auto max-w-xl text-center">
              <DevicePhoneMobileIcon className="mx-auto h-12 w-12 text-green-600" />
              <h3 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
                Integrasi WhatsApp Business API
              </h3>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Langsung terhubung dengan WhatsApp Business API resmi. 
                Tidak perlu aplikasi tambahan atau bot terpisah.
              </p>
              <div className="mt-8 flex items-center justify-center gap-x-6">
                <Badge className="bg-green-100 text-green-800">
                  ✓ WhatsApp Business Verified
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  ✓ Meta Partner
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}