import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { api } from '../services/api.ts';
import { X, Calendar, Clock, Users, Phone, User, Mail, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  phone
}) => {
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('20:00');
  const [guestCount, setGuestCount] = useState('2');
  const [specialRequests, setSpecialRequests] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ id: string; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !guestPhone.trim() || !date || !time) {
      setError(t('يرجى ملء جميع الحقول المطلوبة', 'Please complete all required fields'));
      return;
    }

    if (!acceptedPrivacy) {
      setError(t('يرجى الموافقة على شروط الحجز وسياسة الخصوصية', 'Please agree to booking terms and privacy policy'));
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitReservation({
        name: name.trim(),
        phone: guestPhone.trim(),
        email: email.trim() || undefined,
        date,
        time,
        guest_count: Number(guestCount) || 2,
        special_requests: specialRequests.trim() || undefined
      });

      setSuccessData({
        id: res.reservation.id,
        message: res.message
      });
    } catch (err: any) {
      setError(err.message || t('حدث خطأ أثناء إرسال الطلب', 'An error occurred while submitting'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setName('');
    setGuestPhone('');
    setEmail('');
    setSpecialRequests('');
    onClose();
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleReset}
    >
      <div
        className="bg-[#FCFAF6] border border-[#B69A65]/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#344438] text-white px-6 py-5 flex items-center justify-between border-b border-[#B69A65]/20">
          <div>
            <h3 className="text-xl font-bold text-[#F7F3EC] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#B69A65]" />
              <span>{t('طلب حجز طاولة', 'Reserve a Table')}</span>
            </h3>
            <p className="text-xs text-[#B69A65]">
              {t('مطعم مينا · فندق تلال الرياض', 'MeNa Restaurant · Tilal Riyadh Hotel')}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successData ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-[#344438]">
                {t('تم تسجيل طلب الحجز بنجاح', 'Reservation Request Received')}
              </h4>
              <p className="text-sm text-[#604B3C] leading-relaxed max-w-md mx-auto">
                {successData.message}
              </p>
              <div className="bg-[#F7F3EC] p-3 rounded-lg border border-[#B69A65]/20 text-xs text-[#604B3C]">
                <span>{t('رقم المرجع:', 'Reference ID:')} </span>
                <strong className="text-[#344438] font-mono">{successData.id}</strong>
              </div>
              <p className="text-xs text-[#604B3C]/75">
                {t('لأي تعديل عاجل، يرجى الاتصال المباشر على:', 'For immediate updates, contact us at:')}{' '}
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="font-bold text-[#344438] underline">
                  {phone}
                </a>
              </p>
              <div className="pt-4">
                <button
                  onClick={handleReset}
                  className="bg-[#344438] hover:bg-[#465B4C] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  {t('إغلاق', 'Close')}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Guest Name */}
              <div>
                <label className="block text-xs font-bold text-[#344438] mb-1">
                  {t('الاسم الكريم *', 'Full Name *')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('مثال: محمد بن فهد', 'e.g. John Doe')}
                    className="w-full bg-white border border-[#B69A65]/30 rounded-lg px-3.5 py-2.5 text-sm text-[#344438] focus:outline-none focus:border-[#344438] focus:ring-1 focus:ring-[#344438]"
                  />
                  <User className="w-4 h-4 text-[#B69A65] absolute end-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#344438] mb-1">
                    {t('رقم الهاتف للتأكيد *', 'Phone Number *')}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+966 5X XXX XXXX"
                      className="w-full bg-white border border-[#B69A65]/30 rounded-lg px-3.5 py-2.5 text-sm text-[#344438] focus:outline-none focus:border-[#344438] focus:ring-1 focus:ring-[#344438] dir-ltr text-start"
                    />
                    <Phone className="w-4 h-4 text-[#B69A65] absolute end-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344438] mb-1">
                    {t('البريد الإلكتروني (اختياري)', 'Email (Optional)')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-white border border-[#B69A65]/30 rounded-lg px-3.5 py-2.5 text-sm text-[#344438] focus:outline-none focus:border-[#344438] focus:ring-1 focus:ring-[#344438]"
                    />
                    <Mail className="w-4 h-4 text-[#B69A65] absolute end-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Date, Time, Guests */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#344438] mb-1">
                    {t('التاريخ *', 'Date *')}
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-[#B69A65]/30 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-[#344438] focus:outline-none focus:border-[#344438]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344438] mb-1">
                    {t('الوقت *', 'Time *')}
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white border border-[#B69A65]/30 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-[#344438] focus:outline-none focus:border-[#344438]"
                  >
                    <option value="13:00">1:00 PM (الغداء)</option>
                    <option value="14:00">2:00 PM (الغداء)</option>
                    <option value="15:00">3:00 PM (الغداء)</option>
                    <option value="18:30">6:30 PM (المساء)</option>
                    <option value="19:30">7:30 PM (العشاء)</option>
                    <option value="20:30">8:30 PM (العشاء)</option>
                    <option value="21:30">9:30 PM (العشاء)</option>
                    <option value="22:30">10:30 PM (العشاء)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344438] mb-1">
                    {t('عدد الضيوف *', 'Guests *')}
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full bg-white border border-[#B69A65]/30 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-[#344438] focus:outline-none focus:border-[#344438]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? t('شخص', 'Guest') : t('أشخاص', 'Guests')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-bold text-[#344438] mb-1">
                  {t('ملاحظات أو مناسبة خاصة (اختياري)', 'Special Requests or Occasion (Optional)')}
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder={t('جلسة عائلية خاصة، كرسي طفل، حساسية معينة...', 'Family table, high chair, allergy notes...')}
                  className="w-full bg-white border border-[#B69A65]/30 rounded-lg px-3.5 py-2 text-sm text-[#344438] focus:outline-none focus:border-[#344438]"
                />
              </div>

              {/* Terms check */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="privacy-check"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-1 rounded text-[#344438] focus:ring-[#344438]"
                />
                <label htmlFor="privacy-check" className="text-xs text-[#604B3C] leading-tight select-none">
                  {t(
                    'أوافق على استخدام بيانات التواصل لتأكيد الحجز والتواصل معي من قبل فندق تلال الرياض.',
                    'I agree to be contacted by Tilal Riyadh Hotel team to confirm my booking details.'
                  )}
                </label>
              </div>

              {/* Action buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#B69A65]/20">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#604B3C] hover:text-[#344438]"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#B69A65] hover:bg-[#CFB888] text-[#1A1D1A] font-bold px-6 py-2.5 rounded-lg text-xs sm:text-sm transition-colors shadow-xs disabled:opacity-50"
                >
                  {loading ? t('جاري الإرسال...', 'Submitting...') : t('تأكيد طلب الحجز', 'Submit Reservation')}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
