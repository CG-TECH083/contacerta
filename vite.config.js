import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // ou o plugin que estiver usando

export default defineConfig({
  plugins: [react()],
  base: '/contacerta/',
})
