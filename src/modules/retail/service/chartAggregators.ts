import { RetailLocationEntity } from '../contracts/RetailContracts';
import { ChartDTO } from './chartTypes';

const mapToChart = (counts: Map<string, number>): ChartDTO => {
    const labels: string[] = [];
    const values: number[] = [];
    for (const [label, count] of counts) {
        labels.push(label);
        values.push(count);
    }
    return { labels, values };
};

const incrementCount = (counts: Map<string, number>, key: string): void => {
    counts.set(key, (counts.get(key) ?? 0) + 1);
};

export const aggregateLocationsByCountry = (entities: RetailLocationEntity[]): ChartDTO => {
    const counts = new Map<string, number>();
    for (const entity of entities) {
        incrementCount(counts, entity.country);
    }

    // Convert to array and sort by count descending
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

    return {
        labels: sorted.map(x => x[0]),
        values: sorted.map(x => x[1])
    };
};

export const aggregateStatusDistribution = (entities: RetailLocationEntity[]): ChartDTO => {
    const counts = new Map<string, number>();
    for (const entity of entities) {
        incrementCount(counts, entity.status);
    }
    return mapToChart(counts);
};

export const aggregateListingStatusDistribution = (entities: RetailLocationEntity[]): ChartDTO => {
    const counts = new Map<string, number>();
    for (const entity of entities) {
        incrementCount(counts, entity.listingStatus);
    }
    return mapToChart(counts);
};

export const aggregateStoreFormatDistribution = (
    entities: RetailLocationEntity[]
): ChartDTO => {
    const counts = new Map<string, number>();
    for (const entity of entities) {
        if (!entity.storeFormats || entity.storeFormats.length === 0) {
            incrementCount(counts, 'N/A');
        } else {
            for (const storeFormat of entity.storeFormats) {
                incrementCount(counts, storeFormat);
            }
        }
    }
    return mapToChart(counts);
};

export const aggregatePerformanceScoreByRegion = (entities: RetailLocationEntity[]): ChartDTO => {
    const scores = new Map<string, number>();
    const counts = new Map<string, number>();

    for (const entity of entities) {
        const region = entity.region || 'Other';
        scores.set(region, (scores.get(region) ?? 0) + entity.performanceScore);
        counts.set(region, (counts.get(region) ?? 0) + 1);
    }

    const averages = new Map<string, number>();
    for (const [region, totalScore] of scores) {
        const count = counts.get(region) || 1;
        averages.set(region, parseFloat((totalScore / count).toFixed(2)));
    }

    return mapToChart(averages);
};

export const aggregateTopPerformingLocations = (entities: RetailLocationEntity[]): ChartDTO => {
    const sorted = [...entities].sort((a, b) => b.performanceScore - a.performanceScore);
    const top50 = sorted.slice(0, 50);

    return {
        labels: top50.map(p => p.name),
        values: top50.map(p => p.performanceScore)
    };
};
