import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { X, ShieldCheck } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#B69A65]/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#344438] text-white px-6 py-4 flex items-center justify-between border-b border-[#B69A65]/20">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#B69A65]" />
            <h3 className="text-lg font-bold text-[#F7F3EC]">
              {t('سياسة الخصوصية وشروط الاستخدام', 'Privacy Policy & Terms of Service')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs sm:text-sm text-[#344438] leading-relaxed max-h-[70vh] overflow-y-auto">
          <div>
            <h4 className="font-bold text-sm text-[#344438] mb-1">
              {t('1. خصوصية الزوار والعملاء', '1. Privacy of Guests & Visitors')}
            </h4>
            <p className="text-[#604B3C]">
              {t(
                'يلتزم مطعم مينا وفندق تلال الرياض بحماية خصوصية بياناتكم. نجمع فقط البيانات الأساسية الضرورية لتنسيق وتأكيد الحجوزات (الاسم، رقم الهاتف، والبريد الإلكتروني إن وجد).',
                'MeNa Restaurant and Tilal Riyadh Hotel respect and protect your privacy. We strictly collect essential details necessary for scheduling reservations (name, contact phone, and optional email).'
              )}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm text-[#344438] mb-1">
              {t('2. عدم تخزين أي بيانات دفع بنكي', '2. No Financial or Payment Card Storage')}
            </h4>
            <p className="text-[#604B3C]">
              {t(
                'الموقع لا يقوم بجمع أو حفظ أي أرقام بطاقات مصرفية أو بيانات بنكية. دفع الفواتير يتم مباشرة داخل المطعم أو مكتب استقبال الفندق وفق الإجراءات المصرفية المعتمدة في المملكة العربية السعودية.',
                'This website does not store or process payment card numbers or banking data. All dining payments are handled directly at the restaurant or hotel front desk in accordance with standard Saudi banking regulations.'
              )}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm text-[#344438] mb-1">
              {t('3. طلبات الحجز والتأكيد', '3. Reservations & Confirmation Policy')}
            </h4>
            <p className="text-[#604B3C]">
              {t(
                'طلب الحجز عبر الموقع الإلكتروني يعتبر طلباً أولياً حتى يتم التواصل المباشر مع الضيف من قبل فريق الاستقبال لتأكيد توفر الطاولة في الموعد المحدد.',
                'Submitting a reservation request online is considered an initial request until confirmed via direct communication from our reception staff.'
              )}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm text-[#344438] mb-1">
              {t('4. حقوق الملكية الفكرية', '4. Intellectual Property')}
            </h4>
            <p className="text-[#604B3C]">
              {t(
                'جميع الصور والنصوص والهوية البصرية لمطعم مينا وفندق تلال الرياض محمية بحقوق النشر والملكية الفكرية المعمول بها في المملكة العربية السعودية.',
                'All imagery, text, and visual brand elements of MeNa Restaurant and Tilal Riyadh Hotel are protected by applicable copyright and intellectual property laws.'
              )}
            </p>
          </div>
        </div>

        <div className="bg-[#F7F3EC] px-6 py-3 border-t border-[#B69A65]/20 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#344438] text-white px-5 py-2 rounded-lg text-xs font-semibold hover:bg-[#465B4C] transition-colors"
          >
            {t('فهمت ذلك', 'I Understand')}
          </button>
        </div>
      </div>
    </div>
  );
};
