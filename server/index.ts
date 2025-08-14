import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { neon } from '@neondatabase/serverless';
import passport from 'passport';
import { router } from './routes.js';
import { openaiClient } from './openai.js';
import { configureReplitAuth } from './replitAuth.js';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@shared/schema';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
const port = process.env.PORT || 5000;

// Database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Session storage
const PgSession = connectPgSimple(session);
const sessionMiddleware = session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'user_sessions',
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
});

// Middleware
app.use(express.json());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Configure authentication
configureReplitAuth(app);

// API routes
app.use('/api', router);

// Serve static assets in production
if (isProduction) {
  const clientPath = path.join(__dirname, '../../dist/public');
  app.use(express.static(clientPath));
  
  // Handle SPA routing
  app.get('*', (_, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  if (!isProduction) {
    console.log('API: http://localhost:5000/api');
  }
});

// Export for Vercel
export default app;