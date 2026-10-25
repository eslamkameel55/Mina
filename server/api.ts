import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from './db.js';
import { requireAuth, AuthenticatedRequest, generateToken, verifyPassword, hashPassword } from './auth.js';

export const apiRouter = express.Router();

// Prepare uploads directory
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `mena-${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('الملف غير مدعوم. الصيغ المسموحة هي: JPG, PNG, WebP فقط'));
    }
  }
});

// ==========================================
// 1. Auth Endpoints
// ==========================================

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
  }

  const admin = db.findAdminByEmail(email);
  if (!admin) {
    return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
  }

  const isValid = verifyPassword(password, admin.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
  }

  const token = generateToken(admin);
  res.json({
    token,
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    }
  });
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'غير مسجل' });
  const admin = db.findAdminByEmail(req.user.email);
  if (!admin) return res.status(404).json({ error: 'المستخدم غير موجود' });

  res.json({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role
  });
});

apiRouter.post('/auth/change-password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'كلمة المرور الجديدة يجب ألا تقل عن 8 خانات' });
  }

  const admin = db.findAdminByEmail(req.user!.email);
  if (!admin || !verifyPassword(currentPassword, admin.password_hash)) {
    return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
  }

  const newHash = hashPassword(newPassword);
  db.updateAdminPassword(admin.email, newHash, req.user!.email);
  res.json({ success: true, message: 'تم تحديث كلمة المرور بنجاح' });
});

// ==========================================
// 2. Settings Endpoints
// ==========================================

apiRouter.get('/settings', (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

apiRouter.put('/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateSettings(req.body, req.user!.email);
  res.json(updated);
});

// ==========================================
// 3. Categories Endpoints
// ==========================================

apiRouter.get('/categories', (req: Request, res: Response) => {
  const onlyPublished = req.query.all !== 'true';
  res.json(db.getCategories(onlyPublished));
});

apiRouter.post('/categories', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name_ar, name_en, description_ar, description_en, image_url, sort_order, is_published } = req.body;
  if (!name_ar || !name_en) {
    return res.status(400).json({ error: 'اسم التصنيف بالعربية والإنجليزية مطلوب' });
  }

  const newCat = db.createCategory(
    {
      name_ar,
      name_en,
      description_ar,
      description_en,
      image_url,
      sort_order: Number(sort_order) || 0,
      is_published: is_published !== false
    },
    req.user!.email
  );
  res.status(201).json(newCat);
});

apiRouter.put('/categories/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateCategory(req.params.id, req.body, req.user!.email);
  if (!updated) return res.status(404).json({ error: 'التصنيف غير موجود' });
  res.json(updated);
});

apiRouter.delete('/categories/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  // Check if any dishes belong to this category
  const dishes = db.getDishes(true).filter(d => d.category_id === id);
  if (dishes.length > 0 && req.query.force !== 'true') {
    return res.status(409).json({
      error: `لا يمكن حذف هذا التصنيف لأنه مرتبط بـ (${dishes.length}) طبق. يرجى نقل الأطباق أولاً أو التأكيد بحذفها.`,
      dishes_count: dishes.length
    });
  }

  const success = db.deleteCategory(id, req.user!.email);
  if (!success) return res.status(404).json({ error: 'التصنيف غير موجود' });
  res.json({ success: true });
});

// ==========================================
// 4. Dishes Endpoints
// ==========================================

apiRouter.get('/dishes', (req: Request, res: Response) => {
  const showAll = req.query.all === 'true';
  res.json(db.getDishes(showAll));
});

apiRouter.get('/dishes/:id', (req: Request, res: Response) => {
  const dish = db.getDishById(req.params.id);
  if (!dish) return res.status(404).json({ error: 'الطبق غير موجود' });
  res.json(dish);
});

apiRouter.post('/dishes', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const {
    name_ar,
    name_en,
    description_ar,
    description_en,
    price,
    currency,
    category_id,
    image_url,
    additional_images,
    ingredients_ar,
    ingredients_en,
    allergens,
    is_available,
    is_published,
    is_featured,
    sort_order
  } = req.body;

  if (!name_ar || !name_en) {
    return res.status(400).json({ error: 'الاسم بالعربية والإنجليزية مطلوب' });
  }

  const newDish = db.createDish(
    {
      name_ar,
      name_en,
      description_ar: description_ar || '',
      description_en: description_en || '',
      price: price !== undefined ? Number(price) : 0,
      currency: currency || 'SAR',
      category_id: category_id || '',
      image_url: image_url || '',
      additional_images: Array.isArray(additional_images) ? additional_images : [],
      ingredients_ar: Array.isArray(ingredients_ar) ? ingredients_ar : [],
      ingredients_en: Array.isArray(ingredients_en) ? ingredients_en : [],
      allergens: Array.isArray(allergens) ? allergens : [],
      is_available: is_available !== false,
      is_published: is_published !== false,
      is_featured: Boolean(is_featured),
      sort_order: Number(sort_order) || 0
    },
    req.user!.email
  );

  res.status(201).json(newDish);
});

apiRouter.put('/dishes/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateDish(req.params.id, req.body, req.user!.email);
  if (!updated) return res.status(404).json({ error: 'الطبق غير موجود' });
  res.json(updated);
});

apiRouter.delete('/dishes/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteDish(req.params.id, req.user!.email);
  if (!success) return res.status(404).json({ error: 'الطبق غير موجود' });
  res.json({ success: true });
});

apiRouter.patch('/dishes/:id/status', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { is_available, is_published, is_featured } = req.body;
  const updates: Record<string, boolean> = {};
  if (is_available !== undefined) updates.is_available = Boolean(is_available);
  if (is_published !== undefined) updates.is_published = Boolean(is_published);
  if (is_featured !== undefined) updates.is_featured = Boolean(is_featured);

  const updated = db.updateDish(req.params.id, updates, req.user!.email);
  if (!updated) return res.status(404).json({ error: 'الطبق غير موجود' });
  res.json(updated);
});

// ==========================================
// 5. Gallery Endpoints
// ==========================================

apiRouter.get('/gallery', (_req: Request, res: Response) => {
  res.json(db.getGallery());
});

apiRouter.post('/gallery', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { title_ar, title_en, alt_ar, alt_en, image_url, category } = req.body;
  if (!title_ar || !image_url) {
    return res.status(400).json({ error: 'عنوان الصورة والرابط مطلوبان' });
  }

  const item = db.addGalleryItem(
    {
      title_ar,
      title_en: title_en || title_ar,
      alt_ar: alt_ar || title_ar,
      alt_en: alt_en || title_en || title_ar,
      image_url,
      category: category || 'ambiance'
    },
    req.user!.email
  );

  res.status(201).json(item);
});

apiRouter.delete('/gallery/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteGalleryItem(req.params.id, req.user!.email);
  if (!success) return res.status(404).json({ error: 'الصورة غير موجودة' });
  res.json({ success: true });
});

// ==========================================
// 6. Reservations Endpoints
// ==========================================

apiRouter.post('/reservations', (req: Request, res: Response) => {
  const settings = db.getSettings();
  if (!settings.reservations_enabled) {
    return res.status(403).json({ error: 'خدمة الحجز الإلكتروني غير مفعلة حالياً. يرجى التواصل عبر الهاتف أو البريد.' });
  }

  const { name, phone, email, date, time, guest_count, special_requests } = req.body;
  if (!name || !phone || !date || !time || !guest_count) {
    return res.status(400).json({ error: 'يرجى استكمال جميع الحقول المطلوبة (الاسم، الهاتف، التاريخ، الوقت، وعدد الضيوف)' });
  }

  const reservation = db.createReservation({
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: email ? String(email).trim() : undefined,
    date: String(date),
    time: String(time),
    guest_count: Number(guest_count),
    special_requests: special_requests ? String(special_requests).trim() : undefined
  });

  res.status(201).json({
    success: true,
    reservation,
    message: 'تم استلام طلب الحجز بنجاح. سيتواصل معكم فريق الاستقبال في فندق تلال الرياض لتأكيد الحجز.'
  });
});

apiRouter.get('/reservations', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getReservations());
});

apiRouter.patch('/reservations/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { status, internal_notes } = req.body;
  if (!['new', 'pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'حالة الحجز غير صحيحة' });
  }

  const updated = db.updateReservationStatus(req.params.id, status, internal_notes, req.user!.email);
  if (!updated) return res.status(404).json({ error: 'الحجز غير موجود' });
  res.json(updated);
});

// ==========================================
// 7. Upload Endpoint
// ==========================================

apiRouter.post('/upload', requireAuth, upload.single('image'), (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'لم يتم استلام أي ملف صورة' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.filename,
    original_name: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// ==========================================
// 8. Stats & Audit Logs & Database Backup
// ==========================================

apiRouter.get('/stats', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getStats());
});

apiRouter.get('/audit-logs', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json(db.getAuditLogs());
});

apiRouter.get('/backup', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const backupData = db.getFullData();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=mena-restaurant-backup-${Date.now()}.json`);
  res.send(JSON.stringify(backupData, null, 2));
});
