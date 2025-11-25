import path from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import {ghPages} from "vite-plugin-gh-pages";

export default defineConfig({
  base: '/ecommerce/',
  plugins: [vue(), tailwindcss(), ghPages()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
