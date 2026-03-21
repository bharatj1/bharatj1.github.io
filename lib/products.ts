export interface Product {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  price: number
  originalPrice?: number
  category: 'celebration' | 'wedding' | 'custom' | 'seasonal' | 'everyday'
  occasion: string[]
  images: string[]
  sizes: { label: string; price: number }[]
  flavors: string[]
  servings: string
  leadTime: string
  isBestseller?: boolean
  isNew?: boolean
  rating: number
  reviewCount: number
}

export const products: Product[] = [
  {
    id: '1',
    slug: 'dark-desire',
    name: 'Dark Desire',
    tagline: 'A statement of indulgence',
    description: 'An opulent symphony of premium dark chocolate, layered in the form of silky ganache. Every slice is a statement of indulgence.',
    price: 710,
    category: 'celebration',
    occasion: ['birthday', 'anniversary', 'corporate'],
    images: [
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&q=80',
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&q=80',
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80',
    ],
    sizes: [
      { label: '250g', price: 449 },
      { label: '500g', price: 710 },
      { label: '1000g', price: 1350 },
    ],
    flavors: ['Dark Chocolate', 'Silky Ganache'],
    servings: 'Varies by size',
    leadTime: '48 hours',
    isBestseller: true,
    rating: 4.9,
    reviewCount: 128,
  },
  {
    id: '2',
    slug: 'velvet-noir',
    name: 'Velvet Noir',
    tagline: 'Pure luxury, silky smooth',
    description: 'A luscious velvety indulgence crafted with premium milk chocolate. Silky smooth layers that melt-in-your-mouth fresh and an elegant richness that defines pure luxury.',
    price: 780,
    category: 'celebration',
    occasion: ['birthday', 'anniversary', 'valentines'],
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80',
      'https://images.unsplash.com/photo-1558636508-e0969431e4f0?w=800&q=80',
    ],
    sizes: [
      { label: '250g', price: 449 },
      { label: '500g', price: 780 },
      { label: '1000g', price: 1150 },
    ],
    flavors: ['Milk Chocolate', 'Velvet Cream'],
    servings: 'Varies by size',
    leadTime: '48 hours',
    rating: 4.9,
    reviewCount: 96,
  },
  {
    id: '3',
    slug: 'pure-obsession',
    name: 'Pure Obsession',
    tagline: 'The finest Belgian chocolate luxury',
    description: 'A decadent treat made with the finest Belgian chocolate. Rich, sumptuous layers and a smooth, melt-in-the-mouth finish — pure chocolate luxury.',
    price: 800,
    category: 'celebration',
    occasion: ['birthday', 'corporate', 'milestone'],
    images: [
      'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=800&q=80',
      'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&q=80',
      'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80',
    ],
    sizes: [
      { label: '250g', price: 449 },
      { label: '500g', price: 800 },
      { label: '1000g', price: 1550 },
    ],
    flavors: ['Belgian Chocolate'],
    servings: 'Varies by size',
    leadTime: '48 hours',
    isBestseller: true,
    rating: 4.8,
    reviewCount: 201,
  },
  {
    id: '4',
    slug: 'the-red-affair',
    name: 'The Red Affair',
    tagline: 'Crimson beauty, melts in your mouth',
    description: 'Lusciously soft and elegantly rich, this crimson beauty is infused with a delicate hint of cocoa and layered with smooth whipped cream cheese frosting. An exquisite treat that melts in your mouth.',
    price: 800,
    category: 'wedding',
    occasion: ['wedding', 'anniversary', 'valentines', 'birthday'],
    images: [
      'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800&q=80',
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80',
      'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80',
    ],
    sizes: [
      { label: '250g', price: 500 },
      { label: '500g', price: 800 },
      { label: '1000g', price: 1400 },
    ],
    flavors: ['Red Velvet', 'Cream Cheese Frosting'],
    servings: 'Varies by size',
    leadTime: '48 hours',
    isBestseller: true,
    rating: 5.0,
    reviewCount: 89,
  },
  {
    id: '5',
    slug: 'the-biscoff-dream',
    name: 'The Biscoff Dream',
    tagline: 'Caramelized Biscoff, velvety crumb',
    description: 'A rich, spiced delight with layers of caramelized Biscoff flavor, perfectly complemented by a velvety, indulgent crumb.',
    price: 800,
    category: 'everyday',
    occasion: ['birthday', 'everyday', 'corporate'],
    images: [
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80',
      'https://images.unsplash.com/photo-1559622214-f8a9850965bb?w=800&q=80',
    ],
    sizes: [
      { label: '250g', price: 449 },
      { label: '500g', price: 800 },
      { label: '1000g', price: 1600 },
    ],
    flavors: ['Biscoff', 'Caramel'],
    servings: 'Varies by size',
    leadTime: '48 hours',
    isNew: true,
    rating: 4.9,
    reviewCount: 64,
  },
  {
    id: '6',
    slug: 'tropical-bliss',
    name: 'Tropical Bliss',
    tagline: 'A hint of citrus sweetness',
    description: 'A refreshing tropical treat with moist layers of pineapple, complemented by a light, silky texture and a hint of citrus sweetness.',
    price: 750,
    category: 'seasonal',
    occasion: ['birthday', 'summer', 'celebration'],
    images: [
      'https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=800&q=80',
      'https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=800&q=80',
      'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=800&q=80',
    ],
    sizes: [
      { label: '250g', price: 449 },
      { label: '500g', price: 750 },
      { label: '1000g', price: 1340 },
    ],
    flavors: ['Pineapple', 'Citrus'],
    servings: 'Varies by size',
    leadTime: '48 hours',
    rating: 4.8,
    reviewCount: 93,
  },
  {
    id: '7',
    slug: 'pina-colada-crumb',
    name: 'Pina Colada Crumb',
    tagline: 'Your favourite piña colada, in a cake',
    description: 'A tropical escape in every bite, blending the rich flavors of pineapple and coconut, just like your favourite piña colada.',
    price: 750,
    category: 'seasonal',
    occasion: ['birthday', 'summer', 'celebration'],
    images: [
      'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80',
      'https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=800&q=80',
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80',
    ],
    sizes: [
      { label: '250g', price: 449 },
      { label: '500g', price: 750 },
      { label: '1000g', price: 1440 },
    ],
    flavors: ['Pineapple', 'Coconut'],
    servings: 'Varies by size',
    leadTime: '48 hours',
    isNew: true,
    rating: 4.9,
    reviewCount: 47,
  },
  {
    id: '8',
    slug: 'seasonal-fruit-cake',
    name: 'Seasonal Fruit Cake',
    tagline: 'Nature\'s sweetness in every bite',
    description: 'A delightful medley of fresh, vibrant seasonal fruits, blended into a moist, fragrant cake for the perfect balance of sweetness and natural flavor.',
    price: 800,
    category: 'seasonal',
    occasion: ['birthday', 'celebration', 'everyday'],
    images: [
      'https://images.unsplash.com/photo-1607478900766-efe13248b125?w=800&q=80',
      'https://images.unsplash.com/photo-1602351447937-745cb720612f?w=800&q=80',
      'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80',
    ],
    sizes: [
      { label: '250g', price: 449 },
      { label: '500g', price: 800 },
      { label: '1000g', price: 1400 },
    ],
    flavors: ['Seasonal Fruits'],
    servings: 'Varies by size',
    leadTime: '48 hours',
    rating: 4.7,
    reviewCount: 176,
  },
  {
    id: '9',
    slug: 'nuttelicious',
    name: 'Nuttelicious',
    tagline: 'Nutella meets velvety chocolate',
    description: 'Where luscious Nutella meets velvety chocolate in a couture creation of pure indulgence.',
    price: 710,
    category: 'everyday',
    occasion: ['birthday', 'everyday', 'celebration'],
    images: [
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&q=80',
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&q=80',
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80',
    ],
    sizes: [
      { label: '250g', price: 449 },
      { label: '500g', price: 710 },
      { label: '1000g', price: 1350 },
    ],
    flavors: ['Nutella', 'Dark Chocolate'],
    servings: 'Varies by size',
    leadTime: '48 hours',
    isBestseller: true,
    rating: 4.9,
    reviewCount: 152,
  },
  {
    id: '10',
    slug: 'love-me-latte',
    name: 'Love Me Latte',
    tagline: 'A mocha lover\'s dream',
    description: 'A mocha lover\'s dream — intense, aromatic and utterly indulgent.',
    price: 780,
    category: 'everyday',
    occasion: ['birthday', 'corporate', 'everyday'],
    images: [
      'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=800&q=80',
      'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&q=80',
      'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80',
    ],
    sizes: [
      { label: '250g', price: 449 },
      { label: '500g', price: 780 },
      { label: '1000g', price: 1450 },
    ],
    flavors: ['Mocha', 'Coffee', 'Latte'],
    servings: 'Varies by size',
    leadTime: '48 hours',
    rating: 4.8,
    reviewCount: 88,
  },
  {
    id: '11',
    slug: 'the-nutty-affair',
    name: 'The Nutty Affair',
    tagline: 'Hazelnut sophistication, silky praline',
    description: 'Artisan-crafted with the finest hazelnuts, this decadent cake blends nutty sophistication with silky praline for an unforgettable indulgence.',
    price: 750,
    category: 'everyday',
    occasion: ['birthday', 'anniversary', 'everyday'],
    images: [
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80',
      'https://images.unsplash.com/photo-1559622214-f8a9850965bb?w=800&q=80',
    ],
    sizes: [
      { label: '250g', price: 449 },
      { label: '500g', price: 750 },
      { label: '1000g', price: 1400 },
    ],
    flavors: ['Hazelnut', 'Praline'],
    servings: 'Varies by size',
    leadTime: '48 hours',
    rating: 4.8,
    reviewCount: 71,
  },
  {
    id: '12',
    slug: 'nawabi-creme',
    name: 'Nawabi Creme',
    tagline: 'Saffron-kissed royal decadence',
    description: 'Traditional richness meets modern decadence in this melt-in-your-mouth saffron-kissed masterpiece.',
    price: 800,
    category: 'wedding',
    occasion: ['wedding', 'celebration', 'milestone', 'anniversary'],
    images: [
      'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800&q=80',
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80',
      'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80',
    ],
    sizes: [
      { label: '250g', price: 499 },
      { label: '500g', price: 800 },
      { label: '1000g', price: 1350 },
    ],
    flavors: ['Saffron', 'Royal Cream'],
    servings: 'Varies by size',
    leadTime: '48 hours',
    isNew: true,
    rating: 5.0,
    reviewCount: 43,
  },
  {
    id: '13',
    slug: 'farrero-fame',
    name: 'Farrero Fame',
    tagline: 'Classic meets modern decadence',
    description: 'Traditional richness meets modern decadence in this melt-in-your-mouth Ferrero-inspired masterpiece.',
    price: 750,
    category: 'celebration',
    occasion: ['birthday', 'anniversary', 'celebration'],
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80',
      'https://images.unsplash.com/photo-1558636508-e0969431e4f0?w=800&q=80',
    ],
    sizes: [
      { label: '250g', price: 449 },
      { label: '500g', price: 750 },
      { label: '1000g', price: 1350 },
    ],
    flavors: ['Ferrero', 'Hazelnut Chocolate'],
    servings: 'Varies by size',
    leadTime: '48 hours',
    rating: 4.9,
    reviewCount: 109,
  },
]

