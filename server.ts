import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { INITIAL_PRODUCTS } from './src/data/initialProducts.ts';
import { Product, Order, OrderStatus } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Persistent store file paths
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.join('/tmp', 'data_store') : path.resolve(__dirname, 'data_store');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const EMAIL_LOGS_FILE = path.join(DATA_DIR, 'email_logs.json');

// --- Helper Functions for Data Persistence ---

function getProducts(): Product[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading products file:', err);
  }
  saveProducts(INITIAL_PRODUCTS);
  return INITIAL_PRODUCTS;
}

function saveProducts(products: Product[]) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  } catch (err) {
    console.error('Error saving products:', err);
  }
}

function getOrders(): Order[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading orders file:', err);
  }
  return [];
}

function saveOrders(orders: Order[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error('Error saving orders:', err);
  }
}

// Admin / SMTP settings
interface AdminSettings {
  adminEmail: string;
  smtpUser: string;
  smtpPass?: string;
  isConfigured: boolean;
}

function getSettings(): AdminSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading settings:', err);
  }
  // Default to the user's provided email banoqabil.org123@gmail.com
  return {
    adminEmail: 'banoqabil.org123@gmail.com',
    smtpUser: 'banoqabil.org123@gmail.com',
    isConfigured: false
  };
}

