import { RetailLocationRepository } from '../repository/RetailLocationRepository';
import { logger } from '../../../config/logger';
import { normalizeRetailLocation } from './retailNormalizer';
import { InMemoryRetailLocationStore } from './InMemoryRetailLocationStore';

const collectIndexedIds = (store: InMemoryRetailLocationStore): Set<string> => {
    const collected = new Set<string>();
    const indexes = [
        store.countryIndex,
        store.statusIndex,
        store.listingStatusIndex,
        store.storeFormatIndex,
        store.tagsIndex,
        store.priorityFulfillmentIndex,
        store.dataSourceIndex,
        store.fulfillmentPartnersIndex,
        store.regionIndex,
        store.managedByTeamIndex,
    ];

    for (const index of indexes) {
        for (const idSet of index.values()) {
            for (const id of idSet) {
                collected.add(id);
            }
        }
    }

    return collected;
};

const logIndexSizes = (store: InMemoryRetailLocationStore): void => {
    logger.info(
        `Retail location indexes: country=${store.countryIndex.size}, status=${store.statusIndex.size}, listingStatus=${store.listingStatusIndex.size}, storeFormat=${store.storeFormatIndex.size}, tags=${store.tagsIndex.size}, priorityFulfillment=${store.priorityFulfillmentIndex.size}, dataSource=${store.dataSourceIndex.size}, fulfillmentPartners=${store.fulfillmentPartnersIndex.size}`
    );
};

export const initializeRetailLocationStore = async (
    repository: RetailLocationRepository,
    store: InMemoryRetailLocationStore
): Promise<void> => {
    const rawLocations = await repository.fetchAll();
    store.clear();

    for (const raw of rawLocations) {
        store.addLocation(normalizeRetailLocation(raw));
    }

    logger.info(`Retail location store loaded: ${store.locationsById.size} entities`);
    logIndexSizes(store);

    const indexedIds = collectIndexedIds(store);
    if (indexedIds.size !== store.locationsById.size) {
        logger.warn(
            `Retail location index mismatch: ids=${store.locationsById.size}, indexedIds=${indexedIds.size}`
        );
    }
};
