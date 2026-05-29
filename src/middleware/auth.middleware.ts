import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { env } from '../config/env';

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (env.authMode === 'disabled') {
        req.user = {
            uid: 'demo-user',
            email: 'demo@retailops.local',
        };
        return next();
    }

    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (env.env !== 'production' && token === 'mock_token_for_dev') {
        req.user = {
            uid: 'demo-user',
            email: 'demo@retailops.local',
        };
        return next();
    }

    return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication is not configured for this demo runtime.',
    });
};
