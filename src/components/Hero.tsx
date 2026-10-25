import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { SiteSettings } from '../types/index.ts';
import { ChevronDown, Utensils, Calendar, MapPin, Sparkles } from 'lucide-react';

interface HeroProps {
  settings: SiteSettings;
  onExploreMenu: () => void;
  onOpenReservation: () => void;
  onScrollToAbout: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onExploreMenu,
  onOpenReservation,
  onScrollToAbout
}) => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center bg-[#1A221B] text-white overflow-hidden pt-20 pb-16">
      {/* Background with luxury architectural texture and atmospheric warmth */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=85"
          alt="MeNa Restaurant Atmosphere at Tilal Riyadh"
          className="w-full h-full object-cover object-center brightness-[0.38] contrast-[1.08] scale-105 transform duration-1000 ease-out"
        />
        {/* Subtle gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A221B] via-[#344438]/50 to-[#1A221B]/80" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Editorial Sub-header / Hotel Attribution */}
        <div className="inline-flex items-center gap-2 text-xs md:text-sm tracking-widest uppercase text-[#B69A65] mb-5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-[#B69A65]" />
          <span>{t(settings.hotel_name_ar, settings.hotel_name_en)}</span>
          <span className="opacity-50">·</span>
          <span>{t('الرياض، حي الجزيرة', 'Riyadh, Al Jazirah')}</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-[#F7F3EC] leading-[1.2] md:leading-[1.25] mb-6 max-w-4xl">
          {t(settings.tagline_ar, settings.tagline_en)}
        </h1>

        {/* Subtitle / Prose */}
        <p className="text-base sm:text-lg md:text-xl text-[#F7F3EC]/85 max-w-2xl font-light leading-relaxed mb-10">
          {t(settings.hero_subtitle_ar, settings.hero_subtitle_en)}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full max-w-md">
          <button
            onClick={onExploreMenu}
            className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 bg-[#B69A65] hover:bg-[#CFB888] text-[#1A1D1A] font-semibold px-6 py-3.5 rounded text-sm md:text-base transition-all duration-200 shadow-md cursor-pointer"
          >
            <Utensils className="w-4 h-4" />
            <span>{t('استكشف قائمة الطعام', 'Explore Menu')}</span>
          </button>

          {settings.reservations_enabled && (
            <button
              onClick={onOpenReservation}
              className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-[#F7F3EC] border border-[#B69A65] font-semibold px-6 py-3.5 rounded text-sm md:text-base transition-all duration-200 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#B69A65]" />
              <span>{t('احجز طاولتك', 'Reserve Table')}</span>
            </button>
          )}

          <button
            onClick={onScrollToAbout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs md:text-sm text-[#F7F3EC]/70 hover:text-white py-2 transition-colors cursor-pointer"
          >
            <span>{t('اكتشف تجربة المطعم', 'Discover The Experience')}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ambient details bar */}
        <div className="mt-14 pt-8 border-t border-[#B69A65]/20 grid grid-cols-2 md:grid-cols-3 gap-6 text-start max-w-2xl w-full">
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-[#B69A65]">
              {t('نوع المطبخ', 'Cuisine')}
            </span>
            <span className="text-sm font-medium text-[#F7F3EC]">
              {t('شامي وشرقي أصيل', 'Authentic Levantine')}
            </span>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-[#B69A65]">
              {t('الأجواء', 'Atmosphere')}
            </span>
            <span className="text-sm font-medium text-[#F7F3EC]">
              {t('أندلسية معاصرة هادئة', 'Contemporary Andalusian')}
            </span>
          </div>
          <div className="col-span-2 md:col-span-1">
            <span className="block text-[11px] uppercase tracking-wider text-[#B69A65]">
              {t('الموقع', 'Location')}
            </span>
            <span className="text-sm font-medium text-[#F7F3EC]">
              {t('داخل فندق تلال الرياض', 'Tilal Riyadh Hotel')}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
