import { Request, Response, NextFunction } from 'express';
import { RetailDemandRepository } from '../repository/RetailDemandRepository';
import { successResponse, errorResponse } from '../../../core/response/apiResponse';

const demandRepo = new RetailDemandRepository();

export const getLocationTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const locationName = req.params.locationName as string;
        const data = await demandRepo.getLocationTrend(locationName);
        res.json(successResponse(data));
    } catch (error) {
        next(error);
    }
};

export const getAvailableWeeks = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        res.json(successResponse(await demandRepo.getAvailableWeeks()));
    } catch (error) {
        next(error);
    }
};

export const getDemandQuery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const year = parseInt(req.query.year as string);
        const week = parseInt(req.query.week as string);
        const type = req.query.type === 'products' ? 'products' : 'locations';

        if (Number.isNaN(year) || Number.isNaN(week)) {
            res.status(400).json(errorResponse('Year and Week are required'));
            return;
        }

        const data = await demandRepo.getDemandRankings(year, week, type);
        res.json(successResponse(data));
    } catch (error) {
        next(error);
    }
};

export const getDemandCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        res.json(successResponse(await demandRepo.getDemandCategories()));
    } catch (error) {
        next(error);
    }
};
