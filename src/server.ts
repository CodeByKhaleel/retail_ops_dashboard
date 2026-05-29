import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { retailLocationStore } from './modules/retail/service/InMemoryRetailLocationStore';
import { initializeRetailLocationStore } from './modules/retail/service/retailStoreInitializer';
import { DemoRetailLocationRepository } from './modules/retail/repository/DemoRetailLocationRepository';

let server: ReturnType<typeof app.listen> | undefined;

const startServer = async () => {
    try {
        const start = Date.now();

        logger.info('--- Initializing retail demo store ---');
        await initializeRetailLocationStore(new DemoRetailLocationRepository(), retailLocationStore);

        const duration = Date.now() - start;
        logger.info(`Stores initialized in ${duration}ms`);

        server = app.listen(env.port, () => {
            logger.info(`Server running at http://localhost:${env.port}`);
            logger.info(`Environment: ${env.env}`);
            logger.info(`Auth Mode: ${env.authMode}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.info('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error: Error) => {
    logger.error('Unexpected error:', error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    server?.close();
});

declare global {
    namespace Express {
        interface Request {
            user?: {
                uid: string;
                email?: string;
                [key: string]: any;
            };
        }
    }
}

startServer();
