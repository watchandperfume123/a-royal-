import React from 'react';
import { Package, MessageCircle, Lock } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenTracking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenTracking }) => {
  return (
    <footer className="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#eee8de]">
          <div>
            <div className="flex items-center gap-2">
              <strong className="font-bold text-[#151515] font-serif text-base tracking-wider">
                A.ROYAL
              </strong>
              <span className="text-zinc-400">•</span>
              <span className="text-xs text-zinc-600">
                Curated Watches & Signature Fragrances
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Customer Care & Inquiries • Express Cash on Delivery Nationwide • 100% Authentic Guarantee
            </p>
          </div>

          <div className="flex items-center gap-5 text-xs">
            <button
              onClick={onOpenTracking}
              className="text-zinc-600 hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-[#8b7650]" />
              <span>Track Order</span>
            </button>
            <a
              href="https://wa.me/923016145941"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div>
            <strong>A.ROYAL</strong> — Luxury That Defines You.
          </div>
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} A.ROYAL. All rights reserved.</span>
            <button
              onClick={onOpenAdmin}
              className="text-[11px] text-zinc-400 hover:text-zinc-800 transition-colors flex items-center gap-1 cursor-pointer font-mono border-l border-zinc-300 pl-3 py-0.5"
              title="Admin Portal"
            >
              <Lock className="w-2.5 h-2.5 text-zinc-400" />
              <span>admin</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
