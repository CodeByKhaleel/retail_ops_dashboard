import { Request, Response, NextFunction } from 'express';
import { retailLocationStore } from '../service/InMemoryRetailLocationStore';
import { filterRetailLocationIds } from '../service/retailFilterEngine';
import { getRetailLocationsByIds } from '../service/retailQueryService';
import { successResponse } from '../../../core/response/apiResponse';
import { parsePagination, parseRetailFilters, parseSort } from './retailQueryParser';
import { sortRetailLocations } from '../service/retailSortService';

export const getRetailLocations = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const filters = parseRetailFilters(req.query);
        const { page, pageSize } = parsePagination(req.query);
        const { sortBy, sortOrder } = parseSort(req.query);

        const filteredIds = filterRetailLocationIds(retailLocationStore, filters);
        const totalItems = filteredIds.size;
        const allLocations = getRetailLocationsByIds(retailLocationStore, Array.from(filteredIds));
        const sortedLocations = sortRetailLocations(allLocations, sortBy, sortOrder);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const locations = sortedLocations.slice(start, end);

        res.json(
            successResponse({
                items: locations,
                page,
                pageSize,
                hasNext: end < totalItems,
                totalItems,
                globalTotal: retailLocationStore.locationsById.size,
                totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
            })
        );
    } catch (error) {
        next(error);
    }
};
