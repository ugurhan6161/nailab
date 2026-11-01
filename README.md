# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Vercel Global Config ile ürün kataloğu

Mağaza ürünleri ve fiyatları, Global Config deposundaki `products` anahtarından okunur. Tarayıcı Global Config bağlantı bilgisini görmez; `api/products.ts` bu veriyi sunucu tarafında `/api/products` üzerinden sunar. Admin ürün ekranı aynı kataloğu gösterir; ürün ekleme, silme ve fiyat güncelleme Vercel panelinden yapılır.

### Vercel kurulumu

1. Vercel projesinde `nailab-global-config` deposunu projeye bağlayın. Proje ortam değişkenlerinde `GLOBAL_CONFIG` bağlantı değişkeninin oluştuğunu doğrulayın. Değişkeni `VITE_` önekiyle eklemeyin.
2. Global Config deposunda `products` adlı bir anahtar oluşturun. Değer olarak [`config/products.json`](./config/products.json) dosyasının tamamındaki JSON dizisini yapıştırın. Başlangıç kataloğu mevcut 8 mağaza ürününü içerir.
3. Kaydedin ve uygulamanın bir deployment'ını yayınlayın. Sonraki fiyat/ürün güncellemeleri için Global Config'teki `products` değerini düzenleyip kaydetmeniz yeterlidir; yeni deployment gerekmez. Mağazayı yenileyerek güncel kataloğu alın.

Her ürün için `id`, `title`, `category`, `price`, `image` ve `description` alanları zorunludur. `price` sayı olarak TL tutarıdır (ör. `1250`); `rating`, `reviews`, `stock`, `badge` ve `isNew` isteğe bağlıdır. `stock` verilmezse 50 kabul edilir. Ürün kimlikleri benzersiz olmalıdır.

### Yerel geliştirme

Vercel CLI ile projeyi bağladıktan sonra `vercel env pull .env.local` komutuyla `GLOBAL_CONFIG` değişkenini alın ve `npm run dev` çalıştırın. `.env.local` dosyasını repoya eklemeyin. Bu değişken yoksa katalog sahte/statik fiyatlarla gösterilmez; API açık bir yapılandırma hatası verir.

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
