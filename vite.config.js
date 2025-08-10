// vite.config.js
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const mutePostCssCssSyntaxError = () => ({
  name: 'mute-postcss-css-syntax',
  configureServer(server) {
    const loggerError = server.config.logger.error;
    server.config.logger.error = (msg, opts) => {
      if (opts?.error?.toString?.().includes('CssSyntaxError: [postcss]')) return;
      loggerError(msg, opts);
    };
  },
});

export default defineConfig({
  plugins: [react(), mutePostCssCssSyntaxError()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  // Para o "dependency scan" do Vite
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  // Para a transformação normal de arquivos do src
  esbuild: {
    loader: 'jsx',
    // garante que .js do src sejam tratados como JSX
    include: /src\/.*\.(js|jsx)$/,
    exclude: [],
  },
});