export const testimonials = [
  {
    id: 1,
    name: 'Priya Mehta',
    role: 'Bride',
    text: 'Virali created the most breathtaking wedding cake I have ever seen. Our guests still talk about it. The flavor matched the beauty perfectly.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&q=80',
  },
  {
    id: 2,
    name: 'Arjun Kapoor',
    role: 'Birthday Celebration',
    text: 'Ordered the Dark Desire for my wife\'s birthday. She was blown away. Worth every rupee — this is not just cake, it\'s an experience.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  },
  {
    id: 3,
    name: 'Sanya Malhotra',
    role: 'Corporate Event',
    text: 'XOXO has become our go-to for every corporate milestone. The presentation is impeccable and the team is incredibly professional.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
  },
  {
    id: 4,
    name: 'Rahul Gupta',
    role: 'Anniversary',
    text: 'Two years running, XOXO has made our anniversary unforgettable. The Red Affair is our cake — we will never order anything else.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
  },
]

export const galleryImages = [
  { url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80', alt: 'Dark Desire cake' },
  { url: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=600&q=80', alt: 'The Red Affair' },
  { url: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=600&q=80', alt: 'Pure Obsession' },
  { url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80', alt: 'Tropical Bliss' },
  { url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&q=80', alt: 'Velvet Noir' },
  { url: 'https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=600&q=80', alt: 'Nawabi Creme' },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug)
}

export function getRelatedProducts(product: Product, count = 3): Product[] {
  return products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, count)
}
