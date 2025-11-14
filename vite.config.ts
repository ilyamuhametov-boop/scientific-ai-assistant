import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.FIREBASE_API_KEY': JSON.stringify(env.FIREBASE_API_KEY),
        'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(env.FIREBASE_AUTH_DOMAIN),
        'process.env.FIREBASE_PROJECT_ID': JSON.stringify(env.FIREBASE_PROJECT_ID),
        'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(env.FIREBASE_STORAGE_BUCKET),
        'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.FIREBASE_MESSAGING_SENDER_ID),
        'process.env.FIREBASE_APP_ID': JSON.stringify(env.FIREBASE_APP_ID),
        'process.env.SMARTCAPTCHA_CLIENT_KEY': JSON.stringify(env.SMARTCAPTCHA_CLIENT_KEY),
        'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY),
        'process.env.OPENROUTER_SITE_URL': JSON.stringify(env.OPENROUTER_SITE_URL),
        'process.env.OPENROUTER_APP_NAME': JSON.stringify(env.OPENROUTER_APP_NAME),
        'process.env.OPENROUTER_FAST_MODEL': JSON.stringify(env.OPENROUTER_FAST_MODEL),
        'process.env.OPENROUTER_THINK_MODEL': JSON.stringify(env.OPENROUTER_THINK_MODEL),
        'process.env.OPENROUTER_JSON_MODEL': JSON.stringify(env.OPENROUTER_JSON_MODEL),
        'process.env.OPENROUTER_MAX_TOKENS': JSON.stringify(env.OPENROUTER_MAX_TOKENS),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
