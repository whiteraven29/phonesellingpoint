// types/index.ts
export interface Phone {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  brand?: string;       // Make optional if not always present
  rating?: number;      // Make optional if not always present
  description?: string; // Make optional if not always present
}

export interface CartItem {
  id: string;
  phone_id: string;
  user_id: string;
  quantity: number;
  phone: Phone;
}

// Add this type for the raw Supabase response
export interface SupabaseCartItem {
  id: string;
  phone_id: string;
  user_id: string;
  quantity: number;
  phone: Phone[]; // Supabase joins can return null
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'fulfilled';
  created_at: string;
  order_items: OrderItem[];
}

export interface OrderItem {
  id: string;
  phone_id: string;
  phone_name: string;
  quantity: number;
  price: number;
}