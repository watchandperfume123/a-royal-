import React from 'react';
import { X, CheckCircle, Package, Truck, MessageCircle, Calendar, User, MapPin } from 'lucide-react';
import { Order } from '../types.ts';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderNumber: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onTrackOrder,
}) => {
  if (!order) return null;

  const whatsappMessage = encodeURIComponent(
    `Hello A. ROYAL,\nI have placed order #${order.orderNumber} for Rs ${order.total.toLocaleString()}.\nName: ${order.customer.fullName}, City: ${order.customer.city}.\nPlease share updates on delivery.`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn font-sans">
      <div className="relative w-full max-w-2xl max-h-[94vh] overflow-y-auto bg-[#faf9f6] border border-[#e9e5dc] rounded-sm shadow-2xl text-[#171717] my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-sm bg-white hover:bg-zinc-100 text-zinc-400 hover:text-black border border-[#dfd8cc] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Banner */}
        <div className="p-6 sm:p-8 text-center bg-white border-b border-[#e9e5dc]">
          <div className="w-14 h-14 rounded-full bg-[#f4efe6] border border-[#dfd8cc] flex items-center justify-center mx-auto mb-3 text-[#8b7650]">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs bg-[#f5f1eb] text-[#8b7650] text-[10px] font-bold uppercase tracking-widest mb-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Order Placed & Confirmed
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">
            Thank You For Your Order
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-md mx-auto">
            Dear <strong className="text-zinc-900">{order.customer.fullName}</strong>, your order has been received and is being carefully packed for delivery.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#faf9f6] border border-[#dfd8cc] rounded-sm font-mono text-xs">
            <span className="text-zinc-500 uppercase tracking-wider font-sans text-[11px] font-semibold">
              Your Order ID:
            </span>
            <span className="font-bold text-[#151515] text-sm sm:text-base">
              {order.orderNumber}
            </span>
          </div>
        </div>

        {/* Delivery ETA info */}
        <div className="bg-[#f5f1eb] border-b border-[#e9e5dc] p-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-zinc-700">
            <Truck className="w-4 h-4 text-[#8b7650] shrink-0" />
            <span>
              Estimated Delivery: <strong>2 - 4 Business Days</strong> (
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-sm border border-[#eee8de] space-y-1">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[#8b7650] mb-2">
                <User className="w-3.5 h-3.5" /> Your Contact Details
              </div>
              <p>
                <strong>Name:</strong> {order.customer.fullName}
              </p>
              <p>
                <strong>Phone:</strong> {order.customer.phone}
              </p>
              {order.customer.email && (
                <p>
                  <strong>Email:</strong> {order.customer.email}
                </p>
              )}
            </div>

            <div className="bg-white p-4 rounded-sm border border-[#eee8de] space-y-1">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[#8b7650] mb-2">
                <MapPin className="w-3.5 h-3.5" /> Delivery Address
              </div>
              <p>
                <strong>Address:</strong> {order.customer.address}
              </p>
              <p>
                <strong>City:</strong> {order.customer.city}{' '}
                {order.customer.postalCode ? `(${order.customer.postalCode})` : ''}
              </p>
              <p>
                <strong>Payment:</strong>{' '}
                <span className="uppercase font-semibold text-emerald-700">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Direct Bank Transfer'}
                </span>
              </p>
              {order.customer.notes && (
                <p className="text-amber-800">
                  <strong>Notes:</strong> {order.customer.notes}
                </p>
              )}
            </div>
          </div>

          {/* Items List */}
          <div>
            <h4 className="font-serif text-xs uppercase tracking-widest text-[#8b7650] font-bold mb-2.5 flex items-center gap-1.5">
              <Package className="w-4 h-4" /> Ordered Items ({order.items.length})
            </h4>
            <div className="bg-white border border-[#eee8de] rounded-sm divide-y divide-[#eee8de] max-h-48 overflow-y-auto">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded-xs border border-[#eee8de] bg-[#faf9f6]"
                    />
                    <div>
                      <div className="font-semibold text-zinc-900">{item.productName}</div>
                      <div className="text-zinc-500 text-[11px]">
                        Qty: {item.quantity} • Rs {item.price.toLocaleString()} each
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-zinc-900">
                    Rs {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="p-4 bg-white border border-[#eee8de] rounded-sm space-y-2">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal:</span>
              <span className="font-mono text-zinc-900">Rs {order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Promotional Discount:</span>
                <span className="font-mono">-Rs {order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600">
              <span>Delivery Charges:</span>
              <span className="font-mono text-emerald-700 font-semibold">
                {order.shippingFee === 0 ? 'FREE' : `Rs ${order.shippingFee.toLocaleString()}`}
              </span>
            </div>
            <div className="pt-2 border-t border-[#eee8de] flex justify-between items-center text-sm font-bold text-zinc-900">
              <span className="font-serif">Total Payable at Doorstep:</span>
              <span className="font-mono text-base text-[#151515]">
                Rs {order.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                onClose();
                onTrackOrder(order.orderNumber);
              }}
              className="flex-1 py-3 px-4 rounded-sm bg-[#151515] hover:bg-[#333] text-white font-semibold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Package className="w-4 h-4 text-[#e5c07b]" />
              <span>Track Order Status</span>
            </button>

            <a
              href={`https://wa.me/923016145941?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Support</span>
            </a>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onClose}
              className="text-xs text-zinc-500 hover:text-black underline cursor-pointer"
            >
              Continue Shopping on A.ROYAL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
