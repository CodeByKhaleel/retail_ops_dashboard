/**
 * Main application entry point.
 * Orchestrates state, initialization, and event handling.
 */

import { api } from './api.js';
import { ui } from './ui.js';
import { charts } from './charts.js';
import { fulfillment } from './fulfillment.js';
import { intelligence } from './intelligence.js';
import { getCachedUser } from './auth.js';

window.charts = charts;

const state = {
    page: 1,
    pageSize: 15,
    sortBy: 'performanceScore',
    sortOrder: 'desc',
    filters: {
        country: [],
        status: [],
        listingStatus: [],
        dataSource: [],
        storeFormats: [],
        tags: [],
        fulfillmentPartners: [],
        priorityFulfillment: false,
        region: [],
    },
    allMetaItems: [],
    totalPages: 1,
    hasNext: false,
    showAllCountries: false,
    isSidebarMinimized: false,
    currentLocations: [], // Store current page locations
    isAllSelectedMatching: false,
    totalItems: 0,
    globalTotal: null
};

// --- Initialization ---

async function init() {
    console.log('[MAIN] Initializing dashboard...');

    // Check auth using the cached user from auth module
    const user = getCachedUser();
    const token = user.token;

    console.log('[MAIN] Token exists:', !!token);
    console.log('[MAIN] User email:', user.email);

    // Check if we're in production mode (not localhost)
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

    // In production, require valid demo auth token (not mock token)
    if (isProduction && token === 'mock_token_for_dev') {
        console.log('[MAIN] Mock token not allowed in production, redirecting to login');
        localStorage.clear();
        window.location.href = '/login.html';
        return;
    }

    // Allow dev mode (mock_token_for_dev) to proceed without redirect only in development
    if (!token || (!user.email && token !== 'mock_token_for_dev')) {
        console.log('[MAIN] Not authenticated, redirecting to login');
        window.location.href = '/login.html';
        return;
    }

    // If using mock token, ensure user data is set
    if (token === 'mock_token_for_dev' && !user.email) {
        user.email = 'dev@retailops.com';
        user.name = 'Dev User';
    }

    try {
        console.log('[MAIN] Authenticated as:', user.email);

        document.getElementById('user-name').textContent = user.name || user.email;
        document.getElementById('user-email').textContent = user.email;

        // Update initials
        const initials = user.name
            ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
            : 'EP';
        const initialEl = document.getElementById('user-initials');
        if (initialEl) initialEl.textContent = initials;

        console.log('[MAIN] Loading dashboard data...');
        await loadFilters();
        setupTheme();
        await loadStaticStatusCards(); // Load static status cards first
        await refresh();
        bindEvents();
        bindViewSwitcher();
        fulfillment.init();
        intelligence.init();
        console.log('[MAIN] Dashboard loaded successfully');
    } catch (error) {
        console.error('[MAIN] Error initializing dashboard:', error);
        localStorage.clear();
        window.location.href = '/login.html';
    }
}

function setupTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    const updateUI = (theme) => {
        if (theme === 'dark') {
            sunIcon?.classList.remove('hidden');
            moonIcon?.classList.add('hidden');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            sunIcon?.classList.add('hidden');
            moonIcon?.classList.remove('hidden');
            document.documentElement.setAttribute('data-theme', 'light');
        }
    };

    // Initial State
    const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    updateUI(currentTheme);

    toggleBtn?.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        updateUI(newTheme);

        // Refresh charts to update colors
        refresh(false);
    });
}

// --- Status Cards ---

