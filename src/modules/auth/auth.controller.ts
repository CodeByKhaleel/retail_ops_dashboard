import { Request, Response } from 'express';

export const getDemoConfig = (_req: Request, res: Response): void => {
    res.json({
        success: true,
        data: {
            authMode: 'disabled',
            demoUser: {
                email: 'demo@retailops.local',
                name: 'Demo Operator',
            },
        },
    });
};

export const createSession = async (_req: Request, res: Response): Promise<void> => {
    res.json({ success: true, message: 'Demo session accepted' });
};

export const clearSession = (_req: Request, res: Response): void => {
    res.clearCookie('session');
    res.json({ success: true, message: 'Session cleared' });
};
