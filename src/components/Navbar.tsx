import React, { useState } from 'react';
import { ShoppingBag, Search, Package, Menu, X } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenTracking: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenTracking,
  searchQuery,
  onSearchChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex flex-col group text-left">
          <span className="logo leading-none group-hover:opacity-90 transition-opacity">
            A.ROYAL
          </span>
          <span className="tag leading-none mt-1">
            LUXURY THAT DEFINES YOU
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="navlinks items-center hidden md:flex">
          <a href="#watches" className="hover:text-[#8b7650] transition-colors font-medium">
            Watches
          </a>
          <a href="#perfumes" className="hover:text-[#8b7650] transition-colors font-medium">
            Perfumes
          </a>
          <button
            onClick={onOpenTracking}
            className="hover:text-[#8b7650] transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0 text-inherit text-xs font-medium"
          >
            <Package className="w-4 h-4 text-[#8b7650]" />
            <span>Track Order</span>
          </button>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          {/* Search Toggle */}
          <div className="relative flex items-center">
            {searchOpen ? (
              <div className="flex items-center bg-white border border-[#dfd8cc] rounded-full px-3 py-1.5 text-xs shadow-sm animate-fadeIn">
                <Search className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search watches or perfumes..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-36 sm:w-52 bg-transparent text-zinc-800 placeholder-zinc-400 focus:outline-none text-xs"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    onSearchChange('');
                  }}
                  className="text-zinc-400 hover:text-black ml-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-zinc-600 hover:text-black transition-colors cursor-pointer rounded-full hover:bg-zinc-100"
                title="Search Products"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="cart-nav-btn"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Cart</span>
            {cartCount > 0 && (
              <span className="cart-nav-badge">{cartCount}</span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-700 hover:text-black cursor-pointer rounded-sm hover:bg-zinc-100"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#faf9f6] border-b border-[#e9e5dc] p-5 shadow-lg flex flex-col gap-4 text-sm font-medium z-40 animate-fadeIn">
          <a
            href="#watches"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#8b7650] py-2 border-b border-[#f0ece4] transition-colors"
          >
            Watches Collection
          </a>
          <a
            href="#perfumes"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#8b7650] py-2 border-b border-[#f0ece4] transition-colors"
          >
            Signature Perfumes
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenTracking();
            }}
            className="text-left py-2 flex items-center gap-2 text-zinc-700 hover:text-[#8b7650] cursor-pointer transition-colors"
          >
            <Package className="w-4 h-4 text-[#8b7650]" />
            <span>Track Order Status</span>
          </button>
        </div>
      )}
    </header>
  );
};
