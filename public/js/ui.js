/**
 * UI Utilities and component rendering for the dashboard.
 * Focuses on premium Tailwind-based components.
 */

export const ui = {
    renderTable(containerId, items, onSort) {
        const container = document.getElementById(containerId);
        if (!container) return;

        console.log(`[UI] Rendering table with ${items ? items.length : 0} items`);

        if (!items || items.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="10" class="px-6 py-12 text-center text-slate-500">
                        <div class="flex flex-col items-center gap-2">
                            <span class="text-3xl text-slate-300">∅</span>
                            <p>No Match Found</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        try {
            container.innerHTML = items.map(location => {
                try {
                    return `
                        <tr class="group border-b border-slate-100 table-row-hover">
                            <td class="px-4 py-5">
                                <input type="checkbox" class="location-checkbox w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 transition-all cursor-pointer">
                            </td>
                            <td class="px-4 py-5">
                                <div class="flex items-center gap-3">
                                    ${ui.getAvatarHtml(location.name)}
                                    <div class="font-semibold text-slate-900 text-sm">${location.name}</div>
                                </div>
                            </td>
                            <td class="px-4 py-5 text-slate-600 text-sm">
                                <div class="flex items-center gap-2">
                                    <span>${ui.getCountryFlag(location.country)}</span>
                                    <span>${location.country}</span>
                                </div>
                            </td>
                            <td class="px-4 py-5">
                                <span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${ui.getStatusColor(location.status)}">
                                    ${location.status}
                                </span>
                            </td>
                            <td class="px-4 py-5">
                                <span class="inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ${ui.getListingStatusColor(location.listingStatus)}">
                                    ${location.listingStatus}
                                </span>
                            </td>
                            <td class="px-4 py-5">
                                <span class="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${ui.getDataSourceColor(location.dataSource, true).replace('shadow-md', '').replace('ring-2', '')}">
                                    ${location.dataSource}
                                </span>
                            </td>
                            <td class="px-4 py-5">
                                <div class="flex flex-wrap gap-1.5">
                                    ${(location.storeFormats || []).map(t => `<span class="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${ui.getStoreFormatColor(t, true).replace('shadow-md', '').replace('ring-2', '').replace('!text-white', 'text-white')}">${t}</span>`).join('')}
                                </div>
                            </td>
                            <td class="px-4 py-5">
                                <div class="flex flex-wrap gap-1.5">
                                    ${(location.tags || []).map(t => `<span class="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${ui.getTagColor(t, true).replace('shadow-md', '').replace('ring-2', '').replace('!text-white', 'text-white')}">${t}</span>`).join('')}
                                </div>
                            </td>
                            <td class="px-4 py-5 text-center">
                                <span class="inline-flex items-center text-sm font-black text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
                                    ${location.performanceScore || 0}
                                </span>
                            </td>
                            <td class="px-4 py-5 text-center">
                                ${location.priorityFulfillment ?
                            '<span class="text-emerald-500 text-2xl drop-shadow-sm font-bold">✓</span>' :
                            '<span class="text-slate-300 text-sm">--</span>'}
                            </td>
                        </tr>
                    `;
                } catch (e) {
                    console.error('[UI] Error rendering row:', e, location);
                    return `<tr><td colspan="10" class="text-red-500 p-4">Error Rendering Row</td></tr>`;
                }
            }).join('');
        } catch (error) {
            console.error('[UI] Error in renderTable:', error);
            container.innerHTML = `<tr><td colspan="10" class="text-red-500 p-4">Critical Rendering Error: ${error.message}</td></tr>`;
        }
    },

    getAvatarHtml(name) {
        const letter = (name || 'P').charAt(0).toUpperCase();
        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-rose-500', 'bg-amber-500', 'bg-violet-500', 'bg-cyan-500'];
        const hash = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const colorClass = colors[hash % colors.length];

        return `<div class="w-8 h-8 rounded-lg ${colorClass} text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 ring-1 ring-white/20">${letter}</div>`;
    },

    getCountryFlag(countryName) {
        if (!countryName) return '🏳️';

        const nameToCode = {
            'afghanistan': 'af', 'albania': 'al', 'algeria': 'dz', 'andorra': 'ad', 'angola': 'ao', 'antigua and barbuda': 'ag', 'argentina': 'ar', 'armenia': 'am', 'australia': 'au', 'austria': 'at', 'azerbaijan': 'az', 'bahamas': 'bs', 'bahrain': 'bh', 'bangladesh': 'bd', 'barbados': 'bb', 'belarus': 'by', 'belgium': 'be', 'belize': 'bz', 'benin': 'bj', 'bhutan': 'bt', 'bolivia': 'bo', 'bosnia and herzegovina': 'ba', 'botswana': 'bw', 'brazil': 'br', 'brunei': 'bn', 'bulgaria': 'bg', 'burkina faso': 'bf', 'burundi': 'bi', 'cabo verde': 'cv', 'cambodia': 'kh', 'cameroon': 'cm', 'canada': 'ca', 'central african republic': 'cf', 'chad': 'td', 'chile': 'cl', 'china': 'cn', 'colombia': 'co', 'comoros': 'km', 'congo': 'cg', 'costa rica': 'cr', 'cote d\'ivoire': 'ci', 'croatia': 'hr', 'cuba': 'cu', 'cyprus': 'cy', 'czech republic': 'cz', 'denmark': 'dk', 'djibouti': 'dj', 'dominica': 'dm', 'dominican republic': 'do', 'ecuador': 'ec', 'egypt': 'eg', 'el salvador': 'sv', 'equatorial guinea': 'gq', 'eritrea': 'er', 'estonia': 'ee', 'eswatini': 'sz', 'ethiopia': 'et', 'fiji': 'fj', 'finland': 'fi', 'france': 'fr', 'gabon': 'ga', 'gambia': 'gm', 'georgia': 'ge', 'germany': 'de', 'ghana': 'gh', 'greece': 'gr', 'grenada': 'gd', 'guatemala': 'gt', 'guinea': 'gn', 'guinea-bissau': 'gw', 'guyana': 'gy', 'haiti': 'ht', 'holy see': 'va', 'honduras': 'hn', 'hungary': 'hu', 'iceland': 'is', 'india': 'in', 'indonesia': 'id', 'iran': 'ir', 'iraq': 'iq', 'ireland': 'ie', 'italy': 'it', 'jamaica': 'jm', 'japan': 'jp', 'jordan': 'jo', 'kazakhstan': 'kz', 'kenya': 'ke', 'kiribati': 'ki', 'korea, north': 'kp', 'korea, south': 'kr', 'south korea': 'kr', 'north korea': 'kp', 'kosovo': 'xk', 'kuwait': 'kw', 'kyrgyzstan': 'kg', 'laos': 'la', 'latvia': 'lv', 'lebanon': 'lb', 'lesotho': 'ls', 'liberia': 'lr', 'libya': 'ly', 'liechtenstein': 'li', 'lithuania': 'lt', 'luxembourg': 'lu', 'madagascar': 'mg', 'malawi': 'mw', 'malaysia': 'my', 'maldives': 'mv', 'mali': 'ml', 'malta': 'mt', 'marshall islands': 'mh', 'mauritania': 'mr', 'mauritius': 'mu', 'mexico': 'mx', 'micronesia': 'fm', 'moldova': 'md', 'monaco': 'mc', 'mongolia': 'mn', 'montenegro': 'me', 'morocco': 'ma', 'mozambique': 'mz', 'myanmar': 'mm', 'namibia': 'na', 'nauru': 'nr', 'nepal': 'np', 'netherlands': 'nl', 'new zealand': 'nz', 'nicaragua': 'ni', 'niger': 'ne', 'nigeria': 'ng', 'north macedonia': 'mk', 'norway': 'no', 'oman': 'om', 'pakistan': 'pk', 'palau': 'pw', 'palestine': 'ps', 'panama': 'pa', 'papua new guinea': 'pg', 'paraguay': 'py', 'peru': 'pe', 'philippines': 'ph', 'poland': 'pl', 'portugal': 'pt', 'qatar': 'qa', 'romania': 'ro', 'russia': 'ru', 'rwanda': 'rw', 'saint kitts and nevis': 'kn', 'saint lucia': 'lc', 'saint vincent and the grenadines': 'vc', 'samoa': 'ws', 'san marino': 'sm', 'sao tome and principe': 'st', 'saudi arabia': 'sa', 'senegal': 'sn', 'serbia': 'rs', 'seychelles': 'sc', 'sierra leone': 'sl', 'singapore': 'sg', 'slovakia': 'sk', 'slovenia': 'si', 'solomon islands': 'sb', 'somalia': 'so', 'south africa': 'za', 'south sudan': 'ss', 'spain': 'es', 'sri lanka': 'lk', 'sudan': 'sd', 'suriname': 'sr', 'sweden': 'se', 'switzerland': 'ch', 'syria': 'sy', 'taiwan': 'tw', 'tajikistan': 'tj', 'tanzania': 'tz', 'thailand': 'th', 'timor-leste': 'tl', 'togo': 'tg', 'tonga': 'to', 'trinidad and tobago': 'tt', 'tunisia': 'tn', 'turkey': 'tr', 'turkmenistan': 'tm', 'tuvalu': 'tv', 'uganda': 'ug', 'ukraine': 'ua', 'united arab emirates': 'ae', 'uae': 'ae', 'united kingdom': 'gb', 'uk': 'gb', 'united states': 'us', 'usa': 'us', 'united states of america': 'us', 'uruguay': 'uy', 'uzbekistan': 'uz', 'vanuatu': 'vu', 'venezuela': 've', 'vietnam': 'vn', 'yemen': 'ye', 'zambia': 'zm', 'zimbabwe': 'zw', 'hong kong': 'hk', 'macau': 'mo'
        };

        const cleaned = countryName.toLowerCase().trim();
        const code = nameToCode[cleaned];

        if (!code) return '🏳️';

        return code
            .toUpperCase()
            .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
    },

    getRegionIcon(regionName) {
        if (!regionName) return '🌐';
        const icons = {
            'Europe': '🇪🇺',
            'North America': '🌎',
            'Latin America': '🌎',
            'Asia': '🌏',
            'Middle East': '🌍',
            'Africa': '🌍',
            'Oceania': '🏝️',
            'Other': '🌐'
        };
        return icons[regionName] || '🌐';
    },

    getStatusColor(status) {
        const s = status.toLowerCase();
        if (s === 'active') return 'bg-emerald-500/15 text-emerald-700 ring-1 ring-inset ring-emerald-500/30 font-bold';
        if (s === 'disabled' || s === 'inactive') return 'bg-slate-500/10 text-slate-600 ring-1 ring-inset ring-slate-500/20 font-bold';
        if (s === 'pending' || s === 'provisional') return 'bg-amber-500/15 text-amber-700 ring-1 ring-inset ring-amber-500/30 font-bold';
        return 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 font-bold';
    },

    getStoreFormatColor(type, isActive) {
        const t = (type || '').toLowerCase();
        if (!isActive) return 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-brand-200 dark:hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-brand-600 dark:hover:text-brand-400';

        if (t === 'direct') {
            return 'bg-emerald-600 !text-white border-emerald-600 shadow-md shadow-emerald-100 ring-2 ring-emerald-50';
        }
        if (t === 'indirect') {
            return 'bg-blue-600 !text-white border-blue-600 shadow-md shadow-blue-100 ring-2 ring-blue-50';
        }
        // Default (Indigo)
        return 'bg-brand-600 !text-white border-brand-600 shadow-md shadow-brand-200 ring-2 ring-brand-100';
    },

    getDataSourceColor(source, isActive) {
        const s = (source || '').toLowerCase();
        if (!isActive) return 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-brand-200 dark:hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-brand-600 dark:hover:text-brand-400';

        if (s === 'crm') {
            return 'bg-amber-400 text-amber-950 border-amber-400 shadow-md shadow-amber-100 ring-2 ring-amber-50';
        }
        if (s === 'edge') {
            return 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-100 ring-2 ring-violet-50';
        }
        if (s === 'all') {
            return 'bg-slate-800 text-white border-slate-800 shadow-md shadow-slate-400 ring-2 ring-slate-200';
        }
        // Default (Indigo)
        return 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-200 ring-2 ring-brand-100';
    },

    getTagColor(tag, isActive) {
        const t = (tag || '').toLowerCase();
        if (!isActive) return 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-brand-200 dark:hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-brand-600 dark:hover:text-brand-400';

        if (t === 'atrisk') return 'bg-red-600 !text-white border-red-600 shadow-md shadow-red-100 ring-2 ring-red-50';
        if (t === 'fulfillment') return 'bg-cyan-600 !text-white border-cyan-600 shadow-md shadow-cyan-100 ring-2 ring-cyan-50';
        if (t === 'priority') return 'bg-indigo-600 !text-white border-indigo-600 shadow-md shadow-indigo-100 ring-2 ring-indigo-50';
        if (t === 'exclusivity') return 'bg-purple-600 !text-white border-purple-600 shadow-md shadow-purple-100 ring-2 ring-purple-50';
        if (t === 'marketingbudget') return 'bg-blue-600 !text-white border-blue-600 shadow-md shadow-blue-100 ring-2 ring-blue-50';
        if (t === 'russellgroup') return 'bg-emerald-600 !text-white border-emerald-600 shadow-md shadow-emerald-100 ring-2 ring-emerald-50';

        // Default (Indigo)
        return 'bg-brand-600 !text-white border-brand-600 shadow-md shadow-brand-200 ring-2 ring-brand-100';
    },

    getListingStatusColor(status) {
        const s = status.toLowerCase();
        if (s === 'listed' || s === 'live') return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20';
        if (s === 'archived' || s === 'draft') return 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20';
        return 'bg-slate-100 text-slate-700';
    },

    populateSelect(elementId, options, currentValue) {
        const select = document.getElementById(elementId);
        if (!select) return;

        const anyIcon = elementId === 'filter-region' ? '🌏' : '🌐';
        select.innerHTML = `<option value="">${anyIcon} Any</option>`;
        options.forEach(opt => {
            const selected = opt === currentValue ? 'selected' : '';
            let icon = '';
            // Match icons for status and publishing
            const val = opt.toLowerCase();
            if (select.id === 'filter-country') icon = `${ui.getCountryFlag(opt)} `;
            else if (select.id === 'filter-region') icon = `${ui.getRegionIcon(opt)} `;
            else if (select.id === 'filter-status') {
                if (val === 'active') icon = '✅ ';
                else if (val.includes('inactive') || val === 'disabled') icon = '❌ ';
                else if (val === 'pending') icon = '⏳ ';
                else icon = '🔹 ';
            }
            else if (select.id === 'filter-listingStatus') {
                if (val === 'listed' || val === 'live') icon = '🚀 ';
                else if (val === 'draft') icon = '📝 ';
                else if (val === 'archived') icon = '📦 ';
                else icon = '🔹 ';
            }

            select.innerHTML += `<option value="${opt}" ${selected}>${icon}${opt}</option>`;
        });
    },

    populateCheckboxGroup(containerId, name, options, selectedValues = []) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = options.length > 0 ? options.map(opt => `
            <label class="flex items-center gap-2 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-lg transition-all">
                <input type="checkbox" name="${name}" value="${opt}" 
                    ${selectedValues.includes(opt) ? 'checked' : ''}
                    class="filter-${name}-checkbox w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer">
                <span class="text-sm font-medium text-slate-600 group-hover:text-slate-900">${opt}</span>
            </label>
        `).join('') : '<p class="text-xs text-slate-400 italic">No options available</p>';
    },

    populatePills(containerId, options, selectedValues, onSelect) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Normalize selectedValues to array
        const selected = Array.isArray(selectedValues) ? selectedValues : (selectedValues ? [selectedValues] : []);

        if (!options || options.length === 0) {
            container.innerHTML = '<p class="text-xs text-slate-400 italic">No options available</p>';
            return;
        }

        container.innerHTML = '';
        container.className = 'flex flex-wrap gap-2'; // Ensure container has flex layout

        options.forEach(opt => {
            const isSelected = selected.includes(opt);
            const btn = document.createElement('button');

            // Base styling
            const baseClass = "px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 select-none animate-in fade-in zoom-in duration-300";

            // Determine Color Class using helper
            let colorClass = "";
            if (containerId.includes('storeFormats')) colorClass = ui.getStoreFormatColor(opt, isSelected);
            else if (containerId.includes('dataSource')) colorClass = ui.getDataSourceColor(opt, isSelected);
            else if (containerId.includes('tags')) colorClass = ui.getTagColor(opt, isSelected);
            else {
                colorClass = (isSelected
                    ? "bg-brand-600 !text-white border-brand-600 shadow-md shadow-brand-200 ring-2 ring-brand-100"
                    : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-brand-200 dark:hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-brand-600 dark:hover:text-brand-400");
            }

            btn.className = `${baseClass} ${colorClass}`;
            btn.textContent = opt;
            btn.dataset.value = opt;

            btn.addEventListener('click', () => {
                onSelect(opt, btn);
            });

            container.appendChild(btn);
        });
    },

    updatePillState(containerId, selectedValues) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const selected = Array.isArray(selectedValues) ? selectedValues : (selectedValues ? [selectedValues] : []);
        const buttons = container.querySelectorAll('button');

        buttons.forEach(btn => {
            const val = btn.dataset.value;
            const isSelected = selected.includes(val);

            // Re-apply classes using the logic from populatePills
            const baseClass = "px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 select-none animate-in fade-in zoom-in duration-300";

            let colorClass = "";
            if (containerId.includes('storeFormats')) colorClass = ui.getStoreFormatColor(val, isSelected);
            else if (containerId.includes('dataSource')) colorClass = ui.getDataSourceColor(val, isSelected);
            else if (containerId.includes('tags')) colorClass = ui.getTagColor(val, isSelected);
            else {
                colorClass = (isSelected
                    ? "bg-brand-600 !text-white border-brand-600 shadow-md shadow-brand-200 ring-2 ring-brand-100"
                    : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-brand-200 dark:hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-brand-600 dark:hover:text-brand-400");
            }

            btn.className = `${baseClass} ${colorClass}`;
        });
    },

    toggleBulkActions(selectedCount) {
        let bar = document.getElementById('bulk-actions-bar');
        if (selectedCount === 0) {
            if (bar) bar.remove();
            return;
        }

        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'bulk-actions-bar';
            bar.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] glass-card px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-8 duration-500 premium-shadow border-brand-200/50';
            document.body.appendChild(bar);
        }

        bar.innerHTML = `
        <div class="flex items-center gap-3 pr-6 border-r border-slate-200 dark:border-white/10">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white text-[10px] font-bold">${selectedCount}</span>
            <span class="text-sm font-bold text-slate-900 dark:text-white">Selected</span>
        </div>
        <div class="flex items-center gap-2">
            <button id="bulk-export-csv" class="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-brand-500/20">
                <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Export CSV
            </button>
            <button id="bulk-export-xlsx" class="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-brand-500/20">
                <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Export XLSX
            </button>
            <div class="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1"></div>
            <button id="clear-selection" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all" title="Clear Selection">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    `;
    },

    /**
     * Export data to CSV or XLSX (Excel XML format)
     */
    exportData(data, format = 'csv') {
        if (!data || data.length === 0) return;

        const headers = ['Name', 'Country', 'Status', 'Listing Status', 'Data Source', 'Store Formats', 'Tags', 'Performance Score', 'Priority Fulfillment'];
        const rows = data.map(item => [
            item.name,
            item.country,
            item.status,
            item.listingStatus,
            item.dataSource,
            (item.storeFormats || []).join('; '),
            (item.tags || []).join('; '),
            item.performanceScore || 0,
            item.priorityFulfillment ? 'Yes' : 'No'
        ]);

        let content = '';
        let mimeType = '';
        let extension = '';

        if (format === 'csv') {
            const csvContent = [headers, ...rows].map(e => e.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(",")).join("\n");
            content = csvContent;
            mimeType = 'text/csv;charset=utf-8;';
            extension = 'csv';
        } else {
            // Simple XML Spreadsheet format (Excel 2003 XML)
            let xmlRows = rows.map(r => `
                <Row>
                    ${r.map(c => `<Cell><Data ss:Type="String">${String(c ?? '').replace(/[<>&'"]/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '\'': '&apos;', '"': '&quot;' }[char]))}</Data></Cell>`).join('')}
                </Row>`).join('');

            const xmlHeaders = `<Row>${headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}</Row>`;

            content = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Sheet1">
  <Table>
   ${xmlHeaders}
   ${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`;
            mimeType = 'application/vnd.ms-excel';
            extension = 'xlsx';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `locations_export_${new Date().getTime()}.${extension}`;

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    },

    showError(containerId, message) {
        const banner = document.getElementById(containerId);
        if (!banner) return;

        if (!message) {
            banner.classList.add('hidden');
            return;
        }

        banner.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold">!</span>
                <p class="text-sm font-medium text-red-800">${message}</p>
            </div>
        `;
        banner.classList.remove('hidden');
    }
};
