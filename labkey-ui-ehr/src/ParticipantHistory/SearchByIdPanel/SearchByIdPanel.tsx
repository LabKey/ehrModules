import React, { FC, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { incrementClientSideMetricCount } from '@labkey/components';

import { IdResolutionFeedback } from './IdResolutionFeedback';
import { resolveAnimalIds } from '../services/idResolutionService';
import {
    FILTER_TYPE_ALIVE_AT_CENTER,
    FILTER_TYPE_ALL,
    FILTER_TYPE_ID_SEARCH,
    FILTER_TYPE_URL_PARAMS,
    FilterType,
    IdResolutionResult,
} from '../models';

/**
 * Parse IDs from input string (split by newline, tab, comma, semicolon)
 * Returns de-duplicated array of trimmed IDs (case-insensitive matching)
 * @internal - Exported for testing
 */
export const parseIds = (input: string): string[] => {
    // Split by newline, tab, comma, or semicolon
    const rawIds = input.split(/[\n\t,;]+/);

    // Trim whitespace and filter out empty strings
    const trimmedIds = rawIds.map(id => id.trim()).filter(id => id.length > 0);

    // De-duplicate (case-insensitive) while preserving original casing
    const seenLower = new Set<string>();
    const uniqueIds: string[] = [];

    trimmedIds.forEach(id => {
        const lowerCase = id.toLowerCase();
        if (!seenLower.has(lowerCase)) {
            seenLower.add(lowerCase);
            uniqueIds.push(id);
        }
    });

    return uniqueIds;
};

/**
 * Validate input IDs (check for empty, check 100 ID limit)
 * Returns undefined if valid, error message string if invalid
 * @internal - Exported for testing
 */
export const validateInput = (ids: string[]): string | undefined => {
    if (ids.length === 0) {
        return 'Please enter at least one animal ID.';
    }

    if (ids.length > 100) {
        return `Maximum of 100 animal IDs allowed. You entered ${ids.length} IDs.`;
    }

    return undefined;
};

/**
 * Search By Id Panel Component
 *
 * Provides UI for searching animals by ID with three filter modes:
 * - ID Search: Enter single or multiple animal IDs (max 100)
 * - All Records: View all animals (no filters)
 * - Alive at Center: View only animals with calculated_status = 'Alive'
 * - URL Params: Read-only view for shared/bookmarked links
 *
 * Features:
 * - Multi-separator parsing (newlines, tabs, commas, semicolons)
 * - Alias resolution (tattoos, chip numbers, etc.)
 * - Case-insensitive matching
 * - 100 ID limit validation
 * - ID Resolution feedback for aliases and not-found IDs
 */

export interface SearchByIdPanelProps {
    activeReportSupportsNonIdFilters: boolean;
    initialFilterType: FilterType;
    initialSubjects: string[];
    onFilterChange: (filterType: FilterType, subjects: string[] | undefined) => void;
}

export const SearchByIdPanel: FC<SearchByIdPanelProps> = ({
    onFilterChange,
    initialSubjects,
    initialFilterType,
    activeReportSupportsNonIdFilters,
}) => {
    const [inputValue, setInputValue] = useState<string>(initialSubjects.join(','));
    const [filterType, setFilterType] = useState<FilterType>(initialFilterType);
    const [isResolving, setIsResolving] = useState<boolean>(false);
    const [resolutionResult, setResolutionResult] = useState<IdResolutionResult>({
        resolved: [],
        notFound: [],
    });
    const [validationError, setValidationError] = useState<string | undefined>(undefined);
    const [hasUserTyped, setHasUserTyped] = useState<boolean>(false);

    // Sync filterType with initialFilterType prop changes
    useEffect(() => {
        setFilterType(initialFilterType);
    }, [initialFilterType]);

    // Validate input whenever it changes (but only after user has typed)
    useEffect(() => {
        if (hasUserTyped) {
            const parsedIds = parseIds(inputValue);
            const error = validateInput(parsedIds);
            setValidationError(error);
        }
    }, [inputValue, hasUserTyped]);

    // Handle Update Report button click
    const handleUpdateReport = useCallback(async () => {
        // Set filter mode to ID Search
        setFilterType(FILTER_TYPE_ID_SEARCH);

        // Parse IDs from input
        const parsedIds = parseIds(inputValue);

        // Validate input (in case user clicked without typing)
        const error = validateInput(parsedIds);
        if (error) {
            setValidationError(error);
            setHasUserTyped(true); // Show validation errors now
            // Call onFilterChange with empty array to show no records in reports
            onFilterChange(FILTER_TYPE_ID_SEARCH, []);
            return; // Stop if validation fails
        }

        // Call resolveAnimalIds service
        setIsResolving(true);
        try {
            const result = await resolveAnimalIds({ inputIds: parsedIds });

            // Update resolutionResult state
            setResolutionResult(result);

            // Extract resolved subject IDs
            const resolvedSubjects = result.resolved.map(r => r.resolvedId);

            // Track ID search metric
            incrementClientSideMetricCount('ehrParticipantHistoryFilter', FILTER_TYPE_ID_SEARCH);

            // Call onFilterChange with resolved subject IDs
            onFilterChange(FILTER_TYPE_ID_SEARCH, resolvedSubjects);
        } catch (error) {
            // Handle error
            console.error('Failed to resolve animal IDs:', error);
            setValidationError('Failed to resolve animal IDs. Please try again.');
            // Call onFilterChange with empty array to show no records in reports when error occurs
            onFilterChange(FILTER_TYPE_ID_SEARCH, []);
        } finally {
            setIsResolving(false);
        }
    }, [inputValue, onFilterChange]);

    // Handle filter mode button clicks
    const handleFilterModeChange = useCallback(
        (newFilterType: FilterType) => {
            setFilterType(newFilterType);

            // Track filter metric
            incrementClientSideMetricCount('ehrParticipantHistoryFilter', newFilterType);

            // Clear input when switching to non-ID modes
            setInputValue('');
            setResolutionResult({ resolved: [], notFound: [] });
            setValidationError(undefined);
            setHasUserTyped(false);

            onFilterChange(newFilterType, undefined);
        },
        [onFilterChange]
    );

    // Handle Modify Search button (URL Params mode)
    const handleModifySearch = useCallback(() => {
        setFilterType(FILTER_TYPE_ID_SEARCH);
        setInputValue(initialSubjects.join(','));
        onFilterChange(FILTER_TYPE_ID_SEARCH, initialSubjects);
    }, [initialSubjects, onFilterChange]);

    // Determine if resolution feedback should be visible
    const isResolutionFeedbackVisible =
        resolutionResult.resolved.some(r => r.resolvedBy === 'alias') || resolutionResult.notFound.length > 0;

    if (filterType === FILTER_TYPE_URL_PARAMS) {
        return (
            <div className="search-by-id-panel url-params-mode">
                <div className="url-params-summary">
                    Viewing {initialSubjects.length} animal(s): {initialSubjects.join(', ')}
                </div>
                <button className="modify-button" onClick={handleModifySearch}>
                    Modify Search
                </button>
            </div>
        );
    }

    return (
        <div className="search-by-id-panel">
            <div className="panel-container">
                <label className="label-text" htmlFor="animal-id-input">
                    Enter Animal IDs or Aliases (separated by newline, comma, semicolon, or tab)
                </label>
                <textarea
                    className="animal-id-input"
                    id="animal-id-input"
                    onChange={e => {
                        setInputValue(e.target.value);
                        setHasUserTyped(true);
                    }}
                    placeholder="Enter one or more animal IDs"
                    rows={5}
                    value={inputValue}
                />

                {validationError && (
                    <div className="validation-error" role="alert">
                        {validationError}
                    </div>
                )}

                <div className="button-container">
                    <button
                        className={classNames('search-button', {
                            active: !isResolving && filterType === FILTER_TYPE_ID_SEARCH,
                            inactive: !isResolving && filterType !== FILTER_TYPE_ID_SEARCH,
                        })}
                        disabled={isResolving}
                        onClick={handleUpdateReport}
                    >
                        {isResolving ? 'Searching...' : 'Search By Ids'}
                    </button>
                    <button
                        className={`filter-button all-animals ${filterType === FILTER_TYPE_ALL ? 'active' : 'inactive'}`}
                        onClick={() => handleFilterModeChange(FILTER_TYPE_ALL)}
                    >
                        All Animals
                    </button>
                    <button
                        className={`filter-button alive-at-center ${filterType === FILTER_TYPE_ALIVE_AT_CENTER ? 'active' : 'inactive'}`}
                        disabled={!activeReportSupportsNonIdFilters}
                        onClick={() => handleFilterModeChange(FILTER_TYPE_ALIVE_AT_CENTER)}
                        title={
                            !activeReportSupportsNonIdFilters
                                ? 'This filter type is not supported for this report'
                                : undefined
                        }
                    >
                        All Alive at Center
                    </button>
                </div>
            </div>

            {isResolutionFeedbackVisible && <IdResolutionFeedback resolutionResult={resolutionResult} />}
        </div>
    );
};
