export interface ChartDTO {
    labels: string[];
    values: number[];
}

export interface ChartsResult {
    locationsByCountry: ChartDTO;
    statusDistribution: ChartDTO;
    listingStatusDistribution: ChartDTO;
    storeFormatDistribution: ChartDTO;
    performanceScoreByRegion: ChartDTO;
    topPerformingLocations: ChartDTO;
}
