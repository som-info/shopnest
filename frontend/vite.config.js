import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, requests to /api are proxied to the Django server,
// so the frontend can use relative URLs and avoid CORS issues.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
});
