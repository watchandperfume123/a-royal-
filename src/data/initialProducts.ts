import { Product } from '../types.ts';

export const INITIAL_PRODUCTS: Product[] = [
  // --- WATCHES ---
  {
    id: 'ar-watch-01',
    name: 'The Sovereign Skeleton',
    subtitle: 'Automatic Rose Gold & Black Sapphire',
    category: 'watch',
    price: 28500,
    originalPrice: 38000,
    featured: true,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    description: 'Precision-engineered open-heart automatic skeleton watch with authentic rose gold bezel, anti-reflective sapphire crystal, and genuine hand-stitched leather strap. Hand-assembled for perfection.',
    stockCount: 12,
    inStock: true
  },
  {
    id: 'ar-watch-02',
    name: 'The Noir Royal Chronograph',
    subtitle: 'Matte Black Steel & Obsidian Dial',
    category: 'watch',
    price: 24500,
    originalPrice: 32000,
    featured: true,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    description: 'A bold statement of luxury. Triple sub-dial tachymeter chronograph with hardened ceramic casing, luminous hands, and 5 ATM water resistance.',
    stockCount: 8,
    inStock: true
  },
  {
    id: 'ar-watch-03',
    name: 'The Grand Complication Gold',
    subtitle: '18K Gold Plated Heritage Edition',
    category: 'watch',
    price: 34900,
    originalPrice: 45000,
    featured: true,
    image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=800&q=80',
    description: 'The pinnacle of royal craftsmanship. Radiant champagne dial with Roman numerals, moonphase indicator, and textured jubilee bracelet.',
    stockCount: 6,
    inStock: true
  },
  {
    id: 'ar-watch-04',
    name: 'The Monaco Vintage Chrono',
    subtitle: 'Racing Heritage & Vintage Brown Leather',
    category: 'watch',
    price: 21900,
    originalPrice: 27500,
    featured: false,
    image: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=800&q=80',
    description: 'Inspired by classic European Grand Prix timepieces. Sunburst ivory dial, dual mechanical sub-dials, and aged Italian calfskin strap.',
    stockCount: 15,
    inStock: true
  },
  {
    id: 'ar-watch-05',
    name: 'The Deep Sea Diver Submariner',
    subtitle: 'Ceramic Rotating Bezel & Stainless Steel',
    category: 'watch',
    price: 26500,
    originalPrice: 34000,
    featured: false,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    description: 'Engineered for endurance and luxury. 200m depth rating, unidirectional 120-click ceramic rotating bezel, and Cyclops date magnifier.',
    stockCount: 9,
    inStock: true
  },
  {
    id: 'ar-watch-06',
    name: 'The Royal Minimalist Silver',
    subtitle: 'Ultra-Thin Dress Watch & Mesh Band',
    category: 'watch',
    price: 16900,
    originalPrice: 22000,
    featured: false,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    description: 'Understated elegance. Slim 6.8mm profile, surgical-grade 316L stainless steel, sunray silver dial, and Milanese magnetic mesh band.',
    stockCount: 14,
    inStock: true
  },

  // --- PERFUMES ---
  {
    id: 'ar-perfume-01',
    name: 'Royal Oud Extrait',
    subtitle: 'Rare Cambodian Agarwood & Smoked Amber',
    category: 'perfume',
    price: 16500,
    originalPrice: 22000,
    featured: true,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
    description: 'The crown jewel of A.ROYAL. Distilled from rare aged agarwood, blended with rich benzoin, smoky amber, and dark honey. Exceptional 24-hour projection and sillage.',
    stockCount: 20,
    inStock: true
  },
  {
    id: 'ar-perfume-02',
    name: 'Imperial Velvet Noir',
    subtitle: 'Black Truffle, Spiced Bergamot & Patchouli',
    category: 'perfume',
    price: 14200,
    originalPrice: 18500,
    featured: true,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    description: 'An enigmatic evening scent. Opens with crisp Italian bergamot and spicy saffron, melting into a dark heart of black rose, French truffle, and patchouli.',
    stockCount: 18,
    inStock: true
  },
  {
    id: 'ar-perfume-03',
    name: 'Sovereign White Musk',
    subtitle: 'Pure Musk, White Florals & Powdery Iris',
    category: 'perfume',
    price: 12800,
    originalPrice: 16000,
    featured: false,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    description: 'Clean, aristocratic, and magnetically subtle. Silky white musk infused with fresh aldehydes, velvety iris petal, and sandalwood warmth.',
    stockCount: 25,
    inStock: true
  },
  {
    id: 'ar-perfume-04',
    name: 'Amber Sultani Extrait',
    subtitle: 'Golden Ambergris, Tobacco Leaf & Madagascar Vanilla',
    category: 'perfume',
    price: 17800,
    originalPrice: 23000,
    featured: true,
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
    description: 'A rich oriental masterwork. Warm golden amber resin wrapped in aged Cuban tobacco leaves, Tonka bean, and sweet roasted Madagascar vanilla.',
    stockCount: 11,
    inStock: true
  },
  {
    id: 'ar-perfume-05',
    name: 'Rose Imperiale',
    subtitle: 'Damascus Rose, Pink Pepper & Cashmere Woods',
    category: 'perfume',
    price: 13500,
    originalPrice: 17500,
    featured: false,
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    description: 'The scent of royalty. Fresh morning-dew Damascus rose petals elevated with sharp pink pepper, crisp pear, and wrapped in warm cedar and cashmere.',
    stockCount: 16,
    inStock: true
  },
  {
    id: 'ar-perfume-06',
    name: 'Leather & Tobacco Prestige',
    subtitle: 'Tuscan Leather, Smoked Cedar & Spiced Cardamom',
    category: 'perfume',
    price: 15900,
    originalPrice: 21000,
    featured: false,
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    description: 'Rich, confident and masculine. Supple Tuscan saddle leather infused with cedarwood smoke, black cardamom, and wild thyme.',
    stockCount: 14,
    inStock: true
  }
];
