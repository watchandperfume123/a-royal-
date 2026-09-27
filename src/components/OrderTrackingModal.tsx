import React, { useState, useEffect } from 'react';
import { X, Search, Package, CheckCircle2, Clock, Truck, Home, MessageCircle, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types.ts';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
}

const STATUS_STEPS: { status: OrderStatus; label: string; icon: any }[] = [
  { status: 'pending', label: 'Order Placed', icon: Clock },
  { status: 'confirmed', label: 'Confirmed & Verified', icon: CheckCircle2 },
  { status: 'processing', label: 'Packed & Quality Inspected', icon: Package },
  { status: 'shipped', label: 'In Transit / On The Way', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: Home },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialOrderNumber);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialOrderNumber) {
      setSearchQuery(initialOrderNumber);
      handleTrack(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  if (!isOpen) return null;

  const handleTrack = async (queryToTrack?: string) => {
    const q = (queryToTrack || searchQuery).trim();
    if (!q) {
      setErrorMessage('Please enter an Order ID or Phone number.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(q)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || `No active order found for "${q}". Please check your order number.`);
      } else {
        setOrder(data.order);
      }
    } catch (err: any) {
      console.error('Tracking fetch error:', err);
      setErrorMessage('Failed to connect to tracking server. Please check your network or try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (currentStatus: OrderStatus) => {
    if (currentStatus === 'cancelled') return -1;
    const index = STATUS_STEPS.findIndex((s) => s.status === currentStatus);
    return index !== -1 ? index : 0;
  };

  const activeIndex = order ? getStatusIndex(order.status) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn font-sans">
      <div className="relative w-full max-w-2xl max-h-[94vh] overflow-y-auto bg-[#faf9f6] border border-[#e9e5dc] rounded-sm shadow-2xl text-[#171717] my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#e9e5dc] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-[#8b7650]" />
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#151515]">
                Real-Time Order Tracking
              </h2>
              <p className="text-xs text-zinc-500">Track delivery status across Pakistan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-sm text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#e9e5dc]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. AR-7842) or Mobile Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f6] border border-[#dfd8cc] rounded-sm text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#151515]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#151515] hover:bg-[#333] text-white rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Tracking...' : 'Track'}
            </button>
          </form>

          {errorMessage && (
            <div className="mt-3 p-3 rounded-sm bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Tracking Details View */}
        {order && (
          <div className="p-5 sm:p-6 space-y-6 text-xs">
            {/* Order status banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-[#eee8de] rounded-sm">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
                  Order Reference
                </div>
                <div className="font-mono text-base font-bold text-zinc-900">
                  {order.orderNumber}
                </div>
                <div className="text-zinc-500 text-[11px] mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.customer.city}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    order.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : order.status === 'shipped'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : order.status === 'cancelled'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  Status: {order.status}
                </span>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Courier: <strong>{order.courier || 'TCS Express'}</strong>
                </div>
                {order.trackingNumber && (
                  <div className="text-[11px] font-mono text-zinc-600">
                    CN: {order.trackingNumber}
                  </div>
                )}
              </div>
            </div>

            {/* Stepper Timeline */}
            {order.status !== 'cancelled' ? (
              <div className="bg-white p-5 border border-[#eee8de] rounded-sm">
                <h4 className="font-serif text-xs uppercase tracking-widest text-[#8b7650] font-bold mb-4">
                  Shipment Progress Timeline
                </h4>

                <div className="relative flex flex-col sm:flex-row justify-between gap-4 sm:gap-2">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.status} className="flex-1 flex sm:flex-col items-center gap-3 sm:text-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                            isCurrent
                              ? 'bg-[#151515] border-[#8b7650] text-[#e5c07b] shadow-md ring-2 ring-[#c5a059]/30'
                              : isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-[#faf9f6] border-[#dfd8cc] text-zinc-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p
                            className={`font-semibold text-xs ${
                              isCurrent
                                ? 'text-zinc-900 font-bold'
                                : isCompleted
                                ? 'text-emerald-700'
                                : 'text-zinc-400'
                            }`}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] text-amber-700 font-medium">
                              (Current Stage)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-sm">
                <p className="font-bold">This order has been cancelled.</p>
                <p className="text-[11px] mt-0.5">Please contact customer support via WhatsApp if you have questions.</p>
              </div>
            )}

            {/* Order Items Preview */}
            <div className="bg-white p-4 border border-[#eee8de] rounded-sm space-y-2">
              <h4 className="font-semibold text-zinc-800 text-xs">
                Items in this parcel ({order.items.length}):
              </h4>
              <div className="divide-y divide-[#eee8de]">
                {order.items.map((i, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={i.image} alt={i.productName} className="w-8 h-8 object-cover rounded-xs" />
                      <span>{i.quantity}x {i.productName}</span>
                    </div>
                    <span className="font-mono font-bold text-zinc-900">
                      Rs {(i.price * i.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-[#eee8de] flex justify-between font-bold">
                <span>Total Amount Payable (COD):</span>
                <span className="font-mono text-zinc-900">Rs {order.total.toLocaleString()}</span>
              </div>
            </div>

            {/* WhatsApp contact */}
            <div className="text-center pt-2">
              <a
                href={`https://wa.me/923016145941?text=${encodeURIComponent(
                  `Hello A. ROYAL Support, I am inquiring about tracking for order #${order.orderNumber}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
              >
                <MessageCircle className="w-4 h-4" />
                Need help? Contact WhatsApp Customer Support
              </a>
            </div>
          </div>
        )}

        {/* Fallback info when no query or initial state */}
        {!order && !loading && (
          <div className="p-8 text-center text-xs text-zinc-500">
            <p>Enter the Order ID you received during checkout (e.g. <strong>AR-6488</strong>) or your registered Pakistani phone number.</p>
            <p className="mt-2 text-zinc-400">All shipments are verified and sent out within 24-48 hours via TCS &amp; Leopards.</p>
          </div>
        )}
      </div>
    </div>
  );
};
