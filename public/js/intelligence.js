/**
 * Store Location Intelligence Module
 * Tracks demand signal trends and WOW (Week-over-Week) locational performance.
 */
import { api } from './api.js';

export const intelligence = {
    currentYear: new Date().getFullYear(),
    currentMonth: null,
    currentWeek: null,
    currentQuarter: null,
    currentTimeframe: 'Week', // 'Week', '4W', 'Month', 'Quarter'
    availableWeeks: [],
    activeTab: 'location', // 'location' or 'sku'
    dataCache: new Map(), // (year-timeframe-period-tab) -> data

    months: [
        { id: 1, name: 'January' }, { id: 2, name: 'February' }, { id: 3, name: 'March' },
        { id: 4, name: 'April' }, { id: 5, name: 'May' }, { id: 6, name: 'June' },
        { id: 7, name: 'July' }, { id: 8, name: 'August' }, { id: 9, name: 'September' },
        { id: 10, name: 'October' }, { id: 11, name: 'November' }, { id: 12, name: 'December' }
    ],

    quarters: [
        { id: 1, name: 'Q1 (Jan - Mar)' },
        { id: 2, name: 'Q2 (Apr - Jun)' },
        { id: 3, name: 'Q3 (Jul - Sep)' },
        { id: 4, name: 'Q4 (Oct - Dec)' }
    ],

    /**
     * Map ISO week to month (approximate for UI grouping)
     */
    getWeekMonth(week) {
        if (week <= 4) return 1; if (week <= 8) return 2; if (week <= 12) return 3;
        if (week <= 17) return 4; if (week <= 21) return 5; if (week <= 26) return 6;
        if (week <= 30) return 7; if (week <= 34) return 8; if (week <= 39) return 9;
        if (week <= 43) return 10; if (week <= 48) return 11; return 12;
    },

    getWeekQuarter(week) {
        if (week <= 13) return 1;
        if (week <= 26) return 2;
        if (week <= 39) return 3;
        return 4;
    },

    /**
     * Initialize listeners
     */
    init() {
        document.addEventListener('change', async (e) => {
            if (!e.target) return;

            if (e.target.id === 'period-selector') {
                const val = e.target.value;
                if (this.currentTimeframe === 'Week') this.currentWeek = val === 'all' ? null : Number(val);
                if (this.currentTimeframe === 'Month' || this.currentTimeframe === '4W') this.currentMonth = val === 'all' ? null : Number(val);
                if (this.currentTimeframe === 'Quarter') this.currentQuarter = val === 'all' ? null : Number(val);
                await this.refreshContent();
            }
        });

        document.addEventListener('click', async (e) => {
            // Tab Switcher
            const tabBtn = e.target.closest('[data-intel-tab]');
            if (tabBtn) {
                const newTab = tabBtn.dataset.intelTab;
                if (this.activeTab !== newTab) {
                    this.activeTab = newTab;
                    this.updateTabUI();
                    await this.refreshContent();
                }
                return;
            }

            // Year Toggle
            const yearBtn = e.target.closest('[data-intel-year]');
            if (yearBtn) {
                this.currentYear = Number(yearBtn.dataset.intelYear);
                this.renderFilterDropdowns();
                await this.refreshContent();
                return;
            }

            // Timeframe Chip
            const timeframeBtn = e.target.closest('[data-intel-timeframe]');
            if (timeframeBtn) {
                this.currentTimeframe = timeframeBtn.dataset.intelTimeframe;
                // Reset granular selections when timeframe switches
                this.currentWeek = null;
                this.currentMonth = null;
                this.currentQuarter = null;
                this.renderFilterDropdowns();
                await this.refreshContent();
                return;
            }
        });
    },

    updateTabUI() {
        const activeTabClass = "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10";
        const inactiveTabClass = "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200";

        document.querySelectorAll('[data-intel-tab]').forEach(btn => {
            const isActive = btn.dataset.intelTab === this.activeTab;
            btn.className = `px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${isActive ? activeTabClass : inactiveTabClass}`;
        });
    },

    /**
     * Render the global Intelligence dashboard structure
     */
    async renderDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // If inner structure already exists, just refresh content
        if (container.querySelector('#intel-content-area')) {
            await this.refreshContent();
            return;
        }

        try {
            if (this.availableWeeks.length === 0) {
                const weeks = await api.getIntelligenceWeeks();
                if (!weeks || weeks.length === 0) {
                    container.innerHTML = `<div class="p-20 text-center text-slate-500">No intelligence data available.</div>`;
                    return;
                }
                weeks.sort((a, b) => {
                    if (b.year !== a.year) return b.year - a.year;
                    return b.week - a.week;
                });
                this.availableWeeks = weeks;

                if (!this.currentYear) {
                    this.currentYear = weeks[0].year;
                }
            }

            const activeTabClass = "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10";
            const inactiveTabClass = "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200";

            container.innerHTML = `
                <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div class="space-y-4">
                            <div>
                                <div class="flex items-center gap-3 mb-1">
                                    <h2 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Intelligence Hub</h2>
                                    <span class="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-[10px] font-black uppercase tracking-wider">${this.currentYear} Insights</span>
                                </div>
                                <p class="text-slate-500 dark:text-slate-400 font-medium">Strategic demand tracking and market growth analytics</p>
                            </div>

                            <!-- Tab Switcher -->
                            <div class="inline-flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/5">
                                <button data-intel-tab="location" class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${this.activeTab === 'location' ? activeTabClass : inactiveTabClass}">
                                    Store Location Intelligence
                                </button>
                                <button data-intel-tab="sku" class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${this.activeTab === 'sku' ? activeTabClass : inactiveTabClass}">
                                    SKU Intelligence
                                </button>
                            </div>
                        </div>

                        <!-- Detailed Filters -->
                        <div id="intel-filters-container" class="flex flex-wrap items-center gap-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-2xl rounded-none overflow-hidden">
                            <!-- Filters will be injected here by renderFilterDropdowns -->
                        </div>
                    </div>

                    <div id="intel-content-area">
                        <!-- Content injected here -->
                    </div>
                </div>
            `;

            this.renderFilterDropdowns();
            await this.refreshContent();

        } catch (error) {
            console.error('Intelligence Render Error:', error);
            container.innerHTML = `
                <div class="p-20 text-center">
                    <p class="text-red-500 font-bold mb-2">Failed to load intelligence hub.</p>
                    <button onclick="location.reload()" class="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">Retry</button>
                </div>
            `;
        }
    },

    /**
     * Renders the Year Toggle, Timeframe Chips, and Period Dropdown
     */
    renderFilterDropdowns() {
        const container = document.getElementById('intel-filters-container');
        if (!container) return;

        const years = Array.from(new Set(this.availableWeeks.map(w => w.year))).sort((a, b) => b - a);

        // Find which periods are available for the selected year and timeframe
        const selectedYearWeeks = this.availableWeeks.filter(w => w.year === this.currentYear);

        // Dynamically determine available timeframes based on data
        const availableTfs = ['Week']; // Week is always reference
        const hasMonths = selectedYearWeeks.some(w => this.getWeekMonth(w.week));
        if (hasMonths) availableTfs.push('Month');
        const hasQuarters = selectedYearWeeks.some(w => this.getWeekQuarter(w.week));
        if (hasQuarters) availableTfs.push('Quarter');

        const timeframes = availableTfs;
        const tf = this.currentTimeframe;

        let periodOptions = [];
        let selectedPeriod = null;
        let periodLabel = 'Select Period';

        if (tf === 'Week') {
            periodOptions = selectedYearWeeks.map(w => ({ id: w.week, name: `Week ${w.week}` }));
            selectedPeriod = this.currentWeek;
            periodLabel = 'Timeframe';
        } else if (tf === 'Month') {
            const availableMonthIds = Array.from(new Set(selectedYearWeeks.map(w => this.getWeekMonth(w.week))));
            periodOptions = this.months.filter(m => availableMonthIds.includes(m.id));
            selectedPeriod = this.currentMonth;
            periodLabel = 'Month';
        } else if (tf === 'Quarter') {
            const availableQuarterIds = Array.from(new Set(selectedYearWeeks.map(w => this.getWeekQuarter(w.week))));
            periodOptions = this.quarters.filter(q => availableQuarterIds.includes(q.id));
            selectedPeriod = this.currentQuarter;
            periodLabel = 'Quarter';
        }

        const activeToggleClass = "bg-brand-600 text-white shadow-lg shadow-brand-500/20";
        const inactiveToggleClass = "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800";

        const activeChipClass = "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-none rounded-none";
        const inactiveChipClass = "bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-slate-500 rounded-none";

        container.innerHTML = `
            <!-- Year Toggle -->
            <div class="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-white/5">
                ${years.map(y => `
                    <button data-intel-year="${y}" class="px-3 py-2 text-[11px] font-black rounded-none transition-all ${y === this.currentYear ? activeToggleClass : inactiveToggleClass}">
                        ${y}
                    </button>
                `).join('')}
            </div>

            <!-- Timeframe Chips -->
            <div class="flex items-center gap-2 px-4 border-r border-slate-100 dark:border-white/5">
                ${timeframes.map(tfItem => `
                    <button data-intel-timeframe="${tfItem}" class="px-3 py-1.5 text-[9px] font-black rounded-none border transition-all uppercase tracking-widest ${tfItem === tf ? activeChipClass : inactiveChipClass}">
                        ${tfItem}
                    </button>
                `).join('')}
            </div>

            <!-- Period Dropdown -->
            <div class="relative flex-grow min-w-[220px] rounded-none">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest absolute top-2 left-4 pointer-events-none">${periodLabel}</span>
                <select id="period-selector" class="bg-transparent border-none text-[13px] font-black text-slate-900 dark:text-white focus:ring-0 cursor-pointer w-full py-5 pl-4 pr-10 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors uppercase tracking-tight rounded-none">
                    <option value="all" ${!selectedPeriod ? 'selected' : ''}>Latest Highlights</option>
                    ${periodOptions.map(p => `<option value="${p.id}" ${p.id === selectedPeriod ? 'selected' : ''}>${p.name}</option>`).join('')}
                </select>
            </div>
        `;
    },

    async refreshContent() {
        const area = document.getElementById('intel-content-area');
        if (!area) return;

        const tf = this.currentTimeframe;
        let periodId = 'all';
        if (tf === 'Week') periodId = this.currentWeek || 'all';
        else if (tf === '4W' || tf === 'Month') periodId = this.currentMonth || 'all';
        else if (tf === 'Quarter') periodId = this.currentQuarter || 'all';

        const cacheKey = `${this.currentYear}-${tf}-${periodId}-${this.activeTab}`;

        if (this.dataCache.has(cacheKey)) {
            const cachedData = this.dataCache.get(cacheKey);
            this.renderView(area, cachedData);
            return;
        }

        this.renderViewSkeleton(area);

        try {
            let data;
            const isLocation = this.activeTab === 'location';

            if (tf === 'Week') {
                let weekToFetch = this.currentWeek;
                if (!weekToFetch) {
                    const yearWeeks = this.availableWeeks.filter(w => w.year === this.currentYear);
                    weekToFetch = yearWeeks.length > 0 ? yearWeeks[0].week : this.availableWeeks[0].week;
                }
                data = isLocation ? await api.getIntelligenceByWeek(this.currentYear, weekToFetch) : await api.getSKUIntelligenceByWeek(this.currentYear, weekToFetch);
            } else if (tf === 'Month' || tf === '4W') {
                const monthToFetch = this.currentMonth;
                if (!monthToFetch) {
                    const latestWeek = this.availableWeeks.find(w => w.year === this.currentYear) || this.availableWeeks[0];
                    const defaultMonth = this.getWeekMonth(latestWeek.week);
                    data = isLocation ? await api.getIntelligenceByMonth(this.currentYear, defaultMonth) : await api.getSKUIntelligenceByMonth(this.currentYear, defaultMonth);
                } else {
                    data = isLocation ? await api.getIntelligenceByMonth(this.currentYear, monthToFetch) : await api.getSKUIntelligenceByMonth(this.currentYear, monthToFetch);
                }
            } else if (tf === 'Quarter') {
                const quarterToFetch = this.currentQuarter || 1;
                data = isLocation ? await api.getIntelligenceByQuarter(this.currentYear, quarterToFetch) : await api.getSKUIntelligenceByQuarter(this.currentYear, quarterToFetch);
            }

            this.dataCache.set(cacheKey, data);
            this.renderView(area, data);

            // Pre-fetch alternative tab
            const altTab = this.activeTab === 'location' ? 'sku' : 'location';
            const altCacheKey = `${this.currentYear}-${tf}-${periodId}-${altTab}`;
            if (!this.dataCache.has(altCacheKey)) {
                setTimeout(async () => {
                    try {
                        let altData;
                        if (tf === 'Week') {
                            altData = altTab === 'location'
                                ? await api.getIntelligenceByWeek(this.currentYear, data[0].week)
                                : await api.getSKUIntelligenceByWeek(this.currentYear, data[0].week);
                        } else {
                            const month = this.currentMonth || this.getWeekMonth(data[0].week);
                            altData = altTab === 'location'
                                ? await api.getIntelligenceByMonth(this.currentYear, month)
                                : await api.getSKUIntelligenceByMonth(this.currentYear, month);
                        }
                        this.dataCache.set(altCacheKey, altData);
                    } catch (e) { }
                }, 1000);
            }

        } catch (error) {
            console.error('Refresh Content Error:', error);
            area.innerHTML = `
                <div class="p-10 text-center text-red-500 font-bold border-2 border-dashed border-red-100 dark:border-red-900/30 rounded-3xl">
                    Failed to fetch intelligence data.
                </div>
            `;
        }
    },

    renderView(container, data) {
        if (this.activeTab === 'location') {
            this.renderLocationView(container, data);
        } else {
            this.renderSKUView(container, data);
        }
    },

    getDemandCount(item) {
        return item.demandSignalCount ?? item.searchCount ?? 0;
    },

    getMarketSharePercent(item) {
        return item.marketSharePercent ?? ((item.marketShare ?? 0) * 100);
    },

    getGrowthPercent(item) {
        return item.wowGrowthPercent ?? item.wowGrowth;
    },

    renderLocationView(container, data) {
        const signals = this.calculateWeeklySignals(data);
        const isMonthly = this.currentTimeframe !== 'Week';
        const periodLabel = isMonthly ? (this.currentTimeframe === 'Quarter' ? 'Quarterly' : 'Monthly') : 'Weekly';
        const growthLabel = isMonthly ? (this.currentTimeframe === 'Quarter' ? 'QoQ' : 'MoM') : 'WoW';

        container.innerHTML = `
            <div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                ${this.getSignalsHtml(signals)}

                <div class="grid grid-cols-1 gap-6">
                    <div class="bg-white dark:bg-slate-900/50 rounded-[40px] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                        <th class="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Rank</th>
                                        <th class="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-left">Location</th>
                                        <th class="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">${periodLabel} Demand Signals</th>
                                        <th class="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Market Share</th>
                                        <th class="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">${growthLabel} Growth</th>
                                        <th class="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Trend</th>
                                        <th class="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                    ${data.length > 0
                ? data.map((item, index) => this.getRowHtml(item, index)).join('')
                : `<tr><td colspan="7" class="px-8 py-20 text-center text-slate-400 italic">No rankings for this period.</td></tr>`
            }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderSKUView(container, data) {
        const signals = this.calculateSKUSignals(data);
        const isMonthly = this.currentTimeframe !== 'Week';
        const periodLabel = isMonthly ? (this.currentTimeframe === 'Quarter' ? 'Quarterly' : 'Monthly') : 'Weekly';
        const growthLabel = isMonthly ? (this.currentTimeframe === 'Quarter' ? 'QoQ' : 'MoM') : 'WoW';

        container.innerHTML = `
            <div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                ${this.getSKUSignalsHtml(signals)}

                <div class="grid grid-cols-1 gap-6">
                    <div class="bg-white dark:bg-slate-900/50 rounded-[40px] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                        <th class="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Rank</th>
                                        <th class="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-left">SKU / Subject</th>
                                        <th class="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">${periodLabel} Demand Signals</th>
                                        <th class="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Market Share</th>
                                        <th class="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">${growthLabel} Growth</th>
                                        <th class="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Trend</th>
                                        <th class="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Top Driving Locations</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                    ${data.length > 0
                ? data.map((item, index) => this.getSKURowHtml(item, index)).join('')
                : `<tr><td colspan="7" class="px-8 py-20 text-center text-slate-400 italic">No sku rankings for this period.</td></tr>`
            }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    calculateSKUSignals(data) {
        let fastestGrowing = null;
        let largestDrop = null;
        let marketLeader = data[0] || null;

        data.forEach(item => {
            const growthPercent = this.getGrowthPercent(item);
            if (growthPercent !== null && growthPercent !== undefined) {
                if (!fastestGrowing || growthPercent > this.getGrowthPercent(fastestGrowing)) {
                    fastestGrowing = item;
                }
                if (!largestDrop || growthPercent < this.getGrowthPercent(largestDrop)) {
                    largestDrop = item;
                }
            }
        });

        return { fastestGrowing, largestDrop, marketLeader };
    },

    getSKUSignalsHtml(signals) {
        return `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${signals.marketLeader ? `
                    <div class="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/20 rounded-3xl p-5 border border-indigo-200 dark:border-indigo-500/20 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/10 group/card">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center gap-1.5">
                                <span class="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Market Leader SKU</span>
                            </div>
                            <svg class="w-5 h-5 text-indigo-500 transition-transform duration-500 group-hover/card:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate mb-1 uppercase">${signals.marketLeader.sku}</h4>
                        <div class="flex items-baseline gap-2">
                            <p class="text-3xl font-black text-indigo-600 dark:text-indigo-400">${this.getMarketSharePercent(signals.marketLeader).toFixed(1)}%</p>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Share</span>
                        </div>
                    </div>
                ` : ''}

                ${signals.fastestGrowing ? `
                    <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 rounded-3xl p-5 border border-emerald-200 dark:border-emerald-500/20 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-500/10 group/card">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center gap-1.5">
                                <span class="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Fastest Growing SKU</span>
                            </div>
                            <svg class="w-5 h-5 text-emerald-500 transition-transform duration-500 group-hover/card:scale-110 group-hover/card:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                        </div>
                        <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate mb-1 uppercase">${signals.fastestGrowing.sku}</h4>
                        <p class="text-3xl font-black text-emerald-600 dark:text-emerald-400">+${this.getGrowthPercent(signals.fastestGrowing)}%</p>
                    </div>
                ` : ''}

                ${signals.largestDrop && this.getGrowthPercent(signals.largestDrop) < 0 ? `
                    <div class="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/40 dark:to-red-900/20 rounded-3xl p-5 border border-red-200 dark:border-red-500/20 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-red-500/10 group/card">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center gap-1.5">
                                <span class="text-[11px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Largest Drop SKU</span>
                            </div>
                            <svg class="w-5 h-5 text-red-500 transition-transform duration-500 group-hover/card:scale-110 group-hover/card:-rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"></path></svg>
                        </div>
                        <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate mb-1 uppercase">${signals.largestDrop.sku}</h4>
                        <p class="text-3xl font-black text-red-600 dark:text-red-400">${this.getGrowthPercent(signals.largestDrop)}%</p>
                    </div>
                ` : ''}
            </div>
        `;
    },

    getSKURowHtml(item, index) {
        const isTop3 = index < 3;
        const rankColor = isTop3 ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500';

        let rankChangeHtml = '';
        if (item.rankChange !== null && item.rankChange !== undefined) {
            if (item.rankChange > 0) rankChangeHtml = `<span class="text-[10px] font-bold text-emerald-500 ml-1.5">↑ ${item.rankChange}</span>`;
            else if (item.rankChange < 0) rankChangeHtml = `<span class="text-[10px] font-bold text-red-500 ml-1.5">↓ ${Math.abs(item.rankChange)}</span>`;
        }

        let growthHtml = '<span class="text-xs text-slate-400 dark:text-slate-500">—</span>';
        const growthPercent = this.getGrowthPercent(item);
        if (growthPercent !== null && growthPercent !== undefined) {
            const isPositive = growthPercent > 0;
            const isNegative = growthPercent < 0;
            const colorClass = isPositive ? 'text-emerald-600 dark:text-emerald-400' : (isNegative ? 'text-red-600 dark:text-red-400' : 'text-slate-500');
            const arrow = isPositive ? '▲' : (isNegative ? '▼' : '—');
            growthHtml = `<span class="text-sm font-black ${colorClass}">${arrow} ${Math.abs(growthPercent).toFixed(1)}%</span>`;
        }

        const sparklineHtml = this.getSparklineHtml(item.trendSparkline || []);

        return `
            <tr class="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all">
                <td class="px-6 py-4 border-r border-slate-50 dark:border-white/5">
                    <div class="flex items-center">
                        <span class="text-xl font-black ${rankColor}">${index + 1}</span>
                        ${rankChangeHtml}
                    </div>
                </td>
                <td class="px-6 py-4 font-bold text-slate-900 dark:text-slate-100 uppercase text-[10px] tracking-tight">
                    ${item.sku}
                </td>
                <td class="px-6 py-4 text-right font-black text-slate-900 dark:text-white">
                    ${this.getDemandCount(item).toLocaleString()}
                </td>
                <td class="px-6 py-4 text-right text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    ${this.getMarketSharePercent(item).toFixed(2)}%
                </td>
                <td class="px-6 py-4 text-right">
                    ${growthHtml}
                </td>
                <td class="px-6 py-4">
                    <div class="flex justify-center">${sparklineHtml}</div>
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="flex flex-wrap justify-end gap-1">
                        ${(item.topLocations || []).map(inst => `
                            <span class="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase border border-slate-200 dark:border-white/5">
                                ${inst}
                            </span>
                        `).join('')}
                    </div>
                </td>
            </tr>
        `;
    },

    calculateWeeklySignals(data) {
        let fastestGrowing = null;
        let largestDrop = null;
        let marketLeader = data[0] || null;
        let newEntrant = null;

        data.forEach(item => {
            const growthPercent = this.getGrowthPercent(item);
            if (growthPercent !== null && growthPercent !== undefined) {
                if (!fastestGrowing || growthPercent > this.getGrowthPercent(fastestGrowing)) {
                    fastestGrowing = item;
                }
                if (!largestDrop || growthPercent < this.getGrowthPercent(largestDrop)) {
                    largestDrop = item;
                }
            }
            if (item.rankChange === null && this.getDemandCount(item) > 50) {
                newEntrant = item;
            }
        });

        return { fastestGrowing, largestDrop, marketLeader, newEntrant };
    },

    getSignalsHtml(signals) {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                ${signals.fastestGrowing ? `
                    <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 rounded-3xl p-5 border border-emerald-200 dark:border-emerald-500/20 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-500/10 group/card">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center gap-1.5">
                                <span class="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Fastest Growing</span>
                            </div>
                            <svg class="w-5 h-5 text-emerald-500 transition-transform duration-500 group-hover/card:scale-110 group-hover/card:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                        </div>
                        <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate mb-1 uppercase tracking-tight">${signals.fastestGrowing.location}</h4>
                        <p class="text-3xl font-black text-emerald-600 dark:text-emerald-400">+${this.getGrowthPercent(signals.fastestGrowing)}%</p>
                    </div>
                ` : ''}
                
                ${signals.largestDrop && this.getGrowthPercent(signals.largestDrop) < 0 ? `
                    <div class="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/40 dark:to-red-900/20 rounded-3xl p-5 border border-red-200 dark:border-red-500/20 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-red-500/10 group/card">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center gap-1.5">
                                <span class="text-[11px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Largest Drop</span>
                            </div>
                            <svg class="w-5 h-5 text-red-500 transition-transform duration-500 group-hover/card:scale-110 group-hover/card:-rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"></path></svg>
                        </div>
                        <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate mb-1 uppercase tracking-tight">${signals.largestDrop.location}</h4>
                        <p class="text-3xl font-black text-red-600 dark:text-red-400">${this.getGrowthPercent(signals.largestDrop)}%</p>
                    </div>
                ` : ''}
                
                ${signals.marketLeader ? `
                    <div class="bg-gradient-to-br from-brand-50 to-indigo-100/50 dark:from-brand-950/40 dark:to-indigo-900/20 rounded-3xl p-5 border border-brand-200 dark:border-indigo-500/20 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-500/10 group/card">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center gap-1.5">
                                <span class="text-[11px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">Market Leader</span>
                            </div>
                            <svg class="w-5 h-5 text-brand-500 transition-transform duration-500 group-hover/card:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate mb-1 uppercase tracking-tight">${signals.marketLeader.location}</h4>
                        <p class="text-3xl font-black text-brand-600 dark:text-brand-400">${this.getMarketSharePercent(signals.marketLeader).toFixed(1)}%</p>
                    </div>
                ` : ''}
                
                ${signals.newEntrant ? `
                    <div class="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20 rounded-3xl p-5 border border-amber-200 dark:border-amber-500/20 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/10 group/card">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center gap-1.5">
                                <span class="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">New Entrant</span>
                            </div>
                            <svg class="w-5 h-5 text-amber-500 transition-transform duration-500 group-hover/card:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"></path></svg>
                        </div>
                        <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate mb-1 uppercase tracking-tight">${signals.newEntrant.location}</h4>
                        <p class="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">First Appearance</p>
                    </div>
                ` : ''}
            </div>
        `;
    },

    getRowHtml(item, index) {
        const isTop3 = index < 3;
        const rankColor = isTop3 ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500';

        let rankChangeHtml = '';
        if (item.rankChange !== null && item.rankChange !== undefined) {
            if (item.rankChange > 0) rankChangeHtml = `<span class="text-[10px] font-bold text-emerald-500 ml-1.5">↑ ${item.rankChange}</span>`;
            else if (item.rankChange < 0) rankChangeHtml = `<span class="text-[10px] font-bold text-red-500 ml-1.5">↓ ${Math.abs(item.rankChange)}</span>`;
        }

        let growthHtml = '<span class="text-xs text-slate-400 dark:text-slate-500">—</span>';
        const growthPercent = this.getGrowthPercent(item);
        if (growthPercent !== null && growthPercent !== undefined) {
            const isPositive = growthPercent > 0;
            const isNegative = growthPercent < 0;
            const colorClass = isPositive ? 'text-emerald-600 dark:text-emerald-400' : (isNegative ? 'text-red-600 dark:text-red-400' : 'text-slate-500');
            const arrow = isPositive ? '▲' : (isNegative ? '▼' : '—');
            growthHtml = `<span class="text-sm font-black ${colorClass}">${arrow} ${Math.abs(growthPercent).toFixed(1)}%</span>`;
        }

        const sparklineHtml = this.getSparklineHtml(item.trendSparkline || []);

        return `
            <tr class="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all">
                <td class="px-6 py-4 border-r border-slate-50 dark:border-white/5">
                    <div class="flex items-center">
                        <span class="text-xl font-black ${rankColor}">${index + 1}</span>
                        ${rankChangeHtml}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <h4 class="font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors uppercase text-[11px] tracking-tight">${item.location}</h4>
                    ${item.topSKUs && item.topSKUs.length > 0
                ? `<div class="flex flex-wrap gap-1 mt-1">${item.topSKUs.map(c => `<span class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 text-[8px] font-bold uppercase">${c}</span>`).join('')}</div>`
                : ''}
                </td>
                <td class="px-6 py-4 text-right font-black text-slate-900 dark:text-white">
                    ${this.getDemandCount(item).toLocaleString()}
                </td>
                <td class="px-6 py-4 text-right text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    ${this.getMarketSharePercent(item).toFixed(2)}%
                </td>
                <td class="px-6 py-4 text-right">
                    ${growthHtml}
                </td>
                <td class="px-6 py-4">
                    <div class="flex justify-center">${sparklineHtml}</div>
                </td>
                <td class="px-6 py-4 text-right">
                    ${(item.isPriorityFulfillment || item.isFulfillment)
                ? `<span class="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] font-black border border-indigo-100 dark:border-indigo-800/50">PRIORITY</span>`
                : (item.location || item.isLocation
                    ? `<span class="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black border border-emerald-100 dark:border-emerald-800/50">LOCATION</span>`
                    : `<span class="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[9px] font-black border border-amber-100 dark:border-amber-800/50">PROSPECT</span>`)
            }
                </td>
            </tr>
        `;
    },

    getSparklineHtml(data) {
        if (!data || data.length === 0 || data.every(v => v === 0)) {
            return '<span class="text-xs text-slate-300 dark:text-slate-600">—</span>';
        }

        const width = 60;
        const height = 20;
        const max = Math.max(...data, 1);
        const min = Math.min(...data);
        const range = max - min || 1;

        const points = data.map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        const color = data[data.length - 1] > data[0] ? '#10b981' : '#ef4444';

        return `
            <svg width="${width}" height="${height}" class="overflow-visible">
                <polyline fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${points}" />
            </svg>
        `;
    },

    renderViewSkeleton(container) {
        container.innerHTML = `
            <div class="space-y-8 animate-pulse">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    ${Array(4).fill(0).map(() => `
                        <div class="h-28 bg-slate-50 dark:bg-slate-900 rounded-[32px] skeleton border border-slate-100 dark:border-white/5"></div>
                    `).join('')}
                </div>
                <div class="bg-white dark:bg-slate-900/50 rounded-[40px] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                    <div class="h-[300px] w-full skeleton"></div>
                </div>
            </div>
        `;
    }
};
