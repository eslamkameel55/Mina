import { SiteSettings, Category, Dish, GalleryItem, Reservation, DashboardStats, AuditLog } from '../types/index.ts';

const API_BASE = '/api';

export const api = {
  // Settings
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('فشل جلب إعدادات الموقع');
    return res.json();
  },

  async updateSettings(settings: Partial<SiteSettings>, token: string): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل تحديث الإعدادات');
    }
    return res.json();
  },

  // Categories
  async getCategories(all = false): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories${all ? '?all=true' : ''}`);
    if (!res.ok) throw new Error('فشل جلب التصنيفات');
    return res.json();
  },

  async createCategory(cat: Partial<Category>, token: string): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(cat)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل إنشاء التصنيف');
    }
    return res.json();
  },

  async updateCategory(id: string, updates: Partial<Category>, token: string): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل تعديل التصنيف');
    }
    return res.json();
  },

  async deleteCategory(id: string, token: string, force = false): Promise<void> {
    const res = await fetch(`${API_BASE}/categories/${id}${force ? '?force=true' : ''}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل حذف التصنيف');
    }
  },

  // Dishes
  async getDishes(all = false): Promise<Dish[]> {
    const res = await fetch(`${API_BASE}/dishes${all ? '?all=true' : ''}`);
    if (!res.ok) throw new Error('فشل جلب قائمة الأطباق');
    return res.json();
  },

  async getDish(id: string): Promise<Dish> {
    const res = await fetch(`${API_BASE}/dishes/${id}`);
    if (!res.ok) throw new Error('الطبق غير موجود');
    return res.json();
  },

  async createDish(dish: Partial<Dish>, token: string): Promise<Dish> {
    const res = await fetch(`${API_BASE}/dishes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(dish)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل إنشاء الطبق');
    }
    return res.json();
  },

  async updateDish(id: string, updates: Partial<Dish>, token: string): Promise<Dish> {
    const res = await fetch(`${API_BASE}/dishes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل تحديث بيانات الطبق');
    }
    return res.json();
  },

  async updateDishStatus(id: string, status: { is_available?: boolean; is_published?: boolean; is_featured?: boolean }, token: string): Promise<Dish> {
    const res = await fetch(`${API_BASE}/dishes/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(status)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل تغيير حالة الطبق');
    }
    return res.json();
  },

  async deleteDish(id: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/dishes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل حذف الطبق');
    }
  },

  // Gallery
  async getGallery(): Promise<GalleryItem[]> {
    const res = await fetch(`${API_BASE}/gallery`);
    if (!res.ok) throw new Error('فشل جلب المعرض');
    return res.json();
  },

  async addGalleryItem(item: Partial<GalleryItem>, token: string): Promise<GalleryItem> {
    const res = await fetch(`${API_BASE}/gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(item)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل إضافة الصورة');
    }
    return res.json();
  },

  async deleteGalleryItem(id: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/gallery/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل حذف الصورة');
    }
  },

  // Reservations
  async submitReservation(data: {
    name: string;
    phone: string;
    email?: string;
    date: string;
    time: string;
    guest_count: number;
    special_requests?: string;
  }): Promise<{ success: boolean; message: string; reservation: Reservation }> {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error || 'فشل إرسال طلب الحجز');
    }
    return body;
  },

  async getReservations(token: string): Promise<Reservation[]> {
    const res = await fetch(`${API_BASE}/reservations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('فشل جلب الحجوزات');
    return res.json();
  },

  async updateReservationStatus(id: string, status: Reservation['status'], notes: string | undefined, token: string): Promise<Reservation> {
    const res = await fetch(`${API_BASE}/reservations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status, internal_notes: notes })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل تحديث حالة الحجز');
    }
    return res.json();
  },

  // Upload image
  async uploadImage(file: File, token: string): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'فشل رفع الصورة');
    }
    return res.json();
  },

  // Dashboard Stats & Logs
  async getStats(token: string): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('فشل جلب إحصائيات لوحة التحكم');
    return res.json();
  },

  async getAuditLogs(token: string): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('فشل جلب سجل العمليات');
    return res.json();
  }
};
