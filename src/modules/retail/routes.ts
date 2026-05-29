import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { getRetailLocations } from './controller/locations.controller';
import { getCharts } from './controller/charts.controller';
import { getFulfillmentSummary, getLocationDetails } from './controller/fulfillment.controller';
import {
    getAvailableWeeks,
    getDemandCategories,
    getDemandQuery,
    getLocationTrend,
} from './controller/demand.controller';

const router = Router();

router.get('/locations', authenticate, getRetailLocations);
router.get('/locations/charts', authenticate, getCharts);

router.get('/fulfillment/summary', authenticate, getFulfillmentSummary);
router.get('/fulfillment/location/:locationId', authenticate, getLocationDetails);

router.get('/demand/weeks', authenticate, getAvailableWeeks);
router.get('/demand/query', authenticate, getDemandQuery);
router.get('/demand/categories', authenticate, getDemandCategories);
router.get('/demand/trend/:locationName', authenticate, getLocationTrend);

export default router;
