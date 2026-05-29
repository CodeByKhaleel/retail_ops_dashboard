import { InMemoryRetailLocationStore } from '../src/modules/retail/service/InMemoryRetailLocationStore';
import { filterRetailLocationIds } from '../src/modules/retail/service/retailFilterEngine';
import { RetailLocationEntity } from '../src/modules/retail/contracts/RetailContracts';
import { calculatePerformanceScore, getRegionForCountry } from '../src/modules/retail/service/performanceMatrix';

const createLocation = (overrides: Partial<RetailLocationEntity> = {}): RetailLocationEntity => {
    const country = overrides.country ?? 'United States';
    const tags = overrides.tags ?? ['High Growth'];
    const storeFormats = overrides.storeFormats ?? ['Flagship'];
    const listingStatus = overrides.listingStatus ?? 'Listed';

    return {
        id: overrides.id ?? 'loc-1',
        name: overrides.name ?? 'Metro Flagship',
        country,
        status: overrides.status ?? 'Active',
        listingStatus,
        storeFormats,
        tags,
        priorityFulfillment: overrides.priorityFulfillment ?? false,
        dataSource: overrides.dataSource ?? 'POS',
        fulfillmentPartners: overrides.fulfillmentPartners ?? ['Rapid Ship'],
        refId: overrides.refId ?? 'LOC-1',
        locationType: overrides.locationType ?? storeFormats,
        region: overrides.region ?? getRegionForCountry(country),
        performanceScore: overrides.performanceScore ?? calculatePerformanceScore(tags, country, storeFormats, listingStatus),
        managedByTeam: overrides.managedByTeam ?? 'North Ops',
    };
};

const setupStore = (): InMemoryRetailLocationStore => {
    const store = new InMemoryRetailLocationStore();
    [
        createLocation({ id: 'loc-1', country: 'United States', status: 'Active', storeFormats: ['Flagship'], tags: ['High Growth'], priorityFulfillment: true }),
        createLocation({ id: 'loc-2', country: 'Canada', status: 'Paused', storeFormats: ['Outlet'], tags: ['At Risk'], dataSource: 'CRM' }),
        createLocation({ id: 'loc-3', country: 'India', status: 'Under Review', storeFormats: ['Marketplace'], tags: ['Premium'], fulfillmentPartners: ['Store Pickup'] }),
    ].forEach(location => store.addLocation(location));
    return store;
};

describe('retailFilterEngine', () => {
    it('filters by country, status, format, tags, source and priority fulfillment', () => {
        const store = setupStore();
        expect(filterRetailLocationIds(store, { country: ['United States'] })).toEqual(new Set(['loc-1']));
        expect(filterRetailLocationIds(store, { status: ['Paused'] })).toEqual(new Set(['loc-2']));
        expect(filterRetailLocationIds(store, { storeFormats: ['Marketplace'] })).toEqual(new Set(['loc-3']));
        expect(filterRetailLocationIds(store, { tags: ['Premium'] })).toEqual(new Set(['loc-3']));
        expect(filterRetailLocationIds(store, { dataSource: ['CRM'] })).toEqual(new Set(['loc-2']));
        expect(filterRetailLocationIds(store, { priorityFulfillment: true })).toEqual(new Set(['loc-1']));
    });

    it('combines filters with AND semantics across dimensions', () => {
        const store = setupStore();
        expect(filterRetailLocationIds(store, { country: ['United States'], tags: ['High Growth'] })).toEqual(new Set(['loc-1']));
        expect(filterRetailLocationIds(store, { country: ['United States'], tags: ['At Risk'] })).toEqual(new Set());
    });
});
