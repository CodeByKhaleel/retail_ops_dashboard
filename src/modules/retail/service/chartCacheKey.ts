import { RetailFilters } from './filterTypes';

type StableValue = string | number | boolean | string[] | undefined;

const sortArray = (values: string[]): string[] => [...values].sort();

const normalizeFilters = (filters: RetailFilters): Record<string, StableValue> => {
    const normalized: Record<string, StableValue> = {};

    if (filters.country !== undefined) {
        normalized.country = sortArray(filters.country);
    }
    if (filters.status !== undefined) {
        normalized.status = sortArray(filters.status);
    }
    if (filters.listingStatus !== undefined) {
        normalized.listingStatus = sortArray(filters.listingStatus);
    }
    if (filters.storeFormats !== undefined) {
        normalized.storeFormats = sortArray(filters.storeFormats);
    }
    if (filters.tags !== undefined) {
        normalized.tags = sortArray(filters.tags);
    }
    if (filters.fulfillmentPartners !== undefined) {
        normalized.fulfillmentPartners = sortArray(filters.fulfillmentPartners);
    }
    if (filters.priorityFulfillment !== undefined) {
        normalized.priorityFulfillment = filters.priorityFulfillment;
    }
    if (filters.region !== undefined) {
        normalized.region = sortArray(filters.region);
    }
    if (filters.dataSource !== undefined) {
        normalized.dataSource = sortArray(filters.dataSource);
    }
    if (filters.managedByTeam !== undefined) {
        normalized.managedByTeam = sortArray(filters.managedByTeam);
    }

    return normalized;
};

const stableStringify = (value: Record<string, StableValue>): string => {
    const keys = Object.keys(value).sort();
    const ordered: Record<string, StableValue> = {};
    for (const key of keys) {
        ordered[key] = value[key];
    }
    return JSON.stringify(ordered);
};

export const buildChartCacheKey = (filters: RetailFilters): string => {
    return stableStringify(normalizeFilters(filters));
};