function updateStatusCards(statusData) {
    const container = document.getElementById('status-distribution-cards');
    if (!container) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Define status colors for visual differentiation (light and dark mode)
    // Define status colors for vibrant, premium cards
    const statusColors = {
        'Active': {
            bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
            text: 'text-white',
            border: 'border-emerald-400/20',
            icon: 'text-white/20'
        },
        'Inactive': {
            bg: 'bg-gradient-to-br from-slate-600 to-slate-700',
            text: 'text-white',
            border: 'border-slate-500/20',
            icon: 'text-white/20'
        },
        'Provisional': {
            bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
            text: 'text-white',
            border: 'border-amber-400/20',
            icon: 'text-white/20'
        },
        'Discontinued': {
            bg: 'bg-gradient-to-br from-rose-500 to-red-600',
            text: 'text-white',
            border: 'border-red-400/20',
            icon: 'text-white/20'
        }
    };

    // Default color for unknown statuses
    const defaultColor = {
        bg: 'bg-gradient-to-br from-indigo-500 to-brand-600',
        text: 'text-white',
        border: 'border-brand-400/20',
        icon: 'text-white/20'
    };

    // Clear existing cards
    container.innerHTML = '';

    // Create a card for each status
    if (statusData.labels && statusData.labels.length > 0) {
        statusData.labels.forEach((label, index) => {
            const count = statusData.values[index] || 0;
            const colors = statusColors[label] || defaultColor;

            const card = document.createElement('div');
            card.className = `${colors.bg} rounded-3xl border ${colors.border} p-4 flex flex-col justify-between shadow-lg premium-shadow h-28 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`;

            card.innerHTML = `
                <div class="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                    <svg class="w-12 h-12 ${colors.icon}" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <p class="text-[9px] font-bold ${colors.text} uppercase tracking-widest z-10 opacity-80">${label}</p>
                <h3 class="text-3xl font-bold ${colors.text} leading-none z-10 font-display">${count}</h3>
                <div class="w-6 h-1 bg-white/30 rounded-full z-10"></div>
            `;

            container.appendChild(card);
        });
    } else {
        // Show placeholder when no data
        container.innerHTML = '<p class="text-slate-400 text-sm col-span-4 text-center py-8">No status data available</p>';
    }
}

// --- Load Static Status Cards (Global, No Filters) ---

async function loadStaticStatusCards() {
    try {
        // Fetch global status distribution without any filters
        const globalCharts = await api.get('/retail/locations/charts?page=1&pageSize=1000');
        if (globalCharts && globalCharts.statusDistribution) {
            updateStatusCards(globalCharts.statusDistribution);
        }
    } catch (error) {
        console.error('[MAIN] Error loading static status cards:', error);
        // Show empty state if loading fails
        updateStatusCards({ labels: [], values: [] });
    }
}

// --- Data Operations ---

async function refresh(skipCharts = false) {
    ui.showError('error-banner', '');
    try {
        const query = api.buildQuery({
            ...state.filters,
            page: state.page,
            pageSize: state.pageSize,
            sortBy: state.sortBy,
            sortOrder: state.sortOrder
        });

        if (skipCharts) {
            const locations = await api.get(`/retail/locations${query}`);

            if (!locations || !locations.items) {
                throw new Error('Failed to load locations data');
            }

            state.currentLocations = locations.items;
            state.totalItems = locations.totalItems;
            ui.renderTable('locations-table', locations.items);

            // Initialize or update global total if no filters are active
            // Update Global Total
            if (locations.globalTotal !== undefined) {
                const totalEl = document.getElementById('total-store-locations-count');
                if (totalEl) totalEl.textContent = locations.globalTotal;
            }

            // Update Stats UI
            const isFiltered = Object.values(state.filters).some(v => v !== '' && v !== false && (!Array.isArray(v) || v.length > 0));
            const filteredCard = document.getElementById('filtered-stats-card');
            const filteredCount = document.getElementById('filtered-locations-count');

            if (isFiltered) {
                filteredCard.classList.remove('hidden');
                filteredCount.textContent = locations.totalItems;
                const headerCount = document.getElementById('header-location-count');
                if (headerCount) {
                    headerCount.classList.remove('hidden');
                    headerCount.textContent = `${locations.totalItems} Store Location${locations.totalItems === 1 ? '' : 's'}`;
                }
            } else {
                filteredCard.classList.add('hidden');
                const headerCount = document.getElementById('header-location-count');
                if (headerCount) headerCount.classList.add('hidden');
            }

            state.totalPages = locations.totalPages;
            state.hasNext = locations.hasNext;
            updatePaginationUI();

            resetSelection();
            bindTableCheckboxes();
            return;
        }

        const [locations, chartsData] = await Promise.all([
            api.get(`/retail/locations${query}`),
            api.get(`/retail/locations/charts${query}`)
        ]);

        if (!locations || !locations.items) {
            throw new Error('Failed to load locations data');
        }

        state.currentLocations = locations.items;
        state.totalItems = locations.totalItems;
        ui.renderTable('locations-table', locations.items);

        // Initialize or update global total if no filters are active
        // Update Global Total
        if (locations.globalTotal !== undefined) {
            const totalEl = document.getElementById('total-store-locations-count');
            if (totalEl) totalEl.textContent = locations.globalTotal;
        }

        // Update Stats UI
        const isFiltered = Object.values(state.filters).some(v => v !== '' && v !== false && (!Array.isArray(v) || v.length > 0));
        const filteredCard = document.getElementById('filtered-stats-card');
        const filteredCount = document.getElementById('filtered-locations-count');

        if (isFiltered) {
            filteredCard.classList.remove('hidden');
            filteredCount.textContent = locations.totalItems;
            const headerCount = document.getElementById('header-location-count');
            if (headerCount) {
                headerCount.classList.remove('hidden');
                headerCount.textContent = `${locations.totalItems} Store Location${locations.totalItems === 1 ? '' : 's'}`;
            }
        } else {
            filteredCard.classList.add('hidden');
            const headerCount = document.getElementById('header-location-count');
            if (headerCount) headerCount.classList.add('hidden');
        }

        resetSelection();
        bindTableCheckboxes();

        state.totalPages = locations.totalPages;
        state.hasNext = locations.hasNext;
        updatePaginationUI();


        if (state.totalItems === 0) {
            const emptyData = {
                locationsByCountry: { labels: [], values: [] },
                statusDistribution: { labels: [], values: [] },
                listingStatusDistribution: { labels: [], values: [] },
                storeFormatDistribution: { labels: [], values: [] },
                performanceScoreByRegion: { labels: [], values: [] },
                topPerformingLocations: { labels: [], values: [] }
            };
            charts.updateAll(emptyData, handleChartFilter, state.showAllCountries);
            // Don't update status cards here - they remain static
        } else {
            charts.updateAll(chartsData, handleChartFilter, state.showAllCountries);
            // Don't update status cards here - they remain static
        }

    } catch (error) {
        ui.showError('error-banner', error.message);
    }
}

