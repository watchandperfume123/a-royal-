import React from 'react';
import { ShieldCheck, Truck, Award } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="hero max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div>
        <div className="eyebrow">A new standard of luxury</div>
        <h1 className="serif">
          Luxury That<br className="hidden sm:inline" /> Defines You.
        </h1>
        <p>
          Discover curated watches and signature fragrances designed to become part of your identity.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 sm:mt-7">
          <a className="btn text-center py-3.5 sm:py-3.5 px-6" href="#watches">
            Shop Collection
          </a>
          <a className="btn light text-center py-3.5 sm:py-3.5 px-6" href="#perfumes">
            Explore Scents
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-[#e9e5dc] grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#8b7650] shrink-0" />
            <span>Cash on Delivery Nationwide</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#8b7650] shrink-0" />
            <span>100% Certified Authentic</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8b7650] shrink-0" />
            <span>Express Courier Delivery</span>
          </div>
        </div>
      </div>

      <div className="heroart group mt-6 lg:mt-0">
        <div className="relative z-10 w-full h-full flex items-center justify-center p-3 sm:p-6">
          <div className="relative flex items-center justify-center gap-3 sm:gap-6 transform group-hover:scale-105 transition-transform duration-500">
            {/* Watch Card */}
            <div className="relative w-36 sm:w-44 md:w-52 h-52 sm:h-64 md:h-72 rounded-sm overflow-hidden shadow-2xl border border-white/40 transform -rotate-6">
              <img
                src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80"
                alt="A.ROYAL Chronograph"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5 sm:p-3.5">
                <span className="text-white text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase">
                  Royal Chronograph
                </span>
              </div>
            </div>

            {/* Perfume Card */}
            <div className="relative w-36 sm:w-44 md:w-52 h-52 sm:h-64 md:h-72 rounded-sm overflow-hidden shadow-2xl border border-white/40 transform rotate-6 translate-y-3 sm:translate-y-4">
              <img
                src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=80"
                alt="A.ROYAL Royal Oud"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5 sm:p-3.5">
                <span className="text-white text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase">
                  Royal Oud Extrait
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
