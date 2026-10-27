import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'real-site-metadata',
      transformIndexHtml(html) {
        const configured =
          process.env.PORTFOLIO_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
        if (!configured) return html
        const origin = new URL(configured.startsWith('http') ? configured : `https://${configured}`)
          .origin
        return {
          html: html.replaceAll(
            'content="/social-preview.png"',
            `content="${origin}/social-preview.png"`,
          ),
          tags: [
            { tag: 'link', attrs: { rel: 'canonical', href: `${origin}/` }, injectTo: 'head' },
            { tag: 'meta', attrs: { property: 'og:url', content: `${origin}/` }, injectTo: 'head' },
          ],
        }
      },
    },
  ],
  server: {
    fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.private/**'] },
  },
})
