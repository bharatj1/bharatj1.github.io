'use client'

import { useState } from 'react'
import type { Metadata } from 'next'
import ProductCard from '@/components/ProductCard'
import { products } from '@/lib/products'

type Category = 'all' | 'celebration' | 'wedding' | 'custom' | 'seasonal' | 'everyday'
type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating'

const categories: { value: Category; label: string }[] = [
  { value: 'all', label: 'All Cakes' },
  { value: 'celebration', label: 'Celebration' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'everyday', label: 'Everyday' },
  { value: 'custom', label: 'Custom' },
]

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
]

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [sortBy, setSortBy] = useState<SortOption>('featured')

  const filtered = products
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price
        case 'price-desc': return b.price - a.price
        case 'rating': return b.rating - a.rating
        default: return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0)
      }
    })

  return (
    <>
      {/* Page header */}
      <div className="pt-32 pb-12 px-6 md:px-12 bg-cream-100">
        <div className="max-container">
          <p className="tag-label">Our Collection</p>
          <h1
            className="font-display text-4xl md:text-6xl text-cocoa-900 mt-2 mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            The Full Collection
          </h1>
          <p className="section-subtitle">
            {products.length} handcrafted creations, each made to order with premium ingredients.
          </p>
        </div>
      </div>

      {/* Filters & sorting */}
      <div className="sticky top-[60px] z-40 bg-cream-50/95 backdrop-blur-md border-b border-cream-300 px-6 md:px-12 py-4">
        <div className="max-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Category filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                  activeCategory === cat.value
                    ? 'bg-cocoa-900 text-cream-50'
                    : 'bg-cream-200 text-cocoa-400 hover:bg-cream-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-cocoa-300 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="text-xs text-cocoa-900 bg-cream-100 border border-cream-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-caramel-DEFAULT cursor-pointer"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="section-padding">
        <div className="max-container">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-cocoa-300" style={{ fontFamily: 'var(--font-playfair)' }}>
                No cakes found in this category
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-cocoa-300 mb-8">
                Showing {filtered.length} {filtered.length === 1 ? 'cake' : 'cakes'}
                {activeCategory !== 'all' && ` in ${categories.find(c => c.value === activeCategory)?.label}`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Custom order prompt */}
      <div className="px-6 md:px-12 pb-20">
        <div className="max-container">
          <div className="bg-cream-100 rounded-3xl p-8 md:p-12 text-center">
            <p className="tag-label">Don't See What You're Looking For?</p>
            <h2 className="font-display text-3xl md:text-4xl text-cocoa-900 mt-2 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
              Let's create it together
            </h2>
            <p className="text-cocoa-300 max-w-md mx-auto mb-8">
              Our custom cake service means any design, any flavor, any occasion. Just tell us your vision.
            </p>
            <a
              href="https://wa.me/918779189819?text=Hi%20XOXO%20Bakery!%20I'd%20like%20to%20discuss%20a%20custom%20cake."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex"
            >
              Get a Custom Quote
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
