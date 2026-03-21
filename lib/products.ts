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
    slug: 'velvet-romance',
    name: 'Velvet Romance',
    tagline: 'A whisper of red, a rush of love',
    description: 'Our signature red velvet cake, layered with house-made cream cheese frosting and adorned with hand-piped roses. Each tier is a testament to patience and craftsmanship.',
    price: 4200,
    category: 'celebration',
    occasion: ['birthday', 'anniversary', 'valentines'],
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80',
      'https://images.unsplash.com/photo-1558636508-e0969431e4f0?w=800&q=80',
    ],
    sizes: [
      { label: '6 inch (6–8 servings)', price: 3200 },
      { label: '8 inch (12–15 servings)', price: 4200 },
      { label: '10 inch (20–25 servings)', price: 5800 },
    ],
    flavors: ['Red Velvet', 'Classic Vanilla', 'Dark Chocolate'],
    servings: '12–15',
    leadTime: '48 hours',
    isBestseller: true,
    rating: 4.9,
    reviewCount: 128,
  },
  {
    id: '2',
    slug: 'blossom-dream',
    name: 'Blossom Dream',
    tagline: 'Where every petal tells a story',
    description: 'A delicate white fondant creation adorned with hand-crafted sugar flowers in blush and ivory. Perfect for weddings, bridal showers, or any milestone worth celebrating.',
    price: 6800,
    category: 'wedding',
    occasion: ['wedding', 'anniversary', 'bridal'],
    images: [
      'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800&q=80',
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80',
      'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80',
    ],
    sizes: [
      { label: '6 inch (6–8 servings)', price: 4800 },
      { label: '8 inch (12–15 servings)', price: 6800 },
      { label: '10 inch (20–25 servings)', price: 9200 },
      { label: '3-Tier Wedding (50+ servings)', price: 22000 },
    ],
    flavors: ['Vanilla Bean', 'Rose & Lychee', 'Lavender Honey'],
    servings: '12–15',
    leadTime: '72 hours',
    isNew: false,
    rating: 5.0,
    reviewCount: 89,
  },
  {
    id: '3',
    slug: 'golden-hour',
    name: 'Golden Hour',
    tagline: 'Luxury in every layer',
    description: 'A show-stopping gold-leaf decorated masterpiece with alternating layers of salted caramel and dark chocolate ganache. The gold drip finish makes it pure theatre.',
    price: 5500,
    category: 'celebration',
    occasion: ['birthday', 'corporate', 'milestone'],
    images: [
      'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=800&q=80',
      'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&q=80',
      'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80',
    ],
    sizes: [
      { label: '6 inch (6–8 servings)', price: 4000 },
      { label: '8 inch (12–15 servings)', price: 5500 },
      { label: '10 inch (20–25 servings)', price: 7200 },
    ],
    flavors: ['Salted Caramel', 'Dark Chocolate', 'Coffee Toffee'],
    servings: '12–15',
    leadTime: '48 hours',
    isBestseller: true,
    rating: 4.8,
    reviewCount: 201,
  },
  {
    id: '4',
    slug: 'garden-party',
    name: 'Garden Party',
    tagline: 'Fresh, floral, and utterly alive',
    description: 'A vibrant celebration of seasonal botanicals pressed into buttercream. This cake literally stops conversations. Each arrangement is unique — nature\'s own artwork.',
    price: 4800,
    category: 'seasonal',
    occasion: ['birthday', 'graduation', 'spring'],
    images: [
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80',
      'https://images.unsplash.com/photo-1559622214-f8a9850965bb?w=800&q=80',
    ],
    sizes: [
      { label: '6 inch (6–8 servings)', price: 3500 },
      { label: '8 inch (12–15 servings)', price: 4800 },
      { label: '10 inch (20–25 servings)', price: 6400 },
    ],
    flavors: ['Lemon Elderflower', 'Strawberry Champagne', 'Vanilla Rose'],
    servings: '12–15',
    leadTime: '48 hours',
    isNew: true,
    rating: 4.9,
    reviewCount: 64,
  },
  {
    id: '5',
    slug: 'midnight-noir',
    name: 'Midnight Noir',
    tagline: 'Dark, intense, unforgettable',
    description: 'Triple dark chocolate with espresso-soaked layers and a mirror glaze finish so reflective you can see your own excitement. For those who love life lived in full intensity.',
    price: 5200,
    category: 'everyday',
    occasion: ['birthday', 'anniversary', 'corporate'],
    images: [
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&q=80',
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&q=80',
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80',
    ],
    sizes: [
      { label: '6 inch (6–8 servings)', price: 3800 },
      { label: '8 inch (12–15 servings)', price: 5200 },
      { label: '10 inch (20–25 servings)', price: 6900 },
    ],
    flavors: ['Dark Chocolate Espresso', 'Chocolate Raspberry', 'Dark Truffle'],
    servings: '12–15',
    leadTime: '48 hours',
    rating: 4.7,
    reviewCount: 176,
  },
  {
    id: '6',
    slug: 'the-minimalist',
    name: 'The Minimalist',
    tagline: 'Less is exquisite',
    description: 'Clean lines, nude buttercream, and a single sculptural element. The cake for those who appreciate that true luxury lies in restraint. Pure, quiet perfection.',
    price: 3800,
    originalPrice: 4400,
    category: 'everyday',
    occasion: ['birthday', 'anniversary', 'everyday'],
    images: [
      'https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=800&q=80',
      'https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=800&q=80',
      'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=800&q=80',
    ],
    sizes: [
      { label: '6 inch (6–8 servings)', price: 2800 },
      { label: '8 inch (12–15 servings)', price: 3800 },
      { label: '10 inch (20–25 servings)', price: 5200 },
    ],
    flavors: ['Vanilla Bean', 'Jasmine Green Tea', 'Yuzu Citrus'],
    servings: '12–15',
    leadTime: '48 hours',
    rating: 4.8,
    reviewCount: 93,
  },
  {
    id: '7',
    slug: 'cloud-nine',
    name: 'Cloud Nine',
    tagline: 'Impossibly light, impossibly good',
    description: 'Our signature chiffon creation with whipped mascarpone and fresh berry compote. So light it defies expectations. Perfect for summer celebrations that last until dawn.',
    price: 4500,
    category: 'seasonal',
    occasion: ['birthday', 'summer', 'graduation'],
    images: [
      'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80',
      'https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=800&q=80',
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80',
    ],
    sizes: [
      { label: '6 inch (6–8 servings)', price: 3200 },
      { label: '8 inch (12–15 servings)', price: 4500 },
      { label: '10 inch (20–25 servings)', price: 6000 },
    ],
    flavors: ['Strawberry Mascarpone', 'Blueberry Lavender', 'Peach Cream'],
    servings: '12–15',
    leadTime: '48 hours',
    isNew: true,
    rating: 4.9,
    reviewCount: 47,
  },
  {
    id: '8',
    slug: 'custom-creation',
    name: 'Custom Creation',
    tagline: 'Your vision, our canvas',
    description: 'Tell us your dream and we will bring it to life. From themed children\'s birthdays to architectural wedding centerpieces, no concept is too bold for our team.',
    price: 6000,
    category: 'custom',
    occasion: ['birthday', 'wedding', 'corporate', 'any'],
    images: [
      'https://images.unsplash.com/photo-1607478900766-efe13248b125?w=800&q=80',
      'https://images.unsplash.com/photo-1602351447937-745cb720612f?w=800&q=80',
      'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80',
    ],
    sizes: [
      { label: 'Starting from (consultation required)', price: 6000 },
    ],
    flavors: ['Any flavor available'],
    servings: 'Variable',
    leadTime: '5–7 days',
    rating: 5.0,
    reviewCount: 312,
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
    text: 'Ordered the Golden Hour for my wife\'s 40th. She cried happy tears. Worth every rupee — this is not just cake, it\'s an experience.',
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
    text: 'Two years running, XOXO has made our anniversary unforgettable. The Velvet Romance is our cake — we will never order anything else.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
  },
]

export const galleryImages = [
  { url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80', alt: 'Red velvet cake' },
  { url: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=600&q=80', alt: 'Floral wedding cake' },
  { url: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=600&q=80', alt: 'Gold decorated cake' },
  { url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80', alt: 'Garden party cake' },
  { url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&q=80', alt: 'Dark chocolate cake' },
  { url: 'https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=600&q=80', alt: 'Minimalist cake' },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug)
}

export function getRelatedProducts(product: Product, count = 3): Product[] {
  return products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, count)
}
