import type { Metadata } from 'next'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { products, testimonials, galleryImages } from '@/lib/products'

export const metadata: Metadata = {
  title: 'XOXO Bakery — Handcrafted Custom Cakes Mumbai',
}

export default function HomePage() {
  const featured = products.filter(p => p.isBestseller || p.isNew).slice(0, 6)

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1800&q=80"
            alt="XOXO Bakery hero"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-cocoa-900/70 via-cocoa-900/40 to-cream-50" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-container px-6 md:px-12 text-center pt-24">
          <p className="tag-label text-caramel-light tracking-[0.4em]">Est. 2018 · Mumbai</p>

          <h1
            className="font-display text-5xl md:text-7xl lg:text-8xl text-cream-50 leading-[1.05] mt-4 mb-6"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Where Every Bite<br />
            <em className="italic text-caramel-light">Tells a Love Story</em>
          </h1>

          <p className="text-cream-50/80 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
            Bespoke, handcrafted cakes for life's most meaningful moments. Designed to impress. Made to remember.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/shop" className="btn-primary bg-cream-50 text-cocoa-900 hover:bg-caramel-DEFAULT hover:text-cream-50">
              Explore Our Cakes
            </Link>
            <a
              href="https://wa.me/919876543210?text=Hi%20XOXO%20Bakery!%20I'd%20like%20to%20discuss%20a%20custom%20cake."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline border-cream-50/50 text-cream-50 hover:bg-cream-50 hover:text-cocoa-900"
            >
              Custom Order
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 mt-16 pt-16 border-t border-cream-50/20">
            {[
              { value: '2,000+', label: 'Cakes Created' },
              { value: '4.9★', label: 'Average Rating' },
              { value: '6 Years', label: 'Of Craftsmanship' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl md:text-3xl text-cream-50 font-semibold" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {stat.value}
                </p>
                <p className="text-xs text-cream-50/50 tracking-widest uppercase mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-cream-50/40">
          <span className="text-[10px] tracking-[0.3em] uppercase">Discover</span>
          <div className="w-px h-12 bg-gradient-to-b from-cream-50/40 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div className="bg-caramel-DEFAULT overflow-hidden py-3">
        <div className="flex gap-8 animate-[marquee_20s_linear_infinite] whitespace-nowrap" style={{ animation: 'marquee 25s linear infinite' }}>
          {[...Array(4)].map((_, i) => (
            <span key={i} className="flex items-center gap-8 text-cream-50 text-xs tracking-[0.2em] uppercase font-medium">
              <span>✦ Handcrafted Daily</span>
              <span>✦ Custom Designs</span>
              <span>✦ Premium Ingredients</span>
              <span>✦ 48hr Lead Time</span>
              <span>✦ Mumbai Delivery</span>
            </span>
          ))}
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ── FEATURED CAKES ── */}
      <section className="section-padding">
        <div className="max-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="tag-label">Our Signature Collection</p>
              <h2 className="section-title">
                Crafted with<br />
                <em className="italic" style={{ fontFamily: 'var(--font-playfair)' }}>intention</em>
              </h2>
            </div>
            <Link href="/shop" className="btn-outline self-start md:self-auto">
              View All Cakes
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 3} />
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="section-padding bg-cocoa-900 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,253,248,0.5) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="max-container relative z-10">
          <div className="text-center mb-16">
            <p className="tag-label text-caramel-light">Why XOXO</p>
            <h2 className="font-display text-4xl md:text-5xl text-cream-50 mt-2" style={{ fontFamily: 'var(--font-playfair)' }}>
              The difference is in the details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                ),
                title: 'Artisan Quality',
                desc: 'Every cake is made from scratch using premium, locally-sourced ingredients. No shortcuts, no compromises.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: 'Made with Love',
                desc: 'Virali personally oversees every order. Your celebration matters to us as much as it matters to you.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                ),
                title: 'Fully Bespoke',
                desc: 'No two cakes are alike. We collaborate with you to bring your exact vision — flavors, design, dimensions — to life.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'On Time, Always',
                desc: 'We understand that timing is everything. Your cake will be ready and delivered exactly when you need it.',
              },
            ].map(feature => (
              <div key={feature.title} className="group p-6 rounded-2xl border border-cream-50/10 hover:border-caramel-light/30 hover:bg-cream-50/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-caramel-DEFAULT/20 flex items-center justify-center text-caramel-light mb-5 group-hover:bg-caramel-DEFAULT/30 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-cream-50 text-lg mb-2">{feature.title}</h3>
                <p className="text-cream-50/50 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CUSTOM CAKE CTA ── */}
      <section className="section-padding bg-cream-100">
        <div className="max-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="tag-label">Custom Orders</p>
              <h2 className="section-title mb-6">
                Your vision.<br />
                <em className="italic" style={{ fontFamily: 'var(--font-playfair)' }}>Our canvas.</em>
              </h2>
              <p className="section-subtitle mb-8">
                From whimsical birthday cakes to architectural wedding centerpieces — if you can dream it, we can create it. Every detail, exactly as you envision.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://wa.me/919876543210?text=Hi%20Virali!%20I'd%20love%20to%20discuss%20a%20custom%20cake%20for%20my%20event."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Start Your Design
                </a>
                <Link href="/product/custom-creation" className="btn-outline">
                  See Examples
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-cocoa-900/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1607478900766-efe13248b125?w=800&q=80"
                  alt="Custom cake creation"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-caramel-DEFAULT/10 rounded-xl flex items-center justify-center text-caramel-DEFAULT">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-cocoa-900">5.0 / 5.0</p>
                  <p className="text-xs text-cocoa-300">312 custom orders</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section-padding">
        <div className="max-container">
          <div className="text-center mb-12">
            <p className="tag-label">What They Say</p>
            <h2 className="section-title">
              Stories from our<br />
              <em className="italic" style={{ fontFamily: 'var(--font-playfair)' }}>happy tables</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={testimonial.id}
                className={`p-8 rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-cocoa-900/5 hover:-translate-y-1 ${
                  i === 0 ? 'md:col-span-1 bg-cocoa-900 text-cream-50' : 'bg-cream-100'
                }`}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className={`w-4 h-4 ${i === 0 ? 'text-caramel-light' : 'text-caramel-DEFAULT'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className={`text-lg leading-relaxed mb-6 font-light ${i === 0 ? 'text-cream-50/90' : 'text-cocoa-400'}`}>
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className={`font-semibold text-sm ${i === 0 ? 'text-cream-50' : 'text-cocoa-900'}`}>
                      {testimonial.name}
                    </p>
                    <p className={`text-xs ${i === 0 ? 'text-cream-50/50' : 'text-cocoa-300'}`}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="section-padding bg-cream-100 overflow-hidden">
        <div className="max-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="tag-label">Gallery</p>
              <h2 className="section-title">
                Made with<br />
                <em className="italic" style={{ fontFamily: 'var(--font-playfair)' }}>obsessive care</em>
              </h2>
            </div>
            <a
              href="https://instagram.com/xoxobakery"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline self-start md:self-auto flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              @xoxobakery
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl group ${i === 0 ? 'md:row-span-2' : ''}`}
                style={{ aspectRatio: i === 0 ? '3/4' : '1/1' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-cocoa-900/0 group-hover:bg-cocoa-900/30 transition-all duration-500 flex items-center justify-center">
                  <svg className="w-8 h-8 text-cream-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-caramel-light/20 via-transparent to-transparent" />
        <div className="max-container relative text-center">
          <p className="tag-label">Ready to Order?</p>
          <h2 className="section-title mb-4">
            Let's create something<br />
            <em className="italic" style={{ fontFamily: 'var(--font-playfair)' }}>extraordinary</em>
          </h2>
          <p className="section-subtitle mx-auto mb-10">
            Your perfect cake is just a message away. We'd love to hear about your occasion.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/919876543210?text=Hi%20XOXO%20Bakery!%20I'd%20like%20to%20place%20an%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Message Us on WhatsApp
            </a>
            <Link href="/shop" className="btn-outline">
              Browse Collection
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
