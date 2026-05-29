export type StringIndex = Map<string, Set<string>>;
export type BooleanIndex = Map<boolean, Set<string>>;

export interface RetailLocationIndexes {
    countryIndex: StringIndex;
    statusIndex: StringIndex;
    listingStatusIndex: StringIndex;
    storeFormatIndex: StringIndex;
    tagsIndex: StringIndex;
    priorityFulfillmentIndex: BooleanIndex;
    dataSourceIndex: StringIndex;
    fulfillmentPartnersIndex: StringIndex;
    regionIndex: StringIndex;
    managedByTeamIndex: StringIndex;
}
