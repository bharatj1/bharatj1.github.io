'use client'

import { useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductBySlug, getRelatedProducts, products } from '@/lib/products'
import ProductCard from '@/components/ProductCard'
import { useCart } from '@/lib/cart'

interface Props {
  params: { slug: string }
}

export default function ProductPage({ params }: Props) {
  const product = getProductBySlug(params.slug)
  if (!product) notFound()

  const related = getRelatedProducts(product)
  const { dispatch } = useCart()

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] || product.sizes[0])
  const [selectedFlavor, setSelectedFlavor] = useState(product.flavors[0])
  const [customMessage, setCustomMessage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0],
        price: selectedSize.price,
        size: selectedSize.label,
        flavor: selectedFlavor,
        customMessage,
        quantity,
      },
    })
    dispatch({ type: 'SET_OPEN', payload: true })
    setAdded(true)
    setTimeout(() => setAdded(false), 3000)
  }

  const whatsappMessage = `Hi XOXO Bakery! I'd like to order:\n\n*${product.name}*\nSize: ${selectedSize.label}\nFlavor: ${selectedFlavor}\nQty: ${quantity}${customMessage ? `\nMessage on cake: "${customMessage}"` : ''}\n\nPrice: ₹${(selectedSize.price * quantity).toLocaleString('en-IN')}\n\nPlease confirm availability!`

  return (
    <>
      {/* Breadcrumb */}
      <div className="pt-28 pb-4 px-6 md:px-12">
        <div className="max-container">
          <nav className="flex items-center gap-2 text-xs text-cocoa-300">
            <Link href="/" className="hover:text-cocoa-900 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-cocoa-900 transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-cocoa-900">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product detail */}
      <div className="px-6 md:px-12 pb-20">
        <div className="max-container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* Images */}
            <div className="space-y-4">
              {/* Main image */}
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-cream-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                {product.isBestseller && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-caramel-DEFAULT text-cream-50 text-xs font-semibold tracking-wider uppercase rounded-full">
                      Bestseller
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden transition-all duration-200 ${
                        selectedImage === i ? 'ring-2 ring-caramel-DEFAULT ring-offset-2' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="flex flex-col">
              {/* Header */}
              <div>
                <p className="tag-label">{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
                <h1
                  className="font-display text-4xl md:text-5xl text-cocoa-900 leading-tight mt-1"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {product.name}
                </h1>
                <p className="text-cocoa-300 italic text-lg mt-2">{product.tagline}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-caramel-DEFAULT' : 'text-cream-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-cocoa-900">{product.rating}</span>
                  <span className="text-sm text-cocoa-300">({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="mt-6 p-5 bg-cream-100 rounded-2xl">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-cocoa-900">
                    ₹{selectedSize.price.toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-cocoa-200 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <p className="text-xs text-cocoa-300 mt-1">Inclusive of all taxes · Lead time: {product.leadTime}</p>
              </div>

              {/* Description */}
              <p className="text-cocoa-400 leading-relaxed mt-6">{product.description}</p>

              {/* Size selector */}
              <div className="mt-8">
                <label className="text-xs font-semibold tracking-[0.15em] uppercase text-cocoa-300 mb-3 block">
                  Select Size
                </label>
                <div className="grid gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size.label}
                      onClick={() => setSelectedSize(size)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${
                        selectedSize.label === size.label
                          ? 'border-caramel-DEFAULT bg-caramel-DEFAULT/5 text-cocoa-900'
                          : 'border-cream-300 text-cocoa-400 hover:border-cocoa-300'
                      }`}
                    >
                      <span>{size.label}</span>
                      <span className="font-semibold">₹{size.price.toLocaleString('en-IN')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Flavor selector */}
              <div className="mt-6">
                <label className="text-xs font-semibold tracking-[0.15em] uppercase text-cocoa-300 mb-3 block">
                  Choose Flavor
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.flavors.map(flavor => (
                    <button
                      key={flavor}
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all duration-200 ${
                        selectedFlavor === flavor
                          ? 'border-caramel-DEFAULT bg-caramel-DEFAULT text-cream-50'
                          : 'border-cream-300 text-cocoa-400 hover:border-cocoa-300'
                      }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom message */}
              <div className="mt-6">
                <label className="text-xs font-semibold tracking-[0.15em] uppercase text-cocoa-300 mb-2 block">
                  Message on Cake <span className="text-cocoa-200 normal-case tracking-normal font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  maxLength={60}
                  placeholder='e.g. "Happy Birthday Priya! 🎂"'
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  className="input-field"
                />
                <p className="text-xs text-cocoa-200 mt-1">{customMessage.length}/60 characters</p>
              </div>

              {/* Quantity */}
              <div className="mt-6 flex items-center gap-4">
                <label className="text-xs font-semibold tracking-[0.15em] uppercase text-cocoa-300">Quantity</label>
                <div className="flex items-center gap-3 bg-cream-100 rounded-full px-3 py-1.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-cocoa-900 hover:bg-cream-300 transition-colors text-lg leading-none"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-cocoa-900 hover:bg-cream-300 transition-colors text-lg leading-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-cocoa-300">Total</span>
                <span className="text-xl font-bold text-cocoa-900">
                  ₹{(selectedSize.price * quantity).toLocaleString('en-IN')}
                </span>
              </div>

              {/* CTA buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 btn-primary justify-center ${added ? 'bg-sage text-white' : ''}`}
                >
                  {added ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline flex items-center gap-2 justify-center"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Order via WhatsApp
                </a>
              </div>

              {/* Trust signals */}
              <div className="mt-8 grid grid-cols-3 gap-4 pt-8 border-t border-cream-300">
                {[
                  { icon: '🎂', label: 'Made to Order' },
                  { icon: '✨', label: 'Premium Quality' },
                  { icon: '🚚', label: 'Mumbai Delivery' },
                ].map(item => (
                  <div key={item.label} className="text-center">
                    <div className="text-xl mb-1">{item.icon}</div>
                    <p className="text-xs text-cocoa-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="section-padding bg-cream-100">
          <div className="max-container">
            <h2 className="font-display text-3xl text-cocoa-900 mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
              You might also love
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
