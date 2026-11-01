import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { get } from '@vercel/global-config'
import { getConfiguredProducts } from './api/_lib/products.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const name of ['GLOBAL_CONFIG', 'EDGE_CONFIG']) {
    if (!process.env[name] && env[name]) {
      process.env[name] = env[name]
    }
  }

  return {
    plugins: [
      react(),
      {
        name: 'local-global-config-api',
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

          server.middlewares.use('/api/website-data', async (request, response) => {
            response.setHeader('Cache-Control', 'no-store')
            response.setHeader('Content-Type', 'application/json')
            if (request.method !== 'GET') {
              response.setHeader('Allow', 'GET')
              response.statusCode = 405
              response.end(JSON.stringify({ error: 'Yalnızca GET isteği destekleniyor.' }))
              return
            }

            try {
              if (!process.env.GLOBAL_CONFIG && !process.env.EDGE_CONFIG) {
                throw new Error('GLOBAL_CONFIG veya EDGE_CONFIG ortam değişkeni tanımlanmamış.')
              }
              const websiteData: unknown = await get('websiteData')
              const copy = typeof websiteData === 'object' && websiteData !== null && !Array.isArray(websiteData)
                ? websiteData
                : {}
              response.end(JSON.stringify({ websiteData: copy }))
            } catch (error) {
              console.error('Global Config websiteData okunamadı:', error)
              response.statusCode = 503
              response.end(JSON.stringify({ error: 'WebsiteData yüklenemedi.' }))
            }
          })

          server.middlewares.use('/api/admin/session', (request, response) => {
            response.setHeader('Cache-Control', 'no-store')
            response.setHeader('Content-Type', 'application/json')
            if (request.method !== 'GET') {
              response.setHeader('Allow', 'GET')
              response.statusCode = 405
              response.end(JSON.stringify({ error: 'Yalnızca GET isteği destekleniyor.' }))
              return
            }
            response.end(JSON.stringify({ authenticated: false }))
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
