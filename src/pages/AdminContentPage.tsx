import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Checkbox, CircularProgress,
  Container, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Paper, Select, Stack, Tab, Tabs,
  TextField, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useProducts } from '../context/ProductsContext';
import { useWebsiteData } from '../context/WebsiteDataContext';
import type { CategoryItem, StoreProduct } from '../lib/ecommerceData';
import type { AcademyCourse } from '../lib/supabase';
import defaults from '../../config/websiteData.json';
import { supabase } from '../lib/supabase';

type WebsiteData = {
  copy: Record<string, string>;
  [key: string]: unknown;
};

type CategoryDraft = Omit<CategoryItem, 'databaseId'> & {
  databaseId?: string;
  draftKey: string;
  sortOrder: number;
};

type CourseDraft = Omit<AcademyCourse, 'id' | 'created_at'> & {
  id?: string;
  draftKey: string;
};

const defaultCopy = defaults.copy as Record<string, string>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toCategoryDraft(category: CategoryItem, sortOrder: number): CategoryDraft {
  return { ...category, draftKey: category.databaseId, sortOrder };
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminContentPage() {
  const { authenticated, loading: authLoading, logout } = useAdminAuth();
  const { products, categories, loading: productsLoading, error: productsError, refresh } = useProducts();
  const { updateWebsiteData } = useWebsiteData();
  const navigate = useNavigate();
  const [websiteData, setWebsiteData] = useState<WebsiteData>({ copy: {} });
  const [productDrafts, setProductDrafts] = useState<StoreProduct[] | null>(null);
  const [categoryDraftsState, setCategoryDrafts] = useState<CategoryDraft[] | null>(null);
  const [courseDrafts, setCourseDrafts] = useState<CourseDraft[]>([]);
  const [copySearch, setCopySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [expandedCopySections, setExpandedCopySections] = useState<string[]>(['src/pages/HomePage.tsx']);
  const [tab, setTab] = useState(0);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [loadingWebsiteData, setLoadingWebsiteData] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [websiteDataLoaded, setWebsiteDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copyKeyDraft, setCopyKeyDraft] = useState('');
  const [copyValueDraft, setCopyValueDraft] = useState('');

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { data, error: loadError } = await supabase
          .from('website_content')
          .select('data')
          .eq('id', 'site')
          .maybeSingle();
        if (loadError) throw loadError;
        const remote = isRecord(data?.data) ? data.data : {};
        const remoteCopy = isRecord(remote.copy) ? remote.copy : {};
        const copy = Object.fromEntries(
          Object.entries({ ...defaultCopy, ...remoteCopy })
            .filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
        );
        if (active) {
          setWebsiteData({ ...remote, copy });
          setWebsiteDataLoaded(true);
        }
      } catch (loadError: unknown) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Website metinleri yüklenemedi.');
      } finally {
        if (active) setLoadingWebsiteData(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { data, error: loadError } = await supabase
          .from('academy_courses')
          .select('id, title, description, instructor, duration, level, price, image_url, is_active, created_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (loadError) throw loadError;
        if (active) {
          setCourseDrafts((data ?? []).map((course) => ({
            ...course,
            price: Number(course.price),
            draftKey: course.id,
          })));
        }
      } catch (loadError: unknown) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Eğitimler yüklenemedi.');
      } finally {
        if (active) setLoadingCourses(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!authLoading && !authenticated) navigate('/admin/giris');
  }, [authLoading, authenticated, navigate]);

  const visibleCopy = useMemo(
    () => Object.entries(websiteData.copy).filter(([key, value]) =>
      `${key} ${value} ${defaultCopy[key] ?? ''}`
        .toLocaleLowerCase('tr-TR').includes(copySearch.toLocaleLowerCase('tr-TR')),
    ),
    [copySearch, websiteData.copy],
  );
  const groupedCopy = useMemo(() => {
    const groups = new Map<string, Array<[string, string]>>();
    for (const entry of visibleCopy) {
      const separator = entry[0].indexOf('#');
      const section = separator < 0 ? 'Genel' : entry[0].slice(0, separator);
      groups.set(section, [...(groups.get(section) ?? []), entry]);
    }
    return [...groups.entries()];
  }, [visibleCopy]);
  const editableProducts = productDrafts ?? products;
  const categoryDrafts = categoryDraftsState ?? categories.map(toCategoryDraft);
  const visibleProducts = editableProducts.filter((product) =>
    `${product.title} ${product.category} ${product.id}`
      .toLocaleLowerCase('tr-TR').includes(productSearch.toLocaleLowerCase('tr-TR')),
  );
  const visibleCategories = categoryDrafts.filter((category) =>
    `${category.title} ${category.tag} ${category.description}`
      .toLocaleLowerCase('tr-TR').includes(categorySearch.toLocaleLowerCase('tr-TR')),
  );

  if (!authLoading && !authenticated) return null;

  if (authLoading || productsLoading || loadingWebsiteData || loadingCourses) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>;
  }

  const updateProduct = (id: string, field: keyof StoreProduct, value: string | number | boolean) => {
    setProductDrafts((current) => (current ?? products).map((product) =>
      product.id === id ? { ...product, [field]: value } : product,
    ));
    setNotice(null);
  };

  const addProduct = () => {
    const id = `urun-${Date.now()}`;
    setProductDrafts((current) => [...(current ?? products), {
      id,
      title: '',
      category: categoryDrafts[0]?.tag ?? categories[0]?.tag ?? '',
      price: 0,
      image: '',
      description: '',
      rating: 0,
      reviews: 0,
      stock: 0,
    }]);
  };

  const saveProducts = async () => {
    setSavingSection('products');
    setError(null);
    setNotice(null);
    try {
      const submittedSlugs = new Set(editableProducts.map((product) => product.id));
      const validCategorySlugs = new Set(categories.map((category) => category.tag));
      const productRows = editableProducts.map((product) => ({
        ...(product.databaseId ? { id: product.databaseId } : {}),
        slug: product.id,
        name: product.title.trim(),
        category: product.category.trim(),
        price: product.price,
        image_url: product.image.trim(),
        description: product.description.trim(),
        stock: product.stock ?? 0,
        rating: product.rating,
        review_count: product.reviews,
        badge: product.badge?.trim() || null,
        is_new: product.isNew ?? false,
        is_active: true,
      }));
      if (productRows.some((product) =>
        !product.name || !validCategorySlugs.has(product.category) || !product.image_url ||
        !product.description || !Number.isFinite(product.price) || product.price < 0 ||
        !Number.isInteger(product.stock) || product.stock < 0 ||
        !Number.isFinite(product.rating) || product.rating < 0 || product.rating > 5 ||
        !Number.isInteger(product.review_count) || product.review_count < 0,
      )) {
        throw new Error('Ürünlerde ad, kayıtlı kategori, görsel ve açıklama zorunludur. Fiyat, stok ve puan değerlerini kontrol edin.');
      }

      if (productRows.length > 0) {
        const { error: productsSaveError } = await supabase
          .from('products')
          .upsert(productRows, { onConflict: 'slug' });
        if (productsSaveError) throw new Error(`Ürünler kaydedilemedi: ${productsSaveError.message}`);
      }

      const { data: existingProducts, error: existingProductsError } = await supabase
        .from('products')
        .select('id, slug')
        .eq('is_active', true);
      if (existingProductsError) throw new Error(`Ürün listesi doğrulanamadı: ${existingProductsError.message}`);

      const removedIds = (existingProducts ?? [])
        .filter((product) => product.slug && !submittedSlugs.has(product.slug))
        .map((product) => product.id);
      if (removedIds.length > 0) {
        const { error: deactivateError } = await supabase
          .from('products')
          .update({ is_active: false })
          .in('id', removedIds);
        if (deactivateError) throw new Error(`Kaldırılan ürünler satıştan çıkarılamadı: ${deactivateError.message}`);
      }

      setProductDrafts(null);
      setNotice('Ürün değişiklikleri kaydedildi. Kaldırılan ürünler sipariş geçmişi korunarak satıştan çıkarıldı.');
      refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Ürünler kaydedilemedi.');
    } finally {
      setSavingSection(null);
    }
  };

  const updateCategory = (draftKey: string, field: keyof CategoryDraft, value: string | number | boolean) => {
    setCategoryDrafts((current) => (current ?? categories.map(toCategoryDraft)).map((category) =>
      category.draftKey === draftKey
        ? {
          ...category,
          [field]: value,
          ...(field === 'tag' && typeof value === 'string' ? { id: value } : {}),
        }
        : category,
    ));
    setNotice(null);
  };

  const addCategory = () => {
    const draftKey = `new-${Date.now()}`;
    setCategoryDrafts((current) => [...(current ?? categories.map(toCategoryDraft)), {
      id: '',
      tag: '',
      title: '',
      image: '',
      description: '',
      itemCount: 0,
      isFeatured: false,
      draftKey,
      sortOrder: (current ?? categories.map(toCategoryDraft)).length + 1,
    }]);
  };

  const saveCategory = async (category: CategoryDraft) => {
    const slug = slugify(category.tag || category.title);
    if (!category.title.trim() || !slug || !category.image.trim()) {
      setError('Kategori adı, slug ve görsel alanları zorunludur.');
      return;
    }
    setSavingSection(`category-${category.draftKey}`);
    setError(null);
    setNotice(null);
    try {
      const { data, error: saveError } = await supabase.rpc('save_product_category', {
        p_id: category.databaseId ?? null,
        p_slug: slug,
        p_title: category.title.trim(),
        p_description: category.description.trim(),
        p_image_url: category.image.trim(),
        p_is_featured: category.isFeatured,
        p_sort_order: category.sortOrder,
      });
      if (saveError) throw saveError;
      const savedCategory = data as {
        id: string;
        slug: string;
        title: string;
        description: string;
        image_url: string;
        is_featured: boolean;
        sort_order: number;
      };
      setCategoryDrafts((current) => (current ?? categories.map(toCategoryDraft)).map((entry) => entry.draftKey === category.draftKey
        ? {
          ...entry,
          id: savedCategory.slug,
          tag: savedCategory.slug,
          databaseId: savedCategory.id,
          title: savedCategory.title,
          description: savedCategory.description,
          image: savedCategory.image_url,
          isFeatured: savedCategory.is_featured,
          sortOrder: savedCategory.sort_order,
        }
        : entry));
      setNotice(`“${savedCategory.title}” kategorisi kaydedildi; slug değiştiyse ürün bağlantıları da güncellendi.`);
      refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Kategori kaydedilemedi.');
    } finally {
      setSavingSection(null);
    }
  };

  const deleteCategory = async (category: CategoryDraft) => {
    if (!category.databaseId) {
      setCategoryDrafts((current) => (current ?? categories.map(toCategoryDraft)).filter((entry) => entry.draftKey !== category.draftKey));
      return;
    }
    const productCount = products.filter((product) => product.category === category.tag).length;
    const detail = productCount > 0
      ? ` Bu kategorideki ${productCount} aktif ürün satıştan çıkarılacak. Sipariş geçmişi korunur.`
      : '';
    if (!window.confirm(`“${category.title}” kategorisi kalıcı olarak silinsin mi?${detail}`)) return;
    setSavingSection(`category-${category.draftKey}`);
    setError(null);
    setNotice(null);
    try {
      const { error: deleteError } = await supabase.rpc('delete_product_category', { p_id: category.databaseId });
      if (deleteError) throw deleteError;
      setCategoryDrafts((current) => (current ?? categories.map(toCategoryDraft)).filter((entry) => entry.draftKey !== category.draftKey));
      setProductDrafts(null);
      setNotice(`“${category.title}” kategorisi silindi.${productCount > 0 ? ` ${productCount} ürün satıştan çıkarıldı.` : ''}`);
      refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Kategori silinemedi.');
    } finally {
      setSavingSection(null);
    }
  };

  const addCourse = () => {
    const draftKey = `new-${Date.now()}`;
    setCourseDrafts((current) => [...current, {
      draftKey,
      title: '',
      description: '',
      instructor: '',
      duration: '',
      level: 'Başlangıç',
      price: 0,
      image_url: '',
      is_active: true,
    }]);
  };

  const updateCourse = (draftKey: string, field: keyof CourseDraft, value: string | number | boolean) => {
    setCourseDrafts((current) => current.map((course) =>
      course.draftKey === draftKey ? { ...course, [field]: value } : course,
    ));
    setNotice(null);
  };

  const saveCourses = async () => {
    setSavingSection('courses');
    setError(null);
    setNotice(null);
    try {
      const courseRows = courseDrafts.map((course) => ({
        ...(course.id ? { id: course.id } : {}),
        title: course.title.trim(),
        description: course.description.trim(),
        instructor: course.instructor.trim(),
        duration: course.duration.trim(),
        level: course.level.trim(),
        price: course.price,
        image_url: course.image_url.trim(),
        is_active: true,
      }));
      if (courseRows.some((course) =>
        !course.title || !course.description || !course.instructor || !course.duration ||
        !course.level || !course.image_url || !Number.isFinite(course.price) || course.price < 0,
      )) {
        throw new Error('Her eğitim için ad, açıklama, eğitmen, süre, seviye ve görsel girin; fiyat negatif olamaz.');
      }
      let savedCourseIds: string[] = [];
      if (courseRows.length > 0) {
        const { data: savedCourses, error: saveError } = await supabase
          .from('academy_courses')
          .upsert(courseRows)
          .select('id');
        if (saveError) throw new Error(`Eğitimler kaydedilemedi: ${saveError.message}`);
        savedCourseIds = (savedCourses ?? []).map((course) => course.id);
      }

      const { data: existingCourses, error: existingError } = await supabase
        .from('academy_courses')
        .select('id')
        .eq('is_active', true);
      if (existingError) throw new Error(`Eğitim listesi doğrulanamadı: ${existingError.message}`);
      const retainedIds = new Set([
        ...courseDrafts.flatMap((course) => course.id ? [course.id] : []),
        ...savedCourseIds,
      ]);
      const removedIds = (existingCourses ?? [])
        .filter((course) => !retainedIds.has(course.id))
        .map((course) => course.id);
      if (removedIds.length > 0) {
        const { error: deactivateError } = await supabase
          .from('academy_courses')
          .update({ is_active: false })
          .in('id', removedIds);
        if (deactivateError) throw new Error(`Kaldırılan eğitimler devre dışı bırakılamadı: ${deactivateError.message}`);
      }
      setCourseDrafts([]);
      setNotice('Eğitim değişiklikleri kaydedildi. Kaldırılan eğitimler geçmiş kayıtlar korunarak yayından kaldırıldı.');
      setLoadingCourses(true);
      const { data, error: reloadError } = await supabase
        .from('academy_courses')
        .select('id, title, description, instructor, duration, level, price, image_url, is_active, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (reloadError) throw reloadError;
      setCourseDrafts((data ?? []).map((course) => ({
        ...course,
        price: Number(course.price),
        draftKey: course.id,
      })));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Eğitimler kaydedilemedi.');
    } finally {
      setLoadingCourses(false);
      setSavingSection(null);
    }
  };

  const saveWebsiteData = async () => {
    setSavingSection('copy');
    setError(null);
    setNotice(null);
    try {
      const { error: saveError } = await supabase
        .from('website_content')
        .upsert({ id: 'site', data: websiteData, updated_at: new Date().toISOString() });
      if (saveError) throw new Error(`Web sitesi metinleri kaydedilemedi: ${saveError.message}`);
      updateWebsiteData(websiteData);
      setNotice('Web sitesi metinleri Supabase’e kaydedildi.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Web sitesi metinleri kaydedilemedi.');
    } finally {
      setSavingSection(null);
    }
  };

  const addCopy = () => {
    const key = copyKeyDraft.trim();
    if (!key || !copyValueDraft.trim()) {
      setError('Yeni metin için benzersiz bir anahtar ve metin değeri girin.');
      return;
    }
    if (Object.hasOwn(websiteData.copy, key)) {
      setError('Bu metin anahtarı zaten var.');
      return;
    }
    setWebsiteData((current) => ({ ...current, copy: { ...current.copy, [key]: copyValueDraft } }));
    setCopyKeyDraft('');
    setCopyValueDraft('');
    setError(null);
    setNotice('Yeni metin taslağı eklendi. Kalıcı olması için metinleri kaydedin.');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Çıkış yapılamadı.');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'background.paper', py: 2.5 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 20, fontWeight: 700, color: 'text.primary' }}>
            İçerik Yönetimi
          </Typography>
          <Button onClick={handleLogout} size="small" variant="outlined" color="secondary">Çıkış</Button>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 0.5 }}>
          {[
            { label: 'Genel Bakış', href: '/admin', icon: <DashboardOutlinedIcon sx={{ fontSize: 17 }} /> },
            { label: 'İçerik Yönetimi', href: '/admin/icerik', icon: <Inventory2OutlinedIcon sx={{ fontSize: 17 }} /> },
            { label: 'Siparişler', href: '/admin/siparisler', icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 17 }} /> },
          ].map((item) => (
            <Button key={item.href} component={Link} to={item.href} startIcon={item.icon}
              variant={item.href === '/admin/icerik' ? 'contained' : 'outlined'} color="secondary" size="small">
              {item.label}
            </Button>
          ))}
        </Stack>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>Mağaza ve site içeriği</Typography>
          <Typography color="text.secondary">
            Ürünleri, kategorileri, eğitimleri ve sayfa metinlerini ayrı ayrı yönetin.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {productsError && <Alert severity="error" sx={{ mb: 2 }}>{productsError}</Alert>}
        {notice && <Alert severity="success" role="status" sx={{ mb: 2 }} onClose={() => setNotice(null)}>{notice}</Alert>}

        <Paper variant="outlined" sx={{ mb: 3 }}>
          <Tabs value={tab} onChange={(_, value: number) => setTab(value)} variant="scrollable" allowScrollButtonsMobile
            aria-label="İçerik yönetimi bölümleri">
            <Tab label={`Ürünler (${products.length})`} />
            <Tab label={`Kategoriler (${categories.length})`} />
            <Tab label={`Eğitimler (${courseDrafts.length})`} />
            <Tab label={`Site metinleri (${Object.keys(websiteData.copy).length})`} />
          </Tabs>
        </Paper>

        {tab === 0 && (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>Ürünler</Typography>
                <Typography color="text.secondary">Ürün kaldırma, ürünü satıştan çıkarır; mevcut sipariş kayıtları korunur.</Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button startIcon={<AddIcon />} onClick={addProduct}>Ürün ekle</Button>
                <Button variant="contained" color="secondary" startIcon={savingSection === 'products' ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                  onClick={() => void saveProducts()} disabled={savingSection !== null || Boolean(productsError)}>
                  {savingSection === 'products' ? 'Kaydediliyor…' : 'Ürünleri kaydet'}
                </Button>
              </Stack>
            </Box>
            <TextField value={productSearch} onChange={(event) => setProductSearch(event.target.value)}
              label="Ürün ara" InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            {visibleProducts.length === 0 && (
              <Alert severity="info">{productSearch ? 'Aramanızla eşleşen ürün bulunamadı.' : 'Henüz ürün yok. “Ürün ekle” ile başlayın.'}</Alert>
            )}
            {visibleProducts.map((product) => (
              <Accordion key={product.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 700 }}>
                    {product.title || 'Yeni ürün'} · {product.price.toLocaleString('tr-TR')} ₺
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Ürün adı" value={product.title}
                        onChange={(event) => updateProduct(product.id, 'title', event.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel id={`category-label-${product.id}`}>Kategori</InputLabel>
                        <Select labelId={`category-label-${product.id}`} label="Kategori" value={product.category}
                          onChange={(event) => updateProduct(product.id, 'category', event.target.value)}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category.databaseId} value={category.tag}>{category.title}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {([
                      ['price', 'Fiyat (TL)', 'number'],
                      ['image', 'Görsel yolu veya URL', 'text'],
                      ['description', 'Açıklama', 'text'],
                      ['stock', 'Stok', 'number'],
                      ['rating', 'Puan (0–5)', 'number'],
                      ['reviews', 'Yorum sayısı', 'number'],
                      ['badge', 'Etiket', 'text'],
                    ] as const).map(([field, label, type]) => (
                      <Grid key={field} size={{ xs: 12, sm: field === 'description' ? 12 : 6 }}>
                        <TextField fullWidth label={label} type={type}
                          multiline={field === 'description'} minRows={field === 'description' ? 2 : undefined}
                          value={product[field] ?? ''}
                          onChange={(event) => updateProduct(product.id, field, type === 'number' ? Number(event.target.value) : event.target.value)}
                          inputProps={type === 'number' ? {
                            min: 0,
                            max: field === 'rating' ? 5 : undefined,
                            step: field === 'price' || field === 'rating' ? '0.01' : '1',
                          } : undefined} />
                      </Grid>
                    ))}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControlLabel control={<Checkbox checked={product.isNew ?? false}
                        onChange={(event) => updateProduct(product.id, 'isNew', event.target.checked)} />} label="Yeni ürün etiketi" />
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button color="error" startIcon={<DeleteOutlineIcon />}
                        onClick={() => {
                          if (window.confirm(`“${product.title || 'Yeni ürün'}” ürünü satıştan çıkarılsın mı?`)) {
                            setProductDrafts((current) => (current ?? products).filter((entry) => entry.id !== product.id));
                          }
                        }}>
                        Satıştan kaldır
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}

        {tab === 1 && (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>Kategoriler</Typography>
                <Typography color="text.secondary">Slug değiştirildiğinde ilişkili ürünler yeni kategoriye taşınır.</Typography>
              </Box>
              <Button startIcon={<AddIcon />} onClick={addCategory}>Kategori ekle</Button>
            </Box>
            <TextField value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)}
              label="Kategori ara" InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            {visibleCategories.length === 0 && (
              <Alert severity="info">{categorySearch ? 'Aramanızla eşleşen kategori bulunamadı.' : 'Henüz kategori yok. “Kategori ekle” ile başlayın.'}</Alert>
            )}
            {visibleCategories.map((category) => {
              const isSaving = savingSection === `category-${category.draftKey}`;
              const linkedCount = products.filter((product) => product.category === category.tag).length;
              return (
                <Paper key={category.draftKey} variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Kategori adı" value={category.title}
                        onChange={(event) => updateCategory(category.draftKey, 'title', event.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Slug (URL anahtarı)" value={category.tag}
                        helperText="Küçük harf, rakam ve tire kullanın."
                        onChange={(event) => updateCategory(category.draftKey, 'tag', slugify(event.target.value))} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField fullWidth label="Açıklama" value={category.description}
                        multiline minRows={2}
                        onChange={(event) => updateCategory(category.draftKey, 'description', event.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Görsel yolu veya URL" value={category.image}
                        onChange={(event) => updateCategory(category.draftKey, 'image', event.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField fullWidth label="Sıralama" type="number" value={category.sortOrder}
                        onChange={(event) => updateCategory(category.draftKey, 'sortOrder', Number(event.target.value))} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <FormControlLabel control={<Checkbox checked={category.isFeatured}
                        onChange={(event) => updateCategory(category.draftKey, 'isFeatured', event.target.checked)} />} label="Öne çıkan" />
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary">{linkedCount} aktif ürün</Typography>
                      <Stack direction="row" spacing={1}>
                        <Button color="error" startIcon={<DeleteOutlineIcon />} disabled={isSaving}
                          onClick={() => void deleteCategory(category)}>Sil</Button>
                        <Button variant="contained" color="secondary"
                          startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                          disabled={savingSection !== null} onClick={() => void saveCategory(category)}>
                          {isSaving ? 'Kaydediliyor…' : 'Kategoriyi kaydet'}
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              );
            })}
          </Stack>
        )}

        {tab === 2 && (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>Akademi eğitimleri</Typography>
                <Typography color="text.secondary">Kaldırılan eğitimler yeni ziyaretçilere gösterilmez; mevcut kayıtlar korunur.</Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button startIcon={<AddIcon />} onClick={addCourse}>Eğitim ekle</Button>
                <Button variant="contained" color="secondary" startIcon={savingSection === 'courses' ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                  onClick={() => void saveCourses()} disabled={savingSection !== null}>
                  {savingSection === 'courses' ? 'Kaydediliyor…' : 'Eğitimleri kaydet'}
                </Button>
              </Stack>
            </Box>
            {courseDrafts.length === 0 && <Alert severity="info">Henüz eğitim yok. “Eğitim ekle” ile başlayın.</Alert>}
            {courseDrafts.map((course) => (
              <Accordion key={course.draftKey}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 700 }}>{course.title || 'Yeni eğitim'} · {course.price.toLocaleString('tr-TR')} ₺</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {([
                      ['title', 'Eğitim adı', 'text'],
                      ['instructor', 'Eğitmen', 'text'],
                      ['duration', 'Süre', 'text'],
                      ['level', 'Seviye', 'text'],
                      ['price', 'Fiyat (TL)', 'number'],
                      ['image_url', 'Görsel yolu veya URL', 'text'],
                      ['description', 'Açıklama', 'text'],
                    ] as const).map(([field, label, type]) => (
                      <Grid key={field} size={{ xs: 12, sm: field === 'description' ? 12 : 6 }}>
                        <TextField fullWidth label={label} type={type}
                          multiline={field === 'description'} minRows={field === 'description' ? 2 : undefined}
                          value={course[field] ?? ''}
                          onChange={(event) => updateCourse(course.draftKey, field, type === 'number' ? Number(event.target.value) : event.target.value)}
                          inputProps={type === 'number' ? { min: 0, step: '0.01' } : undefined} />
                      </Grid>
                    ))}
                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button color="error" startIcon={<DeleteOutlineIcon />}
                        onClick={() => {
                          if (window.confirm(`“${course.title || 'Yeni eğitim'}” yayından kaldırılsın mı?`)) {
                            setCourseDrafts((current) => current.filter((entry) => entry.draftKey !== course.draftKey));
                          }
                        }}>
                        Yayından kaldır
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}

        {tab === 3 && (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>Site metinleri</Typography>
                <Typography color="text.secondary">Metinler sayfalarına göre gruplanır. Bir metni bulmak için arayın.</Typography>
              </Box>
              <Button variant="contained" color="secondary"
                startIcon={savingSection === 'copy' ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                onClick={() => void saveWebsiteData()} disabled={savingSection !== null || !websiteDataLoaded}>
                {savingSection === 'copy' ? 'Kaydediliyor…' : 'Metinleri kaydet'}
              </Button>
            </Box>
            <Alert severity="info">
              Uygulamada kullanılan mevcut metinleri düzenleyebilir veya yeni anahtar ekleyebilirsiniz. Yeni anahtarların ekranda kullanılması için ilgili arayüzde de tanımlanması gerekir.
            </Alert>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h3" sx={{ fontSize: '1rem', mb: 1 }}>Yeni metin ekle</Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth label="Metin anahtarı" value={copyKeyDraft}
                    placeholder="src/pages/HomePage.tsx#hero-title"
                    onChange={(event) => setCopyKeyDraft(event.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Metin değeri" value={copyValueDraft}
                    onChange={(event) => setCopyValueDraft(event.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <Button fullWidth sx={{ height: '100%' }} startIcon={<AddIcon />} onClick={addCopy}>Ekle</Button>
                </Grid>
              </Grid>
            </Paper>
            <TextField value={copySearch} onChange={(event) => setCopySearch(event.target.value)}
              label="Metinlerde ara" InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            {visibleCopy.length === 0 && <Alert severity="info">Aramanızla eşleşen metin bulunamadı.</Alert>}
            {groupedCopy.map(([section, entries]) => (
              <Accordion key={section} expanded={expandedCopySections.includes(section)}
                onChange={(_, expanded) => setExpandedCopySections((current) =>
                  expanded ? [...new Set([...current, section])] : current.filter((entry) => entry !== section),
                )}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 700 }}>{section} · {entries.length} metin</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {entries.map(([key, value]) => (
                      <Paper key={key} variant="outlined" sx={{ p: 2 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'flex-start' }}>
                          <TextField fullWidth name={key}
                            label={(defaultCopy[key] ?? key).length > 60
                              ? `${(defaultCopy[key] ?? key).slice(0, 57)}…`
                              : defaultCopy[key] ?? key}
                            value={value}
                            multiline={(defaultCopy[key] ?? value).length > 80}
                            minRows={(defaultCopy[key] ?? value).length > 80 ? 2 : undefined}
                            helperText={key}
                            onChange={(event) => {
                              setWebsiteData((current) => ({ ...current, copy: { ...current.copy, [key]: event.target.value } }));
                              setNotice(null);
                            }} />
                          <Button color="error" startIcon={<DeleteOutlineIcon />}
                            disabled={defaultCopy[key] !== undefined && value === defaultCopy[key]}
                            onClick={() => {
                              const defaultValue = defaultCopy[key];
                              const question = defaultValue === undefined
                                ? `“${key}” metni silinsin mi?`
                                : `“${key}” metni varsayılana döndürülsün mü?`;
                              if (window.confirm(question)) {
                                setWebsiteData((current) => {
                                  const nextCopy = { ...current.copy };
                                  if (defaultValue === undefined) delete nextCopy[key];
                                  else nextCopy[key] = defaultValue;
                                  return { ...current, copy: nextCopy };
                                });
                              }
                            }}>
                            {defaultCopy[key] === undefined ? 'Sil' : value === defaultCopy[key] ? 'Varsayılan' : 'Varsayılana döndür'}
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
