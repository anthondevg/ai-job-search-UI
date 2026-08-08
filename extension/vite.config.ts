import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const extensionRoot = fileURLToPath(new URL('.', import.meta.url))
const workspaceRoot = fileURLToPath(new URL('..', import.meta.url))

function hostPattern(rawUrl: string): string {
  const url = new URL(rawUrl)
  return `${url.origin}/*`
}

function manifestPlugin(apiUrl: string, supabaseUrl: string): Plugin {
  return {
    name: 'extension-manifest',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(
          {
            manifest_version: 3,
            name: 'CV Match Assistant',
            short_name: 'CV Match',
            version: '0.1.0',
            description: 'Analiza ofertas pegadas manualmente usando tu CV activo.',
            permissions: ['sidePanel'],
            host_permissions: [hostPattern(apiUrl), hostPattern(supabaseUrl)],
            background: { service_worker: 'service-worker.js' },
            action: { default_title: 'Abrir CV Match Assistant' },
            side_panel: { default_path: 'index.html' },
            content_security_policy: {
              extension_pages: "script-src 'self'; object-src 'self'",
            },
          },
          null,
          2,
        ),
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, workspaceRoot, '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:3001'
  const supabaseUrl = env.VITE_SUPABASE_URL

  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL is required to build the extension')
  }

  return {
    root: extensionRoot,
    envDir: workspaceRoot,
    plugins: [react(), manifestPlugin(apiUrl, supabaseUrl)],
    publicDir: 'public',
    build: {
      outDir: '../dist-extension',
      emptyOutDir: true,
    },
  }
})
