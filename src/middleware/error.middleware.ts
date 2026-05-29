import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { env } from '../config/env';

// Interface for errors that might have a status code (e.g., DomainError or HttpError)
interface AppError extends Error {
    statusCode?: number;
    status?: number;
    isOperational?: boolean;
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Determine status code (default to 500)
    const statusCode = err.statusCode || err.status || 500;

    // Determine error message
    // In production, mask 500 errors with a generic message
    const message =
        statusCode === 500 && env.env === 'production'
            ? 'Internal Server Error'
            : err.message || 'Unknown Error';

    // 1. Log the error
    // Log strictly for 500s or if we want to trace all errors in dev
    // In production, we might want to log everything but only alert on 500s
    if (statusCode >= 500) {
        logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, { stack: err.stack });
    } else {
        logger.warn(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    }

    // 2. Build the standarized JSON response
    const response = {
        success: false,
        message,
        ...(env.env === 'development' && { stack: err.stack }),
    };

    // 3. Send response
    res.status(statusCode).json(response);
};
