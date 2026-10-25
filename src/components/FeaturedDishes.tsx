import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Dish, SiteSettings } from '../types/index.ts';
import { Sparkles, ArrowRight, ArrowLeft, Info, Eye } from 'lucide-react';

interface FeaturedDishesProps {
  dishes: Dish[];
  settings: SiteSettings;
  onSelectDish: (dish: Dish) => void;
  onViewFullMenu: () => void;
}

export const FeaturedDishes: React.FC<FeaturedDishesProps> = ({
  dishes,
  settings,
  onSelectDish,
  onViewFullMenu
}) => {
  const { t, isRtl } = useLanguage();

  // Filter only featured or published dishes
  const featured = dishes.filter(d => d.is_featured && d.is_published);
  const displayDishes = featured.length > 0 ? featured : dishes.filter(d => d.is_published).slice(0, 6);

  return (
    <section className="py-20 bg-white text-[#242424] border-y border-[#B69A65]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B69A65] font-semibold block mb-2">
              {t('مختارات المطعم', "Chef's Recommendations")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#344438] leading-tight">
              {t('أطباق مميزة من المائدة الشامية', 'Signature Levantine Plates')}
            </h2>
          </div>

          <button
            onClick={onViewFullMenu}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-[#344438] hover:text-[#B69A65] transition-colors cursor-pointer group"
          >
            <span>{t('تصفح كامل قائمة الطعام', 'View Complete Menu')}</span>
            {isRtl ? (
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            ) : (
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            )}
          </button>
        </div>

        {/* Empty state if no published dishes */}
        {displayDishes.length === 0 ? (
          <div className="text-center py-16 px-6 bg-[#F7F3EC] rounded-2xl border border-[#B69A65]/20 max-w-xl mx-auto">
            <Info className="w-10 h-10 text-[#B69A65] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#344438] mb-2">
              {t('قائمتنا الموسمية قيد الاعتماد والتحديث', 'Our seasonal menu is being finalized')}
            </h3>
            <p className="text-sm text-[#604B3C] mb-6">
              {t(
                'يقوم فريق الإدارة ومطبخ مينا حالياً باعتماد القائمة الكاملة وتحديث الأسعار والمكونات.',
                'Our management and kitchen team are currently finalizing the complete menu and dish selections.'
              )}
            </p>
            <a
              href={`tel:${settings.phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 bg-[#344438] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#465B4C] transition-colors"
            >
              <span>{t('الاستفسار عن أطباق اليوم المتاحة', 'Inquire About Today’s Specials')}</span>
            </a>
          </div>
        ) : (
          /* Dish Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayDishes.map((dish) => (
              <div
                key={dish.id}
                onClick={() => onSelectDish(dish)}
                className="group bg-[#FCFAF6] rounded-xl overflow-hidden border border-[#B69A65]/20 shadow-xs hover:shadow-md hover:border-[#B69A65]/60 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Dish Image */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={dish.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'}
                    alt={t(dish.name_ar, dish.name_en)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  
                  {/* Subtle Recommendation Indicator */}
                  {dish.is_featured && (
                    <div className="absolute top-3 start-3 bg-[#344438]/90 text-[#F7F3EC] text-[11px] font-semibold px-2.5 py-1 rounded backdrop-blur-xs flex items-center gap-1 border border-[#B69A65]/30">
                      <Sparkles className="w-3 h-3 text-[#B69A65]" />
                      <span>{t('موصى به من الإدارة', 'Recommended')}</span>
                    </div>
                  )}

                  {/* Unavailable Ribbon */}
                  {!dish.is_available && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-white text-xs font-semibold px-3 py-1.5 bg-black/50 border border-white/20 rounded">
                        {t('غير متاح اليوم', 'Currently Unavailable')}
                      </span>
                    </div>
                  )}

                  {/* Quick view hover icon */}
                  <div className="absolute inset-0 bg-[#344438]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/90 text-[#344438] text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      {t('تفاصيل الطبق', 'View Details')}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category Title */}
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B69A65] block mb-1">
                      {t(dish.category_name_ar || '', dish.category_name_en || '')}
                    </span>

                    {/* Dish Name */}
                    <h3 className="text-lg font-bold text-[#344438] group-hover:text-[#B69A65] transition-colors mb-2">
                      {t(dish.name_ar, dish.name_en)}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-[#604B3C] line-clamp-2 leading-relaxed mb-4">
                      {t(dish.description_ar, dish.description_en)}
                    </p>
                  </div>

                  {/* Price & Allergen indicator */}
                  <div className="pt-3 border-t border-[#B69A65]/15 flex items-center justify-between">
                    <div>
                      {dish.price > 0 ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-[#344438]">
                            {dish.price}
                          </span>
                          <span className="text-xs font-medium text-[#604B3C]">
                            {t(settings.currency_ar, settings.currency_en)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#604B3C]/70">
                          {t('السعر حسب التوفر', 'Price on Request')}
                        </span>
                      )}
                    </div>

                    {dish.allergens && dish.allergens.length > 0 && (
                      <span className="text-[11px] text-[#604B3C]/80" title={t('يحتوي على مسببات حساسية', 'Contains Allergens')}>
                        {dish.allergens.length} {t('تنبيه حساسية', 'allergens')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
