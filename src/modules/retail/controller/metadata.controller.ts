import { Request, Response, NextFunction } from 'express';
import { retailLocationStore } from '../service/InMemoryRetailLocationStore';
import { successResponse } from '../../../core/response/apiResponse';
import { RetailLocationEntity } from '../contracts/RetailContracts';

const sortedValues = (values: Iterable<string>): string[] => {
    return Array.from(values).filter((value) => value.length > 0).sort((a, b) => a.localeCompare(b));
};

const collectDistinct = (selector: (location: RetailLocationEntity) => string | string[]): string[] => {
    const values = new Set<string>();
    for (const location of retailLocationStore.locationsById.values()) {
        const selected = selector(location);
        if (Array.isArray(selected)) {
            selected.forEach((value) => {
                if (value) values.add(value);
            });
        } else if (selected) {
            values.add(selected);
        }
    }
    return sortedValues(values);
};

const buildRegionCountries = (): Record<string, string[]> => {
    const regionCountries = new Map<string, Set<string>>();
    for (const location of retailLocationStore.locationsById.values()) {
        if (!regionCountries.has(location.region)) {
            regionCountries.set(location.region, new Set<string>());
        }
        regionCountries.get(location.region)?.add(location.country);
    }

    return Object.fromEntries(
        Array.from(regionCountries.entries())
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([region, countries]) => [region, sortedValues(countries)])
    );
};

export const getRetailFilterMetadata = (_req: Request, res: Response, next: NextFunction): void => {
    try {
        res.json(
            successResponse({
                region: collectDistinct((location) => location.region),
                country: collectDistinct((location) => location.country),
                dataSource: collectDistinct((location) => location.dataSource),
                status: collectDistinct((location) => location.status),
                listingStatus: collectDistinct((location) => location.listingStatus),
                tags: collectDistinct((location) => location.tags),
                fulfillmentPartners: collectDistinct((location) => location.fulfillmentPartners),
                storeFormats: collectDistinct((location) => location.storeFormats),
                managedByTeam: collectDistinct((location) => location.managedByTeam),
                regionCountries: buildRegionCountries(),
            })
        );
    } catch (error) {
        next(error);
    }
};
