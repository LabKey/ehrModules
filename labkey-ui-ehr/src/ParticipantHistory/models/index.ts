import { Filter } from '@labkey/api';

interface ReportConfigBase {
    category: null | string;
    containerPath: null | string;
    id: string;
    subjectIdFieldName: null | string;
    supportsnonidfilters: boolean | null;
    title: string;
    viewName: null | string;
}

/** For reports that display LabKey query results */
export interface QueryReportConfig extends ReportConfigBase {
    queryName: string;
    reportType: 'query';
    schemaName: string;
}

/** For reports rendered by JavaScript functions */
export interface JsReportConfig extends ReportConfigBase {
    queryName: string; // Function name to invoke
    reportType: 'js';
}

/** For saved LabKey reports (R, chart, etc.) */
export interface OtherReportConfig extends ReportConfigBase {
    queryName: string;
    reportId: string;
    reportType: 'report';
    schemaName: string;
}

/** Discriminated union of all report types */
export type ReportConfig = JsReportConfig | OtherReportConfig | QueryReportConfig;

/** Separates filters into removable and non-removable categories */
export interface FilterArray {
    nonRemovable: Filter.IFilter[];
    removable: Filter.IFilter[];
}

/** Configuration for LabKey Query WebPart with ExtJS integration */
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

/** Note: Extends ExtJS Container component (no official TypeScript definitions available) */
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

export type FilterType = 'aliveAtCenter' | 'all' | 'idSearch' | 'urlParams';

export interface ReportFilters {
    filterType: FilterType;
    subjects?: string[];
}

export const FILTER_TYPE_ALIVE_AT_CENTER: FilterType = 'aliveAtCenter';
export const FILTER_TYPE_ALL: FilterType = 'all';
export const FILTER_TYPE_ID_SEARCH: FilterType = 'idSearch';
export const FILTER_TYPE_URL_PARAMS: FilterType = 'urlParams';

export interface UrlFilters {
    [key: string]: boolean | FilterType | string | string[] | undefined; // Allow custom parameters
    activeReport?: string;
    filterType?: FilterType;
    readOnly?: boolean;
    showReport?: boolean;
    subjects?: string[];
}

export interface IdResolutionResult {
    error?: string;
    notFound: string[];
    resolved: {
        aliasType?: null | string;
        inputId: string;
        resolvedBy: 'alias' | 'direct';
        resolvedId: string;
    }[];
}

export interface ResolveIdsParams {
    inputIds: string[];
}
