export type Language = 'ar' | 'en';

export interface SiteSettings {
  name_ar: string;
  name_en: string;
  hotel_name_ar: string;
  hotel_name_en: string;
  tagline_ar: string;
  tagline_en: string;
  hero_subtitle_ar: string;
  hero_subtitle_en: string;
  about_title_ar: string;
  about_title_en: string;
  about_text_ar: string;
  about_text_en: string;
  phone: string;
  email: string;
  address_ar: string;
  address_en: string;
  google_maps_url: string;
  hotel_website_url: string;
  hotel_dining_url: string;
  coordinates: { lat: number; lng: number };
  reservations_enabled: boolean;
  working_hours_ar: string;
  working_hours_en: string;
  currency_ar: string;
  currency_en: string;
  primary_color: string;
  accent_gold: string;
  background_ivory: string;
  instagram_url?: string;
  facebook_url?: string;
}

export interface Dish {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  currency: string;
  category_id: string;
  category_name_ar?: string;
  category_name_en?: string;
  image_url: string;
  additional_images?: string[];
  ingredients_ar?: string[];
  ingredients_en?: string[];
  allergens?: string[];
  is_available: boolean;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  image_url?: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title_ar: string;
  title_en: string;
  alt_ar: string;
  alt_en: string;
  image_url: string;
  category: 'ambiance' | 'dining' | 'details' | 'dishes';
  created_at: string;
}

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  guest_count: number;
  special_requests?: string;
  status: 'new' | 'pending' | 'confirmed' | 'cancelled';
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'manager';
}

export interface AuditLog {
  id: string;
  action: string;
  performed_by: string;
  details: string;
  timestamp: string;
}

export interface DashboardStats {
  total_dishes: number;
  published_dishes: number;
  draft_dishes: number;
  unavailable_dishes: number;
  total_categories: number;
  total_gallery_images: number;
  total_reservations: number;
  pending_reservations: number;
  recent_logs: AuditLog[];
}
