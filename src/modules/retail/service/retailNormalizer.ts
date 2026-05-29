import { RawRetailLocationDoc, RetailLocationEntity } from '../contracts/RetailContracts';
import { getRegionForCountry, calculatePerformanceScore } from './performanceMatrix';

export function normalizeRetailLocation(raw: RawRetailLocationDoc): RetailLocationEntity {
    const toArray = (value?: string[] | string | any[]): string[] => {
        if (!value) {
            return [];
        }
        if (Array.isArray(value)) {
            return value
                .map(item => typeof item === 'string' ? item : (item?.name || String(item || '')))
                .filter(item => item && item.trim().length > 0);
        }
        return String(value)
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    };

    const country = raw.country ?? raw.address?.country ?? 'Unknown';
    const tags = toArray(raw.tags);
    const storeFormats = toArray(raw.storeFormat);
    const listingStatus = raw.listingStatus ?? 'Unknown';

    return {
        id: raw._id,
        name: raw.name ?? 'Unknown',
        country,
        status: raw.status ?? 'Unknown',
        listingStatus,
        storeFormats,
        tags,
        priorityFulfillment: raw.priorityFulfillment ?? false,
        dataSource: raw.dataSource ?? 'Unknown',
        fulfillmentPartners: toArray(raw.fulfillmentPartners),
        refId: raw.refId ?? 'N/A',
        locationType: toArray(raw.locationType),
        region: getRegionForCountry(country),
        performanceScore: calculatePerformanceScore(tags, country, storeFormats, listingStatus),
        managedByTeam: raw.managedByTeam ?? 'N/A',
    };
}