function saveSettings(settings: AdminSettings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

export interface EmailLog {
  id: string;
  orderNumber: string;
  recipient: string;
  subject: string;
  sentAt: string;
  status: 'sent' | 'logged' | 'failed';
  details: string;
  htmlPreview?: string;
}

function getEmailLogs(): EmailLog[] {
  try {
    if (fs.existsSync(EMAIL_LOGS_FILE)) {
      return JSON.parse(fs.readFileSync(EMAIL_LOGS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading email logs:', err);
  }
  return [];
}

function saveEmailLog(log: EmailLog) {
  try {
    const logs = getEmailLogs();
    logs.unshift(log);
    // keep last 50 logs
    if (logs.length > 50) logs.pop();
    fs.writeFileSync(EMAIL_LOGS_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Error saving email log:', err);
  }
}

// --- Luxury HTML Email Template Generator ---
function generateOrderEmailHtml(order: Order, isCustomerCopy = false): string {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee8de;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width: 50px; vertical-align: middle;">
                <img src="${item.image}" alt="${item.productName}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 3px; border: 1px solid #e9e5dc;" />
              </td>
              <td style="padding-left: 12px; vertical-align: middle;">
                <div style="font-family: 'Georgia', serif; font-size: 14px; font-weight: bold; color: #151515;">${item.productName}</div>
                <div style="font-size: 11px; color: #8b7650; text-transform: uppercase; letter-spacing: 1px;">${item.category}</div>
              </td>
            </tr>
          </table>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee8de; text-align: center; font-size: 13px; color: #555;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee8de; text-align: right; font-family: monospace; font-size: 13px; font-weight: bold; color: #151515;">
          Rs ${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>A.ROYAL Order #${order.orderNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f7f5f0; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e9e5dc; border-radius: 4px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
              
              <!-- Brand Header -->
              <tr>
                <td style="background-color: #151515; padding: 30px 25px; text-align: center;">
                  <div style="font-family: 'Georgia', serif; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #ffffff;">A.ROYAL</div>
                  <div style="font-size: 10px; font-weight: 600; letter-spacing: 3px; color: #c5a059; margin-top: 4px; text-transform: uppercase;">Luxury That Defines You</div>
                </td>
              </tr>

              <!-- Order Alert Banner -->
              <tr>
                <td style="background-color: #fcfbf9; padding: 22px 25px; border-bottom: 1px solid #eee8de; text-align: center;">
                  <span style="display: inline-block; background-color: #eafaf1; color: #27ae60; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 20px; border: 1px solid #d4efdf;">
                    ${isCustomerCopy ? 'Order Placed & Confirmed' : '👑 Real New Order Received'}
                  </span>
                  <h1 style="font-family: 'Georgia', serif; font-size: 22px; color: #151515; margin: 12px 0 4px 0;">
                    ${isCustomerCopy ? 'Thank You For Your Order' : `New Order #${order.orderNumber}`}
                  </h1>
                  <p style="font-size: 13px; color: #666666; margin: 0;">
                    ${isCustomerCopy ? 'Your luxury piece is being prepared for express delivery.' : `Customer: ${order.customer.fullName} • Total: Rs ${order.total.toLocaleString()} (COD)`}
                  </p>
                </td>
              </tr>

              <!-- Customer & Shipping Details -->
              <tr>
                <td style="padding: 24px 25px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #faf9f6; border: 1px solid #eee8de; border-radius: 4px; padding: 16px;">
                    <tr>
                      <td style="vertical-align: top; width: 50%; padding-right: 12px;">
                        <div style="font-size: 11px; font-weight: bold; color: #8b7650; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Customer Information</div>
                        <div style="font-size: 13px; color: #151515; font-weight: bold;">${order.customer.fullName}</div>
                        <div style="font-size: 13px; color: #444; margin-top: 3px;">Phone: <a href="tel:${order.customer.phone}" style="color: #151515; text-decoration: none; font-weight: 600;">${order.customer.phone}</a></div>
                        ${order.customer.email ? `<div style="font-size: 12px; color: #666; margin-top: 2px;">Email: ${order.customer.email}</div>` : ''}
                      </td>
                      <td style="vertical-align: top; width: 50%; padding-left: 12px; border-left: 1px solid #eee8de;">
                        <div style="font-size: 11px; font-weight: bold; color: #8b7650; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Delivery Details</div>
                        <div style="font-size: 13px; color: #333;">${order.customer.address}</div>
                        <div style="font-size: 13px; font-weight: bold; color: #151515; margin-top: 3px;">${order.customer.city} ${order.customer.postalCode ? `(${order.customer.postalCode})` : ''}</div>
                        <div style="font-size: 12px; color: #27ae60; font-weight: bold; margin-top: 4px; text-transform: uppercase;">
                          Payment: ${order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Bank Transfer'}
                        </div>
                      </td>
                    </tr>
                    ${
                      order.customer.notes
                        ? `
                    <tr>
                      <td colspan="2" style="padding-top: 12px; margin-top: 12px; border-top: 1px dashed #dfd8cc; font-size: 12px; color: #b7791f;">
                        <strong>Customer Note:</strong> ${order.customer.notes}
                      </td>
                    </tr>
                    `
                        : ''
                    }
                  </table>
                </td>
              </tr>

              <!-- Items Table -->
              <tr>
                <td style="padding: 0 25px 20px 25px;">
                  <div style="font-size: 12px; font-weight: bold; color: #8b7650; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Ordered Items (${order.items.length})</div>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #eee8de; border-radius: 4px;">
                    <thead>
                      <tr style="background-color: #faf8f5; border-bottom: 1px solid #eee8de;">
                        <th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #777;">Item</th>
                        <th style="padding: 10px 12px; text-align: center; font-size: 11px; text-transform: uppercase; color: #777;">Qty</th>
                        <th style="padding: 10px 12px; text-align: right; font-size: 11px; text-transform: uppercase; color: #777;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Order Calculation -->
              <tr>
                <td style="padding: 0 25px 25px 25px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fcfbf9; border: 1px solid #eee8de; border-radius: 4px; padding: 15px 20px;">
                    <tr>
                      <td style="font-size: 13px; color: #555; padding: 4px 0;">Subtotal:</td>
                      <td style="font-size: 13px; font-family: monospace; color: #151515; text-align: right; padding: 4px 0;">Rs ${order.subtotal.toLocaleString()}</td>
                    </tr>
                    ${
                      order.discount > 0
                        ? `
                    <tr>
                      <td style="font-size: 13px; color: #27ae60; font-weight: 600; padding: 4px 0;">Discount (${order.couponCode || 'Promo'}):</td>
                      <td style="font-size: 13px; font-family: monospace; color: #27ae60; text-align: right; padding: 4px 0;">-Rs ${order.discount.toLocaleString()}</td>
                    </tr>
                    `
                        : ''
                    }
                    <tr>
                      <td style="font-size: 13px; color: #555; padding: 4px 0;">Nationwide Delivery:</td>
                      <td style="font-size: 13px; font-family: monospace; color: #27ae60; font-weight: bold; text-align: right; padding: 4px 0;">
                        ${order.shippingFee === 0 ? 'FREE' : `Rs ${order.shippingFee.toLocaleString()}`}
                      </td>
                    </tr>
                    <tr>
                      <td style="border-top: 1px solid #eee8de; padding-top: 10px; font-family: 'Georgia', serif; font-size: 16px; font-weight: bold; color: #151515;">Total Payable (COD):</td>
                      <td style="border-top: 1px solid #eee8de; padding-top: 10px; font-family: monospace; font-size: 18px; font-weight: bold; color: #151515; text-align: right;">Rs ${order.total.toLocaleString()}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Action Links -->
              <tr>
                <td style="background-color: #faf9f6; border-top: 1px solid #eee8de; padding: 20px 25px; text-align: center;">
                  <a href="https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${order.customer.fullName}, thank you for placing order #${order.orderNumber} with A.ROYAL. We are confirming your delivery to ${order.customer.city}.`
                  )}" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; padding: 10px 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; border-radius: 3px; margin: 4px;">
                    Chat with Customer on WhatsApp
                  </a>
                  <div style="font-size: 11px; color: #888; margin-top: 14px;">
                    A.ROYAL Official Store Dispatch System • Tracking Reference: ${order.orderNumber}
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// --- Email Dispatch Engine via Nodemailer ---
async function dispatchOrderNotification(order: Order) {
  const settings = getSettings();
  const recipient = settings.adminEmail || 'banoqabil.org123@gmail.com';
  const subject = `👑 NEW ORDER #${order.orderNumber} - ${order.customer.fullName} (Rs ${order.total.toLocaleString()})`;
  const html = generateOrderEmailHtml(order, false);

  console.log(`[EMAIL DISPATCH] Preparing order notification for: ${recipient}`);

  // If user provided SMTP credentials (e.g. Gmail App Password)
  if (settings.smtpUser && settings.smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPass.replace(/\s+/g, '') // remove spaces from 16-char app pass
        }
      });

      const info = await transporter.sendMail({
        from: `"A.ROYAL Luxury Store" <${settings.smtpUser}>`,
        to: recipient,
        subject,
        html
      });

      console.log(`[EMAIL DISPATCH] Email successfully sent to ${recipient} (MessageID: ${info.messageId})`);
      saveEmailLog({
        id: `email_${Date.now()}`,
        orderNumber: order.orderNumber,
        recipient,
        subject,
        sentAt: new Date().toISOString(),
        status: 'sent',
        details: `Dispatched directly to ${recipient} via Gmail SMTP (Message ID: ${info.messageId})`,
        htmlPreview: html
      });

      // Also send customer copy if customer provided valid email
      if (order.customer.email && order.customer.email.includes('@')) {
        try {
          const customerHtml = generateOrderEmailHtml(order, true);
          await transporter.sendMail({
            from: `"A.ROYAL Luxury Store" <${settings.smtpUser}>`,
            to: order.customer.email,
            subject: `Your A.ROYAL Order Confirmation #${order.orderNumber}`,
            html: customerHtml
          });
          console.log(`[EMAIL DISPATCH] Customer confirmation sent to ${order.customer.email}`);
        } catch (custErr) {
          console.error(`[EMAIL DISPATCH] Could not send to customer email:`, custErr);
        }
      }

      return { success: true, messageId: info.messageId };
    } catch (smtpErr: any) {
      console.error(`[EMAIL DISPATCH ERROR] SMTP send failed:`, smtpErr.message);
      saveEmailLog({
        id: `email_${Date.now()}`,
        orderNumber: order.orderNumber,
        recipient,
        subject,
        sentAt: new Date().toISOString(),
        status: 'failed',
        details: `Gmail SMTP Error: ${smtpErr.message}. Check Gmail App Password in Admin Portal.`,
        htmlPreview: html
      });
      return { success: false, error: smtpErr.message };
    }
  } else {
    // Log the email as ready and pending SMTP credentials
    console.log(`[EMAIL DISPATCH] SMTP credentials not yet provided in Admin Portal. Order logged for ${recipient}.`);
    saveEmailLog({
      id: `email_${Date.now()}`,
      orderNumber: order.orderNumber,
      recipient,
      subject,
      sentAt: new Date().toISOString(),
      status: 'logged',
      details: `Order email ready for ${recipient}. Enter your 16-character Gmail App Password in Admin Portal to enable live inbox delivery!`,
      htmlPreview: html
    });
    return { success: true, logged: true };
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Products API
app.get('/api/products', (_req: Request, res: Response) => {
  const products = getProducts();
  res.json({ success: true, products });
});

app.post('/api/products', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.name || !body.price || !body.category) {
    return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
  }

  const products = getProducts();
  const newProduct: Product = {
    id: `ar-${body.category}-${Date.now().toString(36)}`,
    name: body.name.trim(),
    subtitle: body.subtitle ? body.subtitle.trim() : '',
    category: body.category === 'perfume' ? 'perfume' : 'watch',
    price: Number(body.price),
    originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
    image: body.image || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    description: body.description || '',
    stockCount: body.stockCount ? Number(body.stockCount) : 10,
    inStock: body.inStock !== false,
    featured: !!body.featured
  };

  products.unshift(newProduct);
  saveProducts(products);
  res.status(201).json({ success: true, product: newProduct });
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  products[index] = { ...products[index], ...req.body };
  saveProducts(products);
  res.json({ success: true, product: products[index] });
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  saveProducts(filtered);
  res.json({ success: true, message: 'Product deleted' });
});

// 2. Orders API (REAL-TIME ORDER CREATION & DISPATCH)
app.get('/api/orders', (_req: Request, res: Response) => {
  const orders = getOrders();
  res.json({ success: true, orders });
});

// Single order tracking by order number or id
app.get('/api/orders/:orderNumber', (req: Request, res: Response) => {
  const { orderNumber } = req.params;
  const cleanNum = orderNumber.trim().toUpperCase().replace('#', '');
  const orders = getOrders();
  const order = orders.find(
    (o) =>
      o.orderNumber.toUpperCase() === cleanNum ||
      o.orderNumber.toUpperCase() === `AR-${cleanNum}` ||
      o.id === orderNumber ||
      o.customer.phone.replace(/[\s-]/g, '') === cleanNum.replace(/[\s-]/g, '')
  );

  if (!order) {
    return res.status(404).json({ success: false, message: `No order found with reference: ${orderNumber}` });
  }

  res.json({ success: true, order });
});

// Real order placement
app.post('/api/orders', async (req: Request, res: Response) => {
  const { customer, items, subtotal, discount, shippingFee, total, couponCode, paymentMethod } = req.body;

  if (!customer || !customer.fullName || !customer.phone || !customer.address || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Complete customer details and items are required' });
  }

  // Generate unique order number (e.g. AR-9284)
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `AR-${randNum}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: `ord_${Date.now()}_${randNum}`,
    orderNumber,
    customer,
    items,
    subtotal: Number(subtotal) || 0,
    discount: Number(discount) || 0,
    shippingFee: Number(shippingFee) || 0,
    total: Number(total) || 0,
    couponCode,
    paymentMethod: paymentMethod === 'bank_transfer' ? 'bank_transfer' : 'cod',
    status: 'pending',
    trackingNumber: `EXP-${randNum}PK`,
    courier: 'TCS Express Pakistan',
    estimatedDelivery: '2 - 4 Business Days',
    createdAt: now,
    updatedAt: now
  };

  // 1. Save order into orders.json
  const orders = getOrders();
  orders.unshift(newOrder);
  saveOrders(orders);

  console.log(`[A.ROYAL REAL ORDER] Placed: #${newOrder.orderNumber} by ${newOrder.customer.fullName} for Rs ${newOrder.total}`);

  // 2. Dispatch Email notification immediately to Gmail
  dispatchOrderNotification(newOrder).catch((err) => {
    console.error('[ORDER EMAIL ERROR]:', err);
  });

  res.status(201).json({ success: true, order: newOrder });
});

// 3. Admin API
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === 'admin' || password === 'aroyal123' || password === 'admin123') {
    const settings = getSettings();
    return res.json({
      success: true,
      token: 'aroyal_auth_token_verified',
      ownerEmail: settings.adminEmail
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid admin credentials. Default password is "admin".' });
});

app.get('/api/admin/orders', (_req: Request, res: Response) => {
  const orders = getOrders();
  res.json({ success: true, orders });
});

app.patch('/api/admin/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status: OrderStatus };
  const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const orders = getOrders();
  const order = orders.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  saveOrders(orders);

  res.json({ success: true, order });
});

app.delete('/api/admin/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const orders = getOrders();
  const filtered = orders.filter((o) => o.id !== id && o.orderNumber !== id);
  saveOrders(filtered);
  res.json({ success: true, message: 'Order removed' });
});

