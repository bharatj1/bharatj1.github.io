import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Our Story — XOXO Bakery',
  description: 'Meet Virali Shah, the founder of XOXO Bakery. Discover the story behind Mumbai\'s most beloved custom cake studio.',
}

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden pt-24">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://drive.google.com/uc?export=view&id=1eEKzI4oHl6_jMml5ogETCQxqjhVJDqd1"
            alt="Virali Shah baking"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cocoa-900 via-cocoa-900/60 to-transparent" />
        </div>
        <div className="relative z-10 max-container px-6 md:px-12 pb-16">
          <p className="tag-label text-caramel-light">Our Story</p>
          <h1
            className="font-display text-5xl md:text-7xl text-cream-50 leading-tight mt-2"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Made with love<br />
            <em className="italic">since 2018</em>
          </h1>
        </div>
      </section>

      {/* Founder story */}
      <section className="section-padding">
        <div className="max-container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="tag-label">Meet the Founder</p>
              <h2 className="section-title mb-6">
                Virali Shah
              </h2>
              <div className="space-y-5 text-cocoa-400 leading-relaxed">
                <p>
                  XOXO is the culmination of a lifelong love affair with the art of pâtisserie, a disciplined craft nurtured in solitude for decades. During the unexpected stillness of recent years, this ritual intensified; creating intricate, emotionally infused desserts for loved ones became a meditative focus.
                </p>
                <p>
                  It was a close confidante, recognizing the profound dedication in a simple truffle, who inspired the transition from personal passion to business — a desire to share this specific language of refined pleasure and care with the world.
                </p>
                <p>
                  Every cake that leaves our studio is treated as a once-in-a-lifetime creation. Because for someone, it is. A 70th birthday. A first anniversary. A proposal. We carry that weight with joy.
                </p>
                <p className="font-medium text-cocoa-900">
                  "We don't just bake — we craft memories. Your support keeps the ovens warm and the whiskey spinning."
                </p>
                <p className="text-sm italic text-cocoa-300">— Virali Shah, Founder</p>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-cocoa-900/20 aspect-[3/4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://drive.google.com/uc?export=view&id=1ElhnS0mpfTD3JLBveqxGbj47k7i1vfFU"
                  alt="Virali Shah in the bakery"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-caramel-DEFAULT text-cream-50 rounded-2xl p-4 text-center shadow-xl">
                <p className="font-display text-3xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>2018</p>
                <p className="text-xs tracking-widest uppercase mt-0.5 opacity-80">Est.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Third photo banner */}
      <div className="w-full h-64 md:h-80 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://drive.google.com/uc?export=view&id=1UmFs90E5LQ88wvdfEzdNb7AikslyYRjJ"
          alt="XOXO Bakery"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Values */}
      <section className="section-padding bg-cream-100">
        <div className="max-container">
          <div className="text-center mb-14">
            <p className="tag-label">What Drives Us</p>
            <h2 className="section-title">Our philosophy</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: '01',
                title: 'Uncompromising Quality',
                desc: 'We source the finest Belgian chocolate, real Madagascar vanilla, and fresh seasonal fruits. Not because it\'s cheaper — it\'s not — but because you deserve nothing less.',
              },
              {
                number: '02',
                title: 'Design with Purpose',
                desc: 'Every flourish, every shade, every sugar flower is intentional. We study color theory, sculpt forms, and paint with food dye. Our cakes are edible art.',
              },
              {
                number: '03',
                title: 'Your Story, Our Medium',
                desc: 'We begin every custom order with a conversation. We want to know about the person, the occasion, the feeling you want to evoke. The cake comes from there.',
              },
            ].map(value => (
              <div key={value.number} className="group p-8 bg-white rounded-3xl hover:shadow-xl hover:shadow-cocoa-900/5 transition-all duration-300">
                <p className="font-display text-5xl text-caramel-DEFAULT/30 font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {value.number}
                </p>
                <h3 className="font-semibold text-xl text-cocoa-900 mb-3">{value.title}</h3>
                <p className="text-cocoa-300 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding">
        <div className="max-container max-w-3xl">
          <div className="text-center mb-14">
            <p className="tag-label">The Journey</p>
            <h2 className="section-title">Six years of milestones</h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-caramel-DEFAULT/20" />

            <div className="space-y-10">
              {[
                { year: '2018', title: 'The Beginning', desc: 'XOXO Bakery is born in a 200 sq. ft. kitchen in Bandra. First order: a birthday cake for a neighbor that got shared on Instagram 47 times.' },
                { year: '2019', title: 'First Wedding', desc: 'A four-tier wedding cake for a 300-guest celebration. The bride cried. So did Virali. This is when we knew weddings were our calling.' },
                { year: '2020', title: 'Pivoting Through the Storm', desc: 'Lockdown transformed us. We launched no-contact delivery, cake boxes for small celebrations, and started our online ordering system.' },
                { year: '2021', title: 'Going Viral', desc: 'A hand-painted monsoon-inspired cake was featured on a major food blog. Inquiries jumped 400%. We hired our first team members.' },
                { year: '2023', title: 'The New Studio', desc: 'We moved to a proper 800 sq. ft. studio kitchen with a dedicated cold storage and photo setup. Our first official pastry chef joined the team.' },
                { year: '2024', title: 'Today', desc: 'Over 2,000 cakes created, a 4.9-star average across 800+ reviews, and the same obsession with perfection that started in that tiny Bandra kitchen.' },
              ].map(item => (
                <div key={item.year} className="flex gap-8">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-caramel-DEFAULT/10 border-2 border-caramel-DEFAULT/30 flex items-center justify-center z-10">
                      <span className="text-xs font-bold text-caramel-DEFAULT">{item.year}</span>
                    </div>
                  </div>
                  <div className="pb-8">
                    <h3 className="font-semibold text-lg text-cocoa-900">{item.title}</h3>
                    <p className="text-cocoa-300 text-sm leading-relaxed mt-2">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-cocoa-900 text-center">
        <div className="max-container">
          <p className="tag-label text-caramel-light">Work with Us</p>
          <h2 className="font-display text-4xl md:text-5xl text-cream-50 mt-2 mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
            Let's celebrate together
          </h2>
          <p className="text-cream-50/60 max-w-md mx-auto mb-10">
            Whether it's an intimate birthday or a grand wedding, we'd love to be part of your story.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/918779189819?text=Hi%20Virali!%20I'd%20love%20to%20discuss%20a%20cake%20for%20my%20special%20occasion."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary bg-cream-50 text-cocoa-900 hover:bg-caramel-DEFAULT hover:text-cream-50"
            >
              Start a Conversation
            </a>
            <Link href="/shop" className="btn-outline border-cream-50/40 text-cream-50 hover:bg-cream-50 hover:text-cocoa-900">
              View Our Cakes
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
