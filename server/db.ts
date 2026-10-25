import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface SiteSettings {
  name_ar: string;
  name_en: string;
  hotel_name_ar: string;
  hotel_name_en: string;
  tagline_ar: string;
  tagline_en: string;
  hero_subtitle_ar: string;
  hero_subtitle_en: string;
  about_title_ar: string;
  about_title_en: string;
  about_text_ar: string;
  about_text_en: string;
  phone: string;
  email: string;
  address_ar: string;
  address_en: string;
  google_maps_url: string;
  hotel_website_url: string;
  hotel_dining_url: string;
  coordinates: { lat: number; lng: number };
  reservations_enabled: boolean;
  working_hours_ar: string;
  working_hours_en: string;
  currency_ar: string;
  currency_en: string;
  primary_color: string;
  accent_gold: string;
  background_ivory: string;
  instagram_url?: string;
  facebook_url?: string;
}

export interface Dish {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  currency: string;
  category_id: string;
  category_name_ar?: string;
  category_name_en?: string;
  image_url: string;
  additional_images?: string[];
  ingredients_ar?: string[];
  ingredients_en?: string[];
  allergens?: string[]; // e.g. ["dairy", "gluten", "nuts"]
  is_available: boolean;
  is_published: boolean;
  is_featured: boolean; // Chef recommendation
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  image_url?: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title_ar: string;
  title_en: string;
  alt_ar: string;
  alt_en: string;
  image_url: string;
  category: 'ambiance' | 'dining' | 'details' | 'dishes';
  created_at: string;
}

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  email?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  guest_count: number;
  special_requests?: string;
  status: 'new' | 'pending' | 'confirmed' | 'cancelled';
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: 'super_admin' | 'manager';
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performed_by: string;
  details: string;
  timestamp: string;
}

