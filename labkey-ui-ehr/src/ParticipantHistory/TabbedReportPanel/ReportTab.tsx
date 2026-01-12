import React, { FC, useEffect, useRef, useState } from 'react';
import { Filter } from '@labkey/api';

// Declare global variables for ExtJS
declare const Ext4: any;

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

export interface FilterArray {
    nonRemovable: Filter.IFilter[];
    removable: Filter.IFilter[];
}

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

    filters: any;
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

export const ReportTab: FC<{
    children: (tab: ExtReportTab) => React.ReactNode;
    filters: any;
    report: ReportConfig;
}> = ({ report, filters, children }) => {
    const targetRef = useRef<HTMLDivElement>(null);
    const [tab, setTab] = useState<ExtReportTab | null>(null);

    useEffect(() => {
        if (!targetRef.current || !Ext4) return;

        const newTab: ExtReportTab = Ext4.create('Ext.container.Container', {
            renderTo: targetRef.current,
            border: false,
            defaults: {
                border: false,
            },
        });
        newTab.report = report;
        newTab.filters = filters;

        // Add getFilterArray function to tab for use by report wrappers
        newTab.getFilterArray = (): FilterArray => {
            const filterArray: FilterArray = {
                removable: [],
                nonRemovable: [],
            };

            const subjectFieldName = report.subjectFieldName || 'Id';

            // ID Search mode: Filter by specific subject IDs
            if (filters && filters.filterType === 'idSearch' && filters.subjects && filters.subjects.length) {
                const subjects = filters.subjects;
                if (subjects.length === 1) {
                    filterArray.nonRemovable.push(Filter.create(subjectFieldName, subjects[0], Filter.Types.EQUAL));
                } else {
                    filterArray.nonRemovable.push(
                        Filter.create(subjectFieldName, subjects.join(';'), Filter.Types.EQUALS_ONE_OF)
                    );
                }
            }

            // URL Params mode: Filter by URL-provided subject IDs (same as ID Search)
            if (filters && filters.filterType === 'urlParams' && filters.subjects && filters.subjects.length) {
                const subjects = filters.subjects;
                if (subjects.length === 1) {
                    filterArray.nonRemovable.push(Filter.create(subjectFieldName, subjects[0], Filter.Types.EQUAL));
                } else {
                    filterArray.nonRemovable.push(
                        Filter.create(subjectFieldName, subjects.join(';'), Filter.Types.EQUALS_ONE_OF)
                    );
                }
            }

            // Alive at Center mode: Filter by calculated_status
            if (filters && filters.filterType === 'aliveAtCenter') {
                filterArray.nonRemovable.push(
                    Filter.create('Id/Demographics/calculated_status', 'Alive', Filter.Types.EQUAL)
                );
            }

            // All Records mode: No filters applied (filterType === 'all')

            return filterArray;
        };

        // Add getQWPConfig function to tab for use by report wrappers
        newTab.getQWPConfig = (): QueryWebPartConfig => {
            const filterArray = newTab.getFilterArray();

            const queryConfig: QueryWebPartConfig = {
                partName: 'Report',
                suppressRenderErrors: true,
                title: report.title,
                schemaName: report.schemaName,
                queryName: report.queryName,
                viewName: report.viewName,
                allowChooseQuery: false,
                allowChooseView: true,
                showInsertNewButton: false,
                showDeleteButton: false,
                showDetailsColumn: true,
                showUpdateColumn: false,
                showRecordSelectors: true,
                allowHeaderLock: false,
                frame: 'portal',
                buttonBarPosition: 'top',
                timeout: 0,
                linkTarget: '_blank',
                filters: filterArray.nonRemovable,
                removeableFilters: filterArray.removable,
                // Add other properties from report config, excluding internal ones
                ...Object.keys(report).reduce(
                    (acc, key) => {
                        if (key !== 'id' && key !== 'title' && key !== 'reportType') {
                            acc[key] = report[key];
                        }
                        return acc;
                    },
                    {} as Record<string, any>
                ),
                tab: newTab,
            };

            return queryConfig;
        };

        setTab(newTab);

        return () => {
            if (newTab) {
                newTab.destroy();
            }
            setTab(null);
        };
    }, [report, filters]);

    return (
        <>
            <div className="report-target" ref={targetRef} />
            {tab && children(tab)}
        </>
    );
};
