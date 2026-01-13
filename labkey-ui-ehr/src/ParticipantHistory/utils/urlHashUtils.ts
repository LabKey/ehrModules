import {
    FILTER_TYPE_ALIVE_AT_CENTER,
    FILTER_TYPE_ALL,
    FILTER_TYPE_ID_SEARCH,
    FILTER_TYPE_URL_PARAMS,
    FilterType,
    UrlFilters,
} from '../models';

/**
 * URL hash utilities for managing filter state in the URL
 *
 * Handles:
 * - URL hash format: #filterType:idSearch&subjects:ID1;ID2&activeReport:reportId
 * - Four filter modes: idSearch, all, aliveAtCenter, urlParams
 * - Preserving other URL parameters
 * - Using replaceState to avoid duplicate history entries
 */

const VALID_FILTER_TYPES: readonly FilterType[] = [
    FILTER_TYPE_ALIVE_AT_CENTER,
    FILTER_TYPE_ALL,
    FILTER_TYPE_ID_SEARCH,
    FILTER_TYPE_URL_PARAMS,
] as const;

/**
 * Helper function to safely decode URI component
 * @param value - The value to decode
 * @returns Decoded value or original value if decoding fails
 */
function safeDecodeURIComponent(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        // Return original value if decoding fails (malformed URI)
        return value;
    }
}

/**
 * Helper function to check if a string is a valid FilterType
 * @param value - The value to check
 * @returns true if value is a valid FilterType
 */
function isValidFilterType(value: string): value is FilterType {
    return VALID_FILTER_TYPES.includes(value as FilterType);
}

/**
 * Updates the URL hash with filter parameters
 *
 * Format examples:
 * - ID Search: #filterType:idSearch&subjects:ID1;ID2;ID3&showReport:1
 * - All Records: #filterType:all&showReport:1
 * - Alive at Center: #filterType:aliveAtCenter&showReport:1
 * - URL Params: #subjects:ID1;ID2&readOnly:true&showReport:1
 *
 * @param filterType - The filter mode to set
 * @param subjects - Optional array of subject IDs (for idSearch and urlParams modes)
 * @param readOnly - Optional flag to enable read-only URL Params mode
 * @param showReport - Optional flag to show report content (defaults to false)
 */
export function updateUrlHash(
    filterType: FilterType,
    subjects?: string[],
    readOnly?: boolean,
    showReport?: boolean
): void {
    // Parse existing hash to preserve other parameters
    const existingFilters = getFiltersFromUrl();

    // Build new hash parameters
    const params: Record<string, string> = {};

    // Preserve other parameters that aren't managed by this function
    Object.keys(existingFilters).forEach(key => {
        if (
            key !== 'filterType' &&
            key !== 'subjects' &&
            key !== 'readOnly' &&
            existingFilters[key] !== undefined &&
            existingFilters[key] !== null
        ) {
            // Special handling for showReport - convert boolean to 1/0
            if (key === 'showReport') {
                params[key] = existingFilters[key] ? '1' : '0';
            } else {
                params[key] = String(existingFilters[key]);
            }
        }
    });

    // Add subjects parameter if provided (for idSearch and urlParams modes)
    if (subjects && subjects.length > 0) {
        params.subjects = subjects.join(';');
    }

    // Add filterType parameter (except for urlParams mode which uses readOnly instead)
    if (filterType !== FILTER_TYPE_URL_PARAMS) {
        params.filterType = filterType;
    }

    // Add readOnly parameter if specified (for urlParams mode)
    if (readOnly) {
        params.readOnly = 'true';
    }

    // Add showReport parameter if true
    if (showReport) {
        params.showReport = '1';
    }

    // Build hash string
    const hashString = Object.keys(params)
        .map(key => {
            // Special handling for subjects - encode individual IDs but not semicolon separator
            if (key === 'subjects') {
                const encodedSubjects = params[key]
                    .split(';')
                    .map(id => encodeURIComponent(id))
                    .join(';');
                return `${key}:${encodedSubjects}`;
            }
            return `${key}:${encodeURIComponent(params[key])}`;
        })
        .join('&');

    // Only update URL if there's content (avoid setting hash to just '#')
    if (hashString) {
        const newUrl = `${window.location.pathname}${window.location.search}#${hashString}`;
        window.history.replaceState(null, '', newUrl);
    } else {
        // Clear hash if no parameters
        const newUrl = `${window.location.pathname}${window.location.search}`;
        window.history.replaceState(null, '', newUrl);
    }
}

/**
 * Parses filter parameters from the current URL hash
 *
 * @returns UrlFilters object with parsed parameters
 */
export function getFiltersFromUrl(): UrlFilters {
    const hash = window.location.hash;

    // Remove leading # if present
    const hashContent = hash.startsWith('#') ? hash.substring(1) : hash;

    // Return default if no hash
    if (!hashContent) {
        return {
            filterType: FILTER_TYPE_ID_SEARCH,
        };
    }

    // Parse hash parameters
    const filters: UrlFilters = {};
    const params = hashContent.split('&');

    params.forEach(param => {
        const colonIndex = param.indexOf(':');
        if (colonIndex === -1) return;

        const key = param.substring(0, colonIndex);
        const rawValue = param.substring(colonIndex + 1);
        const value = safeDecodeURIComponent(rawValue);

        // Parse specific parameters
        if (key === 'subjects') {
            filters.subjects = value ? value.split(';').filter(s => s.length > 0) : [];
        } else if (key === 'filterType') {
            // Validate filterType before assigning
            if (isValidFilterType(value)) {
                filters.filterType = value;
            }
        } else if (key === 'readOnly') {
            filters.readOnly = value === 'true';
        } else if (key === 'showReport') {
            filters.showReport = value === '1' || value === 'true';
        } else if (key === 'activeReport') {
            filters.activeReport = value;
        } else {
            // Preserve other custom parameters
            filters[key] = value;
        }
    });

    // Determine filterType if readOnly is present (URL Params mode)
    if (filters.readOnly && filters.subjects && filters.subjects.length > 0) {
        filters.filterType = FILTER_TYPE_URL_PARAMS;
    }

    // Default to idSearch if no filterType specified
    if (!filters.filterType) {
        filters.filterType = FILTER_TYPE_ID_SEARCH;
    }

    return filters;
}
