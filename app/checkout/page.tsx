'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart'

export default function CheckoutPage() {
  const { state, cartTotal } = useCart()
  const { items } = state

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    deliveryDate: '',
    deliveryTime: '',
    address: '',
    city: 'Mumbai',
    notes: '',
    deliveryType: 'delivery' as 'delivery' | 'pickup',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const generateWhatsAppMessage = () => {
    const itemList = items.map(item =>
      `• ${item.name} (${item.size}, ${item.flavor}) ×${item.quantity} — ₹${(item.price * item.quantity).toLocaleString('en-IN')}${item.customMessage ? `\n  Message: "${item.customMessage}"` : ''}`
    ).join('\n')

    const message = `Hi XOXO Bakery! I'd like to confirm my order:\n\n*ORDER DETAILS*\n${itemList}\n\n*Subtotal: ₹${cartTotal.toLocaleString('en-IN')}*\n\n*DELIVERY INFO*\nType: ${form.deliveryType === 'pickup' ? 'Pickup' : 'Home Delivery'}\nDate: ${form.deliveryDate || 'TBD'}\nTime: ${form.deliveryTime || 'TBD'}\n${form.deliveryType === 'delivery' ? `Address: ${form.address}, ${form.city}` : ''}\n\n*CONTACT*\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\n\n${form.notes ? `Notes: ${form.notes}` : ''}\n\nPlease confirm and share payment details. Thank you!`

    return `https://wa.me/919876543210?text=${encodeURIComponent(message)}`
  }

  const isValid = form.name && form.phone && form.deliveryDate

  if (items.length === 0) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <p className="font-display text-2xl text-cocoa-900 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            Your cart is empty
          </p>
          <Link href="/shop" className="btn-primary">Browse Shop</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-28 min-h-screen">
      <div className="section-padding">
        <div className="max-container max-w-5xl">
          {/* Header */}
          <div className="mb-10">
            <p className="tag-label">Almost There</p>
            <h1 className="font-display text-4xl md:text-5xl text-cocoa-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Confirm Your Order
            </h1>
            <p className="text-cocoa-300 mt-2">Fill in your details and send to us via WhatsApp — we'll confirm within 2 hours.</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10">
            {/* Form */}
            <div className="lg:col-span-3 space-y-8">
              {/* Contact */}
              <div>
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-cocoa-300 mb-4">Contact Information</h2>
                <div className="grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cocoa-400 mb-1.5">Full Name *</label>
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
                      <label className="block text-xs font-medium text-cocoa-400 mb-1.5">WhatsApp Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cocoa-400 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="priya@example.com"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery type */}
              <div>
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-cocoa-300 mb-4">Delivery Preference</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { value: 'delivery', label: 'Home Delivery', desc: 'Delivered to your address in Mumbai', icon: '🚚' },
                    { value: 'pickup', label: 'Self Pickup', desc: 'Pick up from our studio at a scheduled time', icon: '🏪' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, deliveryType: opt.value as 'delivery' | 'pickup' }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        form.deliveryType === opt.value
                          ? 'border-caramel-DEFAULT bg-caramel-DEFAULT/5'
                          : 'border-cream-300 hover:border-cocoa-200'
                      }`}
                    >
                      <div className="text-xl mb-2">{opt.icon}</div>
                      <p className="font-medium text-cocoa-900 text-sm">{opt.label}</p>
                      <p className="text-xs text-cocoa-300 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & time */}
              <div>
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-cocoa-300 mb-4">
                  {form.deliveryType === 'pickup' ? 'Pickup' : 'Delivery'} Date & Time
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-cocoa-400 mb-1.5">Preferred Date *</label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={form.deliveryDate}
                      onChange={handleChange}
                      min={new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cocoa-400 mb-1.5">Preferred Time</label>
                    <select
                      name="deliveryTime"
                      value={form.deliveryTime}
                      onChange={handleChange}
                      className="input-field cursor-pointer"
                    >
                      <option value="">Select time slot</option>
                      <option value="10:00 AM – 12:00 PM">10:00 AM – 12:00 PM</option>
                      <option value="12:00 PM – 2:00 PM">12:00 PM – 2:00 PM</option>
                      <option value="2:00 PM – 4:00 PM">2:00 PM – 4:00 PM</option>
                      <option value="4:00 PM – 6:00 PM">4:00 PM – 6:00 PM</option>
                      <option value="6:00 PM – 8:00 PM">6:00 PM – 8:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address */}
              {form.deliveryType === 'delivery' && (
                <div>
                  <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-cocoa-300 mb-4">Delivery Address</h2>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cocoa-400 mb-1.5">Full Address</label>
                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Building name, street, area, landmark"
                        rows={3}
                        className="input-field resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cocoa-400 mb-1.5">City</label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-cocoa-400 mb-1.5">Additional Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions, allergy information, or design preferences..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-2">
              <div className="bg-cream-100 rounded-3xl p-6 sticky top-24">
                <h2 className="font-display text-xl text-cocoa-900 mb-5" style={{ fontFamily: 'var(--font-playfair)' }}>
                  Order Summary
                </h2>

                <div className="space-y-3 mb-5">
                  {items.map(item => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-cocoa-900 truncate">{item.name}</p>
                        <p className="text-xs text-cocoa-300">{item.size} · ×{item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-cocoa-900 flex-shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-cream-300 pt-4 mb-6">
                  <div className="flex justify-between font-bold text-cocoa-900">
                    <span>Total (excl. delivery)</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* How it works */}
                <div className="mb-6">
                  <p className="text-xs font-semibold tracking-widest uppercase text-cocoa-300 mb-3">How it works</p>
                  {[
                    { step: '1', text: 'Submit via WhatsApp' },
                    { step: '2', text: 'We confirm in 2 hours' },
                    { step: '3', text: 'Pay 50% advance' },
                    { step: '4', text: 'Receive your creation' },
                  ].map(item => (
                    <div key={item.step} className="flex items-center gap-3 mb-2">
                      <div className="w-5 h-5 rounded-full bg-caramel-DEFAULT/20 text-caramel-DEFAULT text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {item.step}
                      </div>
                      <span className="text-xs text-cocoa-400">{item.text}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={isValid ? generateWhatsAppMessage() : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => { if (!isValid) { e.preventDefault(); alert('Please fill in your name, phone, and preferred date.') } }}
                  className={`btn-primary w-full justify-center flex items-center gap-2 ${!isValid ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Send Order on WhatsApp
                </a>

                <Link href="/cart" className="block text-center text-xs text-cocoa-300 hover:text-cocoa-900 mt-3 transition-colors">
                  ← Back to cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
