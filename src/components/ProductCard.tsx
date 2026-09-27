import React from 'react';
import { Eye, ShoppingBag } from 'lucide-react';
import { Product } from '../types.ts';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
}) => {
  return (
    <div className="card group">
      {/* Product Image Area */}
      <div
        className="pic cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        {product.featured && (
          <span className="card-featured-badge">
            Featured
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute bottom-3 right-3 p-2 bg-white/95 hover:bg-white text-zinc-900 rounded-full shadow-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all cursor-pointer"
          title="Quick View"
          aria-label="Quick View"
        >
          <Eye className="w-4 h-4 text-[#8b7650]" />
        </button>
      </div>

      {/* Product Details Area */}
      <div
        className="cardbody cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <div className="category">
          {(product.category || 'LUXURY').toUpperCase()}
        </div>
        <h3 className="line-clamp-1">{product.name}</h3>
        <p className="text-xs text-zinc-500 line-clamp-1 mb-2">
          {product.subtitle}
        </p>
        <div className="price flex items-baseline">
          <span>Rs {product.price.toLocaleString()}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="old">Rs {product.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Card Action Bar */}
      <div className="card-action-bar">
        <button
          onClick={() => onAddToCart(product)}
          className="card-add-btn"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingBag className="w-4 h-4 text-[#8b7650]" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};
