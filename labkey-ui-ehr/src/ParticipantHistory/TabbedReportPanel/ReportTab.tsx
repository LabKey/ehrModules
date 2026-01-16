import React, { FC, useEffect, useRef, useState } from 'react';
import { Filter } from '@labkey/api';

import {
    ExtReportTab,
    FILTER_TYPE_ALIVE_AT_CENTER,
    FILTER_TYPE_ID_SEARCH,
    FILTER_TYPE_URL_PARAMS,
    FilterArray,
    QueryWebPartConfig,
    ReportConfig,
    ReportFilters,
} from '../models';

// Declare global variables for ExtJS
declare const Ext4: any;

export const ReportTab: FC<{
    children: (tab: ExtReportTab) => React.ReactNode;
    filters: ReportFilters;
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
            if (
                filters &&
                filters.filterType === FILTER_TYPE_ID_SEARCH &&
                filters.subjects &&
                filters.subjects.length
            ) {
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
            if (
                filters &&
                filters.filterType === FILTER_TYPE_URL_PARAMS &&
                filters.subjects &&
                filters.subjects.length
            ) {
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
            if (filters && filters.filterType === FILTER_TYPE_ALIVE_AT_CENTER) {
                filterArray.nonRemovable.push(
                    Filter.create('Id/Demographics/calculated_status', 'Alive', Filter.Types.EQUAL)
                );
            }

            // All Records mode: No filters applied (filterType === FILTER_TYPE_ALL)

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
