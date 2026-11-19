import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/gex/',
  plugins: [react()],
  // En desarrollo, /api va al backend local (ecosistema-cinf en :4000). La nómina ya no pasa por aquí.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
