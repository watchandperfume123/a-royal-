import React, { useState } from 'react';
import { ShoppingBag, X, Trash2, Tag, Check, Truck, MessageCircle, ArrowRight } from 'lucide-react';
import { CartItem, CouponValidationResult } from '../types.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  couponCode: string;
  discountPercentage: number;
  onApplyCoupon: (code: string) => Promise<CouponValidationResult>;
  onRemoveCoupon: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  couponCode,
  discountPercentage,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [inputCoupon, setInputCoupon] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 5000;
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = discountPercentage > 0 ? Math.round((subtotal * discountPercentage) / 100) : 0;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 250;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    const res = await onApplyCoupon(inputCoupon.trim());
    setCouponLoading(false);

    if (res.success) {
      setCouponSuccess(res.message);
      setInputCoupon('');
    } else {
      setCouponError(res.message);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello A.ROYAL Luxury Store,\n\nI would like to order items from my cart:\n` +
      cartItems
        .map((i) => `• ${i.quantity}x ${i.product.name} (Rs ${i.product.price.toLocaleString()})`)
        .join('\n') +
      `\n\nSubtotal: Rs ${subtotal.toLocaleString()}` +
      (discount > 0 ? `\nDiscount: -Rs ${discount.toLocaleString()}` : '') +
      `\nDelivery: ${shippingFee === 0 ? 'FREE' : `Rs ${shippingFee}`}` +
      `\nTotal: Rs ${total.toLocaleString()}` +
      `\n\nPlease confirm availability for Cash on Delivery.`
  );

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <ShoppingBag className="w-5 h-5 text-[#8b7650]" />
            <span>Your Cart</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#eee8de] text-zinc-800 font-semibold font-sans">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="cart-close-btn"
            aria-label="Close Cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Banner */}
        <div className="bg-[#f5f1eb] px-6 py-2.5 border-b border-[#e9e5dc] text-xs">
          {subtotal >= FREE_SHIPPING_THRESHOLD ? (
            <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              You have qualified for FREE Nationwide Delivery!
            </p>
          ) : (
            <p className="text-zinc-700">
              Add{' '}
              <strong className="text-[#151515]">
                Rs {(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()}
              </strong>{' '}
              more to get <strong>FREE Delivery</strong>
            </p>
          )}
        </div>

        {/* Drawer Body */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-[#f4efe6] flex items-center justify-center mx-auto mb-4 text-[#8b7650]">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-zinc-900 mb-2">
                Your Bag is Empty
              </h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Discover our curated collection of luxury watches and signature fragrances.
              </p>
              <button onClick={onClose} className="mt-6 btn">
                Start Shopping
              </button>
            </div>
          ) : (
            <div>
              {/* Item cards */}
              {cartItems.map((item) => (
                <div key={item.product.id} className="cart-item-card">
                  <div className="cart-item-thumb">
                    <img src={item.product.image} alt={item.product.name} />
                  </div>
                  <div className="cart-item-details">
                    <div>
                      <div className="category">{item.product.category}</div>
                      <div className="font-semibold text-xs text-zinc-900 line-clamp-1">
                        {item.product.name}
                      </div>
                      <div className="font-mono text-xs font-bold text-zinc-800 mt-1">
                        Rs {item.product.price.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="cart-qty-pill">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Coupon Input Area */}
              <div className="pt-3 border-t border-[#eee8de] mt-4">
                {couponCode ? (
                  <div className="flex items-center justify-between p-2.5 rounded bg-[#f4efe6] border border-[#dfd8cc] text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-800">
                      <Tag className="w-3.5 h-3.5 text-[#8b7650]" />
                      <span>
                        Code <strong>{couponCode}</strong> applied ({discountPercentage}% OFF)
                      </span>
                    </div>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo code (e.g. ROYAL10)"
                        value={inputCoupon}
                        onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 text-xs bg-white border border-[#dfd8cc] rounded-sm focus:outline-none focus:border-[#151515]"
                      />
                      <button
                        type="submit"
                        disabled={couponLoading || !inputCoupon.trim()}
                        className="px-4 py-2 bg-[#151515] text-white text-xs font-semibold rounded-sm hover:bg-[#333] disabled:opacity-50 cursor-pointer"
                      >
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}
                    {couponSuccess && <p className="text-[11px] text-emerald-600">{couponSuccess}</p>}
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="space-y-1.5 text-xs text-zinc-600 mb-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-zinc-900 font-semibold">
                  Rs {subtotal.toLocaleString()}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount ({couponCode}):</span>
                  <span className="font-mono">-Rs {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="font-mono font-semibold text-emerald-700">
                  {shippingFee === 0 ? 'FREE' : `Rs ${shippingFee.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="cart-subtotal-row pt-2 border-t border-[#eee8de]">
              <span className="font-serif">Total:</span>
              <strong>Rs {total.toLocaleString()}</strong>
            </div>

            <div className="cart-cod-badge">
              ✓ Cash on Delivery Available Across Pakistan
            </div>

            <div className="cart-action-buttons">
              <button onClick={onCheckout} className="cart-checkout-btn">
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/923016145941?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cart-wa-btn"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
