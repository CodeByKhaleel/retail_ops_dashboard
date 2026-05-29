import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 7778,
    logLevel: process.env.LOG_LEVEL || 'info',
    authMode: process.env.AUTH_MODE || 'disabled',
};