export interface DatabaseSchema {
  settings: SiteSettings;
  categories: Category[];
  dishes: Dish[];
  gallery: GalleryItem[];
  reservations: Reservation[];
  admins: AdminUser[];
  audit_logs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'mena_db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial state
function createInitialDatabase(): DatabaseSchema {
  const initialPasswordHash = bcrypt.hashSync('TilalMena@2026', 10);

  const initialSettings: SiteSettings = {
    name_ar: 'مطعم مينا',
    name_en: 'MeNa Restaurant',
    hotel_name_ar: 'فندق تلال الرياض',
    hotel_name_en: 'Tilal Riyadh Hotel',
    tagline_ar: 'حيث تلتقي أصالة النكهات بفن الضيافة',
    tagline_en: 'Where Authentic Flavors Meet the Art of Hospitality',
    hero_subtitle_ar: 'اكتشف تجربة طعام مستوحاة من تقاليد بلاد الشام العريقة، في أجواء تجمع الدفء والأناقة المعمارية داخل تلال الرياض.',
    hero_subtitle_en: 'Discover a dining experience inspired by Levantine traditions, amidst warmth and contemporary elegance at Tilal Riyadh.',
    about_title_ar: 'تجربة تجمع النكهة والأجواء الشامية الفاخرة',
    about_title_en: 'An Experience Blending Flavor & Refined Ambiance',
    about_text_ar: 'يقع مطعم مينا في قلب فندق تلال الرياض، ويقدم وجهة استثنائية لعشاق المأكولات الشامية والشرقية الأصيلة. نحرص على تقديم أطباق محضرة بعناية فائقة باستخدام أجود المكونات الطازجة، لنوفر لضيوفنا وأسرهم لحظات دافئة تعكس كرم الضيافة العربية في أجواء معمارية أندلسية معاصرة.',
    about_text_en: 'Nestled inside Tilal Riyadh Hotel, MeNa Restaurant offers a distinguished destination for lovers of authentic Levantine and Middle Eastern cuisine. We craft carefully prepared dishes using prime ingredients, welcoming guests and families to savor Arab hospitality in a serene contemporary Andalusian setting.',
    phone: '+966 59 142 0829',
    email: 'book.riyadh@tilalhotels.com',
    address_ar: 'فندق تلال الرياض، الطريق الدائري الشرقي الفرعي، حي الجزيرة، الرياض 14251، المملكة العربية السعودية',
    address_en: 'Tilal Riyadh Hotel, Eastern Ring Branch Rd, Al Jazirah, Riyadh 14251, Saudi Arabia',
    google_maps_url: 'https://www.google.com/maps/place/MeNa+Restaurant,+Tilal+Riyadh+Hotel/',
    hotel_website_url: 'https://tilalhotels.com/tilal-riyadh/',
    hotel_dining_url: 'https://tilalhotels.com/tilal-riyadh/dining/',
    coordinates: {
      lat: 24.6760592,
      lng: 46.7798192
    },
    reservations_enabled: true,
    working_hours_ar: 'أوقات العمل وجلسات الطعام متاحة يومياً، ويُفضل الحجز المسبق لتأكيد التوفر وضمان أفضل خدمة.',
    working_hours_en: 'Daily dining service available. Prior reservation is recommended to ensure seamless hospitality and availability.',
    currency_ar: 'ر.س',
    currency_en: 'SAR',
    primary_color: '#344438',
    accent_gold: '#B69A65',
    background_ivory: '#F7F3EC'
  };

  const initialCategories: Category[] = [
    {
      id: 'cat-starters',
      name_ar: 'المقبلات الشامية والمازة الباردة',
      name_en: 'Cold Mezze & Shami Starters',
      description_ar: 'تشكيلة المازة التقليدية المحضرة بزيت الزيتون البكر والأعشاب الجبلية',
      description_en: 'Traditional mezze prepared with extra virgin olive oil and mountain herbs',
      sort_order: 1,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat-hot-appetizers',
      name_ar: 'المقبلات الساخنة والفطائر',
      name_en: 'Hot Appetizers & Savories',
      description_ar: 'فطائر طازجة وكبة شامية مقرمشة تقدم مباشرة من الفرن',
      description_en: 'Fresh pastries and crisp Shami kibbeh served directly from the hearth',
      sort_order: 2,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat-mains-grill',
      name_ar: 'المشاوي والأطباق الرئيسية',
      name_en: 'Charcoal Grills & Main Courses',
      description_ar: 'مشاوي فاخرة على الفحم وأطباق المطبخ الشامي الغنية',
      description_en: 'Premium charcoal-grilled meats and rich Levantine signature plates',
      sort_order: 3,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat-desserts',
      name_ar: 'الحلويات الشرقية الفاخرة',
      name_en: 'Eastern Desserts & Delights',
      description_ar: 'حلويات شامية محلاة بماء الورد والفستق الحلبي',
      description_en: 'Levantine confectionery finished with orange blossom water and Aleppo pistachios',
      sort_order: 4,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat-beverages',
      name_ar: 'المشروبات وعصائر الضيافة',
      name_en: 'Beverages & Signature Coolers',
      description_ar: 'عصائر طازجة، مشروبات تراثية، وقهوة عربية أصيلة',
      description_en: 'Fresh pressed juices, heritage coolers, and Saudi ceremonial coffee',
      sort_order: 5,
      is_published: true,
      created_at: new Date().toISOString()
    }
  ];

  const initialDishes: Dish[] = [
    {
      id: 'dish-hummus-beiruti',
      name_ar: 'حمص بيروتي بالكمون وزيت الزيتون',
      name_en: 'Beiruti Hummus with Cumin & Olive Oil',
      description_ar: 'حمص ناعم ممزوج بالطحينة الصافية، الثوم، البقدونس، والكمون مع زيت زيتون بكر فاخر.',
      description_en: 'Velvety chickpeas blended with pure tahini, garlic, fresh parsley, and cumin, drizzled with virgin olive oil.',
      price: 36,
      currency: 'SAR',
      category_id: 'cat-starters',
      category_name_ar: 'المقبلات الشامية والمازة الباردة',
      category_name_en: 'Cold Mezze & Shami Starters',
      image_url: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?auto=format&fit=crop&w=800&q=80',
      allergens: ['sesame'],
      ingredients_ar: ['حمص حب', 'طحينة سمسم', 'زيت زيتون بكر', 'ليمون طازج', 'بقدونس', 'كمون'],
      ingredients_en: ['Chickpeas', 'Sesame Tahini', 'Extra Virgin Olive Oil', 'Fresh Lemon', 'Parsley', 'Cumin'],
      is_available: true,
      is_published: true,
      is_featured: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'dish-mutabbal-badinjan',
      name_ar: 'متبل باذنجان مشوي على الحطب',
      name_en: 'Wood-Smoked Eggplant Mutabbal',
      description_ar: 'باذنجان مشوي على اللهب الطبيعي، مهروس مع الطحينة واللبن الزبادي وحبات الرمان.',
      description_en: 'Fire-roasted smoked eggplant folded with smooth tahini, natural yogurt, and ruby pomegranate seeds.',
      price: 38,
      currency: 'SAR',
      category_id: 'cat-starters',
      category_name_ar: 'المقبلات الشامية والمازة الباردة',
      category_name_en: 'Cold Mezze & Shami Starters',
      image_url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
      allergens: ['sesame', 'dairy'],
      ingredients_ar: ['باذنجان مشوي', 'طحينة', 'زبادي', 'ثوم', 'حبوب الرمان', 'زيت زيتون'],
      ingredients_en: ['Smoked Eggplant', 'Tahini', 'Yogurt', 'Garlic', 'Pomegranate', 'Olive Oil'],
      is_available: true,
      is_published: true,
      is_featured: false,
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'dish-fattoush-shami',
      name_ar: 'فتوش شامي بدبس الرمان والخبز المحمص',
      name_en: 'Traditional Shami Fattoush with Pomegranate Glaze',
      description_ar: 'خضروات موسمية طازجة مع البقلة والنعناع، تعلوها رقائق الخبز المقرمشة وتتبيلة دبس الرمان والسماق.',
      description_en: 'Crisp seasonal greens, purslane, and mint tossed with sumac vinaigrette, tart pomegranate molasses, and toasted pita crisps.',
      price: 42,
      currency: 'SAR',
      category_id: 'cat-starters',
      category_name_ar: 'المقبلات الشامية والمازة الباردة',
      category_name_en: 'Cold Mezze & Shami Starters',
      image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      allergens: ['gluten'],
      ingredients_ar: ['خيار', 'طماطم', 'بقلة', 'نعناع', 'سماق بلدي', 'دبس رمان', 'خبز مقرمش'],
      ingredients_en: ['Cucumber', 'Tomatoes', 'Purslane', 'Mint', 'Sumac', 'Pomegranate Molasses', 'Crisp Pita'],
      is_available: true,
      is_published: true,
      is_featured: true,
      sort_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'dish-kibbeh-kras',
      name_ar: 'أقراص كبة مقلية باللحم والصنوبر',
      name_en: 'Crisp Fried Kibbeh with Pine Nuts',
      description_ar: 'أقراص كبة مقرمشة محشوة باللحم المفروم المتبل والبصل والصنوبر المحمص على الطريقة الشامية.',
      description_en: 'Golden bulgur shells stuffed with seasoned minced meat, sweet onions, and toasted Aleppo pine nuts.',
      price: 48,
      currency: 'SAR',
      category_id: 'cat-hot-appetizers',
      category_name_ar: 'المقبلات الساخنة والفطائر',
      category_name_en: 'Hot Appetizers & Savories',
      image_url: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=80',
      allergens: ['gluten', 'nuts'],
      ingredients_ar: ['برغل ناعم', 'لحم عجل طازج', 'صنوبر', 'بصل', 'بهارات دمشقية'],
      ingredients_en: ['Fine Bulgur', 'Fresh Beef', 'Pine Nuts', 'Onion', 'Damascene Spices'],
      is_available: true,
      is_published: true,
      is_featured: true,
      sort_order: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'dish-mixed-grill-royal',
      name_ar: 'مشاوي مشكلة فاخرة على الفحم',
      name_en: 'Royal Charcoal Mixed Grill Platter',
      description_ar: 'تشكيلة ممتازة من كباب اللحم الحلبي، أوصال لحم الغنم النعيمي، وشيش طاووق الدجاج المتبل، تقدم مع الخبز البيوازي والبصل المشوي.',
      description_en: 'Selection of Aleppian minced lamb kebab, tender Naemi lamb cubes, and marinated shish tawook served over spiced biwaz bread.',
      price: 115,
      currency: 'SAR',
      category_id: 'cat-mains-grill',
      category_name_ar: 'المشاوي والأطباق الرئيسية',
      category_name_en: 'Charcoal Grills & Main Courses',
      image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      allergens: ['dairy', 'gluten'],
      ingredients_ar: ['لحم غنم نعيمي', 'صدر دجاج متبل', 'خبز بيوازي', 'بصل وطماطم مشوية', 'توابل الفحم'],
      ingredients_en: ['Naemi Lamb', 'Marinated Chicken Breast', 'Biwaz Bread', 'Charred Onions', 'House Marinade'],
      is_available: true,
      is_published: true,
      is_featured: true,
      sort_order: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'dish-halawat-jibn',
      name_ar: 'حلاوة الجبن الحمصية بالقشطة البلدية',
      name_en: 'Homsi Halawet El Jibn with Clotted Cream',
      description_ar: 'لفائف الجبن الحلو الطرية محشوة بالقشطة البلدية الطازجة، مزينة بالفستق الحلبي وقطر ماء الورد.',
      description_en: 'Delicate sweet cheese rolls filled with fresh clotted cream (ashta), garnished with crushed pistachios and rosewater syrup.',
      price: 45,
      currency: 'SAR',
      category_id: 'cat-desserts',
      category_name_ar: 'الحلويات الشرقية الفاخرة',
      category_name_en: 'Eastern Desserts & Delights',
      image_url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
      allergens: ['dairy', 'nuts', 'gluten'],
      ingredients_ar: ['جبن عكاوي محلى', 'قشطة بلدية', 'فستق حلبي', 'ماء ورد', 'قطر معطر'],
      ingredients_en: ['Sweet Akkawi Cheese', 'Ashta Cream', 'Pistachios', 'Rosewater', 'Scented Syrup'],
      is_available: true,
      is_published: true,
      is_featured: true,
      sort_order: 6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'dish-lemon-mint-cooler',
      name_ar: 'عصير الليمون بالنعناع المنعش',
      name_en: 'Signature Fresh Lemon Mint Cooler',
      description_ar: 'عصير ليمون طازج معصور يدوياً مع أوراق النعناع الأخضر المنعش والثلج المجروش.',
      description_en: 'Hand-pressed fresh lemon juice blended with crisp garden mint leaves and crushed ice.',
      price: 28,
      currency: 'SAR',
      category_id: 'cat-beverages',
      category_name_ar: 'المشروبات وعصائر الضيافة',
      category_name_en: 'Beverages & Signature Coolers',
      image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
      allergens: [],
      ingredients_ar: ['ليمون طازج', 'نعناع بلدي', 'ثلج نقي', 'عسل خفيف'],
      ingredients_en: ['Fresh Lemon', 'Garden Mint', 'Crushed Ice', 'Touch of Honey'],
      is_available: true,
      is_published: true,
      is_featured: false,
      sort_order: 7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const initialGallery: GalleryItem[] = [
    {
      id: 'gal-1',
      title_ar: 'صالة الطعام والأجواء المعمارية',
      title_en: 'Dining Hall & Architecture',
      alt_ar: 'صالة الطعام الهادئة داخل مطعم مينا في فندق تلال الرياض',
      alt_en: 'Serene dining hall interior at MeNa Restaurant in Tilal Riyadh Hotel',
      image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85',
      category: 'ambiance',
      created_at: new Date().toISOString()
    },
    {
      id: 'gal-2',
      title_ar: 'تنسيق الطاولات والضيافة الراقية',
      title_en: 'Table Setting & Refined Hospitality',
      alt_ar: 'تفاصيل تنسيق الطاولات الفاخرة وأدوات الضيافة',
      alt_en: 'Luxury table layout and hospitality table setting',
      image_url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=85',
      category: 'dining',
      created_at: new Date().toISOString()
    },
    {
      id: 'gal-3',
      title_ar: 'طريقة تقديم الأطباق التراثية',
      title_en: 'Heritage Dish Presentation',
      alt_ar: 'تقديم متميز للمأكولات الشامية والمازة الطازجة',
      alt_en: 'Elegant presentation of Levantine mezze and dishes',
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85',
      category: 'dishes',
      created_at: new Date().toISOString()
    },
    {
      id: 'gal-4',
      title_ar: 'جلسات عائلية هادئة وخاصة',
      title_en: 'Intimate Family Seating',
      alt_ar: 'جلسات دافئة تتسع للعائلات واللقاءات الراقية',
      alt_en: 'Warm ambiance suitable for family dining and distinguished guests',
      image_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=85',
      category: 'ambiance',
      created_at: new Date().toISOString()
    }
  ];

  return {
    settings: initialSettings,
    categories: initialCategories,
    dishes: initialDishes,
    gallery: initialGallery,
    reservations: [],
    admins: [
      {
        id: 'admin-1',
        email: 'admin@tilalhotels.com',
        name: 'مدير مطعم مينا - تلال الرياض',
        password_hash: initialPasswordHash,
        role: 'super_admin',
        created_at: new Date().toISOString()
      }
    ],
    audit_logs: [
      {
        id: 'log-1',
        action: 'INITIALIZE_SYSTEM',
        performed_by: 'system',
        details: 'تهيئة النظام الأساسي وقاعدة بيانات مطعم مينا - فندق تلال الرياض',
        timestamp: new Date().toISOString()
      }
    ]
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content) as DatabaseSchema;
      }
    } catch (err) {
      console.error('[DB] Failed to read database file, initializing fallback:', err);
    }
    const initial = createInitialDatabase();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(dataToSave: DatabaseSchema) {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('[DB] Failed to save database file:', err);
    }
  }

