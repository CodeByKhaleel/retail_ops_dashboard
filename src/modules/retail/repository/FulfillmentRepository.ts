import { retailLocationStore } from '../service/InMemoryRetailLocationStore';
import { FulfillmentLocationSummary } from './FulfillmentAnalyticsEntity';

const skuNames = [
    'Athleisure Core Set',
    'Premium Denim Line',
    'Home Essentials Bundle',
    'Travel Accessories Kit',
    'Seasonal Footwear Drop',
    'Smart Kitchen Starter',
    'Beauty Replenishment Pack',
    'Outdoor Utility Range',
];

const categories = ['Apparel', 'Home', 'Electronics', 'Beauty', 'Outdoor'];

const buildSkuRows = (locationId: string) => {
    const seed = locationId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return skuNames.map((name, index) => {
        const demand = 80 + ((seed + index * 37) % 900);
        const fulfilled = Math.round(demand * (0.22 + ((seed + index) % 45) / 100));
        return {
            skuName: name,
            skuLevel: index % 2 === 0 ? 'Core' : 'Seasonal',
            subject: categories[index % categories.length],
            metrics: {
                browsedCount: demand,
                soldCount: fulfilled,
            },
        };
    }).sort((a, b) => b.metrics.browsedCount - a.metrics.browsedCount);
};

export class FulfillmentRepository {
    async getLocationSummaries(_fulfillmentOnly: boolean = true): Promise<FulfillmentLocationSummary[]> {
        return Array.from(retailLocationStore.locationsById.values())
            .filter(location => location.priorityFulfillment)
            .map(location => {
                const rows = buildSkuRows(location.id);
                return {
                    locationId: location.id,
                    locationName: location.name,
                    totalSKUs: rows.length,
                    totalBrowsed: rows.reduce((sum, row) => sum + row.metrics.browsedCount, 0),
                    totalSold: rows.reduce((sum, row) => sum + row.metrics.soldCount, 0),
                    newSKUsCount: rows.filter((_, index) => index % 3 === 0).length,
                    newIntakesCount: rows.filter((_, index) => index % 4 === 0).length,
                };
            })
            .sort((a, b) => b.totalBrowsed - a.totalBrowsed);
    }

    async getLocationDetails(locationId: string, _fulfillmentOnly: boolean = true): Promise<any> {
        const location = retailLocationStore.locationsById.get(locationId);
        if (!location) {
            return null;
        }

        const rows = buildSkuRows(locationId);
        const topPg = rows.slice(0, 5);
        const topUg = rows.slice(3, 8);
        const topSoldPg = [...rows].sort((a, b) => b.metrics.soldCount - a.metrics.soldCount).slice(0, 5);
        const topSoldUg = [...rows].sort((a, b) => b.metrics.soldCount - a.metrics.soldCount).slice(2, 7);

        return {
            locationId,
            locationName: location.name,
            stats: {
                totalFulfillmentSKUs: rows.length,
            },
            topPg,
            topUg,
            topSoldPg,
            topSoldUg,
        };
    }
}
