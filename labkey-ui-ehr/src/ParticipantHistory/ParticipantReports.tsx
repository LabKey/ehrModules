import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';

import { SearchByIdPanel } from './SearchByIdPanel/SearchByIdPanel';
import { TabbedReportPanel } from './TabbedReportPanel/TabbedReportPanel';
import {
    FILTER_TYPE_ALIVE_AT_CENTER,
    FILTER_TYPE_ALL,
    FILTER_TYPE_ID_SEARCH,
    FILTER_TYPE_URL_PARAMS,
    FilterType,
    ReportConfig,
    ReportFilters,
} from './models';
import { FetchReportsFn, getDefaultParticipantHistoryAPIWrapper } from './APIWrapper';
import { getFiltersFromUrl, updateUrlHash } from './utils/urlHashUtils';

interface ParticipantReportsProps {
    fetchReports?: FetchReportsFn;
}

const ParticipantReportsComponent: FC<ParticipantReportsProps> = ({
    fetchReports = getDefaultParticipantHistoryAPIWrapper().fetchReports,
}) => {
    const urlFilters = useMemo(() => getFiltersFromUrl(), []);
    const [subjects, setSubjects] = useState<string[]>(urlFilters.subjects || []);

    // Determine if we're in read-only mode from URL (for shared/bookmarked links)
    const isReadOnly = useMemo(() => {
        return urlFilters.readOnly && (urlFilters.subjects?.length ?? 0) > 0;
    }, [urlFilters]);

    const [filterType, setFilterType] = useState<FilterType>(() => {
        if (isReadOnly) {
            return FILTER_TYPE_URL_PARAMS; // Read-only mode for shared links
        }
        return urlFilters.filterType || FILTER_TYPE_ID_SEARCH;
    });
    const [activeReport, setActiveReport] = useState(urlFilters.activeReport);
    const [filterNotSupportedError, setFilterNotSupportedError] = useState<null | string>(null);
    // In readOnly mode, always show reports immediately
    const [showReport, setShowReport] = useState<boolean>(isReadOnly || (urlFilters.showReport ?? false));
    const [reports, setReports] = useState<ReportConfig[]>([]);
    const [reportsLoading, setReportsLoading] = useState(true);

    // Fetch all visible reports once on mount
    useEffect(() => {
        fetchReports().then(({ reports: loadedReports, error }) => {
            if (error) {
                console.error('Failed to load reports:', error);
            }
            setReports(loadedReports);
            setReportsLoading(false);
        });
    }, [fetchReports]);

    // Look up supportsnonidfilters from cached reports instead of making a separate query
    // Note: Use lowercase 'supportsnonidfilters' to match the database column name
    const activeReportSupportsNonIdFilters = useMemo(() => {
        if (!activeReport || reports.length === 0) return true;
        const report = reports.find(r => r.id === activeReport);
        return report?.supportsnonidfilters ?? true;
    }, [activeReport, reports]);

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

            updateUrlHash(newFilterType, newSubjects, readOnly, shouldShowReport, activeReport);
        },
        [filterType, activeReport]
    );

    const handleTabChange = useCallback(
        (reportId: string) => {
            setActiveReport(reportId);
            // Update URL hash with new activeReport
            updateUrlHash(filterType, subjects, filterType === FILTER_TYPE_URL_PARAMS, showReport, reportId);
        },
        [filterType, subjects, showReport]
    );

    // Auto-switch from aliveAtCenter to all when report doesn't support it
    // Also set the error message when switching
    useEffect(() => {
        if (filterType === FILTER_TYPE_ALIVE_AT_CENTER && !activeReportSupportsNonIdFilters) {
            // Set error message before switching to All Animals mode
            setFilterNotSupportedError('Filter type unsupported for this report. Switched to All Animals.');
            // Automatically switch to All Animals mode
            handleFilterChange(FILTER_TYPE_ALL, undefined, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeReportSupportsNonIdFilters, filterType]);

    // Clear error message when user manually changes filter or when report supports the filter
    useEffect(() => {
        // Only clear error if user has changed to a filter mode that works
        // Don't clear if we just auto-switched to all (that's handled above with clearError=false)
        if (filterType !== FILTER_TYPE_ALL || activeReportSupportsNonIdFilters) {
            // When filter type is not 'all', or when the report supports non-id filters,
            // the error should be cleared (unless it was just set by the auto-switch)
            // We use a check for activeReportSupportsNonIdFilters here
            if (activeReportSupportsNonIdFilters) {
                setFilterNotSupportedError(null);
            }
        }
    }, [filterType, activeReportSupportsNonIdFilters]);

    // Compute effective filter - override to 'all' if aliveAtCenter is not supported
    const effectiveFilterType =
        filterType === FILTER_TYPE_ALIVE_AT_CENTER && !activeReportSupportsNonIdFilters ? FILTER_TYPE_ALL : filterType;

    const filters: ReportFilters = useMemo(
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
            {!isReadOnly && (
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={activeReportSupportsNonIdFilters}
                    initialFilterType={filterType}
                    initialSubjects={subjects}
                    onFilterChange={handleFilterChange}
                />
            )}
            {filterNotSupportedError && (
                <div className="filter-not-supported-error" role="alert">
                    {filterNotSupportedError}
                </div>
            )}
            <TabbedReportPanel
                activeReport={activeReport}
                filters={filters}
                onTabChange={handleTabChange}
                reports={reportsLoading ? undefined : reports}
                showReport={showReport}
            />
        </div>
    );
};

ParticipantReportsComponent.displayName = 'ParticipantReports';

export const ParticipantReports = memo(ParticipantReportsComponent);