function handleChartFilter(key, label) {
    console.log(`Chart filter clicked: ${key} = ${label}`);

    const keyMap = {
        'country': 'country',
        'status': 'status',
        'publish': 'listingStatus',
        'store-format': 'storeFormats',
        'scoreRegion': 'region'
    };

    const filterKey = keyMap[key];
    if (!filterKey) return;

    let targetLabel = label;
    if (filterKey === 'storeFormats' && label === 'N/A') targetLabel = 'n/a';

    if (filterKey === 'storeFormats' || filterKey === 'country' || filterKey === 'status' || filterKey === 'listingStatus' || filterKey === 'region' || filterKey === 'tags' || filterKey === 'dataSource') {
        const isSelected = state.filters[filterKey].includes(targetLabel);
        if (isSelected) {
            state.filters[filterKey] = state.filters[filterKey].filter(v => v !== targetLabel);
        } else {
            state.filters[filterKey].push(targetLabel);
        }

        // Special case for region -> country correlation
        if (filterKey === 'region') {
            updateCountryFilterOptions();
        } else if (filterKey === 'country') {
            ui.updatePillState('filter-country-container', state.filters.country);
        } else {
            const containerId = `filter-${filterKey}-container`;
            ui.updatePillState(containerId, state.filters[filterKey]);
        }
    } else {
        const isSelected = state.filters[filterKey] === targetLabel;
        state.filters[filterKey] = isSelected ? '' : targetLabel;
        const selectId = `filter-${filterKey}`;
        const select = document.getElementById(selectId);
        if (select) select.value = state.filters[filterKey];
    }

    state.page = 1;
    // Pass true to only update the table, not the charts
    refresh(true);
}

