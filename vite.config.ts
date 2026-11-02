import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/gex-csv': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        rewrite: () =>
          '/spreadsheets/d/e/2PACX-1vRiENG2D1bKgoB5idcDxxa1xQwKNLwDnKnrV93Dmpb3c7lg_yRSKQlZtDmDj9D3B8edY2UoTIyrbPWs/pub?output=csv',
        followRedirects: true,
      },
    },
  },
});
