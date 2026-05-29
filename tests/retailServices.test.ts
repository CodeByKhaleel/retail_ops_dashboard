import { InMemoryRetailLocationStore } from '../src/modules/retail/service/InMemoryRetailLocationStore';
import { DemoRetailLocationRepository } from '../src/modules/retail/repository/DemoRetailLocationRepository';
import { initializeRetailLocationStore } from '../src/modules/retail/service/retailStoreInitializer';
import { getCharts, invalidateAllChartCaches } from '../src/modules/retail/service/retailChartService';
import { filterRetailLocationIds } from '../src/modules/retail/service/retailFilterEngine';
import { getRetailLocationsByIds } from '../src/modules/retail/service/retailQueryService';
import { sortRetailLocations } from '../src/modules/retail/service/retailSortService';
import { RetailDemandRepository } from '../src/modules/retail/repository/RetailDemandRepository';

const setupStore = async () => {
    const store = new InMemoryRetailLocationStore();
    await initializeRetailLocationStore(new DemoRetailLocationRepository(), store);
    invalidateAllChartCaches();
    return store;
};

describe('retail services', () => {
    it('loads deterministic demo locations', async () => {
        const store = await setupStore();
        expect(store.locationsById.size).toBe(72);
        expect(store.statusIndex.has('active')).toBe(true);
        expect(store.storeFormatIndex.has('flagship')).toBe(true);
    });

    it('sorts by performance score and paginates predictably', async () => {
        const store = await setupStore();
        const ids = filterRetailLocationIds(store, {});
        const sorted = sortRetailLocations(getRetailLocationsByIds(store, Array.from(ids)), 'performanceScore', 'desc');
        const page = sorted.slice(0, 10);

        expect(page).toHaveLength(10);
        expect(page[0].performanceScore).toBeGreaterThanOrEqual(page[1].performanceScore);
    });

    it('returns chart aggregations for retail dimensions', async () => {
        const store = await setupStore();
        const charts = getCharts(store, {});

        expect(charts.locationsByCountry.labels.length).toBeGreaterThan(0);
        expect(charts.statusDistribution.labels).toContain('Active');
        expect(charts.listingStatusDistribution.labels).toContain('Listed');
        expect(charts.storeFormatDistribution.labels).toContain('Flagship');
        expect(charts.performanceScoreByRegion.labels.length).toBeGreaterThan(0);
    });

    it('returns demand intelligence response shape', async () => {
        const store = await setupStore();
        await initializeRetailLocationStore(new DemoRetailLocationRepository(), store);
        const repo = new RetailDemandRepository();
        const [latest] = await repo.getAvailableWeeks();
        const rankings = await repo.getDemandRankings(latest.year, latest.week, 'products');

        expect(rankings[0]).toEqual(expect.objectContaining({
            rank: expect.any(Number),
            product: expect.any(String),
            category: expect.any(String),
            searchCount: expect.any(Number),
        }));
    });
});