app.get('/api/admin/stats', (_req: Request, res: Response) => {
  const orders = getOrders();
  const activeOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const settings = getSettings();

  res.json({
    success: true,
    ownerEmail: settings.adminEmail,
    stats: {
      totalOrders: orders.length,
      activeOrders: activeOrders.length,
      totalRevenue,
      pendingCount,
      deliveredCount
    }
  });
});

// Admin Email Settings & Logs
app.get('/api/admin/smtp-config', (_req: Request, res: Response) => {
  const settings = getSettings();
  res.json({
    success: true,
    smtpUser: settings.smtpUser,
    adminEmail: settings.adminEmail,
    isConfigured: !!(settings.smtpUser && settings.smtpPass)
  });
});

app.post('/api/admin/smtp-config', (req: Request, res: Response) => {
  const { smtpUser, smtpPass, adminEmail } = req.body;
  const settings = getSettings();
  if (adminEmail) settings.adminEmail = adminEmail.trim();
  if (smtpUser) settings.smtpUser = smtpUser.trim();
  if (smtpPass) settings.smtpPass = smtpPass.trim();
  settings.isConfigured = !!(settings.smtpUser && settings.smtpPass);
  saveSettings(settings);
  res.json({
    success: true,
    message: 'Gmail notification settings updated successfully!',
    isConfigured: settings.isConfigured
  });
});