function handlePillSelect(value, btn, key, isMulti = false) {
    if (isMulti) {
        if (!Array.isArray(state.filters[key])) {
            state.filters[key] = state.filters[key] ? [state.filters[key]] : [];
        }

        // Special handling for "All" pill in Data Source
        if (key === 'dataSource' && value === 'All') {
            // "All" is now a separate entity, but we allow selecting it.
            // If selecting "All", we might want it to be exclusive or just a normal tag.
            // Based on user request "it's a separate entity", let's treat it as a normal value.
            const idx = state.filters[key].indexOf('All');
            if (idx > -1) {
                state.filters[key].splice(idx, 1);
            } else {
                state.filters[key].push('All');
            }
        } else {
            const idx = state.filters[key].indexOf(value);
            if (idx > -1) {
                state.filters[key].splice(idx, 1);
            } else {
                state.filters[key].push(value);
            }
        }
    } else {
        if (state.filters[key] === value) {
            state.filters[key] = '';
        } else {
            state.filters[key] = value;
        }
    }

    const containerId = `filter-${key}-container`;
    ui.updatePillState(containerId, state.filters[key]);

    state.page = 1;
    refresh();
}

async function loadFilters() {
    try {
        const meta = await api.get('/retail/locations?page=1&pageSize=3000');

        if (!meta || !meta.items) {
            console.warn('Failed to load filter metadata, using empty filters');
            return;
        }

        const items = meta.items || [];
        state.allMetaItems = items; // Cache for correlation

        const collect = (fn, source = items) => {
            const values = source.flatMap(i => {
                const val = fn(i);
                if (val === undefined || val === null) return [];
                return val;
            });
            const unique = [...new Set(values)].filter(v => v !== '').sort();
            return unique;
        };

        // 1. Populate Region Pills
        const regionOpts = collect(i => i.region);
        ui.populatePills('filter-region-container', regionOpts, state.filters.region, (val) => {
            handlePillSelect(val, null, 'region', true);
            updateCountryFilterOptions(); // Correlation logic
        });

        // 2. Initial Country Filter Population
        updateCountryFilterOptions(false);

        // 3. Data Source (Multi)
        let dataSourceOpts = collect(i => i.dataSource);
        if (!dataSourceOpts.includes('All')) dataSourceOpts.unshift('All');
        ui.populatePills('filter-dataSource-container', dataSourceOpts, state.filters.dataSource, (val) => handlePillSelect(val, null, 'dataSource', true));

        // 4. Store Location Status (Multi)
        const statusOpts = collect(i => i.status);
        ui.populatePills('filter-status-container', statusOpts, state.filters.status, (val) => handlePillSelect(val, null, 'status', true));

        // 5. Listing Status (Multi)
        const publishOpts = collect(i => i.listingStatus);
        ui.populatePills('filter-listingStatus-container', publishOpts, state.filters.listingStatus, (val) => handlePillSelect(val, null, 'listingStatus', true));

        // 6. Tags (Multi)
        const tagsOpts = collect(i => i.tags);
        ui.populatePills('filter-tags-container', tagsOpts, state.filters.tags, (val) => handlePillSelect(val, null, 'tags', true));

        // 7. Fulfillment Partners (Multi)
        const locationOpts = collect(i => i.fulfillmentPartners);
        ui.populatePills('filter-fulfillmentPartners-container', locationOpts, state.filters.fulfillmentPartners, (val) => handlePillSelect(val, null, 'fulfillmentPartners', true));

        // 8. Store Formats (Fixed Multi)
        const storeFormats = collect(i => i.storeFormats);
        ui.populatePills('filter-storeFormats-container', storeFormats, state.filters.storeFormats, (val) => handlePillSelect(val, null, 'storeFormats', true));

    } catch (error) {
        console.error('Filter loading failed:', error);
        ui.showError('error-banner', 'Failed to load filter metadata.');
    }
}

/**
 * Handle correlation between Region and Country filters.
 */
function updateCountryFilterOptions(triggerRefresh = true) {
    const items = state.allMetaItems || [];
    const selectedRegions = state.filters.region;

    let filteredItems = items;
    if (selectedRegions.length > 0) {
        filteredItems = items.filter(i => selectedRegions.includes(i.region));
    }

    const collect = (fn, source = filteredItems) => {
        const values = source.flatMap(i => {
            const val = fn(i);
            if (val === undefined || val === null) return [];
            return val;
        });
        const unique = [...new Set(values)].filter(v => v !== '').sort();
        return unique;
    };

    const countryOpts = collect(i => i.country);

    // If existing selected countries are no longer available in the new region list, remove them
    state.filters.country = state.filters.country.filter(c => countryOpts.includes(c));

    ui.populatePills('filter-country-container', countryOpts, state.filters.country, (val) => {
        handlePillSelect(val, null, 'country', true);
    });

    if (triggerRefresh) {
        refresh();
    }
}

