export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
};

export type Address = {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  colors: string[];
  sizes: string[];
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  description: string;
  features: string[];
  specs: Record<string, string>;
  shipping: string;
  bestseller: boolean;
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  text: string;
  createdAt: string;
};

export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  color: string;
  size: string;
  qty: number;
};

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  color: string;
  size: string;
  qty: number;
  price: number;
};

export type ShippingInfo = {
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type Order = {
  id: string;
  number: string;
  userId: string | null;
  items: OrderItem[];
  shipping: ShippingInfo;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: "placed" | "processing" | "shipped" | "delivered";
  createdAt: string;
};

export type WishlistItem = {
  id: string;
  userId: string | null;
  cartId: string;
  productId: string;
};

export type Testimonial = {
  id: string;
  name: string;
  rating: number;
  text: string;
  avatar: string;
};

export type Booking = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  date: string;
  time: string;
  notes: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  sessionId: string;
  from: "user" | "agent";
  text: string;
  createdAt: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export type Store = {
  users: User[];
  addresses: Address[];
  products: Product[];
  reviews: Review[];
  cartItems: CartItem[];
  wishlist: WishlistItem[];
  orders: Order[];
  testimonials: Testimonial[];
  bookings: Booking[];
  chat: ChatMessage[];
  contacts: ContactMessage[];
};
