import { ChartsResult } from './chartTypes';

const CACHE_LIMIT = 100;
const chartCache = new Map<string, ChartsResult>();

export const getCachedCharts = (key: string): ChartsResult | undefined => {
    return chartCache.get(key);
};

export const setCachedCharts = (key: string, charts: ChartsResult): void => {
    if (chartCache.size >= CACHE_LIMIT) {
        chartCache.clear();
    }
    chartCache.set(key, charts);
};

export const clearChartCache = (): void => {
    chartCache.clear();
};
