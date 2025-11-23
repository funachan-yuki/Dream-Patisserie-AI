import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // コード内の process.env.API_KEY を VITE_API_KEY 環境変数に置き換えます
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
  };
});