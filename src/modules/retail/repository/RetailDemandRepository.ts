import { retailLocationStore } from '../service/InMemoryRetailLocationStore';

const categories = ['Apparel', 'Home', 'Electronics', 'Beauty', 'Outdoor', 'Grocery'];
const products = [
    'Athleisure Core Set',
    'Premium Denim Line',
    'Home Essentials Bundle',
    'Travel Accessories Kit',
    'Seasonal Footwear Drop',
    'Smart Kitchen Starter',
    'Beauty Replenishment Pack',
    'Outdoor Utility Range',
];

const currentYear = new Date().getFullYear();
const weeks = Array.from({ length: 12 }, (_, index) => ({
    year: currentYear,
    week: 12 - index,
}));

const trendFor = (seed: number): number[] => {
    return Array.from({ length: 6 }, (_, index) => 80 + ((seed + index * 31) % 420));
};

export class RetailDemandRepository {
    async getAvailableWeeks(): Promise<Array<{ year: number; week: number }>> {
        return weeks;
    }

    async getLocationTrend(locationName: string): Promise<any[]> {
        const seed = locationName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        return weeks.slice(0, 6).map((item, index) => ({
            ...item,
            searchCount: trendFor(seed)[index],
        }));
    }

    async getDemandRankings(year: number, week: number, type: 'locations' | 'products' = 'locations'): Promise<any[]> {
        if (type === 'products') {
            return products.map((product, index) => {
                const searchCount = 400 + ((week * 53 + index * 91) % 1300);
                return {
                    rank: index + 1,
                    product,
                    sku: product,
                    category: categories[index % categories.length],
                    searchCount,
                    marketShare: Number((searchCount / 12000).toFixed(3)),
                    wowGrowth: ((index % 5) - 1) * 7,
                    trendSparkline: trendFor(searchCount),
                    year,
                    week,
                };
            }).sort((a, b) => b.searchCount - a.searchCount).map((item, index) => ({ ...item, rank: index + 1 }));
        }

        return Array.from(retailLocationStore.locationsById.values()).map((location, index) => {
            const seed = location.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
            const searchCount = 250 + ((seed + week * 29) % 1500);
            return {
                rank: index + 1,
                location: location.name,
                locationName: location.name,
                category: location.storeFormats[0] || 'Retail',
                searchCount,
                marketShare: Number((searchCount / 25000).toFixed(3)),
                wowGrowth: ((index % 7) - 2) * 5,
                trendSparkline: trendFor(seed),
                isPriorityFulfillment: location.priorityFulfillment,
                status: location.status,
                year,
                week,
            };
        }).sort((a, b) => b.searchCount - a.searchCount).slice(0, 40).map((item, index) => ({ ...item, rank: index + 1 }));
    }

    async getDemandCategories(): Promise<string[]> {
        return categories;
    }
}
