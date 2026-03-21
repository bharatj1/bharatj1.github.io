import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CartProvider } from '@/lib/cart'

export const metadata: Metadata = {
  title: {
    default: 'XOXO Bakery — Handcrafted Custom Cakes Mumbai',
    template: '%s | XOXO Bakery',
  },
  description: 'Bespoke, handcrafted cakes for every occasion. Premium custom cakes, wedding cakes, and celebration cakes made with love in Mumbai by Virali Shah.',
  keywords: ['custom cakes Mumbai', 'wedding cakes', 'birthday cakes', 'XOXO Bakery', 'Virali Shah', 'handcrafted cakes'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'XOXO Bakery',
    title: 'XOXO Bakery — Handcrafted Custom Cakes Mumbai',
    description: 'Bespoke, handcrafted cakes for every occasion. Premium custom cakes made with love in Mumbai.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XOXO Bakery — Handcrafted Custom Cakes Mumbai',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream-50 text-cocoa-900 antialiased">
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
