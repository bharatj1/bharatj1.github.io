'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    occasion: '',
    date: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const whatsappMessage = `Hi XOXO Bakery! I'd like to get in touch.\n\nName: ${form.name}\nEmail: ${form.email}\nOccasion: ${form.occasion || 'Not specified'}\nDate: ${form.date || 'TBD'}\n\nMessage:\n${form.message}`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      {/* Header */}
      <div className="pt-32 pb-16 px-6 md:px-12 bg-cocoa-900">
        <div className="max-container">
          <p className="tag-label text-caramel-light">Get in Touch</p>
          <h1
            className="font-display text-5xl md:text-6xl text-cream-50 mt-2 leading-tight"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Let's talk<br />
            <em className="italic">about cake</em>
          </h1>
          <p className="text-cream-50/60 mt-4 max-w-md">
            Ready to create something beautiful together? Reach out and we'll respond within a few hours.
          </p>
        </div>
      </div>

      <section className="section-padding">
        <div className="max-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact info */}
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl text-cocoa-900 mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
                Reach us directly
              </h2>

              {/* WhatsApp */}
              <a
                href="https://wa.me/918779189819?text=Hi%20XOXO%20Bakery!%20I'd%20like%20to%20discuss%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-5 bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl hover:bg-[#25D366]/15 transition-colors duration-200 mb-4 group"
              >
                <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-cocoa-900 group-hover:text-[#25D366] transition-colors">WhatsApp</p>
                  <p className="text-sm text-cocoa-300 mt-0.5">+91 98765 43210</p>
                  <p className="text-xs text-cocoa-200 mt-1">Fastest response · Usually within 2 hours</p>
                </div>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/xoxobakery"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-5 bg-cream-100 border border-cream-300 rounded-2xl hover:border-cocoa-200 transition-colors duration-200 mb-4 group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-cocoa-900">Instagram</p>
                  <p className="text-sm text-cocoa-300 mt-0.5">@xoxobakery.vs /p>
                  <p className="text-xs text-cocoa-200 mt-1">See our latest creations</p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:hello@xoxobakery.com"
                className="flex items-start gap-4 p-5 bg-cream-100 border border-cream-300 rounded-2xl hover:border-cocoa-200 transition-colors duration-200 mb-8 group"
              >
                <div className="w-10 h-10 bg-caramel-DEFAULT/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-caramel-DEFAULT" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-cocoa-900">Email</p>
                  <p className="text-sm text-cocoa-300 mt-0.5">hello@xoxobakery.com</p>
                  <p className="text-xs text-cocoa-200 mt-1">For detailed inquiries</p>
                </div>
              </a>

              {/* Hours */}
              <div className="p-5 bg-cocoa-900 rounded-2xl text-cream-50">
                <h3 className="font-semibold mb-3 text-sm tracking-wide">Studio Hours</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { day: 'Mon – Fri', time: '9:00 AM – 7:00 PM' },
                    { day: 'Saturday', time: '9:00 AM – 5:00 PM' },
                    { day: 'Sunday', time: 'By appointment only' },
                  ].map(h => (
                    <div key={h.day} className="flex justify-between">
                      <span className="text-cream-50/60">{h.day}</span>
                      <span>{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-sage/20 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl text-cocoa-900 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
                    Message Received
                  </h3>
                  <p className="text-cocoa-300 max-w-xs mb-8">
                    Thank you for reaching out. We'll get back to you within a few hours. Or reach us directly on WhatsApp for a faster response.
                  </p>
                  <a
                    href={`https://wa.me/918779189819?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Send via WhatsApp Instead
                  </a>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-2xl text-cocoa-900 mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
                    Send us a message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-cocoa-400 mb-1.5">Your Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Priya Sharma"
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-cocoa-400 mb-1.5">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="priya@example.com"
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-cocoa-400 mb-1.5">Occasion</label>
                        <select
                          name="occasion"
                          value={form.occasion}
                          onChange={handleChange}
                          className="input-field cursor-pointer"
                        >
                          <option value="">Select occasion</option>
                          <option value="Birthday">Birthday</option>
                          <option value="Wedding">Wedding</option>
                          <option value="Anniversary">Anniversary</option>
                          <option value="Baby Shower">Baby Shower</option>
                          <option value="Corporate">Corporate Event</option>
                          <option value="Graduation">Graduation</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-cocoa-400 mb-1.5">Event Date</label>
                        <input
                          type="date"
                          name="date"
                          value={form.date}
                          onChange={handleChange}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cocoa-400 mb-1.5">Your Message *</label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us about your occasion, design ideas, flavor preferences, budget range, or anything else we should know..."
                        rows={5}
                        className="input-field resize-none"
                        required
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button type="submit" className="btn-primary flex-1 justify-center">
                        Send Message
                      </button>
                      <a
                        href={`https://wa.me/918779189819?text=${encodeURIComponent(whatsappMessage)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline flex items-center gap-2 justify-center"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp Instead
                      </a>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
