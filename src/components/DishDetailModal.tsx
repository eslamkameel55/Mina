import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Dish, SiteSettings } from '../types/index.ts';
import { X, Sparkles, AlertTriangle, CheckCircle, ShieldAlert, Utensils } from 'lucide-react';

interface DishDetailModalProps {
  dish: Dish | null;
  onClose: () => void;
  settings: SiteSettings;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  dish,
  onClose,
  settings
}) => {
  const { t } = useLanguage();

  if (!dish) return null;

  const allergenLabels: Record<string, { ar: string; en: string }> = {
    gluten: { ar: 'جلوتين (قمح)', en: 'Gluten / Wheat' },
    dairy: { ar: 'مشتقات الحليب والألبان', en: 'Dairy' },
    nuts: { ar: 'مكسرات (صنوبر / فستق / لوز)', en: 'Tree Nuts' },
    sesame: { ar: 'سمسم وطحينة', en: 'Sesame / Tahini' },
    eggs: { ar: 'بيض', en: 'Eggs' },
    shellfish: { ar: 'مأكولات بحرية وقشريات', en: 'Shellfish' }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#FCFAF6] border border-[#B69A65]/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative aspect-16/9 bg-slate-900 overflow-hidden">
          <img
            src={dish.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85'}
            alt={t(dish.name_ar, dish.name_en)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 end-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category & Recommendations tags */}
          <div className="absolute bottom-4 start-4 end-4 flex items-end justify-between text-white">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#B69A65] font-semibold block mb-1">
                {t(dish.category_name_ar || '', dish.category_name_en || '')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {t(dish.name_ar, dish.name_en)}
              </h2>
            </div>

            {dish.is_featured && (
              <span className="bg-[#B69A65] text-[#1A1D1A] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
                {t('موصى به', 'Signature')}
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Availability and Price Bar */}
          <div className="flex items-center justify-between p-4 bg-[#F7F3EC] rounded-xl border border-[#B69A65]/20">
            <div>
              <span className="text-xs text-[#604B3C] block mb-0.5">
                {t('السعر المعتمد', 'Official Price')}
              </span>
              {dish.price > 0 ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-[#344438]">
                    {dish.price}
                  </span>
                  <span className="text-sm font-semibold text-[#604B3C]">
                    {t(settings.currency_ar, settings.currency_en)}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-medium text-[#604B3C]">
                  {t('السعر حسب الطلب والتوفر', 'Price on Request')}
                </span>
              )}
            </div>

            <div>
              {dish.is_available ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {t('متوفر للطلب الآن', 'Available for Dining')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t('غير متوفر اليوم', 'Unavailable Today')}
                </span>
              )}
            </div>
          </div>

          {/* Detailed Descriptions */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#B69A65] mb-2">
              {t('عن الطبق', 'About This Dish')}
            </h4>
            <p className="text-sm sm:text-base text-[#344438] leading-relaxed">
              {t(dish.description_ar, dish.description_en)}
            </p>
            {dish.description_en && (
              <p className="text-xs text-[#604B3C]/80 mt-2 italic font-serif-luxury">
                {dish.description_en}
              </p>
            )}
          </div>

          {/* Ingredients Breakdown */}
          {((dish.ingredients_ar && dish.ingredients_ar.length > 0) || (dish.ingredients_en && dish.ingredients_en.length > 0)) && (
            <div className="pt-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-[#B69A65] mb-2 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" />
                <span>{t('المكونات والعناصر الرئيسية', 'Key Ingredients')}</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {(t(dish.ingredients_ar?.join(',') || '', dish.ingredients_en?.join(',') || '')).split(',').map((ing, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white text-[#344438] px-3 py-1 rounded-md border border-[#B69A65]/20 shadow-2xs"
                  >
                    {ing.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens Information */}
          {dish.allergens && dish.allergens.length > 0 && (
            <div className="pt-2 bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
              <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>{t('تنبيه الحساسية الغذائية المعتمد', 'Certified Allergen Advisory')}</span>
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed mb-3">
                {t(
                  'يرجى إبلاغ طاقم الخدمة بأي حساسية غذائية قبل إعداد وجبتكم:',
                  'Please notify our service team of any specific dietary allergies before ordering:'
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {dish.allergens.map((alg) => (
                  <span
                    key={alg}
                    className="text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded font-medium border border-amber-300/60"
                  >
                    {allergenLabels[alg] ? t(allergenLabels[alg].ar, allergenLabels[alg].en) : alg}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer note & Close */}
          <div className="pt-3 border-t border-[#B69A65]/20 flex items-center justify-between">
            <span className="text-[11px] text-[#604B3C]/75">
              {t('مطعم مينا · فندق تلال الرياض', 'MeNa Restaurant · Tilal Riyadh Hotel')}
            </span>
            <button
              onClick={onClose}
              className="bg-[#344438] hover:bg-[#465B4C] text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              {t('إغلاق', 'Close')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
