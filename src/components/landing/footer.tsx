'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

const navigation = {
  product: [
    { name: 'Fitur', href: '#features' },
    { name: 'Harga', href: '#pricing' },
    { name: 'Demo', href: '#demo' },
    { name: 'API Documentation', href: '/docs' },
  ],
  company: [
    { name: 'Tentang Kami', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Karir', href: '/careers' },
    { name: 'Press Kit', href: '/press' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Kontak', href: '/contact' },
    { name: 'Status', href: '/status' },
    { name: 'Panduan Setup', href: '/setup-guide' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'GDPR', href: '/gdpr' },
  ],
}

const socialLinks = [
  {
    name: 'WhatsApp',
    href: 'https://wa.me/6281234567890',
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/indochat.ai',
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M12.017 0C8.396 0 7.929.01 7.102.048 6.273.088 5.718.222 5.238.42a3.917 3.917 0 0 0-1.419.923A3.927 3.927 0 0 0 2.896 2.76c-.198.48-.332 1.035-.372 1.864C2.486 5.451 2.477 5.918 2.477 9.539c0 3.621.009 4.088.047 4.915.04.829.174 1.384.372 1.864.205.476.479.88.923 1.325.444.444.849.718 1.325.923.48.198 1.035.332 1.864.372.827.038 1.294.047 4.915.047 3.621 0 4.088-.009 4.915-.047.829-.04 1.384-.174 1.864-.372a3.916 3.916 0 0 0 1.325-.923c.444-.445.718-.849.923-1.325.198-.48.332-1.035.372-1.864.038-.827.047-1.294.047-4.915 0-3.621-.009-4.088-.047-4.915-.04-.829-.174-1.384-.372-1.864a3.927 3.927 0 0 0-.923-1.419A3.917 3.917 0 0 0 18.76 2.896c-.48-.198-1.035-.332-1.864-.372C16.069.01 15.602 0 12.017 0zm0 2.162c3.557 0 3.983.01 5.39.048.829.038 1.28.177 1.58.295.397.154.68.338.978.636.298.298.482.581.636.978.118.3.257.751.295 1.58.038 1.407.048 1.833.048 5.39 0 3.557-.01 3.983-.048 5.39-.038.829-.177 1.28-.295 1.58a2.635 2.635 0 0 1-.636.978 2.635 2.635 0 0 1-.978.636c-.3.118-.751.257-1.58.295-1.407.038-1.833.048-5.39.048-3.557 0-3.983-.01-5.39-.048-.829-.038-1.28-.177-1.58-.295a2.635 2.635 0 0 1-.978-.636 2.635 2.635 0 0 1-.636-.978c-.118-.3-.257-.751-.295-1.58-.038-1.407-.048-1.833-.048-5.39 0-3.557.01-3.983.048-5.39.038-.829.177-1.28.295-1.58.154-.397.338-.68.636-.978.298-.298.581-.482.978-.636.3-.118.751-.257 1.58-.295 1.407-.038 1.833-.048 5.39-.048z"
          clipRule="evenodd"
        />
        <path
          fillRule="evenodd"
          d="M12.017 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12.017 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
          clipRule="evenodd"
        />
        <path d="M19.846 5.595a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/indochat-ai',
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/@indochat-ai',
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
]

export function Footer() {
  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Company info */}
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">IndoChat AI</span>
            </div>
            <p className="text-sm leading-6 text-gray-300">
              Solusi AI customer service terdepan untuk UMKM Indonesia. 
              Otomatisasi WhatsApp dengan kecerdasan buatan yang memahami bahasa dan budaya lokal.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <MapPinIcon className="h-4 w-4" />
                <span>Jakarta, Indonesia</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <PhoneIcon className="h-4 w-4" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <EnvelopeIcon className="h-4 w-4" />
                <span>hello@indochat.ai</span>
              </div>
            </div>
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Navigation links */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Produk</h3>
                <ul className="mt-6 space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Perusahaan</h3>
                <ul className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Support</h3>
                <ul className="mt-6 space-y-4">
                  {navigation.support.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
                <ul className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Newsletter signup */}
        <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Subscribe ke newsletter kami</h3>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                Dapatkan tips terbaru tentang customer service dan update produk.
              </p>
            </div>
            <form className="mt-6 sm:flex sm:max-w-md xl:col-span-2 xl:mt-0">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <Input
                type="email"
                name="email-address"
                id="email-address"
                autoComplete="email"
                required
                className="w-full min-w-0 appearance-none bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-white focus:ring-white"
                placeholder="Masukkan email Anda"
              />
              <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-500">
                  Subscribe
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="mt-8 border-t border-gray-900/10 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <p className="text-xs leading-5 text-gray-400">
              Made with ❤️ in Indonesia
            </p>
          </div>
          <p className="mt-8 text-xs leading-5 text-gray-400 md:order-1 md:mt-0">
            &copy; 2024 IndoChat AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}