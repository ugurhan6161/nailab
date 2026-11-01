# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Vercel Global Config ile ürün kataloğu

Mağaza ürünleri ve fiyatları, Global Config deposundaki `products` anahtarından okunur. Tarayıcı Global Config bağlantı bilgisini görmez; `api/products.ts` bu veriyi sunucu tarafında `/api/products` üzerinden sunar. Admin panelindeki içerik düzenleyici ürünleri, fiyatları ve müşteri ekranı metinlerini düzenler; kaydetme işlemi Vercel Global Config'i günceller.

### Vercel kurulumu

`vercel.json`, istemci taraflı React Router sayfalarını `/index.html` dosyasına yeniden yazar; böylece `/admin/giris` gibi adresler yenilendiğinde 404 yerine uygulama açılır. `/api/*` serverless fonksiyonları kendi uç noktalarında çalışmaya devam eder.

1. Vercel projesinde `nailab-global-config` deposunu projeye bağlayın. Proje ortam değişkenlerinde `GLOBAL_CONFIG` veya `EDGE_CONFIG` bağlantı değişkeninin oluştuğunu doğrulayın. Değişkeni `VITE_` önekiyle eklemeyin.
2. Global Config düzenleyicisindeki JSON nesnesini [`config/global-config.json`](./config/global-config.json) içeriğiyle başlatın. En üst düzey değer nesne olmalı ve `products` ile `websiteData` anahtarlarını birlikte içermelidir. `websiteData.copy`, müşteri sayfalarındaki metinlerin başlangıç değerlerini içerir.
3. Vercel projesinin Environment Variables bölümünde aşağıdaki değişkenleri Preview ve Production ortamlarına ekleyin:
   - `ADMIN_EMAIL`: yönetici giriş e-postası.
   - `ADMIN_PASSWORD`: yönetici giriş şifresi.
   - `ADMIN_SESSION_SECRET`: en az 32 baytlık rastgele bir gizli değer. Yerel makinede `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` ile üretilebilir.
   - `VERCEL_TOKEN`: Global Config'i okuma/yazma yetkisi olan Vercel erişim token'ı.
   - `VERCEL_GLOBAL_CONFIG_ID`: Global Config ID'si (bu depo için `ecfg_hsu4rkyec8wyol2atp0qpslpy21g`).
   - `VERCEL_TEAM_ID`: Global Config bir Vercel takımına aitse o takımın Team ID'si; kişisel Global Config için boş bırakın.
   - `SUPABASE_URL`: admin sipariş API'sinin sunucuda kullanacağı Supabase proje URL'si. İstemci yapılandırmasındaki `VITE_SUPABASE_URL` ile aynı değerdir.
   - `SUPABASE_SERVICE_ROLE_KEY`: admin sipariş ekranının sunucu tarafında Supabase'e erişmesi için Service Role key'i. **Bu değişkeni `VITE_` önekiyle tanımlamayın.**
   - `GLOBAL_CONFIG` (veya `EDGE_CONFIG`): Vercel'in Global Config bağlantı değişkeni.
4. `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `VERCEL_TOKEN` ve `SUPABASE_SERVICE_ROLE_KEY` yalnızca sunucu ortam değişkenleri olmalıdır; bunları kaynak koda veya `VITE_` değişkenlerine koymayın. `SUPABASE_URL` için de Vercel'de sunucu ortam değişkeni tanımlayın. Değişkenleri ekledikten sonra yeni bir deployment yayınlayın.
5. `/admin/giris` adresinden `ADMIN_EMAIL` ve `ADMIN_PASSWORD` ile giriş yapın. HttpOnly oturum çerezi sunucu tarafından imzalanır. `/admin/icerik` ekranında ürün ekleyip düzenleyebilir/silebilir, site metinlerini sayfa adına göre arayıp düzenleyebilir ve tüm değişiklikleri tek seferde kaydedebilirsiniz. Kaydetme yeni bir deployment gerektirmez.

Her ürün için `id`, `title`, `category`, `price`, `image` ve `description` alanları zorunludur. `price` sayı olarak TL tutarıdır (ör. `1250`); `rating`, `reviews`, `stock`, `badge` ve `isNew` isteğe bağlıdır. `stock` verilmezse 50 kabul edilir. Ürün kimlikleri benzersiz olmalıdır.

### Yerel geliştirme

Vercel CLI ile projeyi bağladıktan sonra `vercel env pull .env.local` komutuyla gerekli değişkenleri alın ve `vercel dev` çalıştırın; Vite'ın tek başına geliştirme sunucusu `/api` serverless fonksiyonlarını çalıştırmaz. `.env.local` dosyasını repoya eklemeyin. Ürün API'si yapılandırma hatalarında sahte fiyatlar göstermek yerine açık hata verir.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
