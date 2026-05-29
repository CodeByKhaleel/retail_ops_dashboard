import { Request, Response, NextFunction } from 'express';
import { FulfillmentRepository } from '../repository/FulfillmentRepository';
import { successResponse, errorResponse } from '../../../core/response/apiResponse';

const fulfillmentRepo = new FulfillmentRepository();

/**
 * Get the main Fulfillment Dashboard summary (Location level)
 */
export const getFulfillmentSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const fulfillmentOnly = req.query.isFulfillment !== 'false'; // Default to true
        const summaries = await fulfillmentRepo.getLocationSummaries(fulfillmentOnly);
        res.json(successResponse(summaries));
    } catch (error) {
        console.error('Error fetching fulfillment summary:', error);
        res.status(500).json(errorResponse('Failed to fetch fulfillment dashboard summary'));
    }
};

/**
 * Get detailed performer data for an individual location (Leaderboard)
 */
export const getLocationDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const locationId = req.params.locationId as string;
        const fulfillmentOnly = req.query.isFulfillment !== 'false'; // Default to true

        if (!locationId) {
            res.status(400).json(errorResponse('Location ID is required'));
            return;
        }

        const summary = await fulfillmentRepo.getLocationDetails(locationId, fulfillmentOnly);

        if (!summary) {
            res.status(404).json(errorResponse('Location analytics not found'));
            return;
        }

        res.json(successResponse(summary));
    } catch (error) {
        console.error(`Error fetching details for location ${req.params.locationId}:`, error);
        res.status(500).json(errorResponse('Failed to fetch location details'));
    }
};
