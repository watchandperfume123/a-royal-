export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: 'watch' | 'perfume';
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  stockCount: number;
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerDetails {
  fullName: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string;
  paymentMethod: 'cod' | 'bank_transfer';
  status: OrderStatus;
  trackingNumber?: string;
  courier?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CouponValidationResult {
  success: boolean;
  code?: string;
  discountPercentage?: number;
  message: string;
}
