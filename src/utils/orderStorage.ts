export interface StoredOrder {
  id: string;
  order_number: string;
  customer_info: {
    name: string;
    phone: string;
    altPhone?: string;
    address: string;
    division?: string;
    district?: string;
    paymentMethod?: string;
  };
  items: any[];
  subtotal: number;
  delivery_charge: number;
  grand_total: number;
  status: string;
  created_at: string;
}

const STORAGE_KEY = 'anmart_placed_orders';

export const saveOrderToLocal = (order: StoredOrder) => {
  try {
    const existing = getLocalOrders();
    // Prepend new order
    const updated = [order, ...existing.filter(o => o.id !== order.id && o.order_number !== order.order_number)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save order to localStorage:', e);
  }
};

export const getLocalOrders = (): StoredOrder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse local orders:', e);
    return [];
  }
};

export const findLocalOrder = (orderId: string, phone: string): StoredOrder | undefined => {
  const cleanId = orderId.trim().toLowerCase();
  const cleanPhone = phone.trim().replace(/[^\d]/g, '');

  const orders = getLocalOrders();
  return orders.find(order => {
    const idMatch = 
      (order.id && order.id.toLowerCase().includes(cleanId)) ||
      (order.order_number && order.order_number.toLowerCase().includes(cleanId));
    
    const customerPhone = (order.customer_info?.phone || '').replace(/[^\d]/g, '');
    const phoneMatch = customerPhone.endsWith(cleanPhone) || cleanPhone.endsWith(customerPhone);

    return idMatch && (phoneMatch || cleanPhone.length < 5);
  });
};
