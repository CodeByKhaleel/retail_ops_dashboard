/**
 * Fulfillment Dashboard UI Module
 * Handles rendering the specialized Fulfillment analytics views and leaderboards.
 */

import { api } from './api.js';

export const fulfillment = {
    isFulfillmentOnly: true, // Internal state for the toggle
    currentLocationId: null,

    /**
     * Initialize Fulfillment-specific listeners
     */
    init() {
        const toggle = document.getElementById('fulfillment-only-toggle');
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                this.isFulfillmentOnly = e.target.checked;

                // If detail view is visible, refresh it
                const detailView = document.getElementById('fulfillment-detail-view');
                if (detailView && !detailView.classList.contains('hidden') && this.currentLocationId) {
                    this.showDrillDown(this.currentLocationId, false);
                } else {
                    // Otherwise refresh the summary list
                    this.renderSummary('fulfillment-locations-container');
                }
            });
        }
    },

    /**
     * Render the main Fulfillment Location Summary list
     */
    async renderSummary(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const label = this.isFulfillmentOnly ? 'Fulfillment performers' : 'Standard performers';
        container.innerHTML = `<div class="p-8 text-center text-slate-500 italic">Loading ${label}...</div>`;

        try {
            const data = await api.getFulfillmentSummary(this.isFulfillmentOnly);

            // Update total locations count
            const totalCountEl = document.getElementById('total-locations-count');
            if (totalCountEl) {
                totalCountEl.textContent = data?.length?.toLocaleString() || '0';
            }

            if (!data || data.length === 0) {
                container.innerHTML = `<div class="p-8 text-center text-slate-500">No data available for this selection.</div>`;
                return;
            }

            container.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${data.map(u => this.getLocationCardHtml(u)).join('')}
                </div>
            `;

            // Bind click events for drill-down
            container.querySelectorAll('.fulfillment-univ-card').forEach(card => {
                card.addEventListener('click', () => {
                    this.showDrillDown(card.dataset.id);
                });
            });

        } catch (error) {
            console.error('Fulfillment Summary Render Error:', error);
            container.innerHTML = `<div class="p-8 text-center text-red-500">Failed to load summary.</div>`;
        }
    },

    /**
     * Generate HTML for a Location Summary Card
     */
    getLocationCardHtml(u) {
        const skuLabel = this.isFulfillmentOnly ? 'Total Fulfillment SKUs' : 'Total Standard SKUs';
        return `
            <div data-id="${u.locationId}" class="fulfillment-univ-card relative overflow-hidden bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                <div class="flex flex-wrap justify-between items-start mb-6 gap-4">
                    <div>
                        <h3 class="font-black text-slate-900 dark:text-slate-50 group-hover:text-brand-600 transition-colors text-xl">${u.locationName}</h3>
                    </div>
                </div>

                <div class="bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <div class="flex flex-wrap justify-between gap-6 mb-6">
                        <div>
                            <p class="text-xs font-black text-slate-900 dark:text-white">Total Shortlisted SKUs</p>
                            <p class="text-3xl font-black text-brand-600 dark:text-brand-400 mt-2">${(u.totalBrowsed ?? 0).toLocaleString()}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-black text-slate-900 dark:text-white">${skuLabel}</p>
                            <p class="text-3xl font-black text-brand-600 dark:text-brand-400 mt-2">${(u.totalSKUs ?? 0).toLocaleString()}</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div class="rounded-2xl border border-slate-200/70 bg-white/90 dark:bg-slate-900/60 dark:border-slate-800 p-4">
                            <p class="text-sm text-slate-900 dark:text-white font-black">New skus added</p>
                            <div class="flex items-baseline gap-1.5 mt-1">
                                <span class="text-2xl font-black text-brand-600 dark:text-brand-400">${(u.newSKUsCount ?? 0).toLocaleString()}</span>
                                <span class="text-xs text-slate-500 font-bold">&lt; 30 days</span>
                            </div>
                        </div>
                        <div class="rounded-2xl border border-slate-200/70 bg-white/90 dark:bg-slate-900/60 dark:border-slate-800 p-4">
                            <p class="text-sm text-slate-900 dark:text-white font-black">New intakes added</p>
                            <div class="flex items-baseline gap-1.5 mt-1">
                                <span class="text-2xl font-black text-brand-600 dark:text-brand-400">${(u.newIntakesCount ?? 0).toLocaleString()}</span>
                                <span class="text-xs text-slate-500 font-bold">&lt; 30 days</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Show detailed drill-down for a specific location
     */
    async showDrillDown(locationId, pushToHistory = true) {
        this.currentLocationId = locationId;
        const container = document.getElementById('fulfillment-detail-view');
        const mainSummary = document.getElementById('fulfillment-summary-view');

        if (!container || !mainSummary) return;

        if (pushToHistory) {
            history.pushState({ page: 'fulfillment-detail', id: locationId }, '', `/fulfillment/location/${locationId}`);
        }

        mainSummary.classList.add('hidden');
        container.classList.remove('hidden');
        container.innerHTML = `<div class="p-20 text-center text-slate-500 italic">Analyzing performance for ${locationId}...</div>`;

        try {
            const data = await api.getLocationDetails(locationId, this.isFulfillmentOnly);
            this.currentLocationData = data; // Store for tab switching

            const showShortlistedTabs = (data.topPg?.length > 0 && data.topUg?.length > 0);
            const initialShortlistedLevel = data.topPg?.length > 0 ? 'pg' : (data.topUg?.length > 0 ? 'ug' : 'pg');
            const shortlistedList = initialShortlistedLevel === 'pg' ? (data.topPg || []) : (data.topUg || []);

            const showSoldTabs = (data.topSoldPg?.length > 0 && data.topSoldUg?.length > 0);
            const initialSoldLevel = data.topSoldPg?.length > 0 ? 'pg' : (data.topSoldUg?.length > 0 ? 'ug' : 'pg');
            const soldList = initialSoldLevel === 'pg' ? (data.topSoldPg || data.topSold || []) : (data.topSoldUg || []);

            const skuTypeLabel = this.isFulfillmentOnly ? 'Fulfillment SKUs' : 'Standard SKUs';
            const tooltipLabel = this.isFulfillmentOnly ? 'Fulfillment skus' : 'standard skus';

            container.innerHTML = `
                <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button id="back-to-fulfillment-list" class="flex items-center gap-2 text-sm font-bold text-brand-600 hover:gap-3 transition-all">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
                        Back to Location List
                    </button>
                    
                    <div class="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900/50 p-8 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-sm">
                        <div>
                            <h2 class="text-3xl font-black text-slate-900 dark:text-slate-100">${data.locationName}</h2>
                            <p class="text-slate-500 dark:text-slate-400 font-medium">Performance Leaderboard for ${skuTypeLabel}</p>
                        </div>
                        <div class="flex gap-4">
                            <div class="bg-brand-50 dark:bg-brand-900/30 px-6 py-4 rounded-3xl border border-brand-100 dark:border-brand-800 flex flex-col items-center">
                                <span class="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-1">${skuTypeLabel}</span>
                                <span class="text-2xl font-black text-brand-900 dark:text-slate-100">${data.stats.totalFulfillmentSKUs}</span>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                        
                        <!-- Top Shortlisted -->
                        <div class="bg-white dark:bg-slate-900/50 rounded-[40px] border border-slate-200 dark:border-white/5 p-6 shadow-md">
                            <div class="flex flex-wrap items-center justify-between mb-6 gap-2">
                                <h3 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    🔥 Top Shortlisted
                                    <div class="tooltip-container ml-1">
                                        <svg class="w-4 h-4 text-slate-400 hover:text-brand-600 transition-colors cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        <div class="tooltip-content">
                                            Total number of unique customer shortlists for ${tooltipLabel}.
                                        </div>
                                    </div>
                                </h3>
                                <div class="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl ${showShortlistedTabs ? '' : 'hidden'}" id="level-tabs-shortlisted">
                                    <button class="level-tab-shortlisted px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${initialShortlistedLevel === 'pg' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}" data-level="pg">PG</button>
                                    <button class="level-tab-shortlisted px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${initialShortlistedLevel === 'ug' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}" data-level="ug">UG</button>
                                </div>
                            </div>
                            <div id="sku-leaderboard-shortlisted" class="space-y-4">
                                ${shortlistedList.length > 0
                    ? shortlistedList.map((c, i) => this.getSKULeaderboardRowHtml(c, i, 'browsedCount')).join('')
                    : '<div class="p-4 text-center text-slate-400 italic text-sm">No skus shortlisted yet</div>'}
                            </div>
                        </div>

                        <!-- Top Sold -->
                        <div class="bg-white dark:bg-slate-900/50 rounded-[40px] border border-slate-200 dark:border-white/5 p-6 shadow-md">
                            <div class="flex flex-wrap items-center justify-between mb-6 gap-2">
                                <h3 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    💰 Top Sold
                                    <div class="tooltip-container ml-1">
                                        <svg class="w-4 h-4 text-slate-400 hover:text-brand-600 transition-colors cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        <div class="tooltip-content">
                                            Total number of successful enrollments for ${tooltipLabel}.
                                        </div>
                                    </div>
                                </h3>
                                <div class="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl ${showSoldTabs ? '' : 'hidden'}" id="level-tabs-sold">
                                    <button class="level-tab-sold px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${initialSoldLevel === 'pg' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}" data-level="pg">PG</button>
                                    <button class="level-tab-sold px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${initialSoldLevel === 'ug' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}" data-level="ug">UG</button>
                                </div>
                            </div>
                            <div id="sku-leaderboard-sold" class="space-y-4">
                                ${soldList.length > 0
                    ? soldList.map((c, i) => this.getSKULeaderboardRowHtml(c, i, 'soldCount')).join('')
                    : '<div class="p-4 text-center text-slate-400 italic text-sm">No skus sold yet</div>'}
                            </div>
                        </div>

                    </div>
                </div>
            `;

            // Setup tabs logic (reusing existing)
            const setupLevelTabs = (tabSelector, listContainerId, dataKeys, metricKey) => {
                container.querySelectorAll(tabSelector).forEach(tab => {
                    tab.addEventListener('click', () => {
                        const level = tab.dataset.level;
                        container.querySelectorAll(tabSelector).forEach(t => {
                            t.classList.remove('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-brand-600', 'dark:text-brand-400');
                            t.classList.add('text-slate-500', 'dark:text-slate-400');
                        });
                        tab.classList.add('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-brand-600', 'dark:text-brand-400');
                        const list = (level === 'ug' ? data[dataKeys.ug] : data[dataKeys.pg]) || [];
                        const listContainer = document.getElementById(listContainerId);
                        if (listContainer) {
                            listContainer.innerHTML = list.length > 0
                                ? list.map((c, i) => this.getSKULeaderboardRowHtml(c, i, metricKey)).join('')
                                : '<div class="p-4 text-center text-slate-400 italic text-sm">No skus found</div>';
                        }
                    });
                });
            };

            setupLevelTabs('.level-tab-shortlisted', 'sku-leaderboard-shortlisted', { pg: 'topPg', ug: 'topUg' }, 'browsedCount');
            setupLevelTabs('.level-tab-sold', 'sku-leaderboard-sold', { pg: 'topSoldPg', ug: 'topSoldUg' }, 'soldCount');

            document.getElementById('back-to-fulfillment-list').addEventListener('click', () => {
                this.currentLocationId = null;
                history.pushState({ page: 'fulfillment-list' }, '', '/fulfillment');
                container.classList.add('hidden');
                mainSummary.classList.remove('hidden');
            });

        } catch (error) {
            console.error('Fulfillment DrillDown Error:', error);
            container.innerHTML = `<div class="p-20 text-center text-red-500">Failed to load location details.</div>`;
        }
    },

    getSKULeaderboardRowHtml(c, index, metricKey = 'browsedCount') {
        const medal = ['🥇', '🥈', '🥉'][index] || `&nbsp;&nbsp;${index + 1}`;
        let value = metricKey === 'soldCount' ? (c.metrics.soldCount ?? 0) : (c.metrics.browsedCount ?? 0);
        let label = metricKey === 'soldCount' ? 'Enrolled' : 'Shortlists';

        return `
            <div class="flex items-center group p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                <div class="w-12 h-12 flex items-center justify-center text-xl font-black text-slate-300 dark:text-slate-600 group-hover:text-brand-600 transition-colors">
                    ${medal}
                </div>
                <div class="flex-1 ml-4">
                    <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-brand-600 transition-colors">${c.skuName}</h4>
                    <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">${c.skuLevel} • ${c.subject}</p>
                </div>
                <div class="text-right">
                    <p class="text-lg font-black text-brand-700 dark:text-brand-400 leading-none">${value.toLocaleString()}</p>
                    <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">${label}</p>
                </div>
            </div>
        `;
    }
};