// --- Event Handlers ---

function bindEvents() {
    // Auto-apply filters on change
    const filterInputs = [
        'filter-country', 'filter-region',
        'filter-priorityFulfillment',
        'filter-status', 'filter-listingStatus'
    ];

    filterInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => {
                syncFiltersFromUI();
                state.page = 1;
                refresh();
            });
        }
    });

    // Accordion Logic (Shared)
    const setupAccordion = (id, containerId) => {
        document.getElementById(`accordion-toggle-${id}`)?.addEventListener('click', () => {
            const content = document.getElementById(`accordion-content-${id}`);
            const icon = document.getElementById(`accordion-icon-${id}`);
            content.classList.toggle('hidden');
            icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        });
    };

    setupAccordion('store-format', 'filter-fulfillmentPartners-container');
    setupAccordion('country', 'filter-country-container');

    // Filter Tabs Logic
    const filterTabs = document.querySelectorAll('.filter-tab-btn');
    const filterContents = document.querySelectorAll('.filter-tab-content');

    filterTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Update Header Styles
            filterTabs.forEach(b => {
                const isActive = b.dataset.tab === targetTab;
                if (isActive) {
                    b.classList.remove('text-slate-400', 'border-transparent');
                    b.classList.add('text-brand-600', 'border-brand-600');
                } else {
                    b.classList.add('text-slate-400', 'border-transparent');
                    b.classList.remove('text-brand-600', 'border-brand-600');
                }
            });

            // Toggle Contents
            filterContents.forEach(content => {
                if (content.id === `tab-${targetTab}`) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });
        });
    });

    // Generic Demand Signal Logic
    const bindSearch = (inputId, containerId) => {
        document.getElementById(inputId)?.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const container = document.getElementById(containerId);
            const buttons = container.querySelectorAll('button');
            buttons.forEach(btn => {
                const txt = btn.textContent.toLowerCase();
                const shouldShow = txt.includes(term);
                btn.style.display = shouldShow ? 'block' : 'none';
            });
        });
    };

    bindSearch('fulfillment-search', 'filter-fulfillmentPartners-container');
    bindSearch('country-search', 'filter-country-container');

    // Chart Maximization Events
    bindChartEvents();


    document.getElementById('clear-filters').addEventListener('click', () => {
        clearFiltersUI();
        syncFiltersFromUI();
        state.page = 1;
        refresh();
    });

    // Pagination
    // Pagination
    document.getElementById('header-prev').addEventListener('click', () => {
        if (state.page > 1) {
            state.page--;
            refresh();
        }
    });

    document.getElementById('header-next').addEventListener('click', () => {
        if (state.hasNext) {
            state.page++;
            refresh();
        }
    });

    // Sort
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (state.sortBy === field) {
                state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                state.sortBy = field;
                state.sortOrder = 'asc';
            }
            state.page = 1;
            refresh();
        });
    });

    // Toggle All/Major Countries
    document.getElementById('toggle-countries')?.addEventListener('click', () => {
        state.showAllCountries = !state.showAllCountries;
        document.getElementById('country-toggle-text').textContent =
            state.showAllCountries ? 'Show Major Countries' : 'Show All Countries';
        refresh();
    });

    // Reset All Filters
    document.getElementById('reset-all-filters')?.addEventListener('click', () => {
        clearFiltersUI();
        syncFiltersFromUI();
        state.page = 1;
        // Full refresh including charts to reset all visualizations
        refresh(false);
    });

    // Sidebar Minimize Logic
    const toggleSidebar = () => {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        const statsContainer = document.getElementById('stats-container');
        const floatingBtn = document.getElementById('sidebar-toggle');

        state.isSidebarMinimized = !state.isSidebarMinimized;

        if (state.isSidebarMinimized) {
            sidebar.classList.add('lg:hidden');
            mainContent.classList.replace('lg:col-span-3', 'lg:col-span-4');
            floatingBtn.classList.remove('lg:hidden');
        } else {
            sidebar.classList.remove('lg:hidden');
            mainContent.classList.replace('lg:col-span-4', 'lg:col-span-3');
            floatingBtn.classList.add('lg:hidden');
        }

        window.dispatchEvent(new Event('resize'));
    };

    document.getElementById('minimize-sidebar').addEventListener('click', toggleSidebar);
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);

    // Select All Checkbox (Current Page)
    // Select All Button Logic
    document.getElementById('select-all-trigger')?.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.location-checkbox');
        // Determine state: if all checked, uncheck all. Otherwise check all.
        const allChecked = Array.from(checkboxes).every(cb => cb.checked && checkboxes.length > 0);
        const newState = !allChecked;

        checkboxes.forEach(cb => cb.checked = newState);

        // Toggle Banner Logic
        const banner = document.getElementById('selection-banner');
        if (newState && state.totalItems > state.currentLocations.length) {
            banner.classList.remove('hidden');
            document.getElementById('selection-msg').textContent = `All ${state.currentLocations.length} results on this page are selected.`;
            document.getElementById('total-matched-text').textContent = state.totalItems;
            document.getElementById('select-all-matching-btn').classList.remove('hidden');
            document.getElementById('clear-selection-btn').classList.add('hidden');
        } else {
            banner.classList.add('hidden');
            state.isAllSelectedMatching = false;
        }

        updateBulkActionsUI();
    });

    document.getElementById('select-all-matching-btn')?.addEventListener('click', () => {
        state.isAllSelectedMatching = true;
        document.getElementById('selection-msg').textContent = `All ${state.totalItems} locations matching filters are selected.`;
        document.getElementById('select-all-matching-btn').classList.add('hidden');
        document.getElementById('clear-selection-btn').classList.remove('hidden');
        updateBulkActionsUI();
    });

    document.getElementById('clear-selection-btn')?.addEventListener('click', () => {
        resetSelection();
        updateBulkActionsUI();
    });

    // Modal Close
    document.getElementById('modal-overlay')?.addEventListener('click', () => charts.closeMaximize());
    document.getElementById('close-modal-btn')?.addEventListener('click', () => charts.closeMaximize());
}

