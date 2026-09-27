import React, { useState } from 'react';
import { X, ShieldCheck, Truck, CreditCard, AlertCircle } from 'lucide-react';
import { CartItem, CustomerDetails, Order } from '../types.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string;
  onOrderPlaced: (order: Order) => void;
}

const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Abbottabad',
  'Sukkur',
  'Mirpur (AJK)',
  'Other City',
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  discount,
  shippingFee,
  total,
  couponCode,
  onOrderPlaced,
}) => {
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Karachi',
    postalCode: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod');
  const [bankRef, setBankRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customer.fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!customer.phone.trim() || customer.phone.trim().length < 10) {
      setErrorMessage('Please enter a valid Pakistani mobile number (e.g. 0300 1234567).');
      return;
    }
    if (!customer.address.trim()) {
      setErrorMessage('Please enter your complete delivery street address.');
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          ...customer,
          notes: customer.notes
            ? `${customer.notes}${bankRef ? ` | Bank Ref: ${bankRef}` : ''}`
            : bankRef
            ? `Bank Ref: ${bankRef}`
            : undefined,
        },
        items: cartItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          category: item.product.category,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
        })),
        subtotal,
        discount,
        shippingFee,
        total,
        couponCode,
        paymentMethod,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order.');
      }

      onOrderPlaced(data.order);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while placing order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn font-sans">
      <div className="relative w-full max-w-3xl max-h-[94vh] overflow-y-auto bg-[#faf9f6] border border-[#e9e5dc] rounded-sm shadow-2xl text-[#171717] my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#e9e5dc] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#8b7650]" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#151515]">
                A.ROYAL Checkout
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Safe &amp; Secure Checkout • Fast Nationwide Delivery
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-sm text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security / COD banner */}
        <div className="bg-[#f5f1eb] border-b border-[#e9e5dc] px-5 py-2.5 text-xs text-zinc-700 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#8b7650] shrink-0" />
            <span>Cash on Delivery • Pay safely when your luxury package arrives at your doorstep.</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200 shrink-0">
            Express Courier
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-sm bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Customer Info */}
          <div>
            <h3 className="font-serif text-xs uppercase tracking-widest text-[#8b7650] font-bold mb-3 flex items-center gap-1.5">
              <Truck className="w-4 h-4" /> 1. Shipping & Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-700 mb-1 font-semibold">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Ahmed"
                  value={customer.fullName}
                  onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dfd8cc] rounded-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#151515]"
                />
              </div>

              <div>
                <label className="block text-zinc-700 mb-1 font-semibold">
                  WhatsApp / Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0300 1234567"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dfd8cc] rounded-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#151515]"
                />
              </div>

              <div>
                <label className="block text-zinc-700 mb-1 font-semibold">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="for order invoice & updates"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dfd8cc] rounded-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#151515]"
                />
              </div>

              <div>
                <label className="block text-zinc-700 mb-1 font-semibold">
                  City *
                </label>
                <select
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dfd8cc] rounded-sm text-zinc-900 focus:outline-none focus:border-[#151515]"
                >
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-700 mb-1 font-semibold">
                  Complete Street Delivery Address *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="House / Flat #, Street name, Sector/Block, Landmark"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dfd8cc] rounded-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#151515]"
                />
              </div>

              <div>
                <label className="block text-zinc-700 mb-1 font-semibold">
                  Postal Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 75500"
                  value={customer.postalCode}
                  onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dfd8cc] rounded-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#151515]"
                />
              </div>

              <div>
                <label className="block text-zinc-700 mb-1 font-semibold">
                  Delivery Notes / Special Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call before delivery, urgent delivery"
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dfd8cc] rounded-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#151515]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="pt-2 border-t border-[#eee8de]">
            <h3 className="font-serif text-xs uppercase tracking-widest text-[#8b7650] font-bold mb-3 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" /> 2. Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-sm border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'bg-white border-[#151515] ring-1 ring-[#151515]'
                    : 'bg-[#faf8f5] border-[#dfd8cc] hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-0.5 text-black focus:ring-0"
                />
                <div>
                  <div className="font-bold text-zinc-900">Cash on Delivery (COD)</div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Pay with cash when courier delivers the parcel at your doorstep. Recommended.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-sm border cursor-pointer transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-white border-[#151515] ring-1 ring-[#151515]'
                    : 'bg-[#faf8f5] border-[#dfd8cc] hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={() => setPaymentMethod('bank_transfer')}
                  className="mt-0.5 text-black focus:ring-0"
                />
                <div>
                  <div className="font-bold text-zinc-900">Direct Bank Transfer</div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Meezan Bank, HBL, EasyPaisa or JazzCash. Processed upon payment receipt.
                  </p>
                </div>
              </label>
            </div>

            {paymentMethod === 'bank_transfer' && (
              <div className="mt-3 p-3.5 bg-amber-50/70 border border-amber-200 rounded-sm text-xs space-y-2 text-zinc-800">
                <p className="font-semibold text-amber-900">A.ROYAL Official Bank Account Details:</p>
                <div className="font-mono text-[11px] space-y-0.5 bg-white p-2.5 rounded border border-amber-200">
                  <p>Bank: <strong>Meezan Bank Ltd</strong></p>
                  <p>Title: <strong>A.ROYAL LUXURY STORE</strong></p>
                  <p>Account / IBAN: <strong>PK42MEZN00010928374920</strong></p>
                  <p>Payment Mode: <strong>Online Banking / EasyPaisa / JazzCash</strong></p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Transaction ID / Reference Number (after transfer):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TRX-982314 or Sender Name"
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#dfd8cc] rounded-sm text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Order Summary */}
          <div className="pt-2 border-t border-[#eee8de]">
            <h3 className="font-serif text-xs uppercase tracking-widest text-[#8b7650] font-bold mb-3 flex items-center gap-1.5">
              <span>3. Order Summary ({cartItems.length} items)</span>
            </h3>

            <div className="bg-white border border-[#eee8de] rounded-sm p-4 space-y-2.5 text-xs">
              <div className="divide-y divide-[#eee8de] max-h-36 overflow-y-auto mb-3">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-800">{item.quantity}x</span>
                      <span className="text-zinc-700">{item.product.name}</span>
                    </div>
                    <span className="font-mono text-zinc-900">
                      Rs {(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-zinc-600 pt-2 border-t border-[#eee8de]">
                <span>Subtotal:</span>
                <span className="font-mono text-zinc-900 font-semibold">
                  Rs {subtotal.toLocaleString()}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promotional Discount:</span>
                  <span className="font-mono">-Rs {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>Nationwide Shipping:</span>
                <span className="font-mono text-emerald-700 font-semibold">
                  {shippingFee === 0 ? 'FREE' : `Rs ${shippingFee.toLocaleString()}`}
                </span>
              </div>
              <div className="pt-2 border-t border-[#eee8de] flex justify-between items-center text-sm font-bold text-zinc-900">
                <span className="font-serif">Total Payable:</span>
                <span className="font-mono text-lg text-[#151515]">
                  Rs {total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#151515] hover:bg-[#333] text-white rounded-sm font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Confirm & Place Order (Rs {total.toLocaleString()})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
