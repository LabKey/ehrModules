import { Filter } from '@labkey/api';

/**
 * Report Configuration
 * Defines the structure for report metadata and configuration
 */
export interface ReportConfig {
    [key: string]: any; // Allow other config options
    category?: string;
    containerPath?: string;
    id: string;
    queryName?: string;
    reportId?: string;
    reportType: string;
    schemaName?: string;
    subjectFieldName?: string;
    title: string;
    viewName?: string;
}

/**
 * Filter Array
 * Separates filters into removable and non-removable categories
 */
export interface FilterArray {
    nonRemovable: Filter.IFilter[];
    removable: Filter.IFilter[];
}

/**
 * Query Web Part Configuration
 * Configuration for LabKey Query WebPart with ExtJS integration
 */
export interface QueryWebPartConfig {
    [key: string]: any; // Allow additional properties from report config
    allowChooseQuery?: boolean;
    allowChooseView?: boolean;
    allowHeaderLock?: boolean;
    buttonBarPosition?: string;
    containerPath?: string;
    failure?: (error: any) => void;
    filters?: Filter.IFilter[];
    frame?: string;
    linkTarget?: string;
    partConfig?: any;
    partName?: string;
    queryName?: string;
    removeableFilters?: Filter.IFilter[];
    renderTo?: string;
    schemaName?: string;
    showDeleteButton?: boolean;
    showDetailsColumn?: boolean;
    showInsertNewButton?: boolean;
    showRecordSelectors?: boolean;
    showUpdateColumn?: boolean;
    success?: () => void;
    suppressRenderErrors?: boolean;
    tab?: any; // ExtJS tab object
    timeout?: number;
    title?: string;
    viewName?: string;
}

/**
 * Extended Ext.container.Container with custom properties and methods for report tabs
 * Note: Extends ExtJS Container component (no official TypeScript definitions available)
 */
export interface ExtReportTab {
    // ExtJS Container methods we use
    add: (config: any) => void;
    destroy: () => void;

    filters: ReportFilters;
    // Custom methods added to tab
    getFilterArray: () => FilterArray;

    getQWPConfig: () => QueryWebPartConfig;
    // ExtJS Container base properties
    isDestroyed?: boolean;

    removeAll: () => void;
    renderTo?: HTMLElement;
    // Custom properties added to tab
    report: ReportConfig;
}

/**
 * Filter Type
 * Defines the available filter modes for participant history
 */
export type FilterType = 'aliveAtCenter' | 'all' | 'idSearch' | 'urlParams';

/**
 * Report Filters
 * Filters passed to TabbedReportPanel for filtering report data
 */
export interface ReportFilters {
    filterType: FilterType;
    subjects?: string[];
}

/**
 * Filter Type Constants
 * Constant values for filter modes to avoid magic strings
 */
export const FILTER_TYPE_ALIVE_AT_CENTER: FilterType = 'aliveAtCenter';
export const FILTER_TYPE_ALL: FilterType = 'all';
export const FILTER_TYPE_ID_SEARCH: FilterType = 'idSearch';
export const FILTER_TYPE_URL_PARAMS: FilterType = 'urlParams';

/**
 * URL Filters
 * Structure for filter parameters stored in URL hash
 */
export interface UrlFilters {
    [key: string]: boolean | FilterType | string | string[] | undefined; // Allow custom parameters
    activeReport?: string;
    filterType?: FilterType;
    readOnly?: boolean;
    showReport?: boolean;
    subjects?: string[];
}

/**
 * ID Resolution Result
 * Result from resolving animal IDs and aliases
 */
export interface IdResolutionResult {
    notFound: string[];
    resolved: {
        aliasType?: null | string;
        inputId: string;
        resolvedBy: 'alias' | 'direct';
        resolvedId: string;
    }[];
}

/**
 * Resolve IDs Parameters
 * Parameters for resolving animal IDs
 */
export interface ResolveIdsParams {
    inputIds: string[];
}
