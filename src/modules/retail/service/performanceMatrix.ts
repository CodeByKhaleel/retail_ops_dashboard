export interface TagMatrixEntry {
    tag: string;
    weight: number;
}

export const TAG_MATRIX: TagMatrixEntry[] = [
    { tag: 'High Growth', weight: 0.5 },
    { tag: 'Premium', weight: 0.35 },
    { tag: 'Omnichannel', weight: 0.3 },
    { tag: 'Seasonal', weight: 0.15 },
    { tag: 'At Risk', weight: -0.15 },
];

const COUNTRY_SCORES: Record<string, number> = {
    'United States': 0.9,
    'Canada': 0.7,
    'United Kingdom': 0.8,
    'Germany': 0.65,
    'France': 0.62,
    'India': 0.85,
    'Singapore': 0.78,
    'Australia': 0.68,
    'Japan': 0.72,
    'United Arab Emirates': 0.6,
    'Brazil': 0.58,
    'Mexico': 0.55,
};

const FORMAT_SCORES: Record<string, number> = {
    Flagship: 1,
    Marketplace: 0.85,
    Franchise: 0.7,
    Outlet: 0.55,
};

const REGION_MAP: Record<string, string> = {
    'United States': 'North America',
    Canada: 'North America',
    Mexico: 'North America',
    Brazil: 'Latin America',
    'United Kingdom': 'Europe',
    Germany: 'Europe',
    France: 'Europe',
    India: 'Asia',
    Singapore: 'Asia',
    Japan: 'Asia',
    Australia: 'Oceania',
    'United Arab Emirates': 'Middle East',
};

const MAX_RAW_SCORE = 2.1;

export const getRegionForCountry = (countryName: string): string => {
    return REGION_MAP[countryName] || 'Other';
};

export const calculatePerformanceScore = (
    tags: string[],
    country: string,
    storeFormats: string[],
    listingStatus: string
): number => {
    const tagScore = tags.reduce((score, tag) => {
        const matrixTag = TAG_MATRIX.find(tm => tm.tag.toLowerCase() === tag.toLowerCase());
        return score + (matrixTag?.weight ?? 0);
    }, 0);

    const countryScore = COUNTRY_SCORES[country] || 0.4;
    const formatScore = storeFormats.reduce((max, format) => {
        return Math.max(max, FORMAT_SCORES[format] ?? 0.45);
    }, 0);
    const listingScore = listingStatus === 'Listed' ? 0.25 : listingStatus === 'Draft' ? 0.1 : 0;

    const rawScore = tagScore + countryScore + formatScore + listingScore;
    const normalizedScore = Math.min(Math.max(rawScore / MAX_RAW_SCORE, 0), 1);

    return parseFloat(normalizedScore.toFixed(4));
};
