import React, { FC, memo, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { incrementClientSideMetricCount } from '@labkey/components';

import { IdResolutionFeedback } from './IdResolutionFeedback';
import { getDefaultParticipantHistoryAPIWrapper } from '../APIWrapper';
import {
    FILTER_TYPE_ALIVE_AT_CENTER,
    FILTER_TYPE_ALL,
    FILTER_TYPE_ID_SEARCH,
    FILTER_TYPE_URL_PARAMS,
    FilterType,
    IdResolutionResult,
    ResolveIdsParams,
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

interface SearchByIdPanelProps {
    activeReportSupportsNonIdFilters: boolean;
    initialFilterType: FilterType;
    initialSubjects: string[];
    onFilterChange: (filterType: FilterType, subjects: string[] | undefined) => void;
    resolveAnimalIds?: (params: ResolveIdsParams) => Promise<IdResolutionResult>;
}

const SearchByIdPanelComponent: FC<SearchByIdPanelProps> = ({
    onFilterChange,
    initialSubjects,
    initialFilterType,
    activeReportSupportsNonIdFilters,
    resolveAnimalIds = getDefaultParticipantHistoryAPIWrapper().resolveAnimalIds,
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

    useEffect(() => {
        setFilterType(initialFilterType);
    }, [initialFilterType]);

    useEffect(() => {
        if (hasUserTyped) {
            const parsedIds = parseIds(inputValue);
            const error = validateInput(parsedIds);
            setValidationError(error);
        }
    }, [inputValue, hasUserTyped]);

    const handleUpdateReport = useCallback(async () => {
        setFilterType(FILTER_TYPE_ID_SEARCH);
        const parsedIds = parseIds(inputValue);

        const error = validateInput(parsedIds);
        if (error) {
            setValidationError(error);
            setHasUserTyped(true);
            onFilterChange(FILTER_TYPE_ID_SEARCH, []);
            return;
        }

        setIsResolving(true);
        const result = await resolveAnimalIds({ inputIds: parsedIds });
        setIsResolving(false);

        if (result.error) {
            setValidationError('Failed to resolve animal IDs. Please try again.');
            onFilterChange(FILTER_TYPE_ID_SEARCH, []);
            return;
        }

        setResolutionResult(result);
        const resolvedSubjects = result.resolved.map(r => r.resolvedId);
        incrementClientSideMetricCount('ehrParticipantHistoryFilter', FILTER_TYPE_ID_SEARCH);
        onFilterChange(FILTER_TYPE_ID_SEARCH, resolvedSubjects);
    }, [inputValue, onFilterChange, resolveAnimalIds]);

    const handleFilterModeChange = useCallback(
        (newFilterType: FilterType) => {
            setFilterType(newFilterType);
            incrementClientSideMetricCount('ehrParticipantHistoryFilter', newFilterType);
            setInputValue('');
            setResolutionResult({ resolved: [], notFound: [] });
            setValidationError(undefined);
            setHasUserTyped(false);
            onFilterChange(newFilterType, undefined);
        },
        [onFilterChange]
    );

    const handleModifySearch = useCallback(() => {
        setFilterType(FILTER_TYPE_ID_SEARCH);
        setInputValue(initialSubjects.join(','));
        onFilterChange(FILTER_TYPE_ID_SEARCH, initialSubjects);
    }, [initialSubjects, onFilterChange]);

    const isResolutionFeedbackVisible =
        resolutionResult.resolved.some(r => r.resolvedBy === 'alias') || resolutionResult.notFound.length > 0;

    if (filterType === FILTER_TYPE_URL_PARAMS) {
        return (
            <div className="search-by-id-panel search-by-id-panel--url-params">
                <div className="search-by-id-panel__summary">
                    Viewing {initialSubjects.length} animal(s): {initialSubjects.join(', ')}
                </div>
                <button className="search-by-id-panel__modify-button" onClick={handleModifySearch}>
                    Modify Search
                </button>
            </div>
        );
    }

    return (
        <div className="search-by-id-panel">
            <div className="search-by-id-panel__container">
                <label className="search-by-id-panel__label" htmlFor="animal-id-input">
                    Enter Animal IDs or Aliases (separated by newline, comma, semicolon, or tab)
                </label>
                <textarea
                    className="search-by-id-panel__input"
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
                    <div className="search-by-id-panel__validation-error" role="alert">
                        {validationError}
                    </div>
                )}

                <div className="search-by-id-panel__buttons">
                    <button
                        className={classNames('search-by-id-panel__search-button', {
                            'search-by-id-panel__search-button--active':
                                !isResolving && filterType === FILTER_TYPE_ID_SEARCH,
                            'search-by-id-panel__search-button--inactive':
                                !isResolving && filterType !== FILTER_TYPE_ID_SEARCH,
                        })}
                        disabled={isResolving}
                        onClick={handleUpdateReport}
                    >
                        Search By Ids
                    </button>
                    <button
                        className={classNames('search-by-id-panel__filter-button', {
                            'search-by-id-panel__filter-button--active': filterType === FILTER_TYPE_ALL,
                            'search-by-id-panel__filter-button--inactive': filterType !== FILTER_TYPE_ALL,
                        })}
                        onClick={() => handleFilterModeChange(FILTER_TYPE_ALL)}
                    >
                        All Animals
                    </button>
                    <button
                        className={classNames(
                            'search-by-id-panel__filter-button',
                            'search-by-id-panel__filter-button--alive-at-center',
                            {
                                'search-by-id-panel__filter-button--active': filterType === FILTER_TYPE_ALIVE_AT_CENTER,
                                'search-by-id-panel__filter-button--inactive':
                                    filterType !== FILTER_TYPE_ALIVE_AT_CENTER,
                            }
                        )}
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

SearchByIdPanelComponent.displayName = 'SearchByIdPanel';

export const SearchByIdPanel = memo(SearchByIdPanelComponent);
