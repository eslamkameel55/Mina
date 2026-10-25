import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { api } from './services/api.ts';
import { SiteSettings, Dish, Category, GalleryItem } from './types/index.ts';

import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { FeaturedDishes } from './components/FeaturedDishes.tsx';
import { ExperienceSection } from './components/ExperienceSection.tsx';
import { GallerySection } from './components/GallerySection.tsx';
import { LocationContact } from './components/LocationContact.tsx';
import { MenuPage } from './components/MenuPage.tsx';
import { Footer } from './components/Footer.tsx';
import { ReservationModal } from './components/ReservationModal.tsx';
import { DishDetailModal } from './components/DishDetailModal.tsx';
import { PrivacyModal } from './components/PrivacyModal.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';

// Fallback initial settings while server initializes
const initialFallbackSettings: SiteSettings = {
  name_ar: 'مطعم مينا',
  name_en: 'MeNa Restaurant',
  hotel_name_ar: 'فندق تلال الرياض',
  hotel_name_en: 'Tilal Riyadh Hotel',
  tagline_ar: 'حيث تلتقي أصالة النكهات بفن الضيافة',
  tagline_en: 'Where Authentic Flavors Meet the Art of Hospitality',
  hero_subtitle_ar: 'اكتشف تجربة طعام مستوحاة من تقاليد بلاد الشام العريقة، في أجواء تجمع الدفء والأناقة المعمارية داخل تلال الرياض.',
  hero_subtitle_en: 'Discover a dining experience inspired by Levantine traditions, amidst warmth and contemporary elegance at Tilal Riyadh.',
  about_title_ar: 'تجربة تجمع النكهة والأجواء الشامية الفاخرة',
  about_title_en: 'An Experience Blending Flavor & Refined Ambiance',
  about_text_ar: 'يقع مطعم مينا في قلب فندق تلال الرياض، ويقدم وجهة استثنائية لعشاق المأكولات الشامية والشرقية الأصيلة. نحرص على تقديم أطباق محضرة بعناية فائقة باستخدام أجود المكونات الطازجة، لنوفر لضيوفنا وأسرهم لحظات دافئة تعكس كرم الضيافة العربية في أجواء معمارية أندلسية معاصرة.',
  about_text_en: 'Nestled inside Tilal Riyadh Hotel, MeNa Restaurant offers a distinguished destination for lovers of authentic Levantine and Middle Eastern cuisine. We craft carefully prepared dishes using prime ingredients, welcoming guests and families to savor Arab hospitality in a serene contemporary Andalusian setting.',
  phone: '+966 59 142 0829',
  email: 'book.riyadh@tilalhotels.com',
  address_ar: 'فندق تلال الرياض، الطريق الدائري الشرقي الفرعي، حي الجزيرة، الرياض 14251، المملكة العربية السعودية',
  address_en: 'Tilal Riyadh Hotel, Eastern Ring Branch Rd, Al Jazirah, Riyadh 14251, Saudi Arabia',
  google_maps_url: 'https://www.google.com/maps/place/MeNa+Restaurant,+Tilal+Riyadh+Hotel/',
  hotel_website_url: 'https://tilalhotels.com/tilal-riyadh/',
  hotel_dining_url: 'https://tilalhotels.com/tilal-riyadh/dining/',
  coordinates: {
    lat: 24.6760592,
    lng: 46.7798192
  },
  reservations_enabled: true,
  working_hours_ar: 'أوقات العمل وجلسات الطعام متاحة يومياً، ويُفضل الحجز المسبق لتأكيد التوفر وضمان أفضل خدمة.',
  working_hours_en: 'Daily dining service available. Prior reservation is recommended to ensure seamless hospitality and availability.',
  currency_ar: 'ر.س',
  currency_en: 'SAR',
  primary_color: '#344438',
  accent_gold: '#B69A65',
  background_ivory: '#F7F3EC'
};

