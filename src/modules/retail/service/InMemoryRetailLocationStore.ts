import { RetailLocationEntity } from '../contracts/RetailContracts';
import { BooleanIndex, RetailLocationIndexes, StringIndex } from './indexTypes';

export class InMemoryRetailLocationStore implements RetailLocationIndexes {
    locationsById: Map<string, RetailLocationEntity> = new Map();
    countryIndex: StringIndex = new Map();
    statusIndex: StringIndex = new Map();
    listingStatusIndex: StringIndex = new Map();
    storeFormatIndex: StringIndex = new Map();
    tagsIndex: StringIndex = new Map();
    priorityFulfillmentIndex: BooleanIndex = new Map();
    dataSourceIndex: StringIndex = new Map();
    fulfillmentPartnersIndex: StringIndex = new Map();
    regionIndex: StringIndex = new Map();
    managedByTeamIndex: StringIndex = new Map();

    addLocation(entity: RetailLocationEntity): void {
        if (this.locationsById.has(entity.id)) {
            this.removeLocation(entity.id);
        }

        this.locationsById.set(entity.id, entity);
        this.addToStringIndex(this.countryIndex, entity.country, entity.id);
        this.addToStringIndex(this.statusIndex, entity.status, entity.id);
        this.addToStringIndex(this.listingStatusIndex, entity.listingStatus, entity.id);
        this.addToStringIndex(this.dataSourceIndex, entity.dataSource, entity.id);
        this.addToStringIndex(this.regionIndex, entity.region, entity.id);
        this.addToStringIndex(this.managedByTeamIndex, entity.managedByTeam, entity.id);
        this.addToIndex(this.priorityFulfillmentIndex, entity.priorityFulfillment, entity.id);

        for (const storeFormat of entity.storeFormats.length ? entity.storeFormats : ['n/a']) {
            this.addToStringIndex(this.storeFormatIndex, storeFormat, entity.id);
        }

        for (const tag of entity.tags) {
            this.addToStringIndex(this.tagsIndex, tag, entity.id);
        }

        for (const partner of entity.fulfillmentPartners) {
            this.addToStringIndex(this.fulfillmentPartnersIndex, partner, entity.id);
        }
    }

    removeLocation(id: string): void {
        const existing = this.locationsById.get(id);
        if (!existing) {
            return;
        }

        this.removeFromStringIndex(this.countryIndex, existing.country, id);
        this.removeFromStringIndex(this.statusIndex, existing.status, id);
        this.removeFromStringIndex(this.listingStatusIndex, existing.listingStatus, id);
        this.removeFromStringIndex(this.dataSourceIndex, existing.dataSource, id);
        this.removeFromStringIndex(this.regionIndex, existing.region, id);
        this.removeFromStringIndex(this.managedByTeamIndex, existing.managedByTeam, id);
        this.removeFromIndex(this.priorityFulfillmentIndex, existing.priorityFulfillment, id);

        for (const storeFormat of existing.storeFormats.length ? existing.storeFormats : ['n/a']) {
            this.removeFromStringIndex(this.storeFormatIndex, storeFormat, id);
        }

        for (const tag of existing.tags) {
            this.removeFromStringIndex(this.tagsIndex, tag, id);
        }

        for (const partner of existing.fulfillmentPartners) {
            this.removeFromStringIndex(this.fulfillmentPartnersIndex, partner, id);
        }

        this.locationsById.delete(id);
    }

    updateLocation(entity: RetailLocationEntity): void {
        this.removeLocation(entity.id);
        this.addLocation(entity);
    }

    getAllIds(): Set<string> {
        return new Set(this.locationsById.keys());
    }

    clear(): void {
        this.locationsById.clear();
        this.countryIndex.clear();
        this.statusIndex.clear();
        this.listingStatusIndex.clear();
        this.storeFormatIndex.clear();
        this.tagsIndex.clear();
        this.priorityFulfillmentIndex.clear();
        this.dataSourceIndex.clear();
        this.fulfillmentPartnersIndex.clear();
        this.regionIndex.clear();
        this.managedByTeamIndex.clear();
    }

    private ensureSet<K>(map: Map<K, Set<string>>, key: K): Set<string> {
        const existing = map.get(key);
        if (existing) {
            return existing;
        }

        const created = new Set<string>();
        map.set(key, created);
        return created;
    }

    private addToIndex<K>(map: Map<K, Set<string>>, key: K, id: string): void {
        const bucket = this.ensureSet(map, key);
        bucket.add(id);
    }

    private removeFromIndex<K>(map: Map<K, Set<string>>, key: K, id: string): void {
        const bucket = map.get(key);
        if (!bucket) {
            return;
        }

        bucket.delete(id);
        if (bucket.size === 0) {
            map.delete(key);
        }
    }

    private normalizeKey(value: string): string {
        return value.trim().toLowerCase();
    }

    private addToStringIndex(map: Map<string, Set<string>>, key: string, id: string): void {
        this.addToIndex(map, this.normalizeKey(key), id);
    }

    private removeFromStringIndex(map: Map<string, Set<string>>, key: string, id: string): void {
        this.removeFromIndex(map, this.normalizeKey(key), id);
    }
}

export const retailLocationStore = new InMemoryRetailLocationStore();
