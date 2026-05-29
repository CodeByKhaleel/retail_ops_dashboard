import { Request, Response, NextFunction } from 'express';
import { retailLocationStore } from '../service/InMemoryRetailLocationStore';
import { getCharts as getChartsService } from '../service/retailChartService';
import { successResponse } from '../../../core/response/apiResponse';
import { parseRetailFilters } from './retailQueryParser';

export const getCharts = (req: Request, res: Response, next: NextFunction): void => {
    const filters = parseRetailFilters(req.query);
    const charts = getChartsService(retailLocationStore, filters);
    res.json(successResponse(charts));
};
