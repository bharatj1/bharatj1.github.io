import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="tag-label">404</p>
        <h1 className="font-display text-5xl md:text-7xl text-cocoa-900 mt-2 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
          Page not found
        </h1>
        <p className="text-cocoa-300 max-w-md mx-auto mb-10">
          It seems this page has wandered off. Let's get you back to the good stuff.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="btn-primary">Go Home</Link>
          <Link href="/shop" className="btn-outline">Browse Cakes</Link>
        </div>
      </div>
    </div>
  )
}
