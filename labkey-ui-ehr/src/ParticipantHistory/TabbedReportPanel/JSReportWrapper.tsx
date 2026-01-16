import React, { FC, memo, useEffect } from 'react';

import { Query, Filter } from '@labkey/api';

import { ExtReportTab, FilterArray, QueryWebPartConfig, ReportConfig } from '../models';

// Declare global variables for ExtJS and LabKey
declare const Ext4: any;
declare const LABKEY: any;

/** Row from demographicsCurLocation query */
interface DemographicsLocationRow {
    [key: string]: unknown;
    Id?: string;
}

/** Result from LABKEY.Query.selectRows */
interface SelectRowsResult {
    [key: string]: unknown;
    rows?: DemographicsLocationRow[];
}

/** Type for JS report handler function */
type JSReportHandler = (panel: JSReportPanel, tab: ExtReportTab) => void;

/**
 * Panel object interface passed to JavaScript report functions
 * Provides methods for accessing filter data, query configuration, and housing resolution
 */
export interface JSReportPanel {
    getFilterArray: () => FilterArray;
    getQWPConfig: () => QueryWebPartConfig;
    getTitleSuffix: () => string;
    resolveSubjectsFromHousing: (
        tab: ExtReportTab,
        callback: (subjects: string[], tab: ExtReportTab) => void,
        scope?: unknown
    ) => void;
}

/**
 * Resolve a JavaScript function from a handler name and optional namespace
 * @param handlerName - Function reference or string name to resolve
 * @param reportNamespace - Optional namespace to search (e.g., "EHR.reports")
 * @returns Resolved function or null
 */
const resolveJsFunction = (handlerName: JSReportHandler | string, reportNamespace?: string): JSReportHandler | null => {
    if (typeof handlerName === 'function') {
        return handlerName;
    }

    // Try to resolve from namespace if provided
    if (reportNamespace && typeof handlerName === 'string') {
        const parts = reportNamespace.split('.');
        let ns: any = window;
        for (const part of parts) {
            ns = ns && ns[part];
        }

        if (ns?.[handlerName] && typeof ns[handlerName] === 'function') {
            return ns[handlerName];
        }
    }

    // If not found in namespace, try global resolution
    if (typeof handlerName === 'string') {
        const parts = handlerName.split('.');
        let ctx = window as any;
        for (const part of parts) {
            ctx = ctx && ctx[part];
        }
        if (typeof ctx === 'function') {
            return ctx;
        }
    }

    return null;
};

/**
 * Generate title suffix from subject IDs
 * @param subjects - Array of subject IDs
 * @returns Title suffix string (e.g., " - ID1, ID2")
 */
const getTitleSuffix = (subjects?: string[]): string => {
    if (subjects && subjects.length > 0) {
        return ' - ' + subjects.join(', ');
    }
    return '';
};

/**
 * Create resolveSubjectsFromHousing function that queries housing location
 * @param tab - Tab object with getFilterArray method
 * @param panel - Panel object for callback scope
 * @returns Function that resolves subjects from housing location
 */
const createResolveSubjectsFromHousing = (tab: ExtReportTab, panel: JSReportPanel | null) => {
    return (tabArg: ExtReportTab, callback: (subjects: string[], tab: ExtReportTab) => void, scope?: unknown) => {
        if (Ext4?.Msg?.wait) {
            Ext4.Msg.wait('Loading Ids For Location...');
        }

        const filterArray = tab.getFilterArray();
        let filters: Filter.IFilter[] = [];

        if (filterArray.nonRemovable) {
            filters = filters.concat(filterArray.nonRemovable);
        }

        if (filterArray.removable) {
            filters = filters.concat(filterArray.removable);
        }

        Query.selectRows({
            schemaName: 'study',
            queryName: 'demographicsCurLocation',
            sort: 'room,cage,id',
            filterArray: filters,
            failure: (error: unknown) => {
                if (Ext4?.Msg?.hide) {
                    Ext4.Msg.hide();
                }
                console.error('Failed to resolve subjects from housing:', error);
            },
            success: (results: SelectRowsResult) => {
                if (Ext4?.Msg?.hide) {
                    Ext4.Msg.hide();
                }

                const subjects: string[] = [];
                if (results.rows) {
                    results.rows.forEach((row: DemographicsLocationRow) => {
                        if (row.Id) {
                            subjects.push(row.Id);
                        }
                    });
                }

                callback.apply(scope || panel, [subjects, tabArg]);
            },
        });
    };
};

const JSReportWrapperComponent: FC<{ report: ReportConfig; reportNamespace?: string; tab: ExtReportTab }> = ({
    tab,
    report,
    reportNamespace,
}) => {
    useEffect(() => {
        if (!tab || !Ext4) {
            return;
        }

        try {
            const handlerName = report.queryName;
            const jsFunction = resolveJsFunction(handlerName, reportNamespace);

            if (jsFunction) {
                // Create panel object with getFilterArray, getQWPConfig, getTitleSuffix, and resolveSubjectsFromHousing functions using tab's methods
                const panel: JSReportPanel = {
                    getFilterArray: () => tab.getFilterArray(),
                    getQWPConfig: () => tab.getQWPConfig(),
                    getTitleSuffix: () => {
                        const { subjects } = tab?.filters || {};
                        return getTitleSuffix(subjects);
                    },
                    resolveSubjectsFromHousing: createResolveSubjectsFromHousing(tab, null),
                };

                // Update panel reference for resolveSubjectsFromHousing callback scope
                panel.resolveSubjectsFromHousing = createResolveSubjectsFromHousing(tab, panel);

                // Pass panel as the first argument, matching ExtJS TabbedReportPanel behavior
                jsFunction.call(null, panel, tab);
            } else {
                const reportName = report.title ? ` for report '${report.title}'` : '';
                tab.add({
                    html: `<div class="labkey-error">Could not find JavaScript function '${handlerName}'${reportName}</div>`,
                });
                console.error(`Could not find JavaScript function '${handlerName}'${reportName}`);
            }
        } catch (e) {
            const reportName = report.title ? ` '${report.title}'` : '';
            console.error(`Error loading JS report${reportName}`, e);
            if (tab && !tab.isDestroyed) {
                tab.add({
                    html: `<div class="labkey-error">Error loading JS report${reportName}: ${e}</div>`,
                });
            }
        }

        return () => {
            if (tab && !tab.isDestroyed) {
                tab.removeAll();
            }
        };
    }, [tab, report, reportNamespace]);

    return null;
};

JSReportWrapperComponent.displayName = 'JSReportWrapper';

export const JSReportWrapper = memo(JSReportWrapperComponent);
