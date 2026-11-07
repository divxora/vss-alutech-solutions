import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { createApp } from './server/app';

const isProd = process.env.NODE_ENV === 'production';
// In development, AI Studio dev server always listens on port 3000. In production, use process.env.PORT or 3000.
const PORT = isProd ? parseInt(process.env.PORT || '3000', 10) : 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  const app = createApp();

  if (!isProd) {
    // Development mode: mount Vite dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    // Serve transformed index.html for all non-API SPA routes (Express 5 syntax)
    app.use(async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    console.log('[Server] Vite dev server mounted into Express pipeline.');
  } else {
    // Production mode: serve built assets from dist
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.use((req, res, next) => {
        if (req.originalUrl.startsWith('/api')) {
          return next();
        }
        res.sendFile(path.join(distPath, 'index.html'));
      });
      console.log(`[Server] Serving production static bundle from ${distPath}`);
    } else {
      console.warn('[Server] Production dist/ directory not found. Please run "npm run build".');
    }
  }

  app.listen(PORT, HOST, () => {
    console.log(`=======================================================`);
    console.log(`  VSS Alutech Solutions — Full-Stack Server Ready`);
    console.log(`  URL: http://${HOST}:${PORT}`);
    console.log(`  API Health: http://${HOST}:${PORT}/api/health`);
    console.log(`  Mode: ${isProd ? 'Production' : 'Development'}`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
