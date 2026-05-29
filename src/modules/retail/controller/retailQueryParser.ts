import { ParsedQs } from 'qs';
import { RetailFilters } from '../service/filterTypes';
import { DomainError } from '../../../core/errors/DomainError';

const parseString = (value: unknown): string | undefined => {
    if (typeof value !== 'string') {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

const splitList = (value: string): string[] => {
    return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
};

const parseStringArray = (value: unknown): string[] | undefined => {
    if (typeof value === 'string') {
        const result = splitList(value);
        return result.length > 0 ? result : undefined;
    }

    if (Array.isArray(value)) {
        const result: string[] = [];
        for (const item of value) {
            if (typeof item === 'string') {
                result.push(...splitList(item));
            }
        }
        return result.length > 0 ? result : undefined;
    }

    return undefined;
};

const parseBoolean = (value: unknown, fieldName: string): boolean | undefined => {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== 'string') {
        throw new DomainError(400, `Invalid boolean value for ${fieldName}`);
    }
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    throw new DomainError(400, `Invalid boolean value for ${fieldName}`);
};

const parsePositiveInt = (
    value: unknown,
    fieldName: string,
    defaultValue: number
): number => {
    if (value === undefined) {
        return defaultValue;
    }
    if (typeof value !== 'string') {
        throw new DomainError(400, `Invalid ${fieldName}`);
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
        throw new DomainError(400, `Invalid ${fieldName}`);
    }
    return parsed;
};

export const parseRetailFilters = (query: ParsedQs): RetailFilters => {
    return {
        country: parseStringArray(query.country),
        status: parseStringArray(query.status),
        listingStatus: parseStringArray(query.listingStatus),
        dataSource: parseStringArray(query.dataSource),
        storeFormats: parseStringArray(query.storeFormats),
        fulfillmentPartners: parseStringArray(query.fulfillmentPartners),
        tags: parseStringArray(query.tags),
        priorityFulfillment: parseBoolean(query.priorityFulfillment, 'priorityFulfillment'),
        region: parseStringArray(query.region),
        managedByTeam: parseStringArray(query.managedByTeam),
    };
};

const SORT_FIELDS = [
    'name',
    'country',
    'status',
    'listingStatus',
    'dataSource',
    'storeFormat',
    'fulfillmentPartners',
    'tags',
    'priorityFulfillment',
    'region',
    'performanceScore',
] as const;

type SortField = (typeof SORT_FIELDS)[number];
type SortOrder = 'asc' | 'desc';

export const parseSort = (query: ParsedQs): { sortBy: SortField; sortOrder: SortOrder } => {
    const sortBy = parseString(query.sortBy);
    const sortOrder = parseString(query.sortOrder);

    const normalizedSortBy = SORT_FIELDS.includes(sortBy as SortField)
        ? (sortBy as SortField)
        : 'performanceScore';
    const normalizedSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    return { sortBy: normalizedSortBy, sortOrder: normalizedSortOrder };
};

export const parsePagination = (query: ParsedQs): { page: number; pageSize: number } => {
    return {
        page: parsePositiveInt(query.page, 'page', 1),
        pageSize: parsePositiveInt(query.pageSize, 'pageSize', 20),
    };
};
