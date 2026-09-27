import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductQuickViewModal } from './components/ProductQuickViewModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderConfirmationModal } from './components/OrderConfirmationModal.tsx';
import { OrderTrackingModal } from './components/OrderTrackingModal.tsx';
import { AdminPortalModal } from './components/AdminPortalModal.tsx';
import { Footer } from './components/Footer.tsx';
import { INITIAL_PRODUCTS } from './data/initialProducts.ts';
import { Product, CartItem, Order, CouponValidationResult } from './types.ts';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state persisted in localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aroyal_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [couponCode, setCouponCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingInitialNumber, setTrackingInitialNumber] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Listen to #admin hash and keyboard shortcut (Ctrl+Shift+A) for store owner
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem('aroyal_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  // Load products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          return;
        }
      }
      setProducts(INITIAL_PRODUCTS);
    } catch (err) {
      console.error('Failed to fetch live products, using fallback:', err);
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Cart Operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleApplyCoupon = async (code: string): Promise<CouponValidationResult> => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCouponCode(data.code);
        setDiscountPercentage(data.discountPercentage);
        return {
          success: true,
          code: data.code,
          discountPercentage: data.discountPercentage,
          message: `Promo code ${data.code} applied: ${data.discountPercentage}% OFF!`,
        };
      }
      return {
        success: false,
        message: data.message || 'Invalid coupon code.',
      };
    } catch {
      // Local fallback for offline mode
      const cleanCode = (code || '').trim().toUpperCase();
      if (cleanCode === 'ROYAL10') {
        setCouponCode('ROYAL10');
        setDiscountPercentage(10);
        return {
          success: true,
          code: 'ROYAL10',
          discountPercentage: 10,
          message: 'Code ROYAL10 applied: 10% OFF!',
        };
      }
      return { success: false, message: 'Invalid coupon code.' };
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscountPercentage(0);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setQuickViewProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderPlaced = (order: Order) => {
    setConfirmedOrder(order);
    setCartItems([]);
    setCouponCode('');
    setDiscountPercentage(0);
    setIsCheckoutOpen(false);
  };

  // Calculations
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = discountPercentage > 0 ? Math.round((subtotal * discountPercentage) / 100) : 0;
  const shippingFee = subtotal >= 5000 || subtotal === 0 ? 0 : 250;
  const total = Math.max(0, subtotal - discount + shippingFee);

  // Filtered lists
  const watches = useMemo(() => {
    return products.filter((p) => {
      const isWatch = p.category === 'watch';
      if (!searchQuery.trim()) return isWatch;
      const q = searchQuery.toLowerCase();
      return (
        isWatch &&
        (p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q))
      );
    });
  }, [products, searchQuery]);

  const perfumes = useMemo(() => {
    return products.filter((p) => {
      const isPerfume = p.category === 'perfume';
      if (!searchQuery.trim()) return isPerfume;
      const q = searchQuery.toLowerCase();
      return (
        isPerfume &&
        (p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q))
      );
    });
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#171717]">
      {/* Navigation */}
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => {
          setTrackingInitialNumber('');
          setIsTrackingOpen(true);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1">
        {/* Hero */}
        <Hero />

        {/* Watches Section */}
        <section className="section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="watches">
          <div className="sectionhead">
            <div>
              <div className="eyebrow">Precision &amp; presence</div>
              <h2 className="serif">Watches</h2>
            </div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest hidden sm:inline">
              {watches.length} Timepieces
            </span>
          </div>

          {loading ? (
            <div className="products-grid">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-96 bg-[#eee8de] animate-pulse rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {watches.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Mid Signature Banner */}
        <section className="banner">
          <div className="eyebrow" style={{ color: '#c9ad79' }}>
            The A.ROYAL signature
          </div>
          <h2>Wear the moment.</h2>
          <p>Time, character and scent — curated for your presence.</p>
        </section>

        {/* Perfumes Section */}
        <section className="section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="perfumes">
          <div className="sectionhead">
            <div>
              <div className="eyebrow">Signature fragrance</div>
              <h2 className="serif">Perfumes</h2>
            </div>
            <span className="text-xs text-zinc-500 uppercase tracking-widest hidden sm:inline">
              {perfumes.length} Scents
            </span>
          </div>

          {loading ? (
            <div className="products-grid">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-96 bg-[#eee8de] animate-pulse rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {perfumes.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenTracking={() => {
          setTrackingInitialNumber('');
          setIsTrackingOpen(true);
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        couponCode={couponCode}
        discountPercentage={discountPercentage}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
      />

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        subtotal={subtotal}
        discount={discount}
        shippingFee={shippingFee}
        total={total}
        couponCode={couponCode}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Order Placed Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onTrackOrder={(orderNumber) => {
          setConfirmedOrder(null);
          setTrackingInitialNumber(orderNumber);
          setIsTrackingOpen(true);
        }}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialOrderNumber={trackingInitialNumber}
      />

      {/* Admin Portal Modal */}
      <AdminPortalModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onProductsUpdated={fetchProducts}
      />
    </div>
  );
}
