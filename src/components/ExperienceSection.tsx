import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { SiteSettings } from '../types/index.ts';
import { Sparkles, Coffee, ShieldCheck, Heart } from 'lucide-react';

interface ExperienceSectionProps {
  settings: SiteSettings;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ settings }) => {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-[#344438] text-white overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute top-0 end-0 w-96 h-96 bg-[#B69A65]/10 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 start-0 w-96 h-96 bg-[#B69A65]/5 rounded-full blur-3xl -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs uppercase tracking-widest text-[#B69A65] font-semibold block mb-2">
            {t('تجربة الضيافة', 'The Dining Experience')}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F7F3EC] mb-6 leading-tight">
            {t('أكثر من مجرد وجبة؛ لحظات لا تُنسى في تلال الرياض', 'More than a meal; timeless moments at Tilal Riyadh')}
          </h2>
          <p className="text-base sm:text-lg text-[#F7F3EC]/80 leading-relaxed font-light">
            {t(
              'صُممت مساحات مطعم مينا لتمنحكم شعوراً بالراحة والخصوصية، حيث تلتقي فخامة فندق تلال الرياض بحميمية المائدة الشامية وكرم الترحيب العربي الأصيل.',
              'Designed to evoke warmth, comfort, and privacy, MeNa harmonizes the grandeur of Tilal Riyadh Hotel with the intimacy of Levantine family tables.'
            )}
          </p>
        </div>

        {/* Asymmetrical Editorial Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Large Visual Card */}
          <div className="md:col-span-7 bg-[#243027] rounded-2xl overflow-hidden border border-[#B69A65]/20 flex flex-col justify-between group">
            <div className="relative aspect-16/10 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85"
                alt="MeNa Restaurant Atmosphere"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#243027] via-transparent to-transparent" />
            </div>
            <div className="p-6 md:p-8">
              <span className="text-xs uppercase tracking-widest text-[#B69A65] font-semibold block mb-2">
                {t('صالة الطعام الرئيسية', 'The Grand Dining Room')}
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-[#F7F3EC] mb-3">
                {t('هدوء معماري وتناغم بين النور والظلال', 'Architectural Serenity & Play of Light')}
              </h3>
              <p className="text-sm text-[#F7F3EC]/75 leading-relaxed">
                {t(
                  'أجواء تمزج بين الفخامة المعاصرة والهدوء، لتناسب غداء العمل، والعشاء العائلي الهادئ.',
                  'An ambiance that pairs modern luxury with tranquility, curated for business discussions and relaxed family evenings.'
                )}
              </p>
            </div>
          </div>

          {/* Secondary Cards Column */}
          <div className="md:col-span-5 flex flex-col gap-6">
            
            {/* Table Setting Card */}
            <div className="bg-[#243027] rounded-2xl overflow-hidden border border-[#B69A65]/20 flex flex-col flex-1 group">
              <div className="relative aspect-16/9 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80"
                  alt="Table setting"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h4 className="text-lg font-bold text-[#F7F3EC] mb-2">
                  {t('عناية بأدق التفاصيل والضيافة', 'Impeccable Table Detail')}
                </h4>
                <p className="text-xs sm:text-sm text-[#F7F3EC]/70 leading-relaxed">
                  {t(
                    'تجهيز المائدة وأدوات الضيافة الفندقية لنضمن تجربة تليق بضيوفنا الكرام.',
                    'Precision in every place setting, reflecting the refined standards of Tilal Riyadh Hotel.'
                  )}
                </p>
              </div>
            </div>

            {/* Arabic Coffee & Welcome Touch */}
            <div className="bg-[#243027] rounded-2xl p-6 border border-[#B69A65]/20 flex items-center gap-4">
              <div className="p-3 bg-[#B69A65]/15 rounded-xl border border-[#B69A65]/30 shrink-0">
                <Coffee className="w-6 h-6 text-[#B69A65]" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#F7F3EC] mb-1">
                  {t('استقبال الضيوف والترحيب العربي', 'Arabian Welcome & Warmth')}
                </h4>
                <p className="text-xs text-[#F7F3EC]/70">
                  {t('استقبال يعكس كرم التقاليد السعودية والشامية المشتركة.', 'Warm greeting embodying cherished hospitality.')}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
