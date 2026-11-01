import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { getConfiguredProducts } from './api/_lib/products.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (!process.env.GLOBAL_CONFIG && env.GLOBAL_CONFIG) {
    process.env.GLOBAL_CONFIG = env.GLOBAL_CONFIG
  }

  return {
    plugins: [
      react(),
      {
        name: 'local-global-config-products-api',
        configureServer(server) {
          server.middlewares.use('/api/products', async (request, response) => {
            response.setHeader('Cache-Control', 'no-store')
            if (request.method !== 'GET') {
              response.setHeader('Allow', 'GET')
              response.statusCode = 405
              response.end(JSON.stringify({ error: 'Yalnızca GET isteği destekleniyor.' }))
              return
            }

            try {
              const products = await getConfiguredProducts()
              response.setHeader('Content-Type', 'application/json')
              response.end(JSON.stringify({ products }))
            } catch (error) {
              console.error('Global Config ürünleri okunamadı:', error)
              response.statusCode = 503
              response.setHeader('Content-Type', 'application/json')
              const message = error instanceof Error ? error.message : 'Bilinmeyen sunucu hatası.'
              response.end(JSON.stringify({ error: `Ürün kataloğu yüklenemedi: ${message}` }))
            }
          })
        },
      },
    ],
    server: {
      host: '0.0.0.0',
      port: 3000,
    },
  }
})
