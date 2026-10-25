import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { SiteSettings } from '../types/index.ts';
import { MapPin, Phone, Mail, Navigation, Copy, Check, ExternalLink, Clock } from 'lucide-react';

interface LocationContactProps {
  settings: SiteSettings;
}

export const LocationContact: React.FC<LocationContactProps> = ({ settings }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    const addr = t(settings.address_ar, settings.address_en);
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${settings.coordinates.lat},${settings.coordinates.lng}`;

  return (
    <section id="contact" className="py-20 bg-white text-[#242424] border-t border-[#B69A65]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-[#B69A65] font-semibold block mb-2">
            {t('الموقع والتواصل', 'Location & Inquiries')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#344438] mb-4">
            {t('نسعد باستقبالكم في تلال الرياض', 'We Look Forward to Welcoming You')}
          </h2>
          <p className="text-sm sm:text-base text-[#604B3C]">
            {t(
              'تفضلوا بزيارتنا في فندق تلال الرياض على الطريق الدائري الشرقي الفرعي، أو تواصلوا معنا مباشرة لأي استفسار.',
              'Visit us inside Tilal Riyadh Hotel on Eastern Ring Branch Road, or reach out directly for reservations.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-[#F7F3EC] p-6 sm:p-8 rounded-2xl border border-[#B69A65]/20 flex flex-col justify-between space-y-6">
            
            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#344438] text-[#B69A65] rounded-xl shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[#344438] mb-1">
                  {t('العنوان', 'Address')}
                </h4>
                <p className="text-xs sm:text-sm text-[#604B3C] leading-relaxed mb-3">
                  {t(settings.address_ar, settings.address_en)}
                </p>
                <button
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#344438] hover:text-[#B69A65] transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t('تم نسخ العنوان بنجاح!', 'Address Copied!') : t('نسخ العنوان', 'Copy Address')}</span>
                </button>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#344438] text-[#B69A65] rounded-xl shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#344438] mb-1">
                  {t('الهاتف والحجوزات', 'Phone & Inquiries')}
                </h4>
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="text-sm sm:text-base font-semibold text-[#344438] hover:text-[#B69A65] transition-colors block dir-ltr"
                >
                  {settings.phone}
                </a>
                <span className="text-xs text-[#604B3C]/80 block mt-0.5">
                  {t('متاح للمكالمات والاستفسار المباشر', 'Direct inquiries & phone assistance')}
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#344438] text-[#B69A65] rounded-xl shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#344438] mb-1">
                  {t('البريد الإلكتروني المعتمد', 'Official Bookings Email')}
                </h4>
                <a
                  href={`mailto:${settings.email}`}
                  className="text-xs sm:text-sm font-medium text-[#344438] hover:text-[#B69A65] transition-colors break-all"
                >
                  {settings.email}
                </a>
              </div>
            </div>

            {/* Service & Reservation Note */}
            <div className="flex items-start gap-4 pt-4 border-t border-[#B69A65]/20">
              <div className="p-3 bg-[#344438]/10 text-[#344438] rounded-xl shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#344438] mb-1">
                  {t('ساعات الخدمة والزيارة', 'Hours & Dining Notice')}
                </h4>
                <p className="text-xs text-[#604B3C] leading-relaxed">
                  {t(settings.working_hours_ar, settings.working_hours_en)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 bg-[#344438] text-white hover:bg-[#465B4C] text-xs sm:text-sm font-semibold py-3 px-4 rounded-lg transition-colors shadow-xs"
              >
                <Navigation className="w-4 h-4 text-[#B69A65]" />
                <span>{t('احصل على الاتجاهات', 'Get Directions')}</span>
              </a>

              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center gap-2 bg-[#B69A65] text-[#1A1D1A] hover:bg-[#CFB888] text-xs sm:text-sm font-semibold py-3 px-4 rounded-lg transition-colors shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>{t('اتصل الآن', 'Call Now')}</span>
              </a>
            </div>

            {/* Official Hotel Link */}
            <div className="pt-2 text-center border-t border-[#B69A65]/20">
              <a
                href={settings.hotel_website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#604B3C] hover:text-[#344438] font-medium"
              >
                <span>{t('زيارة الموقع الرسمي لفندق تلال الرياض', 'Visit official Tilal Riyadh Hotel website')}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#B69A65]" />
              </a>
            </div>

          </div>

          {/* Interactive Google Map Column */}
          <div className="lg:col-span-7 bg-[#F7F3EC] rounded-2xl overflow-hidden border border-[#B69A65]/20 shadow-xs h-[480px] relative">
            <iframe
              title="MeNa Restaurant Location Google Maps"
              src={`https://maps.google.com/maps?q=${settings.coordinates.lat},${settings.coordinates.lng}&hl=${t('ar', 'en')}&z=16&output=embed`}
              className="w-full h-full border-0"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Map floating banner */}
            <div className="absolute top-4 start-4 bg-white/95 backdrop-blur-xs p-3 rounded-lg shadow-md border border-[#B69A65]/30 max-w-xs">
              <span className="text-xs font-bold text-[#344438] block">
                {t(settings.name_ar, settings.name_en)}
              </span>
              <span className="text-[11px] text-[#604B3C] block">
                {t(settings.hotel_name_ar, settings.hotel_name_en)} · {t('الرياض', 'Riyadh')}
              </span>
              <a
                href={settings.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B69A65] hover:underline mt-1"
              >
                <span>{t('فتح في تطبيق الخرائط', 'Open in Maps App')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