app.get('/api/admin/email-logs', (_req: Request, res: Response) => {
  const logs = getEmailLogs();
  res.json({ success: true, logs });
});

app.post('/api/admin/test-email', async (_req: Request, res: Response) => {
  const settings = getSettings();
  const recipient = settings.adminEmail || 'banoqabil.org123@gmail.com';

  if (!settings.smtpPass) {
    return res.status(400).json({
      success: false,
      message: 'Please enter your 16-character Google App Password first, then save and click test.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: settings.smtpUser || recipient,
        pass: settings.smtpPass.replace(/\s+/g, '')
      }
    });

    const info = await transporter.sendMail({
      from: `"A.ROYAL Test Alert" <${settings.smtpUser || recipient}>`,
      to: recipient,
      subject: `👑 Test Alert from A.ROYAL Store System`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e9e5dc; max-width: 500px; margin: auto; background-color: #faf9f6;">
          <h2 style="color: #151515; font-family: Georgia, serif;">A.ROYAL Store Connected!</h2>
          <p style="color: #555;">This is a test notification verifying that your Gmail is now active and ready to receive real-time order alerts!</p>
          <div style="background-color: #eafaf1; padding: 12px; border-radius: 4px; color: #27ae60; font-weight: bold;">
            ✓ Orders placed by customers will arrive here instantly.
          </div>
          <p style="font-size: 11px; color: #888; margin-top: 15px;">Timestamp: ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    saveEmailLog({
      id: `test_${Date.now()}`,
      orderNumber: 'TEST-001',
      recipient,
      subject: '👑 Test Alert from A.ROYAL Store System',
      sentAt: new Date().toISOString(),
      status: 'sent',
      details: `Test email sent successfully! Message ID: ${info.messageId}`
    });

    res.json({
      success: true,
      message: `Test email successfully sent to ${recipient}! Check your Gmail inbox.`
    });
  } catch (err: any) {
    console.error('Test email failed:', err);
    saveEmailLog({
      id: `test_${Date.now()}`,
      orderNumber: 'TEST-001',
      recipient,
      subject: '👑 Test Alert from A.ROYAL Store System',
      sentAt: new Date().toISOString(),
      status: 'failed',
      details: `Failed to deliver test email: ${err.message}`
    });
    res.status(500).json({
      success: false,
      message: `Failed to send email: ${err.message}. Ensure 2-Step Verification is ON and you are using a 16-character Google App Password.`
    });
  }
});

// 4. Coupons Validation
app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const code = (req.body.code || '').trim().toUpperCase();

  const coupons: Record<string, number> = {
    ROYAL10: 10,
    WELCOME5: 5,
    EIDROYAL: 15,
    VIP20: 20,
    LUXURY10: 10
  };

  if (coupons[code]) {
    return res.json({
      success: true,
      code,
      discountPercentage: coupons[code],
      message: `Promo code ${code} applied: ${coupons[code]}% OFF your entire order!`
    });
  }

  return res.status(400).json({
    success: false,
    message: 'Invalid promo code. Try ROYAL10 or EIDROYAL.'
  });
});

// ----------------------------------------------------
// Production / Dev Vite Middlewares
// ----------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, () => {
    console.log(`[A. ROYAL Server] Running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
