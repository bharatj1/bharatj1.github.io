'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart'

export default function CartPage() {
  const { state, dispatch, cartTotal } = useCart()
  const { items } = state

  const generateWhatsAppMessage = () => {
    if (items.length === 0) return '#'
    const itemList = items.map(item =>
      `• ${item.name} (${item.size}, ${item.flavor}) x${item.quantity} — ₹${(item.price * item.quantity).toLocaleString('en-IN')}${item.customMessage ? `\n  Message: "${item.customMessage}"` : ''}`
    ).join('\n')
    const message = `Hi XOXO Bakery! I'd like to place an order:\n\n${itemList}\n\n*Total: ₹${cartTotal.toLocaleString('en-IN')}*\n\nPlease confirm availability and delivery details.`
    return `https://wa.me/919876543210?text=${encodeURIComponent(message)}`
  }

  return (
    <div className="pt-28 min-h-screen">
      <div className="section-padding">
        <div className="max-container">
          {/* Header */}
          <div className="mb-10">
            <p className="tag-label">Your Selection</p>
            <h1 className="font-display text-4xl md:text-5xl text-cocoa-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Your Cart
            </h1>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-cream-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-cocoa-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-cocoa-900 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
                Your cart is empty
              </h2>
              <p className="text-cocoa-300 mb-8">Discover our handcrafted collection and find your perfect cake.</p>
              <Link href="/shop" className="btn-primary">Browse Shop</Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Cart items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map(item => {
                  const key = `${item.id}-${item.size}-${item.flavor}`
                  return (
                    <div key={key} className="flex gap-4 p-5 bg-white rounded-2xl border border-cream-200 hover:border-cream-300 transition-colors duration-200">
                      {/* Image */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-cocoa-900">{item.name}</h3>
                            <p className="text-sm text-cocoa-300 mt-0.5">{item.size}</p>
                            <p className="text-sm text-cocoa-300">{item.flavor}</p>
                            {item.customMessage && (
                              <p className="text-xs text-caramel-DEFAULT mt-1 italic">"{item.customMessage}"</p>
                            )}
                          </div>
                          <button
                            onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: key })}
                            className="text-cocoa-200 hover:text-rose-deep transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity */}
                          <div className="flex items-center gap-2 bg-cream-100 rounded-full px-2 py-1">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, size: item.size, quantity: item.quantity - 1 } })
                                } else {
                                  dispatch({ type: 'REMOVE_ITEM', payload: key })
                                }
                              }}
                              className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-sm hover:bg-cream-300 transition-colors"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, size: item.size, quantity: item.quantity + 1 } })}
                              className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-sm hover:bg-cream-300 transition-colors"
                            >
                              +
                            </button>
                          </div>

                          {/* Price */}
                          <span className="font-bold text-cocoa-900">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Continue shopping */}
                <div className="pt-4">
                  <Link href="/shop" className="text-sm text-caramel-DEFAULT hover:text-caramel-dark flex items-center gap-1 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-cream-100 rounded-3xl p-6 sticky top-24">
                  <h2 className="font-display text-xl text-cocoa-900 mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
                    Order Summary
                  </h2>

                  <div className="space-y-3 mb-6">
                    {items.map(item => (
                      <div key={`${item.id}-${item.size}-${item.flavor}`} className="flex justify-between text-sm">
                        <span className="text-cocoa-400 truncate mr-2">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-cocoa-900 font-medium flex-shrink-0">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-cream-300 pt-4 mb-6">
                    <div className="flex justify-between text-sm text-cocoa-300 mb-2">
                      <span>Subtotal</span>
                      <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-cocoa-300 mb-4">
                      <span>Delivery</span>
                      <span>Calculated on confirmation</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-cocoa-900">
                      <span>Total</span>
                      <span>₹{cartTotal.toLocaleString('en-IN')}+</span>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="bg-caramel-DEFAULT/10 rounded-xl p-4 mb-6">
                    <p className="text-xs text-cocoa-400 leading-relaxed">
                      <span className="font-semibold">Note:</span> All orders require 48–72 hours notice. Our team will confirm availability and delivery charges via WhatsApp.
                    </p>
                  </div>

                  {/* CTA */}
                  <a
                    href={generateWhatsAppMessage()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full justify-center flex items-center gap-2 mb-3"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Place Order via WhatsApp
                  </a>

                  <button
                    onClick={() => {
                      if (confirm('Clear your cart?')) dispatch({ type: 'CLEAR_CART' })
                    }}
                    className="w-full text-center text-xs text-cocoa-200 hover:text-cocoa-400 transition-colors py-2"
                  >
                    Clear cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
