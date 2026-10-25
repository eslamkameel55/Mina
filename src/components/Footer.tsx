import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { SiteSettings } from '../types/index.ts';
import { Phone, Mail, MapPin, Globe, ExternalLink, Shield } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  setActiveView: (view: 'home' | 'menu' | 'admin') => void;
  onOpenReservation: () => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  setActiveView,
  onOpenReservation,
  onOpenPrivacy
}) => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <footer className="bg-[#1A221B] text-[#F7F3EC] pt-16 pb-12 border-t border-[#B69A65]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand & Story */}
          <div className="space-y-4">
            <div className="flex flex-col items-start">
              <span className="font-serif-luxury text-2xl font-bold tracking-wider text-[#B69A65]">
                {settings.name_en}
              </span>
              <span className="text-sm font-semibold text-[#F7F3EC] font-cairo">
                {settings.name_ar}
              </span>
              <span className="text-[11px] text-[#B69A65]/80 uppercase tracking-widest mt-1">
                {t('فندق تلال الرياض', 'Tilal Riyadh Hotel')}
              </span>
            </div>
            <p className="text-xs text-[#F7F3EC]/70 leading-relaxed">
              {t(
                'وجهة طعام فاخرة مستوحاة من تقاليد بلاد الشام العريقة، في بيئة معمارية راقية ترحب بالعائلات والضيوف.',
                'A refined dining destination inspired by Levantine traditions, welcoming families and guests with authentic hospitality.'
              )}
            </p>
            <div className="pt-2">
              <button
                onClick={toggleLanguage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#B69A65]/40 text-xs text-[#F7F3EC] hover:bg-[#B69A65]/20 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#B69A65]" />
                <span>{language === 'ar' ? 'English Language' : 'اللغة العربية'}</span>
              </button>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#B69A65] mb-4">
              {t('روابط سريعة', 'Navigation')}
            </h4>
            <ul className="space-y-2.5 text-xs text-[#F7F3EC]/80">
              <li>
                <button
                  onClick={() => { setActiveView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#B69A65] transition-colors cursor-pointer"
                >
                  {t('الرئيسية', 'Home')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveView('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#B69A65] transition-colors cursor-pointer"
                >
                  {t('قائمة الطعام الشامية', 'Levantine Menu')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveView('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 50); }}
                  className="hover:text-[#B69A65] transition-colors cursor-pointer"
                >
                  {t('عن المطعم وفلسفة الضيافة', 'About MeNa Restaurant')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveView('home'); setTimeout(() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }), 50); }}
                  className="hover:text-[#B69A65] transition-colors cursor-pointer"
                >
                  {t('المعرض البصري والأجواء', 'Photo Gallery')}
                </button>
              </li>
              {settings.reservations_enabled && (
                <li>
                  <button
                    onClick={onOpenReservation}
                    className="text-[#B69A65] font-semibold hover:underline cursor-pointer"
                  >
                    {t('حجز طاولة مسبق', 'Reserve a Table')}
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Contact & Location */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#B69A65] mb-4">
              {t('التواصل المباشر', 'Contact Us')}
            </h4>
            <div className="space-y-3 text-xs text-[#F7F3EC]/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B69A65] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {t(settings.address_ar, settings.address_en)}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#B69A65] shrink-0" />
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="hover:text-white transition-colors dir-ltr font-mono"
                >
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#B69A65] shrink-0" />
                <a
                  href={`mailto:${settings.email}`}
                  className="hover:text-white transition-colors break-all"
                >
                  {settings.email}
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Hotel Connection & Policies */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#B69A65] mb-4">
              {t('فندق تلال الرياض', 'Tilal Riyadh Hotel')}
            </h4>
            <p className="text-xs text-[#F7F3EC]/70 leading-relaxed mb-4">
              {t(
                'يقع مطعم مينا كأحد أبرز مرافق الضيافة داخل فندق تلال الرياض الراقي.',
                'MeNa Restaurant is an esteemed dining venue nestled inside Tilal Riyadh Hotel.'
              )}
            </p>
            <div className="space-y-2">
              <a
                href={settings.hotel_website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#B69A65] hover:underline block"
              >
                <span>{t('الموقع الرسمي للفندق', 'Official Hotel Website')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={settings.hotel_dining_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#B69A65] hover:underline block"
              >
                <span>{t('صفحة المطاعم الرسمية', 'Official Dining Page')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#B69A65]/15 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F7F3EC]/60 gap-4">
          <div>
            © {new Date().getFullYear()} {t('مطعم مينا - فندق تلال الرياض. جميع الحقوق محفوظة.', 'MeNa Restaurant – Tilal Riyadh Hotel. All rights reserved.')}
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t('سياسة الخصوصية وشروط الاستخدام', 'Privacy Policy & Terms')}
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              <Shield className="w-3 h-3 text-[#B69A65]" />
              <span>{t('لوحة الإدارة', 'Admin Portal')}</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
