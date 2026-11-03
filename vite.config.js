import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const pages = [
  'index',
  'login',
  'register',
  'dashboard',
  'pets',
  'pet-details',
  'health-record',
  'profile',
  'admin',
]

export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [page, resolve(import.meta.dirname, `${page}.html`)]),
      ),
    },
  },
})
