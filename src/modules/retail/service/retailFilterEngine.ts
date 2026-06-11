import { InMemoryRetailLocationStore } from './InMemoryRetailLocationStore';
import { RetailFilters } from './filterTypes';

type SetEntry = { set: Set<string>; order: number };

const cloneSet = (input: Set<string>): Set<string> => new Set(input);

const intersectSets = (sets: Set<string>[]): Set<string> => {
    if (sets.length === 0) {
        return new Set<string>();
    }

    const ordered: SetEntry[] = sets.map((set, order) => ({ set, order }));
    ordered.sort((a, b) => (a.set.size - b.set.size) || (a.order - b.order));

    const result = cloneSet(ordered[0].set);
    for (let i = 1; i < ordered.length; i += 1) {
        const nextSet = ordered[i].set;
        for (const id of result) {
            if (!nextSet.has(id)) {
                result.delete(id);
            }
        }
        if (result.size === 0) {
            break;
        }
    }
    return result;
};

const unionSets = (sets: Set<string>[]): Set<string> => {
    const result = new Set<string>();
    for (const set of sets) {
        for (const id of set) {
            result.add(id);
        }
    }
    return result;
};

const applySearch = (
    store: InMemoryRetailLocationStore,
    search: string
): Set<string> => {
    const normalizedSearch = search.trim().toLowerCase();
    if (normalizedSearch.length === 0) {
        return store.getAllIds();
    }

    const matches = new Set<string>();
    for (const location of store.locationsById.values()) {
        const haystacks = [
            location.name,
            location.country,
            location.refId,
            location.managedByTeam,
            location.region,
            location.dataSource,
            ...location.tags,
            ...location.fulfillmentPartners,
            ...location.storeFormats,
        ];

        if (haystacks.some((value) => value.toLowerCase().includes(normalizedSearch))) {
            matches.add(location.id);
        }
    }

    return matches;
};

const normalizeArray = (values: string[]): string[] => {
    return values.map((value) => value.trim().toLowerCase()).filter((value) => value.length > 0);
};

const addSingleFilter = <K>(
    map: Map<K, Set<string>>,
    key: K | undefined,
    activeSets: Set<string>[]
): boolean => {
    if (key === undefined) {
        return true;
    }

    const set = map.get(key);
    if (!set) {
        return false;
    }

    activeSets.push(cloneSet(set));
    return true;
};

const buildOrSet = (
    map: Map<string, Set<string>>,
    values?: string[]
): Set<string> | null => {
    if (!values || values.length === 0) {
        return null;
    }

    const sets: Set<string>[] = [];
    for (const value of normalizeArray(values)) {
        const existing = map.get(value);
        if (existing) {
            sets.push(existing);
        }
    }

    return sets.length === 0 ? new Set<string>() : unionSets(sets);
};

export const filterRetailLocationIds = (
    store: InMemoryRetailLocationStore,
    filters: RetailFilters
): Set<string> => {
    const activeSets: Set<string>[] = [];

    if (filters.search) {
        const searchMatches = applySearch(store, filters.search);
        if (searchMatches.size === 0) {
            return new Set<string>();
        }
        activeSets.push(searchMatches);
    }

    if (filters.priorityFulfillment === true) {
        if (!addSingleFilter(store.priorityFulfillmentIndex, true, activeSets)) {
            return new Set<string>();
        }
    }

    const filterMappings: { key: keyof RetailFilters; index: Map<string, Set<string>> }[] = [
        { key: 'country', index: store.countryIndex },
        { key: 'status', index: store.statusIndex },
        { key: 'listingStatus', index: store.listingStatusIndex },
        { key: 'region', index: store.regionIndex },
        { key: 'dataSource', index: store.dataSourceIndex },
        { key: 'storeFormats', index: store.storeFormatIndex },
        { key: 'fulfillmentPartners', index: store.fulfillmentPartnersIndex },
        { key: 'tags', index: store.tagsIndex },
        { key: 'managedByTeam', index: store.managedByTeamIndex },
    ];

    for (const mapping of filterMappings) {
        const filterValue = filters[mapping.key];
        if (Array.isArray(filterValue) && filterValue.length > 0) {
            const orSet = buildOrSet(mapping.index, filterValue);
            if (orSet) {
                if (orSet.size === 0) {
                    return new Set<string>();
                }
                activeSets.push(orSet);
            }
        }
    }

    if (activeSets.length === 0) {
        return store.getAllIds();
    }

    return intersectSets(activeSets);
};
