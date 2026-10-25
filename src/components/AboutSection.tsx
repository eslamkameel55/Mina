import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { SiteSettings } from '../types/index.ts';
import { ExternalLink, CheckCircle2, Building, HeartHandshake, UtensilsCrossed } from 'lucide-react';

interface AboutSectionProps {
  settings: SiteSettings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings }) => {
  const { t } = useLanguage();

  const hospitalityPillars = [
    {
      icon: <UtensilsCrossed className="w-5 h-5 text-[#B69A65]" />,
      title: t('أصالة المطبخ الشامي', 'Authentic Levantine Heritage'),
      description: t(
        'نختار بعناية التوابل الدمشقية، زيت الزيتون البكر، وأجود المكونات الطازجة لإعداد أطباق تقليدية بلمسة راقية.',
        'We select fine spices, virgin olive oil, and premium fresh ingredients to prepare heritage recipes with elevated presentation.'
      )
    },
    {
      icon: <Building className="w-5 h-5 text-[#B69A65]" />,
      title: t('طابع أندلسي معاصر', 'Contemporary Andalusian Ambiance'),
      description: t(
        'تصميم داخلي مستوحى من الهندسة الأندلسية المتوازنة داخل فندق تلال الرياض، يمنح الجلسات هدوءاً وخصوصية.',
        'Interior design inspired by Andalusian architectural balance at Tilal Riyadh Hotel, ensuring serene dining comfort.'
      )
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-[#B69A65]" />,
      title: t('كرم الضيافة ودفء اللقاء', 'Generous Warm Hospitality'),
      description: t(
        'أجواء مثالية لاستقبال العائلات والأصدقاء وضيوف الأعمال، مع خدمة فندقية متقنة ومريحة.',
        'An ideal setting for families, friends, and business lunches, enriched by meticulous hotel hospitality.'
      )
    }
  ];

  return (
    <section id="about" className="py-20 md:py-28 bg-[#F7F3EC] text-[#242424] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-[#B69A65] font-semibold block mb-2">
            {t('عن مطعم مينا', 'About MeNa Restaurant')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#344438] mb-4 leading-tight">
            {t(settings.about_title_ar, settings.about_title_en)}
          </h2>
          <div className="w-16 h-0.5 bg-[#B69A65] mx-auto mb-6" />
          <p className="text-base sm:text-lg text-[#604B3C] leading-relaxed">
            {t(settings.about_text_ar, settings.about_text_en)}
          </p>
        </div>

        {/* Editorial Layout: Image & Story */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          {/* Main Visual Column */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-xl overflow-hidden shadow-xl aspect-4/3 border border-[#B69A65]/20">
              <img
                src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=85"
                alt="MeNa Restaurant Dining Ambiance at Tilal Riyadh"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 start-4 end-4 text-white p-3 backdrop-blur-sm bg-black/30 rounded-lg">
                <span className="text-xs font-medium text-[#B69A65] block">
                  {t('فندق تلال الرياض', 'Tilal Riyadh Hotel')}
                </span>
                <p className="text-sm">
                  {t('وجهتكم لتذوق كرم المائدة الشامية في قلب العاصمة', 'Your destination for authentic Levantine feasts in Riyadh')}
                </p>
              </div>
            </div>
          </div>

          {/* Pillars List Column */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {hospitalityPillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-[#B69A65]/15 shadow-xs hover:border-[#B69A65]/40 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-lg bg-[#344438]/5 border border-[#344438]/10 shrink-0">
                      {pillar.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#344438] mb-1">
                        {pillar.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#604B3C] leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Official Hotel Link */}
            <div className="pt-2">
              <a
                href={settings.hotel_dining_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#344438] hover:text-[#B69A65] transition-colors"
              >
                <span>{t('زيارة صفحة المطاعم في موقع فندق تلال الرياض الرسمي', 'Visit official Tilal Riyadh dining page')}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