  private save() {
    this.saveDirect(this.data);
  }

  // Settings
  getSettings(): SiteSettings {
    return { ...this.data.settings };
  }

  updateSettings(newSettings: Partial<SiteSettings>, performedBy: string): SiteSettings {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.logAudit('UPDATE_SETTINGS', performedBy, 'تحديث إعدادات وبيانات الموقع الرئيسية');
    this.save();
    return this.getSettings();
  }

  // Categories
  getCategories(onlyPublished = false): Category[] {
    let list = [...this.data.categories];
    if (onlyPublished) {
      list = list.filter(c => c.is_published);
    }
    return list.sort((a, b) => a.sort_order - b.sort_order);
  }

  createCategory(category: Omit<Category, 'id' | 'created_at'>, performedBy: string): Category {
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.data.categories.push(newCategory);
    this.logAudit('CREATE_CATEGORY', performedBy, `إضافة تصنيف جديد: ${newCategory.name_ar} (${newCategory.name_en})`);
    this.save();
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<Category>, performedBy: string): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.logAudit('UPDATE_CATEGORY', performedBy, `تعديل تصنيف: ${this.data.categories[idx].name_ar}`);
    this.save();
    return this.data.categories[idx];
  }

  deleteCategory(id: string, performedBy: string): boolean {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    const catName = this.data.categories[idx].name_ar;
    this.data.categories.splice(idx, 1);
    this.logAudit('DELETE_CATEGORY', performedBy, `حذف تصنيف: ${catName}`);
    this.save();
    return true;
  }

  // Dishes
  getDishes(all = false): Dish[] {
    let list = [...this.data.dishes];
    if (!all) {
      list = list.filter(d => d.is_published);
    }
    // Enrich category names if needed
    const catMap = new Map(this.data.categories.map(c => [c.id, c]));
    list = list.map(d => {
      const c = catMap.get(d.category_id);
      return {
        ...d,
        category_name_ar: c ? c.name_ar : d.category_name_ar,
        category_name_en: c ? c.name_en : d.category_name_en
      };
    });
    return list.sort((a, b) => a.sort_order - b.sort_order);
  }

  getDishById(id: string): Dish | null {
    const dish = this.data.dishes.find(d => d.id === id);
    if (!dish) return null;
    const c = this.data.categories.find(cat => cat.id === dish.category_id);
    return {
      ...dish,
      category_name_ar: c ? c.name_ar : dish.category_name_ar,
      category_name_en: c ? c.name_en : dish.category_name_en
    };
  }

  createDish(dish: Omit<Dish, 'id' | 'created_at' | 'updated_at'>, performedBy: string): Dish {
    const now = new Date().toISOString();
    const newDish: Dish = {
      ...dish,
      id: `dish-${Date.now()}`,
      created_at: now,
      updated_at: now
    };
    this.data.dishes.push(newDish);
    this.logAudit('CREATE_DISH', performedBy, `إضافة طبق جديد: ${newDish.name_ar} (${newDish.name_en})`);
    this.save();
    return newDish;
  }

  updateDish(id: string, updates: Partial<Dish>, performedBy: string): Dish | null {
    const idx = this.data.dishes.findIndex(d => d.id === id);
    if (idx === -1) return null;
    this.data.dishes[idx] = {
      ...this.data.dishes[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.logAudit('UPDATE_DISH', performedBy, `تعديل طبق: ${this.data.dishes[idx].name_ar}`);
    this.save();
    return this.data.dishes[idx];
  }

  deleteDish(id: string, performedBy: string): boolean {
    const idx = this.data.dishes.findIndex(d => d.id === id);
    if (idx === -1) return false;
    const dishName = this.data.dishes[idx].name_ar;
    this.data.dishes.splice(idx, 1);
    this.logAudit('DELETE_DISH', performedBy, `حذف طبق: ${dishName}`);
    this.save();
    return true;
  }

  // Gallery
  getGallery(): GalleryItem[] {
    return [...this.data.gallery];
  }

  addGalleryItem(item: Omit<GalleryItem, 'id' | 'created_at'>, performedBy: string): GalleryItem {
    const newItem: GalleryItem = {
      ...item,
      id: `gal-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.data.gallery.push(newItem);
    this.logAudit('ADD_GALLERY_IMAGE', performedBy, `إضافة صورة للمعرض: ${newItem.title_ar}`);
    this.save();
    return newItem;
  }

  deleteGalleryItem(id: string, performedBy: string): boolean {
    const idx = this.data.gallery.findIndex(g => g.id === id);
    if (idx === -1) return false;
    const title = this.data.gallery[idx].title_ar;
    this.data.gallery.splice(idx, 1);
    this.logAudit('DELETE_GALLERY_IMAGE', performedBy, `حذف صورة من المعرض: ${title}`);
    this.save();
    return true;
  }

  // Reservations
  getReservations(): Reservation[] {
    return [...this.data.reservations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  createReservation(reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'status'>): Reservation {
    const now = new Date().toISOString();
    const newRes: Reservation = {
      ...reservation,
      id: `res-${Date.now()}`,
      status: 'new',
      created_at: now,
      updated_at: now
    };
    this.data.reservations.push(newRes);
    this.save();
    return newRes;
  }

  updateReservationStatus(id: string, status: Reservation['status'], internalNotes: string | undefined, performedBy: string): Reservation | null {
    const idx = this.data.reservations.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.reservations[idx] = {
      ...this.data.reservations[idx],
      status,
      internal_notes: internalNotes !== undefined ? internalNotes : this.data.reservations[idx].internal_notes,
      updated_at: new Date().toISOString()
    };
    this.logAudit('UPDATE_RESERVATION', performedBy, `تحديث حالة حجز ${id} إلى ${status}`);
    this.save();
    return this.data.reservations[idx];
  }

  // Admins & Auth
  findAdminByEmail(email: string): AdminUser | null {
    return this.data.admins.find(a => a.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }

  updateAdminPassword(email: string, newHash: string, performedBy: string): boolean {
    const admin = this.findAdminByEmail(email);
    if (!admin) return false;
    admin.password_hash = newHash;
    this.logAudit('CHANGE_PASSWORD', performedBy, `تغيير كلمة المرور للمستخدم: ${email}`);
    this.save();
    return true;
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return [...this.data.audit_logs].reverse();
  }

  private logAudit(action: string, performedBy: string, details: string) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      performed_by: performedBy,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.audit_logs.push(log);
    // Keep max 500 logs
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs.shift();
    }
  }

  // Dashboard Stats
  getStats() {
    const dishes = this.data.dishes;
    return {
      total_dishes: dishes.length,
      published_dishes: dishes.filter(d => d.is_published).length,
      draft_dishes: dishes.filter(d => !d.is_published).length,
      unavailable_dishes: dishes.filter(d => !d.is_available).length,
      total_categories: this.data.categories.length,
      total_gallery_images: this.data.gallery.length,
      total_reservations: this.data.reservations.length,
      pending_reservations: this.data.reservations.filter(r => r.status === 'new' || r.status === 'pending').length,
      recent_logs: this.getAuditLogs().slice(0, 5)
    };
  }

  // Full export
  getFullData(): DatabaseSchema {
    return JSON.parse(JSON.stringify(this.data));
  }
}

export const db = new Database();
