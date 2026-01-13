import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { incrementClientSideMetricCount } from '@labkey/components';

import { SearchByIdPanel } from './SearchByIdPanel/SearchByIdPanel';
import { TabbedReportPanel } from './TabbedReportPanel/TabbedReportPanel';
import { getFiltersFromUrl, updateUrlHash } from './utils/urlHashUtils';
import {
    FILTER_TYPE_ALIVE_AT_CENTER,
    FILTER_TYPE_ALL,
    FILTER_TYPE_ID_SEARCH,
    FILTER_TYPE_URL_PARAMS,
    FilterType,
} from './models';

// Declare global LABKEY API
declare const LABKEY: any;

const ParticipantReportsComponent: FC = () => {
    const urlFilters = useMemo(() => getFiltersFromUrl(), []);
    const [subjects, setSubjects] = useState<string[]>(urlFilters.subjects || []);

    // Determine initial filter type based on URL parameters
    const initialFilterType = useMemo(() => {
        if (urlFilters.readOnly && urlFilters.subjects?.length > 0) {
            return FILTER_TYPE_URL_PARAMS; // Read-only mode for shared links
        }
        return urlFilters.filterType || FILTER_TYPE_ID_SEARCH;
    }, [urlFilters]);

    const [filterType, setFilterType] = useState<FilterType>(initialFilterType);
    const [activeReport, setActiveReport] = useState(urlFilters.activeReport);
    const [activeReportSupportsNonIdFilters, setActiveReportSupportsNonIdFilters] = useState<boolean>(true);
    const [filterNotSupportedError, setFilterNotSupportedError] = useState<null | string>(null);
    const [showReport, setShowReport] = useState<boolean>(urlFilters.showReport ?? false);

    // Query active report metadata to get supportsNonIdFilters field from ehr.reports
    useEffect(() => {
        if (!activeReport || typeof LABKEY === 'undefined') {
            setActiveReportSupportsNonIdFilters(true); // Default to true if no report or LABKEY not available
            return;
        }

        LABKEY.Query.selectRows({
            schemaName: 'ehr',
            queryName: 'reports',
            filterArray: [LABKEY.Filter.create('reportname', activeReport, LABKEY.Filter.Types.EQUAL)],
            columns: 'supportsnonidfilters',
            success: (data: any) => {
                if (data.rows && data.rows.length > 0) {
                    const supportsNonIdFilters = data.rows[0].supportsnonidfilters;
                    setActiveReportSupportsNonIdFilters(supportsNonIdFilters === true);
                } else {
                    // Report not found in metadata, default to true (allow all filters)
                    setActiveReportSupportsNonIdFilters(true);
                }
            },
            failure: (error: any) => {
                console.error('Failed to query report metadata:', error);
                // On error, default to true (allow all filters)
                setActiveReportSupportsNonIdFilters(true);
            },
        });
    }, [activeReport]);

    const handleFilterChange = useCallback(
        (newFilterType: FilterType, newSubjects?: string[], clearError = true) => {
            setFilterType(newFilterType);
            setSubjects(newSubjects || []);
            if (clearError) {
                setFilterNotSupportedError(null); // Clear any previous error
            }

            // Determine if report should be shown
            // Show report for 'all' and 'aliveAtCenter' modes always
            // Show report for 'idSearch' and 'urlParams' only when subjects exist
            const shouldShowReport =
                newFilterType === FILTER_TYPE_ALL ||
                newFilterType === FILTER_TYPE_ALIVE_AT_CENTER ||
                ((newFilterType === FILTER_TYPE_ID_SEARCH || newFilterType === FILTER_TYPE_URL_PARAMS) &&
                    (newSubjects?.length ?? 0) > 0);
            setShowReport(shouldShowReport);

            // When switching from urlParams to idSearch (via "Modify Search"), remove readOnly parameter
            const isLeavingReadOnly = filterType === FILTER_TYPE_URL_PARAMS && newFilterType !== FILTER_TYPE_URL_PARAMS;
            const readOnly = newFilterType === FILTER_TYPE_URL_PARAMS && !isLeavingReadOnly;

            updateUrlHash(newFilterType, newSubjects, readOnly, shouldShowReport);
        },
        [filterType]
    );

    const handleTabChange = useCallback(
        (reportId: string) => {
            setActiveReport(reportId);
            // Update URL hash with new activeReport
            updateUrlHash(filterType, subjects, filterType === FILTER_TYPE_URL_PARAMS, showReport);
        },
        [filterType, subjects, showReport]
    );

    // Determine if current filter is not supported and set error message
    useEffect(() => {
        if (filterType === FILTER_TYPE_ALIVE_AT_CENTER && !activeReportSupportsNonIdFilters) {
            setFilterNotSupportedError('This report does not support Alive at Center filtering.');
        } else {
            setFilterNotSupportedError(null);
        }
    }, [filterType, activeReportSupportsNonIdFilters]);

    // Auto-switch from aliveAtCenter to all when report doesn't support it
    useEffect(() => {
        if (filterType === FILTER_TYPE_ALIVE_AT_CENTER && !activeReportSupportsNonIdFilters) {
            // Automatically switch to All Animals mode, but keep error message visible

            handleFilterChange(FILTER_TYPE_ALL, undefined, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeReportSupportsNonIdFilters, filterType]);

    // Compute effective filter - override to 'all' if aliveAtCenter is not supported
    const effectiveFilterType = useMemo(() => {
        if (filterType === FILTER_TYPE_ALIVE_AT_CENTER && !activeReportSupportsNonIdFilters) {
            return FILTER_TYPE_ALL; // Override to show all animals
        }
        return filterType;
    }, [filterType, activeReportSupportsNonIdFilters]);

    const filters = useMemo(
        () => ({
            filterType: effectiveFilterType,
            subjects:
                effectiveFilterType === FILTER_TYPE_ID_SEARCH || effectiveFilterType === FILTER_TYPE_URL_PARAMS
                    ? subjects
                    : undefined,
        }),
        [effectiveFilterType, subjects]
    );

    return (
        <div className="participant-reports">
            <SearchByIdPanel
                activeReportSupportsNonIdFilters={activeReportSupportsNonIdFilters}
                initialFilterType={filterType}
                initialSubjects={subjects}
                onFilterChange={handleFilterChange}
            />
            {filterNotSupportedError && (
                <div className="filter-not-supported-error" role="alert">
                    {filterNotSupportedError}
                </div>
            )}
            <TabbedReportPanel
                activeReport={activeReport}
                filters={filters}
                onTabChange={handleTabChange}
                reportNamespace="EHR.reports"
                reportsQuery="reports"
                reportsSchema="ehr"
                showReport={showReport}
            />
        </div>
    );
};

ParticipantReportsComponent.displayName = 'ParticipantReports';

export const ParticipantReports = memo(ParticipantReportsComponent);
