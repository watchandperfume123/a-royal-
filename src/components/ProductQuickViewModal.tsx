import React, { useState } from 'react';
import { X, Check, ShoppingBag, Zap, ShieldCheck, Truck, Award } from 'lucide-react';
import { Product } from '../types.ts';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn font-sans"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white border border-[#e9e5dc] rounded-sm shadow-2xl my-auto text-[#171717]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#faf8f5] hover:bg-[#151515] text-zinc-600 hover:text-white transition-all cursor-pointer border border-[#dfd8cc]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Column */}
          <div className="p-6 sm:p-8 bg-[#faf9f6] flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-[#e9e5dc]">
            <div className="relative w-full aspect-square max-w-sm rounded-sm overflow-hidden bg-[#f4efe6] border border-[#eee8de] shadow-sm">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xs bg-[#151515] text-[#e5c07b] text-[10px] font-bold uppercase tracking-wider">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Details Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8b7650]">
                {product.category}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">
                {product.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">{product.subtitle}</p>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-zinc-900">
                  Rs {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="font-mono text-sm text-zinc-400 line-through">
                    Rs {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mt-4">
                {product.description}
              </p>

              {/* Guarantees */}
              <div className="mt-5 pt-4 border-t border-[#eee8de] space-y-2 text-xs text-zinc-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cash on Delivery Available Across Pakistan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Genuine Certified Luxury Piece</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>24-48 Hours Express Delivery</span>
                </div>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-4 border-t border-[#eee8de]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-zinc-700">Quantity:</span>
                <div className="cart-qty-pill">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 bg-[#faf8f5] hover:bg-[#151515] text-[#151515] hover:text-white border border-[#dfd8cc] hover:border-[#151515] rounded-sm font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onBuyNow(product, quantity)}
                  className="flex-1 py-3 bg-[#151515] hover:bg-[#333] text-white rounded-sm font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Zap className="w-4 h-4 text-[#e5c07b]" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
