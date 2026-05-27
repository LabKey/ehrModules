/*
 * Copyright (c) 2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
import React, { FC, memo, useEffect } from 'react';

import { Filter, Query } from '@labkey/api';

import { ExtReportTab, FilterArray, JsReportConfig, QueryWebPartConfig, ReportFilters } from '../models';

import { useReportTab } from './useReportTab';

interface DemographicsLocationRow {
    [key: string]: unknown;
    Id?: string;
}

interface SelectRowsResult {
    [key: string]: unknown;
    rows?: DemographicsLocationRow[];
}

type JSReportHandler = (panel: JSReportPanel, tab: ExtReportTab) => void;

/**
 * Panel object interface passed to JavaScript report functions
 * Provides methods for accessing filter data, query configuration, and housing resolution
 */
interface JSReportPanel {
    getFilterArray: () => FilterArray;
    getQWPConfig: () => QueryWebPartConfig;
    getTitleSuffix: () => string;
    resolveSubjectsFromHousing?: (
        tab: ExtReportTab,
        callback: (subjects: string[], tab: ExtReportTab) => void,
        scope?: unknown
    ) => void;
}

/**
 * Generate title suffix from subject IDs
 * @param subjects - Array of subject IDs
 * @returns Title suffix string (e.g., " - ID1, ID2")
 */
export const getTitleSuffix = (subjects?: string[]): string => {
    if (subjects && subjects.length > 0) {
        return ' - ' + subjects.join(', ');
    }
    return '';
};

/**
 * Safely traverse an object path and return the value at that path.
 * Returns undefined if any part of the path doesn't exist.
 */
const getNestedProperty = (obj: unknown, path: string[]): unknown => {
    let current: unknown = obj;
    for (const part of path) {
        if (current !== null && typeof current === 'object' && part in current) {
            current = (current as Record<string, unknown>)[part];
        } else {
            return undefined;
        }
    }
    return current;
};

/**
 * Resolve a JavaScript function from a handler name and optional namespace.
 * Supports:
 * - Direct function references
 * - Namespace lookup (e.g., "testFunction" in "EHR.reports" namespace)
 * - Global path resolution (e.g., "EHR.reports.testFunction")
 *
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
        const nsParts = reportNamespace.split('.');
        const ns = getNestedProperty(window, nsParts);

        if (ns !== null && typeof ns === 'object') {
            const fn = (ns as Record<string, unknown>)[handlerName];
            if (typeof fn === 'function') {
                return fn as JSReportHandler;
            }
        }
    }

    // If not found in namespace, try global resolution
    if (typeof handlerName === 'string') {
        const fn = getNestedProperty(window, handlerName.split('.'));
        if (typeof fn === 'function') {
            return fn as JSReportHandler;
        }
    }

    return null;
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

                const subjects =
                    results.rows?.reduce((result, row: DemographicsLocationRow) => {
                        if (row.Id) result.push(row.Id);
                        return result;
                    }, [] as string[]) ?? [];

                callback.apply(scope || panel, [subjects, tabArg]);
            },
        });
    };
};

const EHR_REPORT_NAMESPACE = 'EHR.reports';

interface JSReportWrapperProps {
    filters: ReportFilters;
    report: JsReportConfig;
}

const JSReportWrapperComponent: FC<JSReportWrapperProps> = ({ report, filters }) => {
    const { tab, targetRef } = useReportTab(report, filters);

    useEffect(() => {
        if (!tab) return;

        try {
            const handlerName = report.queryName;
            const jsFunction = resolveJsFunction(handlerName, EHR_REPORT_NAMESPACE);

            if (jsFunction) {
                // Create panel object with getFilterArray, getQWPConfig, getTitleSuffix, and resolveSubjectsFromHousing functions using tab's methods
                const panel: JSReportPanel = {
                    getFilterArray: () => tab.getFilterArray(),
                    getQWPConfig: () => tab.getQWPConfig(),
                    getTitleSuffix: () => {
                        const { subjects } = tab?.filters || {};
                        return getTitleSuffix(subjects);
                    },
                    // Placeholder; replaced below once panel reference is available
                    resolveSubjectsFromHousing: undefined,
                };

                // Set resolveSubjectsFromHousing with the panel reference for callback scope
                panel.resolveSubjectsFromHousing = createResolveSubjectsFromHousing(tab, panel);

                // Pass panel as the first argument, matching ExtJS TabbedReportPanel behavior
                jsFunction.call(null, panel, tab);
            } else {
                // Encode values before interpolating into raw HTML to prevent XSS
                const safeHandler = LABKEY.Utils.encodeHtml(String(handlerName));
                const safeTitle = report.title ? LABKEY.Utils.encodeHtml(report.title) : '';
                const reportName = safeTitle ? ` for report '${safeTitle}'` : '';
                tab.add({
                    html: `<div class="labkey-error">Could not find JavaScript function '${safeHandler}'${reportName}</div>`,
                });
                console.error(
                    `Could not find JavaScript function '${handlerName}'${report.title ? ` for report '${report.title}'` : ''}`
                );
            }
        } catch (e) {
            const reportName = report.title ? ` '${report.title}'` : '';
            console.error(`Error loading JS report${reportName}`, e);
            if (tab && !tab.isDestroyed) {
                // Encode values before interpolating into raw HTML to prevent XSS
                const safeReportName = report.title ? ` '${LABKEY.Utils.encodeHtml(report.title)}'` : '';
                const safeError = LABKEY.Utils.encodeHtml(String(e));
                tab.add({
                    html: `<div class="labkey-error">Error loading JS report${safeReportName}: ${safeError}</div>`,
                });
            }
        }

        return () => {
            if (tab && !tab.isDestroyed) {
                tab.removeAll();
            }
        };
    }, [tab, report]);

    return <div className="js-report-wrapper__target report-target" ref={targetRef} />;
};

JSReportWrapperComponent.displayName = 'JSReportWrapper';

export const JSReportWrapper = memo(JSReportWrapperComponent);
