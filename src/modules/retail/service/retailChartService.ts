import { InMemoryRetailLocationStore } from './InMemoryRetailLocationStore';
import { RetailFilters } from './filterTypes';
import { ChartsResult } from './chartTypes';
import { buildChartCacheKey } from './chartCacheKey';
import { getCachedCharts, setCachedCharts, clearChartCache } from './chartCache';
import { filterRetailLocationIds } from './retailFilterEngine';
import { getRetailLocationsByIds } from './retailQueryService';
import {
    aggregateLocationsByCountry,
    aggregateListingStatusDistribution,
    aggregateStoreFormatDistribution,
    aggregateStatusDistribution,
    aggregatePerformanceScoreByRegion,
    aggregateTopPerformingLocations,
} from './chartAggregators';

export const getCharts = (
    store: InMemoryRetailLocationStore,
    filters: RetailFilters
): ChartsResult => {
    const cacheKey = buildChartCacheKey(filters);
    const cached = getCachedCharts(cacheKey);
    if (cached) {
        return cached;
    }

    const filteredIds = filterRetailLocationIds(store, filters);
    const entities = getRetailLocationsByIds(store, Array.from(filteredIds));
    const charts: ChartsResult = {
        locationsByCountry: aggregateLocationsByCountry(entities),
        statusDistribution: aggregateStatusDistribution(entities),
        listingStatusDistribution: aggregateListingStatusDistribution(entities),
        storeFormatDistribution: aggregateStoreFormatDistribution(entities),
        performanceScoreByRegion: aggregatePerformanceScoreByRegion(entities),
        topPerformingLocations: aggregateTopPerformingLocations(entities),
    };

    setCachedCharts(cacheKey, charts);
    return charts;
};

export const invalidateAllChartCaches = (): void => {
    clearChartCache();
};
