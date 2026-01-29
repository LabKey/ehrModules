import { useEffect, useRef, useState } from 'react';
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

/**
 * Hook that creates and manages an ExtJS report tab container.
 *
 * Creates an Ext4 container on mount, attaches report/filter data and
 * helper methods (getFilterArray, getQWPConfig), and destroys on cleanup.
 */
export function useReportTab(
    report: ReportConfig,
    filters: ReportFilters
): { tab: ExtReportTab | null; targetRef: React.RefObject<HTMLDivElement> } {
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

            if (!filters) {
                return filterArray;
            }

            const subjectIdFieldName = report.subjectIdFieldName || 'Id';
            const hasSubjects = filters.subjects?.length > 0;

            // ID Search and URL Params modes: Filter by specific subject IDs
            const isSubjectFilterMode =
                filters.filterType === FILTER_TYPE_ID_SEARCH || filters.filterType === FILTER_TYPE_URL_PARAMS;
            if (isSubjectFilterMode && hasSubjects) {
                const subjects = filters.subjects;
                if (subjects.length === 1) {
                    filterArray.nonRemovable.push(Filter.create(subjectIdFieldName, subjects[0], Filter.Types.EQUAL));
                } else {
                    filterArray.nonRemovable.push(
                        Filter.create(subjectIdFieldName, subjects.join(';'), Filter.Types.EQUALS_ONE_OF)
                    );
                }
            }

            // Alive at Center mode: Filter by calculated_status
            if (filters.filterType === FILTER_TYPE_ALIVE_AT_CENTER) {
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

            // Explicitly pick properties from report that should flow to QueryWebPart
            // This is safer than rest-spread exclusion: new internal properties won't leak
            const queryConfig: QueryWebPartConfig = {
                partName: 'Report',
                suppressRenderErrors: true,
                title: report.title,
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
                // Properties from report config that QueryWebPart needs
                containerPath: report.containerPath ?? undefined,
                viewName: report.viewName ?? undefined,
                queryName: report.queryName,
                schemaName: 'schemaName' in report ? report.schemaName : undefined,
                reportId: 'reportId' in report ? report.reportId : undefined,
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

    return { tab, targetRef };
}
