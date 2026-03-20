'use client'

import Link from 'next/link'
import { Product } from '@/lib/products'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="product-card">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading={priority ? 'eager' : 'lazy'}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {product.isBestseller && (
              <span className="px-2.5 py-1 bg-caramel-DEFAULT text-cream-50 text-[10px] font-semibold tracking-wider uppercase rounded-full">
                Bestseller
              </span>
            )}
            {product.isNew && (
              <span className="px-2.5 py-1 bg-sage text-white text-[10px] font-semibold tracking-wider uppercase rounded-full">
                New
              </span>
            )}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-cocoa-900/0 group-hover:bg-cocoa-900/20 transition-all duration-500 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-cream-50 text-cocoa-900 text-xs font-semibold tracking-widest uppercase px-5 py-2.5 rounded-full transform translate-y-3 group-hover:translate-y-0">
              View Details
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-caramel-DEFAULT' : 'text-cream-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[11px] text-cocoa-300">({product.reviewCount})</span>
          </div>

          {/* Name & tagline */}
          <h3 className="font-display text-lg text-cocoa-900 leading-snug group-hover:text-caramel-DEFAULT transition-colors duration-200" style={{ fontFamily: 'var(--font-playfair)' }}>
            {product.name}
          </h3>
          <p className="text-xs text-cocoa-300 mt-1 italic">{product.tagline}</p>

          {/* Price & CTA */}
          <div className="flex items-center justify-between mt-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-cocoa-900">₹{product.price.toLocaleString('en-IN')}</span>
                {product.originalPrice && (
                  <span className="text-sm text-cocoa-200 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                )}
              </div>
              <p className="text-[10px] text-cocoa-300 mt-0.5">for {product.servings} servings</p>
            </div>
            <span className="w-9 h-9 rounded-full bg-cream-100 group-hover:bg-caramel-DEFAULT flex items-center justify-center transition-all duration-300">
              <svg className="w-4 h-4 text-cocoa-300 group-hover:text-cream-50 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
