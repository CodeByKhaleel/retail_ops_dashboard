export interface RawRetailLocationDoc {
    _id: string;
    name?: string;
    status?: string;
    listingStatus?: string;
    storeFormat?: string[] | string;
    tags?: string[] | string;
    priorityFulfillment?: boolean;
    dataSource?: string;
    refId?: string;
    locationType?: string[] | string;
    fulfillmentPartners?: string[] | string;
    managedByTeam?: string;
    country?: string;
    address?: {
        country?: string;
    };
}

export interface RetailLocationEntity {
    id: string;
    name: string;
    country: string;
    status: string;
    listingStatus: string;
    storeFormats: string[];
    tags: string[];
    priorityFulfillment: boolean;
    dataSource: string;
    fulfillmentPartners: string[];
    refId: string;
    locationType: string[];
    region: string;
    performanceScore: number;
    managedByTeam: string;
}

export interface RetailLocationFilter {
    search?: string;
    country?: string;
    status?: string;
    listingStatus?: string;
    storeFormat?: string;
    tags?: string;
    fulfillmentPartner?: string;
    dataSource?: string;
    priorityFulfillment?: boolean;
}

export interface PaginationOptions {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface RetailLocationStats {
    totalLocations: number;
    byCountry: Record<string, number>;
    byStatus: Record<string, number>;
    byListingStatus: Record<string, number>;
    byStoreFormat: Record<string, number>;
}
