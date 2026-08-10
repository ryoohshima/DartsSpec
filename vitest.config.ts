import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// アプリ本体の vite.config.ts は Cloudflare プラグインを含むため、
// ユニットテストは軽量な専用設定で実行する。
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '#': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
})
