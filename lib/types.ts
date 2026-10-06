export interface Product {
  id: number;
  slug: string;
  name: string;
  categorySlug: string;
  brand: string;
  description: string;
  specs?: string | null;
  price: number;
  comparePrice?: number | null;
  competitorName?: string | null;
  savingAmount?: number | null;
  badge?: string | null;
  image: string;
  additionalImages?: string | null;
  stock: number;
  rating: number;
  reviewCount: number;
  isStaffPick: number;
  isFeatured: number;
  isDealOfTheDay: number;
  createdAt?: string | null;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  featured: number;
  itemCount: number;
  subcategories?: string | null;
}

export interface CartItem {
  id: number;
  slug: string;
  name: string;
  brand: string;
  price: number;
  comparePrice?: number;
  savingAmount?: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress: string;
  city: string;
  postcode: string;
  deliveryMethod: string;
  subtotal: number;
  promoCode?: string | null;
  discountAmount?: number | null;
  shippingFee: number;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  image?: string | null;
}
