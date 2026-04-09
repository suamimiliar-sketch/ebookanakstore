export type ProductType = "ebook" | "minigame" | "ebook_exclusive";

export interface ProductPage {
  id?: number;
  page_number: number;
  color?: string | null;
  image_url?: string | null;
}

export interface Product {
  id: number;
  product_type: ProductType;
  title: string;
  category: string;
  age_group: string;
  age_label?: string | null;
  description: string;
  price: number;
  file_name?: string | null;
  cover_color?: string | null;
  drive_download_link?: string | null;
  is_bonus: boolean;
  thumbnail_url?: string | null;
  game_url?: string | null;
  icon?: string | null;
  access_duration_hours: number;
  has_audio: boolean;
  has_interactive: boolean;
  is_active: boolean;
  pages: ProductPage[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_type: ProductType;
  title: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  order_id: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string | null;
  subtotal: number;
  discount: number;
  total: number;
  bundle_applied: boolean;
  payment_status: "pending" | "success" | "failed" | "expired";
  items: OrderItem[];
  created_at: string;
  paid_at?: string | null;
}
