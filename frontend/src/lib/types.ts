export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
}

export interface ProductImage {
  url: string;
  is_primary?: boolean;
}

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string;
  mrp: number;
  sale_price: number;
  stock_total: number;
  stock_remaining: number;
  rating: number;
  rating_count: number;
  is_flash_deal: boolean;
  flash_deal_ends_at?: string;
  dispatch_hours: number;
  product_images: ProductImage[];
  product_variants?: ProductVariant[];
  categories?: { slug: string; name: string };
  stock_ratio?: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  banner_url?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  products: {
    title: string;
    slug: string;
    sale_price: number;
    mrp: number;
    product_images: ProductImage[];
  };
  product_variants?: { size?: string; color?: string; stock: number };
}
