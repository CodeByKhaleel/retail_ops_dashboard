import { RetailLocationRepository } from './RetailLocationRepository';
import { RawRetailLocationDoc } from '../contracts/RetailContracts';

const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Germany',
    'France',
    'India',
    'Singapore',
    'Australia',
    'Japan',
    'United Arab Emirates',
    'Brazil',
    'Mexico',
];

const cityBrands = [
    'Harbor',
    'Metro',
    'Summit',
    'Cedar',
    'Riverside',
    'Central',
    'Northgate',
    'Westline',
    'Market',
    'Parkside',
    'Union',
    'Eastpoint',
];

const statuses = ['Active', 'Paused', 'Under Review', 'Closed'];
const listingStatuses = ['Listed', 'Draft', 'Suppressed', 'Archived'];
const storeFormats = ['Flagship', 'Outlet', 'Marketplace', 'Franchise'];
const tags = ['High Growth', 'At Risk', 'Premium', 'Seasonal', 'Omnichannel'];
const dataSources = ['POS', 'Ecommerce', 'CRM', 'Marketplace'];
const fulfillmentPartners = ['Rapid Ship', 'Regional DC', 'Store Pickup', 'Drop Ship'];
const teams = ['North Ops', 'Growth Ops', 'Marketplace Ops', 'Inventory Control'];

export class DemoRetailLocationRepository implements RetailLocationRepository {
    async fetchAll(): Promise<RawRetailLocationDoc[]> {
        const locations: RawRetailLocationDoc[] = [];

        for (let i = 1; i <= 72; i += 1) {
            const country = countries[i % countries.length];
            const format = storeFormats[i % storeFormats.length];
            const status = statuses[i % statuses.length];
            const listingStatus = listingStatuses[(i + 1) % listingStatuses.length];
            const locationTags = [
                tags[i % tags.length],
                tags[(i + 2) % tags.length],
            ];

            locations.push({
                _id: `retail-location-${String(i).padStart(3, '0')}`,
                name: `${cityBrands[i % cityBrands.length]} ${format} ${i}`,
                country,
                address: { country },
                status,
                listingStatus,
                storeFormat: [format],
                tags: locationTags,
                priorityFulfillment: i % 4 === 0 || locationTags.includes('Premium'),
                dataSource: dataSources[i % dataSources.length],
                fulfillmentPartners: [fulfillmentPartners[i % fulfillmentPartners.length]],
                locationType: [format],
                refId: `LOC-${1000 + i}`,
                managedByTeam: teams[i % teams.length],
            });
        }

        return locations;
    }
}
