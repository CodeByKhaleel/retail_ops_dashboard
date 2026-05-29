import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import cookieParser from 'cookie-parser';
import { authenticate } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error.middleware';
import retailRoutes from './modules/retail/routes';
import authRoutes from './modules/auth/routes';
import { getDemoConfig } from './modules/auth/auth.controller';

const app = express();
app.use(cookieParser());

app.use((req, res, next) => {
    res.on('finish', () => {
        const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
        console.log(`${color}${req.method} ${req.originalUrl} - ${res.statusCode}\x1b[0m`);
    });
    next();
});

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.tailwindcss.com', 'https://cdn.jsdelivr.net'],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                connectSrc: ["'self'", 'http://localhost:*', 'http://127.0.0.1:*'],
                imgSrc: ["'self'", 'data:', 'https:'],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                upgradeInsecureRequests: null,
            },
        },
        hsts: false,
    })
);

app.use(cors());
app.use(express.json());
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 1000,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

const isDocker = process.cwd() === '/app' || __dirname.includes('/dist/');
const publicDir = isDocker
    ? path.join(process.cwd(), 'public')
    : path.join(__dirname, '../public');

app.use(express.static(publicDir));

app.get('/', (_, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/login', (_, res) => {
    res.sendFile(path.join(publicDir, 'login.html'));
});

app.get('/health', (_, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api', authenticate, (_, res) => {
    res.json({ message: 'Retail Operations Dashboard API' });
});

app.use('/api/retail', retailRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/config/demo', getDemoConfig);

app.get(/^(?!\/api).+/, (_, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

app.use(errorHandler);

export default app;
