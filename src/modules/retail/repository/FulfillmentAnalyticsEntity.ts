export interface FulfillmentAnalyticsEntity {
    locationId: string;
    locationName: string;
    region?: string;
    skuRefId: string;
    skuName: string;
    skuLevel: string;
    subject: string;
    metrics: {
        browsedCount: number;
        soldCount: number;
    };
    flags: {
        isFulfillment: boolean;
        isNewSKU: boolean;
        isNewIntake: boolean;
    };
    activeIntakes: Array<{
        month: string;
        year: number;
        isNew: boolean;
    }>;
    lastSyncedAt: Date;
}

export interface FulfillmentLocationSummary {
    locationId: string;
    locationName: string;
    totalSKUs: number;
    totalBrowsed: number;
    totalSold: number;
    newSKUsCount: number;
    newIntakesCount: number;
}
