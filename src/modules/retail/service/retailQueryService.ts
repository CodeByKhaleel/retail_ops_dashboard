import { InMemoryRetailLocationStore } from './InMemoryRetailLocationStore';
import { RetailLocationEntity } from '../contracts/RetailContracts';
import { logger } from '../../../config/logger';

export const getRetailLocationsByIds = (
    store: InMemoryRetailLocationStore,
    ids: string[]
): RetailLocationEntity[] => {
    const locations: RetailLocationEntity[] = [];
    for (const id of ids) {
        const location = store.locationsById.get(id);
        if (!location) {
            logger.warn(`Store Location id missing from store: ${id}`);
            continue;
        }
        locations.push(location);
    }
    return locations;
};