function MainApp() {
  const { t, language } = useLanguage();

  const [activeView, setActiveView] = useState<'home' | 'menu' | 'admin'>(() => {
    if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
      return 'admin';
    }
    if (window.location.pathname.startsWith('/menu') || window.location.hash === '#menu') {
      return 'menu';
    }
    return 'home';
  });

  const [settings, setSettings] = useState<SiteSettings>(initialFallbackSettings);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  // Sync browser path/hash
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
        setActiveView('admin');
      } else if (window.location.pathname.startsWith('/menu') || window.location.hash === '#menu') {
        setActiveView('menu');
      } else {
        setActiveView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const changeView = (view: 'home' | 'menu' | 'admin') => {
    setActiveView(view);
    if (view === 'admin') {
      window.history.pushState(null, '', '#admin');
    } else if (view === 'menu') {
      window.history.pushState(null, '', '#menu');
    } else {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const loadData = async () => {
    try {
      const [fetchedSettings, fetchedDishes, fetchedCats, fetchedGal] = await Promise.all([
        api.getSettings().catch(() => initialFallbackSettings),
        api.getDishes(false).catch(() => []),
        api.getCategories(true).catch(() => []),
        api.getGallery().catch(() => [])
      ]);

      setSettings(fetchedSettings);
      setDishes(fetchedDishes);
      setCategories(fetchedCats);
      setGallery(fetchedGal);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync document title
  useEffect(() => {
    const restaurantTitle = t(
      `${settings.name_ar} – ${settings.hotel_name_ar}`,
      `${settings.name_en} – ${settings.hotel_name_en}`
    );
    document.title = activeView === 'admin'
      ? `${t('لوحة الإدارة', 'Admin Portal')} | ${restaurantTitle}`
      : activeView === 'menu'
      ? `${t('قائمة الطعام', 'Menu')} | ${restaurantTitle}`
      : restaurantTitle;
  }, [settings, activeView, language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#344438] flex flex-col items-center justify-center text-white p-4">
        <div className="w-12 h-12 border-2 border-[#B69A65]/30 border-t-[#B69A65] rounded-full animate-spin mb-4" />
        <span className="font-serif-luxury text-xl font-bold text-[#B69A65] tracking-wider">
          MeNa Restaurant
        </span>
        <span className="text-xs text-[#F7F3EC]/70 mt-1">
          {t('جاري تحميل التجربة الفندقية...', 'Loading luxury hospitality experience...')}
        </span>
      </div>
    );
  }

  // Admin View
  if (activeView === 'admin') {
    return (
      <AdminDashboard
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
        onExitAdmin={() => changeView('home')}
        onRefreshDishes={loadData}
      />
    );
  }

  // Public View
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EC] text-[#242424] font-cairo">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        activeView={activeView}
        setActiveView={changeView}
        onOpenReservation={() => setReservationModalOpen(true)}
      />

      {/* View router */}
      {activeView === 'menu' ? (
        <MenuPage
          dishes={dishes}
          categories={categories}
          settings={settings}
          onSelectDish={(dish) => setSelectedDish(dish)}
          onBackToHome={() => changeView('home')}
          onOpenReservation={() => setReservationModalOpen(true)}
        />
      ) : (
        <main className="flex-1">
          {/* Hero Section */}
          <Hero
            settings={settings}
            onExploreMenu={() => changeView('menu')}
            onOpenReservation={() => setReservationModalOpen(true)}
            onScrollToAbout={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
          />

          {/* About Section */}
          <AboutSection settings={settings} />

          {/* Featured Dishes Section */}
          <FeaturedDishes
            dishes={dishes}
            settings={settings}
            onSelectDish={(dish) => setSelectedDish(dish)}
            onViewFullMenu={() => changeView('menu')}
          />

          {/* Atmosphere & Experience Section */}
          <ExperienceSection settings={settings} />

          {/* Interactive Photo Gallery */}
          <GallerySection items={gallery} />

          {/* Location & Contact Section */}
          <LocationContact settings={settings} />
        </main>
      )}

      {/* Footer */}
      <Footer
        settings={settings}
        setActiveView={changeView}
        onOpenReservation={() => setReservationModalOpen(true)}
        onOpenPrivacy={() => setPrivacyModalOpen(true)}
      />

      {/* Modals */}
      <ReservationModal
        isOpen={reservationModalOpen}
        onClose={() => setReservationModalOpen(false)}
        phone={settings.phone}
      />

      <DishDetailModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        settings={settings}
      />

      <PrivacyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </AuthProvider>
  );
}
