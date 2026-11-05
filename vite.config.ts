import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { performAnalysis } from './src/analyzer';

function apiPlugin(): Plugin {
  return {
    name: 'api-endpoints',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];

        if (url === '/health') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'ok' }));
          return;
        }

        if ((url === '/analyze' || url === '/api/analyze') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const text = parsed.requirements_text || '';
              if (!text.trim()) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ detail: 'requirements_text is required.' }));
                return;
              }
              const result = performAnalysis(text);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ detail: err?.message || 'Internal error' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
