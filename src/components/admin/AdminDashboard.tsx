import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import {
  SiteSettings,
  Dish,
  Category,
  GalleryItem,
  Reservation,
  DashboardStats,
  AuditLog
} from '../../types/index.ts';
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  Image as ImageIcon,
  CalendarCheck,
  Settings,
  ShieldAlert,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Upload,
  Download,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Search,
  Sparkles,
  Phone,
  RefreshCw,
  Clock
} from 'lucide-react';

interface AdminDashboardProps {
  settings: SiteSettings;
  onUpdateSettings: (newSettings: SiteSettings) => void;
  onExitAdmin: () => void;
  onRefreshDishes: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  onUpdateSettings,
  onExitAdmin,
  onRefreshDishes
}) => {
  const { t, isRtl } = useLanguage();
  const { user, token, isAuthenticated, login, logout } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Active admin tab
  const [activeTab, setActiveTab] = useState<'stats' | 'dishes' | 'categories' | 'gallery' | 'reservations' | 'settings' | 'logs' | 'security'>('stats');

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & form states
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Partial<Dish> | null>(null);
  const [dishUploadLoading, setDishUploadLoading] = useState(false);
  const [dishSearch, setDishSearch] = useState('');

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [newGalleryItem, setNewGalleryItem] = useState({
    title_ar: '',
    title_en: '',
    alt_ar: '',
    alt_en: '',
    image_url: '',
    category: 'ambiance' as GalleryItem['category']
  });

  // Settings editing state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load dashboard data when authenticated
  const loadDashboardData = async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const [statsData, allDishes, allCats, allGallery, allReservations, logs] = await Promise.all([
        api.getStats(token),
        api.getDishes(true), // get all dishes including drafts
        api.getCategories(true),
        api.getGallery(),
        api.getReservations(token),
        api.getAuditLogs(token)
      ]);

      setStats(statsData);
      setDishes(allDishes);
      setCategories(allCats);
      setGallery(allGallery);
      setReservations(allReservations);
      setAuditLogs(logs);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const res = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (!res.success) {
      setLoginError(res.error || t('فشل تسجيل الدخول', 'Login failed'));
    }
  };

  // Dish CRUD actions
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingDish) return;

    try {
      if (editingDish.id) {
        // Update existing
        await api.updateDish(editingDish.id, editingDish, token);
        showToast(t('تم تحديث بيانات الطبق بنجاح', 'Dish updated successfully'));
      } else {
        // Create new
        await api.createDish(editingDish, token);
        showToast(t('تمت إضافة الطبق الجديد بنجاح', 'Dish added successfully'));
      }
      setDishModalOpen(false);
      setEditingDish(null);
      await loadDashboardData();
      onRefreshDishes();
    } catch (err: any) {
      alert(err.message || t('حدث خطأ أثناء حفظ الطبق', 'Failed to save dish'));
    }
  };

  const handleDeleteDish = async (dish: Dish) => {
    if (!token) return;
    const confirmMsg = t(
      `هل أنت متأكد من حذف طبق "${dish.name_ar}" نهائياً؟`,
      `Are you sure you want to permanently delete "${dish.name_en}"?`
    );
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.deleteDish(dish.id, token);
      showToast(t('تم حذف الطبق', 'Dish deleted'));
      await loadDashboardData();
      onRefreshDishes();
    } catch (err: any) {
      alert(err.message || t('فشل حذف الطبق', 'Failed to delete dish'));
    }
  };

  const handleToggleDishStatus = async (dish: Dish, field: 'is_available' | 'is_published' | 'is_featured') => {
    if (!token) return;
    try {
      const updates = { [field]: !dish[field] };
      await api.updateDishStatus(dish.id, updates, token);
      showToast(t('تم تحديث الحالة', 'Status updated'));
      await loadDashboardData();
      onRefreshDishes();
    } catch (err: any) {
      alert(err.message || t('فشل تحديث الحالة', 'Failed to update status'));
    }
  };

  const handleDishImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!token || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setDishUploadLoading(true);
    try {
      const res = await api.uploadImage(file, token);
      setEditingDish(prev => ({
        ...prev,
        image_url: res.url
      }));
      showToast(t('تم رفع الصورة بنجاح', 'Image uploaded successfully'));
    } catch (err: any) {
      alert(err.message || t('فشل رفع الصورة', 'Failed to upload image'));
    } finally {
      setDishUploadLoading(false);
    }
  };

  // Category CRUD actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingCategory) return;

    try {
      if (editingCategory.id) {
        await api.updateCategory(editingCategory.id, editingCategory, token);
        showToast(t('تم تحديث التصنيف', 'Category updated'));
      } else {
        await api.createCategory(editingCategory, token);
        showToast(t('تمت إضافة التصنيف', 'Category created'));
      }
      setCategoryModalOpen(false);
      setEditingCategory(null);
      await loadDashboardData();
      onRefreshDishes();
    } catch (err: any) {
      alert(err.message || t('فشل حفظ التصنيف', 'Failed to save category'));
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!token) return;
    const confirmMsg = t(
      `هل أنت متأكد من حذف التصنيف "${cat.name_ar}"؟`,
      `Are you sure you want to delete category "${cat.name_en}"?`
    );
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.deleteCategory(cat.id, token, false);
      showToast(t('تم حذف التصنيف', 'Category deleted'));
      await loadDashboardData();
    } catch (err: any) {
      if (window.confirm(`${err.message} ${t('هل تريد تأكيد الحذف الإجباري؟', 'Do you want to force delete?')}`)) {
        try {
          await api.deleteCategory(cat.id, token, true);
          showToast(t('تم حذف التصنيف', 'Category deleted'));
          await loadDashboardData();
        } catch (innerErr: any) {
          alert(innerErr.message);
        }
      }
    }
  };

  // Gallery actions
  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!newGalleryItem.title_ar || !newGalleryItem.image_url) {
      alert(t('يرجى إدخال عنوان ورابط الصورة', 'Please provide title and image URL'));
      return;
    }

    try {
      await api.addGalleryItem(newGalleryItem, token);
      showToast(t('تمت إضافة الصورة للمعرض', 'Image added to gallery'));
      setGalleryModalOpen(false);
      setNewGalleryItem({
        title_ar: '',
        title_en: '',
        alt_ar: '',
        alt_en: '',
        image_url: '',
        category: 'ambiance'
      });
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message || t('فشل إضافة الصورة', 'Failed to add image'));
    }
  };

  const handleDeleteGallery = async (item: GalleryItem) => {
    if (!token) return;
    if (!window.confirm(t('حذف هذه الصورة من المعرض؟', 'Delete this image from gallery?'))) return;
    try {
      await api.deleteGalleryItem(item.id, token);
      showToast(t('تم حذف الصورة', 'Image deleted'));
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message || t('فشل حذف الصورة', 'Failed to delete image'));
    }
  };

  // Reservation Status
  const handleUpdateReservation = async (res: Reservation, newStatus: Reservation['status']) => {
    if (!token) return;
    try {
      await api.updateReservationStatus(res.id, newStatus, res.internal_notes, token);
      showToast(t('تم تحديث حالة الحجز', 'Reservation status updated'));
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message || t('فشل تحديث الحجز', 'Failed to update reservation'));
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const updated = await api.updateSettings(settingsForm, token);
      onUpdateSettings(updated);
      showToast(t('تم حفظ إعدادات وبيانات الموقع بنجاح', 'Site settings saved successfully'));
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message || t('فشل حفظ الإعدادات', 'Failed to save settings'));
    }
  };

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setPasswordMsg(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordMsg({ text: data.error || 'فشل التغيير', isError: true });
      } else {
        setPasswordMsg({ text: t('تم تغيير كلمة المرور بنجاح!', 'Password changed successfully!'), isError: false });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch {
      setPasswordMsg({ text: t('خطأ في الاتصال بالخادم', 'Connection error'), isError: true });
    }
  };

  // Download DB Backup
  const handleDownloadBackup = () => {
    if (!token) return;
    window.open('/api/backup', '_blank');
  };

  // -------------------------------------------------------------
  // Render Unauthenticated Login Screen
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1F2421] text-[#F7F3EC] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-[#243027] border border-[#B69A65]/30 rounded-2xl p-8 shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#344438] text-[#B69A65] border border-[#B69A65]/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-[#F7F3EC]">
              {t('لوحة تحكم إدارة مطعم مينا', 'MeNa Admin Management')}
            </h2>
            <p className="text-xs text-[#B69A65] mt-1">
              {t('فندق تلال الرياض · نظام الإدارة المعتمد', 'Tilal Riyadh Hotel · Certified Portal')}
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-3 bg-red-950/80 border border-red-500/50 text-red-200 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#F7F3EC]/80 mb-1">
                {t('البريد الإلكتروني للإدارة', 'Admin Email')}
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@tilalhotels.com"
                className="w-full bg-[#1A221B] border border-[#B69A65]/30 rounded-lg px-3.5 py-2.5 text-sm text-[#F7F3EC] focus:outline-none focus:border-[#B69A65]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F7F3EC]/80 mb-1">
                {t('كلمة المرور', 'Password')}
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1A221B] border border-[#B69A65]/30 rounded-lg px-3.5 py-2.5 text-sm text-[#F7F3EC] focus:outline-none focus:border-[#B69A65]"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#B69A65] hover:bg-[#CFB888] text-[#1A1D1A] font-bold py-3 rounded-lg text-sm transition-colors mt-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? t('جاري التحقق...', 'Verifying...') : t('تسجيل الدخول إلى الإدارة', 'Sign In to Dashboard')}
            </button>
          </form>

          {/* Seed credentials notice for demonstration and testing */}
          <div className="mt-6 p-3 bg-[#1A221B] rounded-lg border border-[#B69A65]/20 text-[11px] text-[#F7F3EC]/70 space-y-1">
            <span className="font-bold text-[#B69A65] block">{t('بيانات الدخول الأولية المعتمدة:', 'Initial Admin Credentials:')}</span>
            <div>{t('البريد:', 'Email:')} <code className="text-[#F7F3EC] font-mono">admin@tilalhotels.com</code></div>
            <div>{t('كلمة المرور:', 'Password:')} <code className="text-[#F7F3EC] font-mono">TilalMena@2026</code></div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onExitAdmin}
              className="text-xs text-[#B69A65] hover:underline"
            >
              {t('← العودة إلى الموقع الرئيسي', '← Return to Main Website')}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render Authenticated Dashboard
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F0EDE6] text-[#242424] flex flex-col">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 end-6 z-50 bg-[#344438] text-white px-5 py-3 rounded-xl shadow-xl border border-[#B69A65] flex items-center gap-2 text-sm animate-in fade-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 text-[#B69A65]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="bg-[#243027] text-white border-b border-[#B69A65]/30 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="font-serif-luxury font-bold text-lg text-[#B69A65]">
                {settings.name_en}
              </span>
              <span className="text-xs text-[#F7F3EC]/80 font-cairo">
                {t('لوحة الإدارة', 'Admin Console')}
              </span>
            </div>
            <span className="hidden sm:inline-block text-[11px] bg-[#344438] px-2.5 py-0.5 rounded text-[#B69A65] border border-[#B69A65]/30">
              {user?.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={dataLoading}
              className="p-2 rounded hover:bg-white/10 text-[#F7F3EC] transition-colors cursor-pointer"
              title={t('تحديث البيانات', 'Refresh Data')}
            >
              <RefreshCw className={`w-4 h-4 text-[#B69A65] ${dataLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-[#B69A65]/40 text-[#F7F3EC] hover:bg-white/10 transition-colors"
            >
              <span>{t('معاينة الموقع العام', 'View Public Site')}</span>
              {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5 text-[#B69A65]" />}
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded bg-red-950/60 text-red-200 border border-red-500/40 hover:bg-red-900 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('تسجيل الخروج', 'Logout')}</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto scrollbar-none py-1 border-t border-[#B69A65]/15 text-xs">
          {[
            { id: 'stats', label: t('الإحصائيات العامة', 'Overview'), icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
            { id: 'dishes', label: t('إدارة الأطباق', 'Dishes'), icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
            { id: 'categories', label: t('إدارة التصنيفات', 'Categories'), icon: <FolderTree className="w-3.5 h-3.5" /> },
            { id: 'gallery', label: t('مكتبة الصور', 'Gallery'), icon: <ImageIcon className="w-3.5 h-3.5" /> },
            { id: 'reservations', label: t('الحجوزات', 'Reservations'), icon: <CalendarCheck className="w-3.5 h-3.5" /> },
            { id: 'settings', label: t('بيانات وإعدادات الموقع', 'Site Settings'), icon: <Settings className="w-3.5 h-3.5" /> },
            { id: 'logs', label: t('سجل العمليات والنسخ', 'Audit & Backup'), icon: <Clock className="w-3.5 h-3.5" /> },
            { id: 'security', label: t('الأمان وكلمة المرور', 'Security'), icon: <KeyRound className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-md font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#F0EDE6] text-[#344438]'
                  : 'text-[#F7F3EC]/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* =====================================================================
            TAB 1: STATS OVERVIEW
        ===================================================================== */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#344438]">
                  {t('لوحة المؤشرات والإحصائيات الحقيقية', 'Operational Overview')}
                </h1>
                <p className="text-xs text-[#604B3C]">
                  {t('بيانات دقيقة ومحدثة مباشرة من قاعدة بيانات مطعم مينا في فندق تلال الرياض.', 'Real-time metrics from MeNa database.')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingDish({
                      name_ar: '',
                      name_en: '',
                      description_ar: '',
                      description_en: '',
                      price: 0,
                      currency: 'SAR',
                      category_id: categories[0]?.id || '',
                      image_url: '',
                      allergens: [],
                      is_available: true,
                      is_published: true,
                      is_featured: false,
                      sort_order: (dishes.length + 1)
                    });
                    setDishModalOpen(true);
                  }}
                  className="bg-[#B69A65] hover:bg-[#CFB888] text-[#1A1D1A] text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('إضافة طبق جديد', 'Add New Dish')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className="bg-[#344438] hover:bg-[#465B4C] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Settings className="w-4 h-4 text-[#B69A65]" />
                  <span>{t('تعديل بيانات الموقع', 'Edit Site Info')}</span>
                </button>
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-[#B69A65]/20 shadow-xs">
                <span className="text-xs font-medium text-[#604B3C] block mb-1">
                  {t('إجمالي الأطباق المسجلة', 'Total Dishes')}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#344438]">
                  {stats?.total_dishes || dishes.length}
                </span>
                <span className="text-[11px] text-[#604B3C]/70 block mt-1">
                  {stats?.published_dishes || dishes.filter(d => d.is_published).length} {t('منشور للزوار', 'published')}
                </span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#B69A65]/20 shadow-xs">
                <span className="text-xs font-medium text-[#604B3C] block mb-1">
                  {t('أطباق مسودة (غير منشورة)', 'Draft / Hidden Dishes')}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-700">
                  {stats?.draft_dishes || dishes.filter(d => !d.is_published).length}
                </span>
                <span className="text-[11px] text-[#604B3C]/70 block mt-1">
                  {t('محفوظة في الإدارة فقط', 'Saved in dashboard only')}
                </span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#B69A65]/20 shadow-xs">
                <span className="text-xs font-medium text-[#604B3C] block mb-1">
                  {t('أطباق غير متاحة اليوم', 'Currently Unavailable')}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-rose-700">
                  {stats?.unavailable_dishes || dishes.filter(d => !d.is_available).length}
                </span>
                <span className="text-[11px] text-[#604B3C]/70 block mt-1">
                  {t('نفدت أو خارج الموسم', 'Out of stock today')}
                </span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#B69A65]/20 shadow-xs">
                <span className="text-xs font-medium text-[#604B3C] block mb-1">
                  {t('طلبات الحجز الجديدة', 'New Reservations')}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                  {stats?.pending_reservations || reservations.filter(r => r.status === 'new').length}
                </span>
                <span className="text-[11px] text-[#604B3C]/70 block mt-1">
                  {t('تحتاج تأكيد فريق الاستقبال', 'Awaiting confirmation')}
                </span>
              </div>
            </div>

            {/* Quick Glance Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Recent Reservations */}
              <div className="bg-white p-6 rounded-xl border border-[#B69A65]/20 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-[#344438] flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-[#B69A65]" />
                    <span>{t('أحدث طلبات الحجز', 'Recent Reservations')}</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('reservations')}
                    className="text-xs text-[#B69A65] font-semibold hover:underline"
                  >
                    {t('عرض الكل', 'View All')}
                  </button>
                </div>

                {reservations.length === 0 ? (
                  <p className="text-xs text-[#604B3C]/70 py-6 text-center">
                    {t('لا توجد طلبات حجز حالياً.', 'No reservations recorded yet.')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {reservations.slice(0, 4).map(res => (
                      <div key={res.id} className="p-3 bg-[#F7F3EC] rounded-lg border border-[#B69A65]/15 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-[#344438] block">{res.name}</strong>
                          <span className="text-[#604B3C]">{res.date} · {res.time} · {res.guest_count} {t('ضيوف', 'guests')}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          res.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          res.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {res.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Audit Activities */}
              <div className="bg-white p-6 rounded-xl border border-[#B69A65]/20 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-[#344438] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#B69A65]" />
                    <span>{t('سجل الإجراءات الإدارية الأخير', 'Recent Administrative Activity')}</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="text-xs text-[#B69A65] font-semibold hover:underline"
                  >
                    {t('عرض السجل الكامل', 'View Logs')}
                  </button>
                </div>

                {auditLogs.length === 0 ? (
                  <p className="text-xs text-[#604B3C]/70 py-6 text-center">
                    {t('لا توجد عمليات مسجلة حتى الآن.', 'No audit activities recorded.')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.slice(0, 4).map(log => (
                      <div key={log.id} className="p-3 bg-[#F7F3EC] rounded-lg border border-[#B69A65]/15 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-[#604B3C] mb-1">
                          <span className="font-semibold text-[#344438]">{log.action}</span>
                          <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[#344438]">{log.details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: DISHES MANAGEMENT (CRUD)
        ===================================================================== */}
        {activeTab === 'dishes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#344438]">
                  {t('إدارة أطباق وقائمة الطعام', 'Menu Dishes Management')}
                </h2>
                <p className="text-xs text-[#604B3C]">
                  {t('إضافة وتعديل وحذف الأطباق، والتحكم في النشر وحالة التوفر والأسعار والصور.', 'Full CRUD control over menu items, photos, and availability.')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={dishSearch}
                    onChange={(e) => setDishSearch(e.target.value)}
                    placeholder={t('بحث باسم الطبق...', 'Search dishes...')}
                    className="bg-white border border-[#B69A65]/30 rounded-lg ps-8 pe-3 py-1.5 text-xs text-[#344438] focus:outline-none focus:border-[#344438]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#B69A65] absolute start-2.5 top-2.5" />
                </div>

                <button
                  onClick={() => {
                    setEditingDish({
                      name_ar: '',
                      name_en: '',
                      description_ar: '',
                      description_en: '',
                      price: 0,
                      currency: 'SAR',
                      category_id: categories[0]?.id || '',
                      image_url: '',
                      ingredients_ar: [],
                      ingredients_en: [],
                      allergens: [],
                      is_available: true,
                      is_published: true,
                      is_featured: false,
                      sort_order: dishes.length + 1
                    });
                    setDishModalOpen(true);
                  }}
                  className="bg-[#B69A65] hover:bg-[#CFB888] text-[#1A1D1A] text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('إضافة طبق جديد', 'Add Dish')}</span>
                </button>
              </div>
            </div>

            {/* Dishes Table */}
            <div className="bg-white rounded-xl border border-[#B69A65]/20 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-[#344438] text-white uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 text-start">{t('الطبق', 'Dish')}</th>
                      <th className="py-3 px-4 text-start">{t('التصنيف', 'Category')}</th>
                      <th className="py-3 px-4 text-start">{t('السعر', 'Price')}</th>
                      <th className="py-3 px-4 text-center">{t('التوفر', 'Availability')}</th>
                      <th className="py-3 px-4 text-center">{t('النشر', 'Status')}</th>
                      <th className="py-3 px-4 text-center">{t('توصية', 'Feature')}</th>
                      <th className="py-3 px-4 text-end">{t('إجراءات', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dishes
                      .filter(d => {
                        if (!dishSearch.trim()) return true;
                        const q = dishSearch.toLowerCase();
                        return d.name_ar.toLowerCase().includes(q) || d.name_en.toLowerCase().includes(q);
                      })
                      .map((dish) => (
                        <tr key={dish.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Dish Image & Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={dish.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=80'}
                                alt=""
                                className="w-12 h-12 object-cover rounded-lg border border-[#B69A65]/20 shrink-0"
                              />
                              <div>
                                <span className="font-bold text-[#344438] block text-sm">
                                  {dish.name_ar}
                                </span>
                                <span className="text-[#604B3C]/80 block text-xs">
                                  {dish.name_en}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4 text-[#604B3C]">
                            {dish.category_name_ar || t('غير محدد', 'Unassigned')}
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 font-bold text-[#344438]">
                            {dish.price > 0 ? `${dish.price} ${dish.currency}` : t('حسب الطلب', 'On Request')}
                          </td>

                          {/* Availability toggle */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleDishStatus(dish, 'is_available')}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                                dish.is_available
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              }`}
                              title={t('اضغط لتبديل حالة التوفر', 'Click to toggle availability')}
                            >
                              {dish.is_available ? t('متاح', 'Available') : t('غير متاح', 'Out')}
                            </button>
                          </td>

                          {/* Published status toggle */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleDishStatus(dish, 'is_published')}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                                dish.is_published
                                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                              title={t('اضغط لتبديل حالة النشر', 'Click to toggle publish status')}
                            >
                              {dish.is_published ? t('منشور', 'Published') : t('مسودة', 'Draft')}
                            </button>
                          </td>

                          {/* Recommendation toggle */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleDishStatus(dish, 'is_featured')}
                              className={`p-1.5 rounded transition-colors ${
                                dish.is_featured
                                  ? 'text-[#B69A65] bg-amber-50'
                                  : 'text-slate-300 hover:text-slate-500'
                              }`}
                              title={t('تمييز كمقترح من الإدارة', 'Feature dish')}
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-end">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingDish({ ...dish });
                                  setDishModalOpen(true);
                                }}
                                className="p-1.5 rounded text-[#344438] hover:bg-slate-100 cursor-pointer"
                                title={t('تعديل', 'Edit')}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDish(dish)}
                                className="p-1.5 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title={t('حذف', 'Delete')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: CATEGORIES MANAGEMENT
        ===================================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#344438]">
                  {t('إدارة تصنيفات قائمة الطعام', 'Menu Categories Management')}
                </h2>
                <p className="text-xs text-[#604B3C]">
                  {t('إضافة، تعديل، وترتيب تصنيفات الأطباق المعتمدة من الإدارة.', 'Create, order, and organize culinary categories.')}
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCategory({
                    name_ar: '',
                    name_en: '',
                    description_ar: '',
                    description_en: '',
                    sort_order: categories.length + 1,
                    is_published: true
                  });
                  setCategoryModalOpen(true);
                }}
                className="bg-[#B69A65] hover:bg-[#CFB888] text-[#1A1D1A] text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{t('إضافة تصنيف جديد', 'Add Category')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const attachedCount = dishes.filter(d => d.category_id === cat.id).length;
                return (
                  <div key={cat.id} className="bg-white p-5 rounded-xl border border-[#B69A65]/20 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-mono bg-[#F7F3EC] px-2 py-0.5 rounded text-[#604B3C]">
                          #{cat.sort_order}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          cat.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {cat.is_published ? t('منشور', 'Active') : t('مسودة', 'Draft')}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-[#344438] mb-1">
                        {cat.name_ar}
                      </h3>
                      <h4 className="text-xs font-semibold text-[#B69A65] mb-2">
                        {cat.name_en}
                      </h4>
                      {cat.description_ar && (
                        <p className="text-xs text-[#604B3C] mb-3 line-clamp-2">
                          {cat.description_ar}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#B69A65]/15 flex items-center justify-between text-xs">
                      <span className="text-[#604B3C]">
                        {attachedCount} {t('أطباق مرتبطة', 'dishes')}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory({ ...cat });
                            setCategoryModalOpen(true);
                          }}
                          className="p-1 text-[#344438] hover:text-[#B69A65]"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1 text-rose-600 hover:text-rose-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: GALLERY MANAGEMENT
        ===================================================================== */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#344438]">
                  {t('إدارة مكتبة الصور والمعرض', 'Photo Gallery Management')}
                </h2>
                <p className="text-xs text-[#604B3C]">
                  {t('إدارة صور المكان والضيافة وتنسيق الطاولات مع نصوص بديلة بالعربية والإنجليزية.', 'Manage authorized photos and bilingual alt descriptions.')}
                </p>
              </div>

              <button
                onClick={() => setGalleryModalOpen(true)}
                className="bg-[#B69A65] hover:bg-[#CFB888] text-[#1A1D1A] text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{t('إضافة صورة للمعرض', 'Add Gallery Image')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {gallery.map(item => (
                <div key={item.id} className="bg-white rounded-xl overflow-hidden border border-[#B69A65]/20 shadow-xs flex flex-col justify-between">
                  <div className="relative aspect-4/3 bg-slate-100">
                    <img src={item.image_url} alt={item.alt_ar} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleDeleteGallery(item)}
                      className="absolute top-2 end-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                      title={t('حذف', 'Delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-xs text-[#344438] truncate">{item.title_ar}</h4>
                    <span className="text-[10px] text-[#B69A65] block uppercase tracking-wider">{item.category}</span>
                    <p className="text-[11px] text-[#604B3C]/80 line-clamp-1 mt-1">{item.alt_ar}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 5: RESERVATIONS MANAGEMENT
        ===================================================================== */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#344438]">
                  {t('إدارة حجوزات المطعم', 'Reservations Management')}
                </h2>
                <p className="text-xs text-[#604B3C]">
                  {t('متابعة طلبات حجز الطاولات، والتأكيد، والتواصل مع الضيوف.', 'Review, confirm, or cancel guest dining reservations.')}
                </p>
              </div>

              <div className="text-xs text-[#604B3C]">
                {t('الحجز الإلكتروني:', 'Online reservations:')}{' '}
                <strong className={settings.reservations_enabled ? 'text-emerald-700' : 'text-rose-700'}>
                  {settings.reservations_enabled ? t('مفعل حالياً', 'Enabled') : t('معطل', 'Disabled')}
                </strong>
              </div>
            </div>

            {reservations.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-[#B69A65]/20">
                <CalendarCheck className="w-12 h-12 text-[#B69A65] mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-[#344438]">{t('لا توجد حجوزات مسجلة حتى الآن.', 'No reservations currently.')}</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#B69A65]/20 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs">
                    <thead className="bg-[#344438] text-white uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4 text-start">{t('الضيف', 'Guest')}</th>
                        <th className="py-3 px-4 text-start">{t('الهاتف', 'Phone')}</th>
                        <th className="py-3 px-4 text-start">{t('الموعد', 'Schedule')}</th>
                        <th className="py-3 px-4 text-center">{t('العدد', 'Guests')}</th>
                        <th className="py-3 px-4 text-start">{t('ملاحظات', 'Notes')}</th>
                        <th className="py-3 px-4 text-center">{t('الحالة', 'Status')}</th>
                        <th className="py-3 px-4 text-end">{t('تحديث الحالة', 'Action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reservations.map(res => (
                        <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-[#344438]">
                            {res.name}
                            {res.email && <span className="block font-normal text-[11px] text-[#604B3C]">{res.email}</span>}
                          </td>
                          <td className="py-3 px-4 font-mono dir-ltr text-start">
                            <a href={`tel:${res.phone}`} className="hover:underline text-[#344438]">
                              {res.phone}
                            </a>
                          </td>
                          <td className="py-3 px-4 text-[#604B3C]">
                            {res.date} · {res.time}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-[#344438]">
                            {res.guest_count}
                          </td>
                          <td className="py-3 px-4 text-[#604B3C] max-w-xs truncate" title={res.special_requests}>
                            {res.special_requests || '—'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              res.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                              res.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {res.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-end">
                            <select
                              value={res.status}
                              onChange={(e) => handleUpdateReservation(res, e.target.value as any)}
                              className="bg-[#F7F3EC] border border-[#B69A65]/30 rounded px-2 py-1 text-xs text-[#344438] cursor-pointer"
                            >
                              <option value="new">{t('جديد', 'New')}</option>
                              <option value="pending">{t('قيد التأكيد', 'Pending')}</option>
                              <option value="confirmed">{t('مؤكد', 'Confirmed')}</option>
                              <option value="cancelled">{t('ملغى', 'Cancelled')}</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 6: SITE SETTINGS
        ===================================================================== */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl border border-[#B69A65]/20 shadow-xs p-6 max-w-4xl">
            <h2 className="text-xl font-bold text-[#344438] mb-1">
              {t('إعدادات وبيانات مطعم مينا الرئيسية', 'MeNa Restaurant Global Settings')}
            </h2>
            <p className="text-xs text-[#604B3C] mb-6">
              {t('تنعكس جميع التعديلات فوراً على الموقع العام دون الحاجة لتعديل الكود البرمجي.', 'Changes update the public website immediately.')}
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#344438] mb-1">
                    {t('اسم المطعم بالعربية', 'Restaurant Name (Arabic)')}
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.name_ar}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name_ar: e.target.value })}
                    className="w-full bg-[#F7F3EC]/50 border border-[#B69A65]/30 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344438] mb-1">
                    {t('اسم المطعم بالإنجليزية', 'Restaurant Name (English)')}
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.name_en}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name_en: e.target.value })}
                    className="w-full bg-[#F7F3EC]/50 border border-[#B69A65]/30 rounded-lg p-2.5 text-sm font-serif-luxury"
                  />
                </div>
              </div>

              {/* Taglines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#344438] mb-1">
                    {t('الشعار اللفظي العربي (Hero Headline)', 'Arabic Tagline')}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.tagline_ar}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline_ar: e.target.value })}
                    className="w-full bg-[#F7F3EC]/50 border border-[#B69A65]/30 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344438] mb-1">
                    {t('الشعار اللفظي الإنجليزي', 'English Tagline')}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.tagline_en}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline_en: e.target.value })}
                    className="w-full bg-[#F7F3EC]/50 border border-[#B69A65]/30 rounded-lg p-2.5 text-sm font-serif-luxury"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#B69A65]/15">
                <div>
                  <label className="block text-xs font-bold text-[#344438] mb-1">
                    {t('رقم الهاتف للتواصل والحجز', 'Contact Phone')}
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full bg-[#F7F3EC]/50 border border-[#B69A65]/30 rounded-lg p-2.5 text-sm dir-ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344438] mb-1">
                    {t('البريد الإلكتروني المعتمد', 'Official Bookings Email')}
                  </label>
                  <input
                    type="email"
                    required
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full bg-[#F7F3EC]/50 border border-[#B69A65]/30 rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#344438] mb-1">
                    {t('العنوان بالعربية', 'Address (Arabic)')}
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.address_ar}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address_ar: e.target.value })}
                    className="w-full bg-[#F7F3EC]/50 border border-[#B69A65]/30 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344438] mb-1">
                    {t('العنوان بالإنجليزية', 'Address (English)')}
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.address_en}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address_en: e.target.value })}
                    className="w-full bg-[#F7F3EC]/50 border border-[#B69A65]/30 rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Working hours notice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#344438] mb-1">
                    {t('ملاحظة أوقات العمل بالعربية', 'Working Hours Notice (Arabic)')}
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.working_hours_ar}
                    onChange={(e) => setSettingsForm({ ...settingsForm, working_hours_ar: e.target.value })}
                    className="w-full bg-[#F7F3EC]/50 border border-[#B69A65]/30 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344438] mb-1">
                    {t('ملاحظة أوقات العمل بالإنجليزية', 'Working Hours Notice (English)')}
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.working_hours_en}
                    onChange={(e) => setSettingsForm({ ...settingsForm, working_hours_en: e.target.value })}
                    className="w-full bg-[#F7F3EC]/50 border border-[#B69A65]/30 rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Feature toggles */}
              <div className="pt-2 border-t border-[#B69A65]/15 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-[#344438] block">
                    {t('تفعيل خدمة حجز الطاولات الإلكتروني', 'Enable Online Reservations Form')}
                  </span>
                  <span className="text-xs text-[#604B3C]">
                    {t('إظهار نموذج الحجز للزوار في الموقع العام', 'Display reservation CTA and modal on site')}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.reservations_enabled}
                  onChange={(e) => setSettingsForm({ ...settingsForm, reservations_enabled: e.target.checked })}
                  className="w-5 h-5 rounded text-[#344438] focus:ring-[#344438] cursor-pointer"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#344438] hover:bg-[#465B4C] text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  {t('حفظ التعديلات', 'Save All Settings')}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* =====================================================================
            TAB 7: AUDIT LOGS & BACKUP
        ===================================================================== */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#344438]">
                  {t('سجل العمليات والنسخ الاحتياطي', 'Audit Logs & Database Backup')}
                </h2>
                <p className="text-xs text-[#604B3C]">
                  {t('توثيق كافة التعديلات الإدارية وتنزيل نسخة كاملة من قاعدة البيانات بصيغة JSON.', 'Activity logging and complete JSON database backup.')}
                </p>
              </div>

              <button
                onClick={handleDownloadBackup}
                className="bg-[#344438] hover:bg-[#465B4C] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
              >
                <Download className="w-4 h-4 text-[#B69A65]" />
                <span>{t('تحميل نسخة احتياطية من قاعدة البيانات', 'Export DB Backup (JSON)')}</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-[#B69A65]/20 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-[#344438] text-white uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 text-start">{t('التاريخ والوقت', 'Timestamp')}</th>
                      <th className="py-3 px-4 text-start">{t('العملية', 'Action')}</th>
                      <th className="py-3 px-4 text-start">{t('المنفذ', 'User')}</th>
                      <th className="py-3 px-4 text-start">{t('التفاصيل', 'Details')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-[#604B3C] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#344438]">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 text-[#604B3C]">
                          {log.performed_by}
                        </td>
                        <td className="py-3 px-4 text-[#344438]">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 8: SECURITY & PASSWORD
        ===================================================================== */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-xl border border-[#B69A65]/20 shadow-xs p-6 max-w-xl">
            <h2 className="text-xl font-bold text-[#344438] mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#B69A65]" />
              <span>{t('أمان الحساب وتغيير كلمة المرور', 'Security & Password Update')}</span>
            </h2>
            <p className="text-xs text-[#604B3C] mb-6">
              {t('تحديث كلمة المرور لحساب المدير المصرح له (يتم التشفير الآمن بخوارزمية bcrypt).', 'Update admin credentials securely hashed using bcrypt.')}
            </p>

            {passwordMsg && (
              <div className={`p-3 text-xs rounded-lg mb-4 flex items-center gap-2 ${
                passwordMsg.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {passwordMsg.isError ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#344438] mb-1">
                  {t('كلمة المرور الحالية', 'Current Password')}
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#F7F3EC]/50 border border-[#B69A65]/30 rounded-lg p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344438] mb-1">
                  {t('كلمة المرور الجديدة (8 خانات على الأقل)', 'New Password (min 8 characters)')}
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#F7F3EC]/50 border border-[#B69A65]/30 rounded-lg p-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                className="bg-[#344438] hover:bg-[#465B4C] text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
              >
                {t('تحديث كلمة المرور', 'Update Password')}
              </button>
            </form>
          </div>
        )}

      </main>

      {/* =====================================================================
          DISH EDIT/CREATE MODAL
      ===================================================================== */}
      {dishModalOpen && editingDish && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-[#B69A65]/30 shadow-2xl overflow-hidden my-8" onClick={e => e.stopPropagation()}>
            <div className="bg-[#344438] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base text-[#F7F3EC]">
                {editingDish.id ? t('تعديل بيانات الطبق', 'Edit Dish') : t('إضافة طبق جديد للقائمة', 'Add New Dish')}
              </h3>
              <button onClick={() => setDishModalOpen(false)} className="text-white/70 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#344438] mb-1">{t('الاسم بالعربية *', 'Arabic Name *')}</label>
                  <input
                    type="text"
                    required
                    value={editingDish.name_ar || ''}
                    onChange={e => setEditingDish({ ...editingDish, name_ar: e.target.value })}
                    className="w-full bg-[#F7F3EC]/40 border border-[#B69A65]/30 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#344438] mb-1">{t('الاسم بالإنجليزية *', 'English Name *')}</label>
                  <input
                    type="text"
                    required
                    value={editingDish.name_en || ''}
                    onChange={e => setEditingDish({ ...editingDish, name_en: e.target.value })}
                    className="w-full bg-[#F7F3EC]/40 border border-[#B69A65]/30 rounded-lg p-2 font-serif-luxury"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#344438] mb-1">{t('الوصف بالعربية', 'Arabic Description')}</label>
                  <textarea
                    rows={2}
                    value={editingDish.description_ar || ''}
                    onChange={e => setEditingDish({ ...editingDish, description_ar: e.target.value })}
                    className="w-full bg-[#F7F3EC]/40 border border-[#B69A65]/30 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#344438] mb-1">{t('الوصف بالإنجليزية', 'English Description')}</label>
                  <textarea
                    rows={2}
                    value={editingDish.description_en || ''}
                    onChange={e => setEditingDish({ ...editingDish, description_en: e.target.value })}
                    className="w-full bg-[#F7F3EC]/40 border border-[#B69A65]/30 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Price, Currency, Category, Sort */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-[#344438] mb-1">{t('السعر', 'Price')}</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editingDish.price ?? 0}
                    onChange={e => setEditingDish({ ...editingDish, price: Number(e.target.value) })}
                    className="w-full bg-[#F7F3EC]/40 border border-[#B69A65]/30 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#344438] mb-1">{t('العملة', 'Currency')}</label>
                  <input
                    type="text"
                    value={editingDish.currency || 'SAR'}
                    onChange={e => setEditingDish({ ...editingDish, currency: e.target.value })}
                    className="w-full bg-[#F7F3EC]/40 border border-[#B69A65]/30 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#344438] mb-1">{t('التصنيف', 'Category')}</label>
                  <select
                    value={editingDish.category_id || ''}
                    onChange={e => setEditingDish({ ...editingDish, category_id: e.target.value })}
                    className="w-full bg-[#F7F3EC]/40 border border-[#B69A65]/30 rounded-lg p-2"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name_ar}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#344438] mb-1">{t('الترتيب', 'Order')}</label>
                  <input
                    type="number"
                    value={editingDish.sort_order ?? 0}
                    onChange={e => setEditingDish({ ...editingDish, sort_order: Number(e.target.value) })}
                    className="w-full bg-[#F7F3EC]/40 border border-[#B69A65]/30 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Image Upload & URL */}
              <div>
                <label className="block font-bold text-[#344438] mb-1">{t('صورة الطبق (رفع ملف أو إدخال رابط)', 'Dish Image')}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="https://... أو رفع صورة"
                    value={editingDish.image_url || ''}
                    onChange={e => setEditingDish({ ...editingDish, image_url: e.target.value })}
                    className="flex-1 bg-[#F7F3EC]/40 border border-[#B69A65]/30 rounded-lg p-2 text-xs"
                  />
                  <label className="bg-[#344438] hover:bg-[#465B4C] text-white px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5 text-[#B69A65]" />
                    <span>{dishUploadLoading ? t('جاري الرفع...', 'Uploading...') : t('رفع صورة', 'Upload')}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleDishImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {editingDish.image_url && (
                  <div className="mt-2 w-24 h-16 rounded overflow-hidden border border-[#B69A65]/30">
                    <img src={editingDish.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Allergens selection */}
              <div>
                <label className="block font-bold text-[#344438] mb-1">
                  {t('مسببات الحساسية المعتمدة', 'Certified Allergens')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'gluten', label: t('جلوتين', 'Gluten') },
                    { id: 'dairy', label: t('ألبان', 'Dairy') },
                    { id: 'nuts', label: t('مكسرات', 'Nuts') },
                    { id: 'sesame', label: t('سمسم', 'Sesame') },
                    { id: 'eggs', label: t('بيض', 'Eggs') },
                    { id: 'shellfish', label: t('مأكولات بحرية', 'Shellfish') }
                  ].map(alg => {
                    const selected = editingDish.allergens?.includes(alg.id);
                    return (
                      <button
                        type="button"
                        key={alg.id}
                        onClick={() => {
                          const current = editingDish.allergens || [];
                          const updated = selected ? current.filter(x => x !== alg.id) : [...current, alg.id];
                          setEditingDish({ ...editingDish, allergens: updated });
                        }}
                        className={`px-2.5 py-1 rounded text-xs transition-colors ${
                          selected
                            ? 'bg-amber-700 text-white font-bold'
                            : 'bg-slate-100 text-[#344438] hover:bg-slate-200'
                        }`}
                      >
                        {alg.label} {selected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-[#B69A65]/15 grid grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#344438]">
                  <input
                    type="checkbox"
                    checked={editingDish.is_available !== false}
                    onChange={e => setEditingDish({ ...editingDish, is_available: e.target.checked })}
                    className="rounded text-[#344438]"
                  />
                  <span>{t('متاح للطلب اليوم', 'Available')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#344438]">
                  <input
                    type="checkbox"
                    checked={editingDish.is_published !== false}
                    onChange={e => setEditingDish({ ...editingDish, is_published: e.target.checked })}
                    className="rounded text-[#344438]"
                  />
                  <span>{t('منشور للزوار', 'Published')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#344438]">
                  <input
                    type="checkbox"
                    checked={Boolean(editingDish.is_featured)}
                    onChange={e => setEditingDish({ ...editingDish, is_featured: e.target.checked })}
                    className="rounded text-[#344438]"
                  />
                  <span>{t('موصى به من الإدارة', 'Featured')}</span>
                </label>
              </div>

              {/* Form buttons */}
              <div className="pt-4 border-t border-[#B69A65]/20 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDishModalOpen(false)}
                  className="px-4 py-2 rounded text-[#604B3C]"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-[#344438] hover:bg-[#465B4C] text-white font-bold px-5 py-2 rounded-lg"
                >
                  {t('حفظ الطبق', 'Save Dish')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          CATEGORY EDIT/CREATE MODAL
      ===================================================================== */}
      {categoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-[#B69A65]/30 shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-base text-[#344438] mb-4">
              {editingCategory.id ? t('تعديل التصنيف', 'Edit Category') : t('إضافة تصنيف جديد', 'Add Category')}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#344438] mb-1">{t('الاسم بالعربية *', 'Arabic Name *')}</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name_ar || ''}
                  onChange={e => setEditingCategory({ ...editingCategory, name_ar: e.target.value })}
                  className="w-full bg-[#F7F3EC]/40 border border-[#B69A65]/30 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-[#344438] mb-1">{t('الاسم بالإنجليزية *', 'English Name *')}</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name_en || ''}
                  onChange={e => setEditingCategory({ ...editingCategory, name_en: e.target.value })}
                  className="w-full bg-[#F7F3EC]/40 border border-[#B69A65]/30 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-[#344438] mb-1">{t('ترتيب الظهور', 'Sort Order')}</label>
                <input
                  type="number"
                  value={editingCategory.sort_order ?? 0}
                  onChange={e => setEditingCategory({ ...editingCategory, sort_order: Number(e.target.value) })}
                  className="w-full bg-[#F7F3EC]/40 border border-[#B69A65]/30 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cat-pub"
                  checked={editingCategory.is_published !== false}
                  onChange={e => setEditingCategory({ ...editingCategory, is_published: e.target.checked })}
                  className="rounded text-[#344438]"
                />
                <label htmlFor="cat-pub" className="font-bold text-[#344438]">{t('نشر التصنيف للزوار', 'Publish Category')}</label>
              </div>

              <div className="pt-3 border-t border-[#B69A65]/20 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded text-[#604B3C]"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-[#344438] hover:bg-[#465B4C] text-white font-bold px-5 py-2 rounded-lg"
                >
                  {t('حفظ', 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          GALLERY ADD MODAL
      ===================================================================== */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-[#B69A65]/30 shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-base text-[#344438] mb-4">
              {t('إضافة صورة لمعرض المطعم', 'Add Gallery Image')}
            </h3>

            <form onSubmit={handleAddGallery} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#344438] mb-1">{t('العنوان بالعربية *', 'Arabic Title *')}</label>
                <input
                  type="text"
                  required
                  value={newGalleryItem.title_ar}
                  onChange={e => setNewGalleryItem({ ...newGalleryItem, title_ar: e.target.value })}
                  className="w-full bg-[#F7F3EC]/40 border border-[#B69A65]/30 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-[#344438] mb-1">{t('العنوان بالإنجليزية', 'English Title')}</label>
                <input
                  type="text"
                  value={newGalleryItem.title_en}
                  onChange={e => setNewGalleryItem({ ...newGalleryItem, title_en: e.target.value })}
                  className="w-full bg-[#F7F3EC]/40 border border-[#B69A65]/30 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-[#344438] mb-1">{t('رابط الصورة *', 'Image URL *')}</label>
                <input
                  type="text"
                  required
                  value={newGalleryItem.image_url}
                  onChange={e => setNewGalleryItem({ ...newGalleryItem, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#F7F3EC]/40 border border-[#B69A65]/30 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-[#344438] mb-1">{t('القسم', 'Section Category')}</label>
                <select
                  value={newGalleryItem.category}
                  onChange={e => setNewGalleryItem({ ...newGalleryItem, category: e.target.value as any })}
                  className="w-full bg-[#F7F3EC]/40 border border-[#B69A65]/30 rounded-lg p-2"
                >
                  <option value="ambiance">{t('الأجواء المعمارية', 'Ambiance')}</option>
                  <option value="dining">{t('تنسيق الطاولات', 'Dining Space')}</option>
                  <option value="dishes">{t('تقديم الأطباق', 'Dishes Presentation')}</option>
                  <option value="details">{t('تفاصيل الضيافة', 'Hospitality Details')}</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#B69A65]/20 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGalleryModalOpen(false)}
                  className="px-4 py-2 rounded text-[#604B3C]"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-[#344438] hover:bg-[#465B4C] text-white font-bold px-5 py-2 rounded-lg"
                >
                  {t('إضافة الصورة', 'Add Image')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