function bindViewSwitcher() {
    const btnPriority = document.getElementById('view-priority');
    const btnFulfillment = document.getElementById('view-fulfillment');
    const btnIntelligence = document.getElementById('view-intelligence');
    const viewPriority = document.getElementById('priority-view');
    const viewFulfillment = document.getElementById('fulfillment-view');
    const viewIntelligence = document.getElementById('intelligence-view');
    const sidebar = document.getElementById('sidebar');
    const homeBrand = document.getElementById('home-brand');

    if (!btnPriority || !btnFulfillment || !btnIntelligence) return;

    const switchToPriority = (pushState = true) => {
        // Update Buttons
        btnPriority.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-white dark:bg-slate-900 shadow-sm text-brand-600 whitespace-nowrap";
        btnFulfillment.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 whitespace-nowrap";
        btnIntelligence.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 whitespace-nowrap";

        // Update Views
        viewPriority.classList.remove('hidden');
        viewFulfillment.classList.add('hidden');
        viewIntelligence.classList.add('hidden');

        // Update Navbar Title & Badge
        const navTitle = document.getElementById('nav-dashboard-title');
        const navBadge = document.getElementById('nav-dashboard-badge');
        if (navTitle) navTitle.textContent = 'Store Location Dashboard';
        if (navBadge) {
            navBadge.textContent = 'Priority';
            navBadge.className = 'hidden sm:inline-block ml-3 text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg uppercase tracking-widest border border-indigo-100';
        }

        // Show Sidebar
        sidebar.classList.remove('hidden');
        refresh(true); // Refresh main table

        if (pushState) {
            history.pushState({ page: 'priority' }, '', '/priority');
        }
    };

    const switchToFulfillment = (pushState = true) => {
        // Update Buttons
        btnFulfillment.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-white dark:bg-slate-900 shadow-sm text-brand-600 whitespace-nowrap";
        btnPriority.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 whitespace-nowrap";
        btnIntelligence.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 whitespace-nowrap";

        // Update Views
        viewPriority.classList.add('hidden');
        viewFulfillment.classList.remove('hidden');
        viewIntelligence.classList.add('hidden');

        // Update Navbar Title & Badge
        const navTitle = document.getElementById('nav-dashboard-title');
        const navBadge = document.getElementById('nav-dashboard-badge');
        if (navTitle) navTitle.textContent = 'Fulfillment Dashboard';
        if (navBadge) {
            navBadge.textContent = 'Fulfillment';
            navBadge.className = 'hidden sm:inline-block ml-3 text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-lg uppercase tracking-widest border border-purple-100';
        }

        // Hide Sidebar
        sidebar.classList.add('hidden');

        // Reset sub-views
        document.getElementById('fulfillment-summary-view').classList.remove('hidden');
        document.getElementById('fulfillment-detail-view').classList.add('hidden');

        // Load Data
        fulfillment.renderSummary('fulfillment-locations-container');

        if (pushState) {
            history.pushState({ page: 'fulfillment' }, '', '/fulfillment');
        }
    };

    const switchToIntelligence = (pushState = true) => {
        // Update Buttons
        btnIntelligence.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-white dark:bg-slate-900 shadow-sm text-brand-600 whitespace-nowrap";
        btnPriority.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 whitespace-nowrap";
        btnFulfillment.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 whitespace-nowrap";

        // Update Views
        viewPriority.classList.add('hidden');
        viewFulfillment.classList.add('hidden');
        viewIntelligence.classList.remove('hidden');

        // Update Navbar Title & Badge
        const navTitle = document.getElementById('nav-dashboard-title');
        const navBadge = document.getElementById('nav-dashboard-badge');
        if (navTitle) navTitle.textContent = 'Store Location Intelligence';
        if (navBadge) {
            navBadge.textContent = 'Insights';
            navBadge.className = 'hidden sm:inline-block ml-3 text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg uppercase tracking-widest border border-emerald-100';
        }

        // Hide Sidebar
        sidebar.classList.add('hidden');

        // Load Data
        intelligence.renderDashboard('intelligence-dashboard-container');

        if (pushState) {
            history.pushState({ page: 'intelligence' }, '', '/intelligence');
        }
    };

    btnPriority.addEventListener('click', () => switchToPriority(true));
    btnFulfillment.addEventListener('click', () => switchToFulfillment(true));
    btnIntelligence.addEventListener('click', () => switchToIntelligence(true));
    homeBrand?.addEventListener('click', () => {
        switchToPriority(false);
        history.pushState({ page: 'priority' }, '', '/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- Router Logic ---

    const handleRoute = () => {
        const path = window.location.pathname;

        if (path.startsWith('/fulfillment')) {
            switchToFulfillment(false);
            if (path.includes('/location/')) {
                const parts = path.split('/location/');
                const locationId = parts[1];
                if (locationId) {
                    fulfillment.showDrillDown(locationId, false);
                }
            }
        } else if (path.startsWith('/intelligence')) {
            switchToIntelligence(false);
        } else {
            switchToPriority(false);
            if (path !== '/priority' && path !== '/') {
                history.replaceState({ page: 'priority' }, '', '/priority');
            }
        }
    };

    // Handle initial load
    handleRoute();

    // Handle Back/Forward buttons
    window.addEventListener('popstate', handleRoute);
}

function bindChartEvents() {
    document.querySelectorAll('.chart-maximize-btn').forEach(btn => {
        // Remove existing listener to avoid duplication
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            const chartId = newBtn.getAttribute('data-maximize');
            const title = newBtn.getAttribute('data-title');
            charts.maximize(chartId, title);
        });
    });
}

function syncFiltersFromUI() {
    const introEl = document.getElementById('filter-priorityFulfillment');
    if (introEl) state.filters.priorityFulfillment = introEl.checked;
}

function bindTableCheckboxes() {
    const tableCheckboxes = document.querySelectorAll('.location-checkbox');
    tableCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            if (!cb.checked) {
                // If any individual checkbox is unchecked, turn off All Selected Matching mode
                state.isAllSelectedMatching = false;
                document.getElementById('selection-banner').classList.add('hidden');
            }
            updateBulkActionsUI();
        });
    });
}

