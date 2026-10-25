import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Dish, Category, SiteSettings } from '../types/index.ts';
import { Search, Filter, Sparkles, Check, AlertCircle, Utensils, ArrowLeft, ArrowRight } from 'lucide-react';

interface MenuPageProps {
  dishes: Dish[];
  categories: Category[];
  settings: SiteSettings;
  onSelectDish: (dish: Dish) => void;
  onBackToHome: () => void;
  onOpenReservation: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  dishes,
  categories,
  settings,
  onSelectDish,
  onBackToHome,
  onOpenReservation
}) => {
  const { t, isRtl } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  // Filter dishes
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      // Must be published for public menu
      if (!dish.is_published) return false;

      // Filter by availability if toggled
      if (onlyAvailable && !dish.is_available) return false;

      // Filter by category
      if (selectedCategoryId !== 'all' && dish.category_id !== selectedCategoryId) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchAr = dish.name_ar.toLowerCase().includes(query) || dish.description_ar.toLowerCase().includes(query);
        const matchEn = dish.name_en.toLowerCase().includes(query) || dish.description_en.toLowerCase().includes(query);
        if (!matchAr && !matchEn) return false;
      }

      return true;
    });
  }, [dishes, selectedCategoryId, onlyAvailable, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F7F3EC] text-[#242424] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb & Back */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#344438] hover:text-[#B69A65] transition-colors cursor-pointer"
          >
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{t('العودة إلى الصفحة الرئيسية', 'Back to Home')}</span>
          </button>

          {settings.reservations_enabled && (
            <button
              onClick={onOpenReservation}
              className="bg-[#B69A65] hover:bg-[#CFB888] text-[#1A1D1A] text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              {t('احجز طاولتك الآن', 'Reserve Table')}
            </button>
          )}
        </div>

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-[#B69A65] font-semibold block mb-2">
            {t('قائمة المأكولات الشامية', 'Levantine Dining Menu')}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#344438] mb-3">
            {t('قائمة طعام مطعم مينا', 'MeNa Restaurant Menu')}
          </h1>
          <p className="text-xs sm:text-sm text-[#604B3C] leading-relaxed">
            {t(
              'أطباق محضرة بأصالة التقاليد الشامية ومكونات فاخرة معتمدة من إدارة الفندق.',
              'Dishes crafted with authentic Levantine culinary artistry and prime ingredients.'
            )}
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-[#B69A65]/20 mb-10 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('ابحث عن اسم طبق أو مكون...', 'Search dish name or ingredient...')}
                className="w-full bg-[#F7F3EC]/50 border border-[#B69A65]/30 rounded-xl ps-10 pe-4 py-2.5 text-sm text-[#344438] focus:outline-none focus:border-[#344438] focus:bg-white"
              />
              <Search className="w-4 h-4 text-[#B69A65] absolute start-3.5 top-3.5 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute end-3 top-3 text-xs text-[#604B3C] hover:text-[#344438]"
                >
                  {t('مسح', 'Clear')}
                </button>
              )}
            </div>

            {/* Availability Filter Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm font-medium text-[#344438] self-start md:self-center">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="rounded text-[#344438] focus:ring-[#344438] w-4 h-4 cursor-pointer"
              />
              <span>{t('عرض الأطباق المتاحة فقط اليوم', 'Show available dishes only')}</span>
            </label>

          </div>

          {/* Dynamic Category Tabs */}
          <div className="pt-2 border-t border-[#B69A65]/15 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategoryId === 'all'
                  ? 'bg-[#344438] text-white shadow-xs'
                  : 'bg-[#F7F3EC] text-[#604B3C] hover:bg-[#EFE8DD] hover:text-[#344438]'
              }`}
            >
              {t('جميع الأطباق', 'All Dishes')} ({dishes.filter(d => d.is_published).length})
            </button>

            {categories.map((cat) => {
              const count = dishes.filter(d => d.is_published && d.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategoryId === cat.id
                      ? 'bg-[#344438] text-white shadow-xs'
                      : 'bg-[#F7F3EC] text-[#604B3C] hover:bg-[#EFE8DD] hover:text-[#344438]'
                  }`}
                >
                  {t(cat.name_ar, cat.name_en)} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

        </div>

        {/* Dishes Grid */}
        {filteredDishes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#B69A65]/20 max-w-lg mx-auto">
            <Utensils className="w-12 h-12 text-[#B69A65] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-[#344438] mb-1">
              {t('لم نجد أطباقاً تطابق معايير البحث', 'No dishes found matching your criteria')}
            </h3>
            <p className="text-xs text-[#604B3C] mb-4">
              {t('جرب البحث بكلمة أخرى أو قم بإلغاء التصفية لتصفح كامل القائمة.', 'Try adjusting your search terms or reset the filters.')}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId('all');
                setOnlyAvailable(false);
              }}
              className="bg-[#344438] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#465B4C] transition-colors"
            >
              {t('إعادة ضبط الفلاتر', 'Reset Filters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                onClick={() => onSelectDish(dish)}
                className="group bg-white rounded-xl overflow-hidden border border-[#B69A65]/20 shadow-xs hover:shadow-md hover:border-[#B69A65]/60 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={dish.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'}
                    alt={t(dish.name_ar, dish.name_en)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  
                  {dish.is_featured && (
                    <div className="absolute top-3 start-3 bg-[#344438]/90 text-[#F7F3EC] text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1 border border-[#B69A65]/30">
                      <Sparkles className="w-3 h-3 text-[#B69A65]" />
                      <span>{t('موصى به', 'Chef Pick')}</span>
                    </div>
                  )}

                  {!dish.is_available && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-white text-xs font-semibold px-3 py-1 bg-black/60 border border-white/20 rounded">
                        {t('غير متاح اليوم', 'Unavailable Today')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B69A65] block mb-1">
                      {t(dish.category_name_ar || '', dish.category_name_en || '')}
                    </span>

                    <h3 className="text-base sm:text-lg font-bold text-[#344438] group-hover:text-[#B69A65] transition-colors mb-1.5">
                      {t(dish.name_ar, dish.name_en)}
                    </h3>

                    <p className="text-xs text-[#604B3C] line-clamp-2 leading-relaxed mb-4">
                      {t(dish.description_ar, dish.description_en)}
                    </p>
                  </div>

                  {/* Price & Allergens footer */}
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
                          {t('السعر حسب الطلب', 'Price on Request')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDish(dish);
                      }}
                      className="text-xs font-semibold text-[#344438] hover:text-[#B69A65] underline"
                    >
                      {t('التفاصيل', 'Details')}
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
