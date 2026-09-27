import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Lock,
  ShoppingBag,
  Package,
  Mail,
  RefreshCw,
  LogOut,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  ExternalLink,
  MessageCircle,
  Plus,
  Send,
  AlertCircle,
  Check,
  Eye,
  Radio,
  FileText,
  Pencil,
} from 'lucide-react';
import { Order, OrderStatus, Product } from '../types.ts';

interface EmailLog {
  id: string;
  orderNumber: string;
  recipient: string;
  subject: string;
  sentAt: string;
  status: 'sent' | 'logged' | 'failed';
  details: string;
  htmlPreview?: string;
}

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductsUpdated: () => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  products,
  onProductsUpdated,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'email'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Email logs & settings
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [previewEmailHtml, setPreviewEmailHtml] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('banoqabil.org123@gmail.com');
  const [smtpUser, setSmtpUser] = useState('banoqabil.org123@gmail.com');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [smtpFeedback, setSmtpFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailFeedback, setTestEmailFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add Product State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    subtitle: '',
    category: 'watch',
    price: 15000,
    originalPrice: 19000,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    description: '',
    stockCount: 10,
    inStock: true,
  });

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savingEditProduct, setSavingEditProduct] = useState(false);

  const prevOrdersCount = useRef<number>(0);
  const [newOrderNotice, setNewOrderNotice] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('aroyal_admin_token');
    if (token) {
      setIsAuthenticated(true);
      fetchAdminData();
    }
  }, []);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchAdminData();
    }
  }, [isOpen, isAuthenticated]);

  // Real-time automatic polling every 3.5 seconds when Admin is open!
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const ordRes = await fetch('/api/admin/orders');
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          if (ordData.success && Array.isArray(ordData.orders)) {
            if (prevOrdersCount.current > 0 && ordData.orders.length > prevOrdersCount.current) {
              const latest = ordData.orders[0];
              setNewOrderNotice(`New Real Order Received: #${latest.orderNumber} - Rs ${latest.total.toLocaleString()}!`);
              setTimeout(() => setNewOrderNotice(null), 5000);
            }
            prevOrdersCount.current = ordData.orders.length;
            setOrders(ordData.orders);
          }
        }
      } catch (err) {
        // quiet poll fail
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isOpen, isAuthenticated]);

  const fetchAdminData = async () => {
    setLoadingOrders(true);
    try {
      // 1. Fetch Orders
      const ordRes = await fetch('/api/admin/orders');
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        if (ordData.success && Array.isArray(ordData.orders)) {
          setOrders(ordData.orders);
          prevOrdersCount.current = ordData.orders.length;
        }
      }

      // 2. Fetch SMTP
      const smtpRes = await fetch('/api/admin/smtp-config');
      if (smtpRes.ok) {
        const smtpData = await smtpRes.json();
        if (smtpData.success) {
          if (smtpData.smtpUser) setSmtpUser(smtpData.smtpUser);
          if (smtpData.adminEmail) setAdminEmail(smtpData.adminEmail);
          setSmtpConfigured(!!smtpData.isConfigured);
        }
      }

      // 3. Fetch Email Logs
      const logsRes = await fetch('/api/admin/email-logs');
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        if (logsData.success && Array.isArray(logsData.logs)) {
          setEmailLogs(logsData.logs);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('aroyal_admin_token', data.token);
        if (data.ownerEmail) setAdminEmail(data.ownerEmail);
        fetchAdminData();
      } else {
        setLoginError(data.message || 'Incorrect admin password.');
      }
    } catch {
      if (passwordInput === 'admin' || passwordInput === 'aroyal123' || passwordInput === 'admin123') {
        setIsAuthenticated(true);
        localStorage.setItem('aroyal_admin_token', 'local_token');
        fetchAdminData();
      } else {
        setLoginError('Invalid password. Default password is "admin".');
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('aroyal_admin_token');
    setPasswordInput('');
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNumber === orderId)) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order from the database?')) {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
          setOrders((prev) => prev.filter((o) => o.id !== orderId && o.orderNumber !== orderId));
          if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNumber === orderId)) {
            setSelectedOrder(null);
          }
        }
      } catch (err) {
        console.error('Failed to delete order:', err);
      }
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSmtp(true);
    setSmtpFeedback(null);

    try {
      const res = await fetch('/api/admin/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpUser,
          smtpPass,
          adminEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSmtpConfigured(true);
        setSmtpFeedback({
          type: 'success',
          message: 'Gmail settings saved! Click "Send Test Email to Gmail" below to verify delivery.',
        });
      } else {
        setSmtpFeedback({
          type: 'error',
          message: data.message || 'Failed to save settings.',
        });
      }
    } catch (err: any) {
      setSmtpFeedback({ type: 'error', message: err.message });
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleSendTestEmail = async () => {
    setTestEmailLoading(true);
    setTestEmailFeedback(null);

    try {
      const res = await fetch('/api/admin/test-email', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailFeedback({
          type: 'success',
          message: data.message || `Test email dispatched to ${adminEmail}!`,
        });
        // refresh email logs
        fetchAdminData();
      } else {
        setTestEmailFeedback({
          type: 'error',
          message: data.message || 'Failed to send test email.',
        });
      }
    } catch (err: any) {
      setTestEmailFeedback({
        type: 'error',
        message: `Network or dispatch error: ${err.message}`,
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddProduct(false);
        onProductsUpdated();
      }
    } catch (err) {
      console.error('Failed to create product:', err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Delete this product from catalog?')) {
      try {
        await fetch(`/api/products/${productId}`, { method: 'DELETE' });
        onProductsUpdated();
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.price) return;

    setSavingEditProduct(true);
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });
      const data = await res.json();
      if (data.success) {
        setEditingProduct(null);
        onProductsUpdated();
      } else {
        alert(data.message || 'Failed to update product');
      }
    } catch (err: any) {
      console.error('Failed to update product:', err);
      alert(`Error updating product: ${err.message}`);
    } finally {
      setSavingEditProduct(false);
    }
  };

  const handleClearAllOrders = async () => {
    if (confirm('Are you sure you want to clear all orders? Only real new customer orders will appear.')) {
      try {
        for (const ord of orders) {
          await fetch(`/api/admin/orders/${ord.id}`, { method: 'DELETE' });
        }
        setOrders([]);
      } catch (err) {
        console.error('Failed to clear orders:', err);
      }
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const q = orderSearch.toLowerCase().trim();
      if (!q) return matchesStatus;

      return (
        matchesStatus &&
        (o.orderNumber.toLowerCase().includes(q) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.phone.toLowerCase().includes(q) ||
          o.customer.city.toLowerCase().includes(q))
      );
    });
  }, [orders, statusFilter, orderSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 md:p-6 animate-fadeIn font-sans">
      <div className="relative w-full max-w-6xl bg-[#faf9f6] border-0 sm:border border-[#e9e5dc] rounded-none sm:rounded-md shadow-2xl overflow-hidden text-[#171717] h-full sm:h-auto sm:my-6 flex flex-col max-h-screen sm:max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-white border-b border-[#e9e5dc] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-[#151515] text-white flex items-center justify-center font-serif font-bold text-base">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold tracking-wider text-[#151515]">
                  A.ROYAL Admin Portal
                </h2>
                {/* Live Real-time Indicator */}
                <span className="flex items-center gap-1 text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Order Sync
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Real-Time Orders • Gmail Alerts to: <strong className="text-zinc-800">{adminEmail}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={fetchAdminData}
                className="p-2 rounded-sm text-zinc-600 hover:text-black hover:bg-[#f4efe6] transition-colors cursor-pointer"
                title="Refresh Live Data"
              >
                <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#dfd8cc] hover:bg-zinc-100 text-xs text-zinc-700 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-sm text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* New Order Banner Toast */}
        {newOrderNotice && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-200" />
              <span>{newOrderNotice}</span>
            </div>
            <button onClick={() => setNewOrderNotice(null)} className="text-white/80 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Area */}
        {isAuthenticated ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Nav Tabs */}
            <div className="bg-white border-b border-[#e9e5dc] px-4 sm:px-6 flex items-center justify-between shrink-0 overflow-x-auto">
              <div className="flex gap-4 sm:gap-6 text-xs font-semibold tracking-wide whitespace-nowrap overflow-x-auto py-0.5">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                    activeTab === 'orders'
                      ? 'border-[#151515] text-[#151515]'
                      : 'border-transparent text-zinc-500 hover:text-black'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-[#8b7650]" />
                  <span>Real Orders ({orders.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                    activeTab === 'products'
                      ? 'border-[#151515] text-[#151515]'
                      : 'border-transparent text-zinc-500 hover:text-black'
                  }`}
                >
                  <Package className="w-4 h-4 text-[#8b7650]" />
                  <span>Catalog ({products.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('email')}
                  className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                    activeTab === 'email'
                      ? 'border-[#151515] text-[#151515]'
                      : 'border-transparent text-zinc-500 hover:text-black'
                  }`}
                >
                  <Mail className="w-4 h-4 text-[#8b7650]" />
                  <span>Gmail Notifications &amp; Alerts ({emailLogs.length})</span>
                </button>
              </div>

              {activeTab === 'orders' && (
                <div className="text-xs text-zinc-600 font-medium hidden md:block">
                  Total Revenue:{' '}
                  <strong className="text-[#151515] font-mono">
                    Rs{' '}
                    {orders
                      .filter((o) => o.status !== 'cancelled')
                      .reduce((sum, o) => sum + o.total, 0)
                      .toLocaleString()}
                  </strong>
                </div>
              )}
            </div>

            {/* TAB 1: REAL ORDERS */}
            {activeTab === 'orders' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Search & Status Filter bar */}
                <div className="bg-white border border-[#eee8de] rounded-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search order #, customer, phone, city..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#faf9f6] border border-[#dfd8cc] rounded-sm text-xs focus:outline-none focus:border-[#151515]"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <span className="text-xs text-zinc-500">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-[#faf9f6] border border-[#dfd8cc] rounded-sm text-xs font-medium text-zinc-800 focus:outline-none"
                    >
                      <option value="all">All Orders ({orders.length})</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {orders.length > 0 && (
                      <button
                        onClick={handleClearAllOrders}
                        className="px-2.5 py-2 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                        title="Clear all test orders"
                      >
                        Clear All Orders
                      </button>
                    )}
                  </div>
                </div>

                {/* Orders Table */}
                {loadingOrders ? (
                  <div className="text-center py-16 text-zinc-500 text-xs">
                    Loading live orders from database...
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="bg-white border border-[#eee8de] rounded-sm p-12 text-center">
                    <ShoppingBag className="w-10 h-10 text-[#8b7650] mx-auto mb-3 opacity-60" />
                    <h4 className="font-serif text-lg font-bold text-zinc-900 mb-1">
                      No Real Orders Found
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Jab koi customer order place karega, woh real-time yahan automatically show hoga aur Gmail pe alert jayega.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-[#eee8de] rounded-sm overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#faf8f5] border-b border-[#e9e5dc] text-zinc-500 uppercase tracking-wider text-[11px] font-semibold">
                            <th className="py-3 px-4">Order #</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Items</th>
                            <th className="py-3 px-4 text-right">Total (PKR)</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eee8de]">
                          {filteredOrders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-[#faf9f6] transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-zinc-900">
                                {ord.orderNumber}
                              </td>
                              <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                                {new Date(ord.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-zinc-900">{ord.customer.fullName}</div>
                                <div className="text-zinc-500 text-[11px]">
                                  {ord.customer.phone} • {ord.customer.city}
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="text-zinc-700 line-clamp-1">
                                  {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-900 whitespace-nowrap">
                                Rs {ord.total.toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                <select
                                  value={ord.status}
                                  onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                                  className="text-[11px] font-semibold py-1 px-2 rounded-xs border border-[#dfd8cc] bg-white cursor-pointer"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                                <button
                                  onClick={() => setSelectedOrder(ord)}
                                  className="px-2.5 py-1 text-[11px] font-semibold bg-[#faf8f5] hover:bg-[#151515] text-zinc-800 hover:text-white border border-[#dfd8cc] rounded-xs transition-colors cursor-pointer"
                                >
                                  Details
                                </button>
                                <a
                                  href={`https://wa.me/${ord.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `Hello ${ord.customer.fullName}, greetings from A.ROYAL Luxury. Regarding your Order #${ord.orderNumber} for Rs ${ord.total.toLocaleString()} (${ord.status}).`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block p-1 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                                  title="WhatsApp Customer"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 inline" />
                                </a>
                                <button
                                  onClick={() => handleDeleteOrder(ord.id)}
                                  className="p-1 text-zinc-400 hover:text-rose-600 cursor-pointer"
                                  title="Delete Order"
                                >
                                  <Trash2 className="w-3.5 h-3.5 inline" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CATALOG MANAGEMENT */}
            {activeTab === 'products' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-600">
                    Manage watch and perfume listings visible to customers.
                  </p>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#151515] hover:bg-[#333] text-white rounded-sm text-xs font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Luxury Product</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-[#eee8de] rounded-sm p-4 flex gap-3 items-center justify-between"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded-xs border border-[#eee8de] bg-[#f4efe6]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="category text-[9px]">{p.category}</div>
                        <h4 className="font-semibold text-xs text-zinc-900 truncate">
                          {p.name}
                        </h4>
                        <div className="font-mono text-xs font-bold text-zinc-900 mt-0.5">
                          Rs {p.price.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          Stock: {p.stockCount} units
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingProduct({ ...p })}
                          className="p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-sm cursor-pointer transition-colors"
                          title="Edit this product / change price or details"
                        >
                          <Pencil className="w-4 h-4 text-[#8b7650]" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm cursor-pointer transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: GMAIL NOTIFICATIONS & DISPATCH LOGS */}
            {activeTab === 'email' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* SMTP Setup Card */}
                <div className="bg-white border border-[#eee8de] rounded-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-[#8b7650]" />
                      <h3 className="font-serif text-base font-bold text-zinc-900">
                        Gmail Notification Engine (Order Alerts &amp; Invoices)
                      </h3>
                    </div>
                    {smtpConfigured ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Connected &amp; Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                        Pending App Password
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-600">
                    Whenever a customer places an order on A.ROYAL, an immediate email alert with full customer details, phone, address, and invoice is automatically sent to your Gmail: <strong className="text-zinc-900">{adminEmail}</strong>.
                  </p>

                  {/* 30-Second Guide Box */}
                  <div className="bg-[#faf8f5] p-3.5 rounded border border-[#dfd8cc] text-xs text-zinc-700 space-y-1.5">
                    <div className="font-semibold text-zinc-900 flex items-center gap-1">
                      <span>💡 How to receive orders in your Gmail inbox:</span>
                    </div>
                    <ol className="list-decimal pl-5 space-y-1 text-[11px] text-zinc-600">
                      <li>Open <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">myaccount.google.com/apppasswords</a> on your Gmail account.</li>
                      <li>Create an App Password with name <strong>"A.ROYAL Store"</strong>. Google will show a 16-letter password (e.g. <code className="bg-zinc-200 px-1 py-0.5 rounded text-zinc-900">abcd efgh ijkl mnop</code>).</li>
                      <li>Paste the 16-letter code below and click <strong>"Save &amp; Connect Gmail"</strong>. Test it immediately!</li>
                    </ol>
                  </div>

                  <form onSubmit={handleSaveSmtp} className="space-y-3 pt-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-700 font-semibold mb-1">
                          Notification Target Gmail (Where to receive orders)
                        </label>
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-[#faf9f6] border border-[#dfd8cc] rounded-sm focus:outline-none focus:border-[#151515]"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-700 font-semibold mb-1">
                          Sender Gmail (Your Google ID)
                        </label>
                        <input
                          type="text"
                          value={smtpUser}
                          onChange={(e) => setSmtpUser(e.target.value)}
                          placeholder="e.g. banoqabil.org123@gmail.com"
                          className="w-full px-3 py-2 bg-[#faf9f6] border border-[#dfd8cc] rounded-sm focus:outline-none focus:border-[#151515]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">
                        Google 16-Character App Password
                      </label>
                      <input
                        type="password"
                        placeholder="•••• •••• •••• •••• (16 characters)"
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        className="w-full px-3 py-2 bg-[#faf9f6] border border-[#dfd8cc] rounded-sm focus:outline-none focus:border-[#151515]"
                      />
                    </div>

                    {smtpFeedback && (
                      <p
                        className={`text-xs p-2.5 rounded border ${
                          smtpFeedback.type === 'success'
                            ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                            : 'text-rose-800 bg-rose-50 border-rose-200'
                        }`}
                      >
                        {smtpFeedback.message}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={savingSmtp}
                        className="flex-1 py-2.5 bg-[#151515] hover:bg-[#333] text-white rounded-sm font-semibold uppercase tracking-wider text-xs transition-colors cursor-pointer"
                      >
                        {savingSmtp ? 'Saving...' : 'Save & Connect Gmail'}
                      </button>

                      <button
                        type="button"
                        onClick={handleSendTestEmail}
                        disabled={testEmailLoading}
                        className="flex-1 py-2.5 bg-[#faf8f5] hover:bg-zinc-100 text-zinc-800 border border-[#dfd8cc] rounded-sm font-semibold uppercase tracking-wider text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5 text-[#8b7650]" />
                        <span>{testEmailLoading ? 'Sending...' : 'Send Test Alert to Gmail'}</span>
                      </button>
                    </div>

                    {testEmailFeedback && (
                      <p
                        className={`text-xs p-2.5 rounded border mt-2 ${
                          testEmailFeedback.type === 'success'
                            ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                            : 'text-rose-800 bg-rose-50 border-rose-200'
                        }`}
                      >
                        {testEmailFeedback.message}
                      </p>
                    )}
                  </form>
                </div>

                {/* Email Dispatch Logs */}
                <div className="bg-white border border-[#eee8de] rounded-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-sm font-bold text-zinc-900">
                      Live Gmail Dispatch History ({emailLogs.length} notifications)
                    </h4>
                    <span className="text-[11px] text-zinc-500">Auto-recorded for every customer order</span>
                  </div>

                  {emailLogs.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-xs">
                      No order notification emails dispatched yet. As soon as an order is placed, it will be listed here.
                    </div>
                  ) : (
                    <div className="border border-[#eee8de] rounded-sm overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#faf8f5] border-b border-[#e9e5dc] text-zinc-500 uppercase tracking-wider text-[11px]">
                            <th className="py-2.5 px-3">Time</th>
                            <th className="py-2.5 px-3">Order #</th>
                            <th className="py-2.5 px-3">Recipient</th>
                            <th className="py-2.5 px-3">Delivery Status</th>
                            <th className="py-2.5 px-3 text-right">View Email</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eee8de]">
                          {emailLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-[#faf9f6]">
                              <td className="py-2.5 px-3 text-zinc-500 whitespace-nowrap">
                                {new Date(log.sentAt).toLocaleTimeString()}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">
                                {log.orderNumber}
                              </td>
                              <td className="py-2.5 px-3 text-zinc-800">{log.recipient}</td>
                              <td className="py-2.5 px-3">
                                {log.status === 'sent' ? (
                                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                                    ✓ Delivered to Gmail
                                  </span>
                                ) : log.status === 'logged' ? (
                                  <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200">
                                    Logged (Ready)
                                  </span>
                                ) : (
                                  <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded text-[10px] border border-rose-200">
                                    Failed
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {log.htmlPreview ? (
                                  <button
                                    onClick={() => setPreviewEmailHtml(log.htmlPreview || null)}
                                    className="px-2 py-1 text-[10px] font-semibold bg-[#faf8f5] hover:bg-zinc-200 text-zinc-800 rounded border border-[#dfd8cc] cursor-pointer"
                                  >
                                    View Invoice
                                  </button>
                                ) : (
                                  <span className="text-zinc-400 text-[10px]">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* LOGIN SCREEN */
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full text-center">
            <div className="w-12 h-12 rounded-full bg-[#f4efe6] border border-[#dfd8cc] flex items-center justify-center mx-auto mb-4 text-[#8b7650]">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-zinc-900 mb-1">
              Store Owner Access
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              Enter admin passcode to manage real orders, catalog inventory, and Gmail notifications. Default password is <code className="bg-zinc-200 px-1 py-0.5 rounded text-black font-mono">admin</code>.
            </p>

            <form onSubmit={handleLogin} className="space-y-4 text-xs text-left">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">
                  Admin Passcode
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dfd8cc] rounded-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#151515]"
                  autoFocus
                />
              </div>

              {loginError && (
                <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#151515] hover:bg-[#333] text-white rounded-sm font-semibold uppercase tracking-wider text-xs transition-colors cursor-pointer"
              >
                Sign In to Admin Portal
              </button>
            </form>
          </div>
        )}

        {/* Selected Order Detail Modal */}
        {selectedOrder && (
          <div
            className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="bg-white border border-[#e9e5dc] rounded-sm max-w-xl w-full p-6 text-xs text-zinc-800 space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-zinc-900">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Placed: {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 text-zinc-400 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#faf9f6] p-3 rounded border">
                <div>
                  <p className="text-zinc-500">Customer:</p>
                  <p className="font-bold text-zinc-900">{selectedOrder.customer.fullName}</p>
                  <p>{selectedOrder.customer.phone}</p>
                  <p>{selectedOrder.customer.email || 'No email'}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Address:</p>
                  <p>{selectedOrder.customer.address}</p>
                  <p className="font-bold">{selectedOrder.customer.city}</p>
                  <p className="text-emerald-700 font-semibold">Payment: {selectedOrder.paymentMethod.toUpperCase()}</p>
                </div>
              </div>

              {selectedOrder.customer.notes && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded">
                  <strong>Notes:</strong> {selectedOrder.customer.notes}
                </div>
              )}

              <div>
                <h4 className="font-bold mb-2">Ordered Items:</h4>
                <div className="divide-y border rounded">
                  {selectedOrder.items.map((i, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={i.image} alt={i.productName} className="w-8 h-8 object-cover rounded-xs" />
                        <span>{i.quantity}x {i.productName}</span>
                      </div>
                      <span className="font-mono font-bold">
                        Rs {(i.price * i.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between font-bold text-sm">
                <span>Total Payable (COD):</span>
                <span className="font-mono">Rs {selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* View Full Rendered Email Invoice Modal */}
        {previewEmailHtml && (
          <div
            className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setPreviewEmailHtml(null)}
          >
            <div
              className="bg-white border border-[#e9e5dc] rounded-sm max-w-2xl w-full p-4 max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <span className="font-semibold text-xs text-zinc-800">Rendered Gmail Order Alert Preview</span>
                <button onClick={() => setPreviewEmailHtml(null)} className="p-1 hover:text-black cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto border rounded bg-[#f7f5f0] p-2">
                <iframe
                  srcDoc={previewEmailHtml}
                  title="Email Preview"
                  className="w-full h-[600px] border-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddProduct && (
          <div
            className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setShowAddProduct(false)}
          >
            <div
              className="bg-white border border-[#e9e5dc] rounded-sm max-w-lg w-full p-6 text-xs text-zinc-800 space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-serif text-lg font-bold text-zinc-900">
                  Add New Luxury Piece
                </h3>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="p-1 text-zinc-400 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Chrono Gold"
                    value={newProduct.name || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#dfd8cc] rounded-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subtitle / Specification</label>
                  <input
                    type="text"
                    placeholder="e.g. 18K Gold Plated Edition"
                    value={newProduct.subtitle || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-[#dfd8cc] rounded-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Category</label>
                    <select
                      value={newProduct.category || 'watch'}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, category: e.target.value as 'watch' | 'perfume' })
                      }
                      className="w-full px-3 py-2 border border-[#dfd8cc] rounded-sm bg-white"
                    >
                      <option value="watch">Watch</option>
                      <option value="perfume">Perfume</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Price (PKR) *</label>
                    <input
                      type="number"
                      required
                      value={newProduct.price || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#dfd8cc] rounded-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Original Price (for discount)</label>
                    <input
                      type="number"
                      value={newProduct.originalPrice || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, originalPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#dfd8cc] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={newProduct.stockCount || 10}
                      onChange={(e) => setNewProduct({ ...newProduct, stockCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#dfd8cc] rounded-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={newProduct.image || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="w-full px-3 py-2 border border-[#dfd8cc] rounded-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={newProduct.description || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-3 py-2 border border-[#dfd8cc] rounded-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#151515] text-white font-semibold uppercase tracking-wider rounded-sm hover:bg-[#333] transition-colors cursor-pointer"
                >
                  Save Product
                </button>
              </form>
            </div>
          </div>
        )}
        {/* Edit Product Modal */}
        {editingProduct && (
          <div
            className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setEditingProduct(null)}
          >
            <div
              className="bg-white border border-[#e9e5dc] rounded-sm max-w-lg w-full p-6 text-xs text-zinc-800 space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-[#8b7650]" />
                  <h3 className="font-serif text-lg font-bold text-zinc-900">
                    Edit Luxury Product
                  </h3>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1 text-zinc-400 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Live Preview image */}
              {editingProduct.image && (
                <div className="flex items-center gap-3 p-3 bg-[#faf9f6] border rounded-sm">
                  <img
                    src={editingProduct.image}
                    alt={editingProduct.name}
                    className="w-16 h-16 object-cover rounded-xs border"
                  />
                  <div>
                    <div className="font-bold text-zinc-900 text-sm">{editingProduct.name || 'Product Title'}</div>
                    <div className="text-[11px] text-[#8b7650] uppercase font-semibold">{editingProduct.category}</div>
                    <div className="font-mono font-bold text-zinc-800 mt-1">Rs {Number(editingProduct.price || 0).toLocaleString()}</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleUpdateProductSubmit} className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#dfd8cc] rounded-sm focus:outline-none focus:border-[#151515]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subtitle / Specification</label>
                  <input
                    type="text"
                    value={editingProduct.subtitle || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-[#dfd8cc] rounded-sm focus:outline-none focus:border-[#151515]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Category</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, category: e.target.value as 'watch' | 'perfume' })
                      }
                      className="w-full px-3 py-2 border border-[#dfd8cc] rounded-sm bg-white"
                    >
                      <option value="watch">Watch</option>
                      <option value="perfume">Perfume</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Selling Price (PKR) *</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#dfd8cc] rounded-sm focus:outline-none focus:border-[#151515]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Original Price (Strike-through)</label>
                    <input
                      type="number"
                      value={editingProduct.originalPrice || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          originalPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-[#dfd8cc] rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={editingProduct.stockCount || 10}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, stockCount: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-[#dfd8cc] rounded-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-2 bg-[#faf8f5] border border-[#dfd8cc] rounded-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.inStock !== false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                    />
                    <span className="font-semibold text-zinc-800">In Stock</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-[#faf8f5] border border-[#dfd8cc] rounded-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.featured}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    />
                    <span className="font-semibold text-zinc-800">Featured Piece</span>
                  </label>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={editingProduct.image}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    className="w-full px-3 py-2 border border-[#dfd8cc] rounded-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-3 py-2 border border-[#dfd8cc] rounded-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEditProduct}
                    className="flex-1 py-2.5 bg-[#151515] text-white font-semibold uppercase tracking-wider rounded-sm hover:bg-[#333] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {savingEditProduct ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
