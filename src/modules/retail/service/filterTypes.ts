export interface RetailFilters {
    search?: string;
    country?: string[];
    status?: string[];
    listingStatus?: string[];
    dataSource?: string[];
    storeFormats?: string[];
    fulfillmentPartners?: string[];
    tags?: string[];
    priorityFulfillment?: boolean;
    region?: string[];
    managedByTeam?: string[];
}
