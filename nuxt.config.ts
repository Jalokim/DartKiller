import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/icon',
    '@vite-pwa/nuxt',
    // 'nuxt-phosphor-icons',
  ],
  app: {
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: '#065f46' },
        { name: 'apple-mobile-web-app-title', content: 'Dart Killer' },
      ]
    }
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  nitro: {
    output: {
      dir: '.output'
    },
    preset: 'static'
  },
  // @ts-ignore - PWA module augments the Nuxt config type
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Dart Killer',
      short_name: 'Dart Killer',
      description: 'Dart Killer game with PWA support',
      theme_color: '#065f46',
      background_color: '#065f46',
      display: 'fullscreen',
      orientation: 'portrait',
      start_url: '/',
      scope: '/',
      icons: [
        {
          src: 'pwa-icons/192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-icons/512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'pwa-icons/512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
    includeAssets: ['pwa-icons/*.png'],
    client: {
      installPrompt: true,
    },
    registerWebManifestInRouteRules: true,
  }
})
