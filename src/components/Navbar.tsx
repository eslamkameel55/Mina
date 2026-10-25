import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { SiteSettings } from '../types/index.ts';
import { Menu, X, Phone, Calendar, Globe, Shield, ExternalLink } from 'lucide-react';

interface NavbarProps {
  settings: SiteSettings;
  activeView: 'home' | 'menu' | 'admin';
  setActiveView: (view: 'home' | 'menu' | 'admin') => void;
  onOpenReservation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeView,
  setActiveView,
  onOpenReservation
}) => {
  const { language, toggleLanguage, t, isRtl } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: t('الرئيسية', 'Home'), action: () => { setActiveView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { id: 'menu', label: t('قائمة الطعام', 'Menu'), action: () => { setActiveView('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { id: 'about', label: t('عن المطعم', 'About Us'), action: () => { setActiveView('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 50); } },
    { id: 'gallery', label: t('معرض الصور', 'Gallery'), action: () => { setActiveView('home'); setTimeout(() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }), 50); } },
    { id: 'contact', label: t('تواصل معنا', 'Contact'), action: () => { setActiveView('home'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 50); } }
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#344438]/95 backdrop-blur-md shadow-lg py-3 text-white'
          : 'bg-[#344438] text-white py-4 md:py-5 border-b border-[#B69A65]/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo / Brand Name */}
          <div
            onClick={() => { setActiveView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="cursor-pointer flex flex-col items-start select-none group"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-serif-luxury text-2xl md:text-3xl font-bold tracking-wider text-[#B69A65] group-hover:text-white transition-colors">
                {settings.name_en}
              </span>
              <span className="text-sm md:text-base font-semibold text-[#F7F3EC]/90 font-cairo">
                {settings.name_ar}
              </span>
            </div>
            <span className="text-[10px] md:text-xs text-[#B69A65]/80 tracking-widest uppercase">
              {t('فندق تلال الرياض', 'Tilal Riyadh Hotel')}
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={link.action}
                className={`transition-colors duration-200 cursor-pointer hover:text-[#B69A65] relative py-1 ${
                  activeView === link.id
                    ? 'text-[#B69A65] font-semibold after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-[#B69A65]'
                    : 'text-[#F7F3EC]/80'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#B69A65]/40 text-xs font-medium text-[#F7F3EC] hover:bg-[#B69A65]/20 hover:border-[#B69A65] transition-all cursor-pointer"
              title={t('تغيير اللغة', 'Switch Language')}
            >
              <Globe className="w-3.5 h-3.5 text-[#B69A65]" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Quick Call */}
            <a
              href={`tel:${settings.phone.replace(/\s+/g, '')}`}
              className="p-2 rounded border border-[#B69A65]/30 text-[#F7F3EC] hover:bg-[#B69A65]/20 transition-all cursor-pointer"
              title={t('اتصل بالمطعم', 'Call Restaurant')}
            >
              <Phone className="w-4 h-4 text-[#B69A65]" />
            </a>

            {/* Reservation Button */}
            {settings.reservations_enabled && (
              <button
                onClick={onOpenReservation}
                className="flex items-center gap-2 bg-[#B69A65] hover:bg-[#CFB888] text-[#1A1D1A] font-semibold px-4 py-2 rounded text-xs md:text-sm transition-all duration-200 shadow-sm cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{t('احجز طاولتك', 'Reserve Table')}</span>
              </button>
            )}

            {/* Admin Access Indicator / Link */}
            <button
              onClick={() => setActiveView('admin')}
              className={`p-2 rounded border transition-all cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-[#B69A65] text-[#1A1D1A] border-[#B69A65]'
                  : isAuthenticated
                  ? 'border-emerald-500/50 text-emerald-300 hover:bg-emerald-950/40'
                  : 'border-[#B69A65]/20 text-[#F7F3EC]/50 hover:text-white hover:border-[#B69A65]/50'
              }`}
              title={isAuthenticated ? t('لوحة التحكم (مسجل)', 'Admin Dashboard (Logged in)') : t('دخول الإدارة', 'Admin Portal')}
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-1.5 rounded border border-[#B69A65]/40 text-xs text-[#F7F3EC]"
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded text-[#F7F3EC] hover:bg-[#B69A65]/20"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#243027] border-b border-[#B69A65]/20 px-5 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-3 pt-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  link.action();
                  setMobileMenuOpen(false);
                }}
                className={`text-start py-2 px-2 text-base font-medium rounded transition-colors ${
                  activeView === link.id
                    ? 'text-[#B69A65] bg-[#344438]'
                    : 'text-[#F7F3EC]/90 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#B69A65]/20 flex flex-col gap-3">
            {settings.reservations_enabled && (
              <button
                onClick={() => {
                  onOpenReservation();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#B69A65] text-[#1A1D1A] font-semibold py-2.5 rounded text-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>{t('احجز طاولتك', 'Reserve Table')}</span>
              </button>
            )}

            <div className="flex items-center justify-between pt-1">
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-2 text-xs text-[#B69A65] hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{settings.phone}</span>
              </a>

              <button
                onClick={() => {
                  setActiveView('admin');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs text-[#F7F3EC]/70 hover:text-white"
              >
                <Shield className="w-3.5 h-3.5 text-[#B69A65]" />
                <span>{t('لوحة الإدارة', 'Admin Portal')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
