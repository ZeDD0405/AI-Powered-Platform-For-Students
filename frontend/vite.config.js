import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      // __API__ is available globally in all components — no imports needed
      __API__: JSON.stringify(env.VITE_API_URL || 'http://localhost:5000'),
    },
  }
})
