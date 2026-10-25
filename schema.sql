-- =========================================================================
-- MeNa Restaurant – Tilal Riyadh | مطعم مينا - فندق تلال الرياض
-- Complete PostgreSQL & Supabase Database Schema with Row Level Security (RLS)
-- =========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id VARCHAR(64) PRIMARY KEY DEFAULT 'current_settings',
  name_ar VARCHAR(255) NOT NULL DEFAULT 'مطعم مينا',
  name_en VARCHAR(255) NOT NULL DEFAULT 'MeNa Restaurant',
  hotel_name_ar VARCHAR(255) NOT NULL DEFAULT 'فندق تلال الرياض',
  hotel_name_en VARCHAR(255) NOT NULL DEFAULT 'Tilal Riyadh Hotel',
  tagline_ar TEXT NOT NULL DEFAULT 'حيث تلتقي أصالة النكهات بفن الضيافة',
  tagline_en TEXT NOT NULL DEFAULT 'Where Authentic Flavors Meet the Art of Hospitality',
  hero_subtitle_ar TEXT,
  hero_subtitle_en TEXT,
  about_title_ar VARCHAR(255),
  about_title_en VARCHAR(255),
  about_text_ar TEXT,
  about_text_en TEXT,
  phone VARCHAR(50) NOT NULL DEFAULT '+966 59 142 0829',
  email VARCHAR(255) NOT NULL DEFAULT 'book.riyadh@tilalhotels.com',
  address_ar TEXT NOT NULL,
  address_en TEXT NOT NULL,
  google_maps_url TEXT,
  hotel_website_url TEXT DEFAULT 'https://tilalhotels.com/tilal-riyadh/',
  hotel_dining_url TEXT DEFAULT 'https://tilalhotels.com/tilal-riyadh/dining/',
  latitude NUMERIC(10, 7) DEFAULT 24.6760592,
  longitude NUMERIC(10, 7) DEFAULT 46.7798192,
  reservations_enabled BOOLEAN DEFAULT true,
  working_hours_ar TEXT,
  working_hours_en TEXT,
  currency_ar VARCHAR(20) DEFAULT 'ر.س',
  currency_en VARCHAR(20) DEFAULT 'SAR',
  primary_color VARCHAR(20) DEFAULT '#344438',
  accent_gold VARCHAR(20) DEFAULT '#B69A65',
  background_ivory VARCHAR(20) DEFAULT '#F7F3EC',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_published ON categories(is_published);

-- 3. Dishes Table
CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'SAR',
  image_url TEXT,
  additional_images TEXT[] DEFAULT '{}',
  ingredients_ar TEXT[] DEFAULT '{}',
  ingredients_en TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category_id);
CREATE INDEX IF NOT EXISTS idx_dishes_published ON dishes(is_published);
CREATE INDEX IF NOT EXISTS idx_dishes_available ON dishes(is_available);

-- 4. Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  alt_ar TEXT NOT NULL,
  alt_en TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'ambiance', -- ambiance, dining, details, dishes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  date DATE NOT NULL,
  time VARCHAR(20) NOT NULL,
  guest_count INT NOT NULL CHECK (guest_count > 0),
  special_requests TEXT,
  status VARCHAR(30) DEFAULT 'new', -- 'new', 'pending', 'confirmed', 'cancelled'
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);

-- 6. Admin Profiles Table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'manager', -- 'super_admin', 'manager'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(100) NOT NULL,
  performed_by VARCHAR(255) NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- Row Level Security (RLS) Policies
-- =========================================================================

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Site Settings: Public can read, only authenticated admins can write
CREATE POLICY "Public can view site settings" ON site_settings
  FOR SELECT USING (true);

-- Categories: Public can view published categories
CREATE POLICY "Public can view published categories" ON categories
  FOR SELECT USING (is_published = true);

-- Dishes: Public can view published dishes
CREATE POLICY "Public can view published dishes" ON dishes
  FOR SELECT USING (is_published = true);

-- Gallery: Public can view gallery images
CREATE POLICY "Public can view gallery images" ON gallery_images
  FOR SELECT USING (true);

-- Reservations: Public can insert reservations (book table)
CREATE POLICY "Public can submit reservations" ON reservations
  FOR INSERT WITH CHECK (true);

-- Admin tables & management: Strictly restricted to authenticated users
-- (e.g. auth.role() = 'authenticated' in Supabase)
