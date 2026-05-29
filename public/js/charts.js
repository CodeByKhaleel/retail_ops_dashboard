/**
 * Charts service for the dashboard.
 * Wraps Chart.js and handles modular rendering of visualizations.
 */

export const charts = {
    instances: {
        country: null,
        scoreRegion: null
    },

    fullData: {},

    render(ctxId, type, title, data, onChartClick, originalKey, showAll = false) {
        const ctx = document.getElementById(ctxId);
        if (!ctx) return null;

        // Use originalKey if provided (for maximized view)
        const key = originalKey || ctxId.split('-')[1] || ctxId;
        const isMaximized = ctxId.includes('maximized');

        // Store full data for potential maximization
        if (!isMaximized) {
            this.fullData[key] = data;
        }

        let displayData = data;
        // Dynamic sizing: Limit top lists to 10 for dashboard, 15 for maximized view
        if (!showAll && (key === 'topLocations' || key === 'country')) {
            const limit = isMaximized ? 15 : 10;
            displayData = {
                labels: (data.labels || []).slice(0, limit),
                values: (data.values || []).slice(0, limit)
            };
        }

        if (this.instances[ctxId]) {
            this.instances[ctxId].destroy();
        }

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const isBar = type === 'bar';
        const labelColor = isDark ? '#cbd5e1' : '#334155'; // Darker text for visibility
        const gridColor = isDark ? '#1e293b' : '#f1f5f9';

        // Color Logic per Chart Type
        let barColor = '#7c3aed'; // Purple default
        if (key === 'topLocations') barColor = '#10b981'; // Emerald for locations
        if (key === 'country') barColor = '#6366f1'; // Indigo for countries
        if (key === 'scoreRegion') barColor = '#f59e0b'; // Amber for region scores

        // Color changes when expanded (more saturated/vibrant)
        if (isMaximized) {
            if (key === 'topLocations') barColor = '#059669';
            if (key === 'country') barColor = '#4f46e5';
            if (key === 'scoreRegion') barColor = '#d97706';
            if (key === 'store-format') barColor = '#6d28d9';
        }

        this.instances[ctxId] = new Chart(ctx, {
            type,
            data: {
                labels: displayData.labels || [],
                datasets: [{
                    label: title,
                    data: displayData.values || [],
                    backgroundColor: isBar ? barColor : [
                        '#7c3aed', '#10b981', '#f59e0b', '#ef4444',
                        '#8b5cf6', '#ec4899', '#06b6d4'
                    ],
                    borderRadius: isBar ? 8 : 0,
                    borderWidth: 0,
                    hoverOffset: 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                onClick: (event, elements) => {
                    if (elements.length > 0 && onChartClick) {
                        const index = elements[elements.length - 1].index;
                        const label = this.instances[ctxId].data.labels[index];
                        onChartClick(key, label);
                    }
                },
                plugins: {
                    legend: {
                        display: !isBar || (isBar && isMaximized),
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            color: labelColor,
                            font: {
                                size: isMaximized ? 14 : 11,
                                family: "'Outfit', sans-serif",
                                weight: '700'
                            }
                        }
                    },
                    tooltip: {
                        padding: 12,
                        backgroundColor: isDark ? '#1e293b' : '#0f172a',
                        titleFont: { family: "'Outfit', sans-serif", size: 13, weight: '700' },
                        bodyFont: { family: "'Outfit', sans-serif", size: 12 }
                    }
                },
                scales: isBar ? {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: {
                            color: labelColor,
                            font: {
                                size: isMaximized ? 12 : 10,
                                family: "'Outfit', sans-serif",
                                weight: '700'
                            }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: labelColor,
                            font: {
                                size: isMaximized ? 12 : 9,
                                family: "'Outfit', sans-serif",
                                weight: '700'
                            },
                            maxRotation: isMaximized ? 90 : 45,
                            minRotation: isMaximized ? 45 : 45,
                            callback: function (val, index) {
                                const label = this.getLabelForValue(val);
                                const limit = isMaximized ? 25 : 15;
                                return label.length > limit ? label.substring(0, limit - 3) + '...' : label;
                            }
                        }
                    }
                } : {}
            }
        });

        return this.instances[ctxId];
    },

    maximize(sourceId, title) {
        // Normalize key (remove 'chart-' prefix if present)
        const key = sourceId.includes('-') ? sourceId.split('-')[1] : sourceId;
        const data = this.fullData[key];

        if (!data) {
            console.error(`No data found for key: ${key} (source: ${sourceId})`);
            return;
        }

        const modal = document.getElementById('chart-modal');
        const modalTitle = document.getElementById('modal-chart-title');
        modalTitle.textContent = title;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            // Determine type based on original key
            const type = (key === 'status' || key === 'publish') ? 'pie' : 'bar';
            if (key === 'status') {
                this.render('maximized-chart-canvas', 'doughnut', title, data, null, key);
            } else {
                this.render('maximized-chart-canvas', type, title, data, null, key);
            }
        }, 50);
    },

    closeMaximize() {
        const modal = document.getElementById('chart-modal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        if (this.instances['maximized-chart-canvas']) {
            this.instances['maximized-chart-canvas'].destroy();
            delete this.instances['maximized-chart-canvas'];
        }
    },

    updateAll(data, onChartClick, showAllCountries = false) {
        this.render('chart-country', 'bar', 'Store Locations by Country', data.locationsByCountry, onChartClick, null, showAllCountries);
        this.render('chart-scoreRegion', 'bar', 'Performance Score', data.performanceScoreByRegion, onChartClick);
    }
};
