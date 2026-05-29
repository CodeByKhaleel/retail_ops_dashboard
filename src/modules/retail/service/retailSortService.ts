import { RetailLocationEntity } from '../contracts/RetailContracts';

export type SortField =
    | 'name'
    | 'country'
    | 'status'
    | 'listingStatus'
    | 'dataSource'
    | 'storeFormat'
    | 'fulfillmentPartners'
    | 'tags'
    | 'priorityFulfillment'
    | 'region'
    | 'performanceScore';

export type SortOrder = 'asc' | 'desc';

const normalize = (value: string): string => value.toLowerCase();

const getSortableValue = (location: RetailLocationEntity, sortBy: SortField): string => {
    switch (sortBy) {
        case 'name':
            return location.name;
        case 'country':
            return location.country;
        case 'status':
            return location.status;
        case 'listingStatus':
            return location.listingStatus;
        case 'dataSource':
            return location.dataSource;
        case 'storeFormat':
            return location.storeFormats.join(', ');
        case 'fulfillmentPartners':
            return location.fulfillmentPartners.join(', ');
        case 'tags':
            return location.tags.join(', ');
        case 'priorityFulfillment':
            return location.priorityFulfillment ? '1' : '0';
        case 'region':
            return location.region;
        case 'performanceScore':
            return location.performanceScore.toString();
        default:
            return location.name;
    }
};

export const sortRetailLocations = (
    locations: RetailLocationEntity[],
    sortBy: SortField,
    sortOrder: SortOrder
): RetailLocationEntity[] => {
    const direction = sortOrder === 'asc' ? 1 : -1;
    return [...locations].sort((a, b) => {
        if (sortBy === 'performanceScore') {
            return (a.performanceScore - b.performanceScore) * direction;
        }

        const left = normalize(getSortableValue(a, sortBy));
        const right = normalize(getSortableValue(b, sortBy));
        if (left < right) {
            return -1 * direction;
        }
        if (left > right) {
            return 1 * direction;
        }
        return 0;
    });
};