function updateBulkActionsUI() {
    const selectedCount = state.isAllSelectedMatching
        ? state.totalItems
        : document.querySelectorAll('.location-checkbox:checked').length;

    ui.toggleBulkActions(selectedCount);
    bindBulkActions();
}

function resetSelection() {
    state.isAllSelectedMatching = false;
    document.getElementById('selection-banner')?.classList.add('hidden');
    const selectAll = document.getElementById('select-all-locations');
    if (selectAll) selectAll.checked = false;
    document.querySelectorAll('.location-checkbox').forEach(cb => cb.checked = false);
}

const handleExport = async (format, btnId) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    let data = [];
    const originalText = btn.innerHTML;
    btn.innerHTML = `<svg class="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
    btn.disabled = true;

    try {
        const selectedCheckboxes = document.querySelectorAll('.location-checkbox:checked');

        if (state.isAllSelectedMatching) {
            // Export ALL matching filter criteria
            const query = api.buildQuery({ ...state.filters, page: 1, pageSize: 100000, sortBy: state.sortBy, sortOrder: state.sortOrder });
            const res = await api.get(`/retail/locations${query}`);
            data = res.items;
        } else if (selectedCheckboxes.length > 0) {
            // Export ONLY selected rows
            const allCheckboxes = Array.from(document.querySelectorAll('.location-checkbox'));
            const selectedIndices = Array.from(selectedCheckboxes).map(cb => allCheckboxes.indexOf(cb));
            data = selectedIndices.map(index => state.currentLocations[index]);
        } else {
            // NO rows selected, but clicked Export in header -> Export current page (standard behavior)
            // Or better: Export ALL filtered results if from header
            const query = api.buildQuery({ ...state.filters, page: 1, pageSize: 100000, sortBy: state.sortBy, sortOrder: state.sortOrder });
            const res = await api.get(`/retail/locations${query}`);
            data = res.items;
        }
        ui.exportData(data, format);
    } catch (err) {
        console.error('Export failed:', err);
        ui.showError('error-banner', 'Failed to generate export file.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

function bindBulkActions() {
    const exportCsvBtn = document.getElementById('bulk-export-csv');
    const exportXlsxBtn = document.getElementById('bulk-export-xlsx');

    exportCsvBtn?.addEventListener('click', () => handleExport('csv', 'bulk-export-csv'));
    exportXlsxBtn?.addEventListener('click', () => handleExport('xlsx', 'bulk-export-xlsx'));

    document.getElementById('clear-selection')?.addEventListener('click', () => {
        resetSelection();
        updateBulkActionsUI();
    });
}


function clearFiltersUI() {
    const introducerFilter = document.getElementById('filter-priorityFulfillment');
    if (introducerFilter) introducerFilter.checked = false;

    // Reset state object to defaults
    state.filters = {
        country: [],
        status: [],
        listingStatus: [],
        dataSource: [],
        storeFormats: [],
        tags: [],
        fulfillmentPartners: [],
        priorityFulfillment: false,
        region: [],
        managedByTeam: [],
    };

    // Refresh UI for all pill containers
    ['country', 'region', 'status', 'listingStatus', 'dataSource', 'tags', 'fulfillmentPartners', 'storeFormats'].forEach(key => {
        ui.updatePillState(`filter-${key}-container`, state.filters[key]);
    });

    // Reset country list to any (no region)
    if (typeof updateCountryFilterOptions === 'function') {
        updateCountryFilterOptions(false);
    }
}

function bindDataSourceCheckboxes() {
    // Deprecated: Handled by Pill Logic
}

function updatePaginationUI() {
    const pageStatus = document.getElementById('pagination-status');
    if (pageStatus) pageStatus.textContent = `Page ${state.page} of ${state.totalPages || 1}`;

    const prevBtn = document.getElementById('header-prev');
    const nextBtn = document.getElementById('header-next');

    if (prevBtn) {
        prevBtn.disabled = state.page <= 1;
        prevBtn.classList.toggle('opacity-30', state.page <= 1);
    }
    if (nextBtn) {
        nextBtn.disabled = !state.hasNext;
        nextBtn.classList.toggle('opacity-30', !state.hasNext);
    }

    // Error Banner toggle
    const errorBanner = document.getElementById('error-banner');
    if (errorBanner) {
        if (state.totalItems === 0) {
            errorBanner.classList.remove('hidden');
        } else {
            errorBanner.classList.add('hidden');
        }
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
