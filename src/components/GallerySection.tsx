import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { GalleryItem } from '../types/index.ts';
import { X, ChevronLeft, ChevronRight, Maximize2, Image as ImageIcon } from 'lucide-react';

interface GallerySectionProps {
  items: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ items }) => {
  const { t, isRtl } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = [
    { id: 'all', label: t('الكل', 'All') },
    { id: 'ambiance', label: t('الأجواء المعمارية', 'Ambiance') },
    { id: 'dining', label: t('تنسيق الطاولات', 'Dining Space') },
    { id: 'dishes', label: t('تقديم الأطباق', 'Presentations') }
  ];

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory);

  // Handle lightbox keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        if (isRtl) handlePrev();
        else handleNext();
      }
      if (e.key === 'ArrowLeft') {
        if (isRtl) handleNext();
        else handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, isRtl, filteredItems.length]);

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
  };

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
  };

  return (
    <section id="gallery" className="py-20 md:py-28 bg-[#F7F3EC] text-[#242424]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#B69A65] font-semibold block mb-2">
            {t('المعرض البصري', 'Visual Gallery')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#344438] mb-4">
            {t('لمحات من فخامة المكان والضيافة', 'Glimpses of Splendor & Hospitality')}
          </h2>
          <p className="text-sm sm:text-base text-[#604B3C]">
            {t(
              'استكشف روعة الأجواء وتنسيق الجلسات داخل مطعم مينا في فندق تلال الرياض.',
              'Explore the atmosphere and graceful dining settings at MeNa Restaurant in Tilal Riyadh Hotel.'
            )}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#344438] text-white shadow-xs'
                  : 'bg-white/80 text-[#604B3C] border border-[#B69A65]/20 hover:bg-white hover:text-[#344438]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-[#604B3C]">
            <ImageIcon className="w-8 h-8 text-[#B69A65] mx-auto mb-2" />
            <p className="text-sm">{t('لا توجد صور في هذا القسم حالياً', 'No photos in this section currently')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(index)}
                className="group relative rounded-xl overflow-hidden aspect-4/3 bg-slate-200 cursor-pointer shadow-xs border border-[#B69A65]/20 hover:shadow-md transition-all duration-300"
              >
                <img
                  src={item.image_url}
                  alt={t(item.alt_ar, item.alt_en)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[#344438]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold">{t(item.title_ar, item.title_en)}</h4>
                      <p className="text-xs text-[#B69A65]">{t(item.alt_ar, item.alt_en)}</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-full backdrop-blur-xs">
                      <Maximize2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
            className="absolute top-5 end-5 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev / Next Buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute start-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors z-50 cursor-pointer"
            aria-label="Previous image"
          >
            {isRtl ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute end-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors z-50 cursor-pointer"
            aria-label="Next image"
          >
            {isRtl ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
          </button>

          {/* Image Container */}
          <div
            className="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredItems[lightboxIndex].image_url}
              alt={t(filteredItems[lightboxIndex].alt_ar, filteredItems[lightboxIndex].alt_en)}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            
            <div className="mt-4 text-center text-white max-w-xl">
              <h3 className="text-lg font-bold text-[#F7F3EC]">
                {t(filteredItems[lightboxIndex].title_ar, filteredItems[lightboxIndex].title_en)}
              </h3>
              <p className="text-xs text-[#B69A65] mt-1">
                {t(filteredItems[lightboxIndex].alt_ar, filteredItems[lightboxIndex].alt_en)}
              </p>
              <span className="text-[11px] text-white/50 mt-2 block">
                {lightboxIndex + 1} / {filteredItems.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
