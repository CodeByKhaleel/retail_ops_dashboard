import { logout, getAuthToken } from './auth.js';

const API_BASE = '/api';

export const api = {
    async get(path) {
        // Try to get a fresh token first
        let token = await getAuthToken();

        // If no token from demo auth (maybe initializing), fallback to localStorage
        if (!token) {
            token = localStorage.getItem('authToken');
        }

        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE}${path}`, {
                headers,
                // Include credentials to send session cookies automatically
                credentials: 'same-origin'
            });

            if (response.status === 401) {
                console.warn('Unauthorized. Attempting to refresh token...');

                // One-time retry with a forced token refresh
                const freshToken = await getAuthToken();
                if (freshToken && freshToken !== token) {
                    console.log('🔄 Retrying with refreshed token...');
                    const retryResponse = await fetch(`${API_BASE}${path}`, {
                        headers: { ...headers, 'Authorization': `Bearer ${freshToken}` },
                        credentials: 'same-origin'
                    });
                    if (retryResponse.ok) {
                        const payload = await retryResponse.json();
                        return payload.data;
                    }
                }

                // If still unauthorized, check if it's just a temporary initialization issue
                // or if we should actually logout. We only logout if we are sure the user is gone.
                console.warn('Session expired or unauthorized. Logging out...');
                logout();
                throw new Error('Unauthorized - please log in again');
            }

            const payload = await response.json();

            if (!response.ok || !payload.success) {
                const message = payload.message || 'API request failed';
                throw new Error(message);
            }

            return payload.data;
        } catch (error) {
            console.error(`API Error [GET ${path}]:`, error);
            throw error;
        }
    },

    /**
     * Fetch the global summary of Fulfillment Locations
     */
    async getFulfillmentSummary(isFulfillment = true) {
        return this.get(`/retail/fulfillment/summary?isFulfillment=${isFulfillment}`);
    },

    /**
     * Fetch detailed performer data for a specific location
     */
    async getLocationDetails(locationId, isFulfillment = true) {
        return this.get(`/retail/fulfillment/location/${locationId}?isFulfillment=${isFulfillment}`);
    },

    async getIntelligenceTrend(locationName) {
        return this.get(`/retail/demand/trend/${encodeURIComponent(locationName)}`);
    },

    async getIntelligenceWeeks() {
        return this.get('/retail/demand/weeks');
    },

    async getIntelligenceByWeek(year, week, fulfillmentOnly = false) {
        return this.get(`/retail/demand/query?year=${year}&week=${week}&type=locations&fulfillmentOnly=${fulfillmentOnly}`);
    },

    async getSKUIntelligenceByWeek(year, week) {
        return this.get(`/retail/demand/query?year=${year}&week=${week}&type=products`);
    },

    async getIntelligenceByMonth(year, month, fulfillmentOnly = false) {
        return this.get(`/retail/demand/query?year=${year}&week=${month * 4}&type=locations&fulfillmentOnly=${fulfillmentOnly}`);
    },

    async getSKUIntelligenceByMonth(year, month) {
        return this.get(`/retail/demand/query?year=${year}&week=${month * 4}&type=products`);
    },

    async getIntelligenceByQuarter(year, quarter, fulfillmentOnly = false) {
        return this.get(`/retail/demand/query?year=${year}&week=${quarter * 13}&type=locations&fulfillmentOnly=${fulfillmentOnly}`);
    },

    async getSKUIntelligenceByQuarter(year, quarter) {
        return this.get(`/retail/demand/query?year=${year}&week=${quarter * 13}&type=products`);
    },

    // Helper to build query strings from filter objects
    buildQuery(params) {
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    if (value.length > 0) qs.set(key, value.join(','));
                } else {
                    qs.set(key, String(value));
                }
            }
        });
        const str = qs.toString();
        return str ? `?${str}` : '';
    }
};
