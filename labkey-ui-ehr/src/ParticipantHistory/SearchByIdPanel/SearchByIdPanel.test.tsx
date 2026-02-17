import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { parseIds, SearchByIdPanel, validateInput } from './SearchByIdPanel';
import {
    FILTER_TYPE_ALIVE_AT_CENTER,
    FILTER_TYPE_ALL,
    FILTER_TYPE_ID_SEARCH,
    FILTER_TYPE_URL_PARAMS,
    IdResolutionResult,
    ResolveIdsParams,
} from '../models';

const mockResolveAnimalIds = jest.fn<Promise<IdResolutionResult>, [ResolveIdsParams]>();

describe('parseIds utility function', () => {
    test.each([
        { name: 'newline', separator: '\n' },
        { name: 'comma', separator: ',' },
        { name: 'tab', separator: '\t' },
        { name: 'semicolon', separator: ';' },
    ])('parses IDs with $name separators', ({ separator }) => {
        // Act
        const result = parseIds(`ID1${separator}ID2${separator}ID3`);

        // Assert - IDs are split on the given separator
        expect(result).toEqual(['ID1', 'ID2', 'ID3']);
    });

    test('parses IDs with mixed separators', () => {
        // Act
        const result = parseIds('ID1,ID2\nID3;ID4\tID5');

        // Assert - IDs are split on any supported separator
        expect(result).toEqual(['ID1', 'ID2', 'ID3', 'ID4', 'ID5']);
    });

    test('trims whitespace from IDs', () => {
        // Act
        const result = parseIds('  ID1  ,  ID2  \n  ID3  ');

        // Assert - leading and trailing whitespace is removed from each ID
        expect(result).toEqual(['ID1', 'ID2', 'ID3']);
    });

    test('filters out empty strings', () => {
        // Act
        const result = parseIds('ID1,,ID2\n\nID3');

        // Assert - consecutive separators do not produce empty entries
        expect(result).toEqual(['ID1', 'ID2', 'ID3']);
    });

    test('de-duplicates IDs (case-insensitive)', () => {
        // Act
        const result = parseIds('ID1,id1,ID2,Id2');

        // Assert - duplicate IDs are removed regardless of casing
        expect(result).toEqual(['ID1', 'ID2']);
    });

    test('preserves original casing of first occurrence', () => {
        // Act
        const result = parseIds('id1,ID1,Id2,ID2');

        // Assert - first occurrence casing is kept when deduplicating
        expect(result).toEqual(['id1', 'Id2']);
    });

    test('handles empty input', () => {
        // Act
        const result = parseIds('');

        // Assert - empty string produces empty array
        expect(result).toEqual([]);
    });

    test('handles whitespace-only input', () => {
        // Act
        const result = parseIds('   \n\t  ');

        // Assert - whitespace-only input produces empty array
        expect(result).toEqual([]);
    });

    test('handles special characters in IDs', () => {
        // Act
        const result = parseIds('ID-123,ID_456,ID@789');

        // Assert - special characters within IDs are preserved
        expect(result).toEqual(['ID-123', 'ID_456', 'ID@789']);
    });

    test('handles IDs with spaces', () => {
        // Act
        const result = parseIds('ID 123,ID 456');

        // Assert - internal spaces within IDs are preserved
        expect(result).toEqual(['ID 123', 'ID 456']);
    });
});

describe('validateInput utility function', () => {
    test.each([1, 100])('returns undefined for valid input with %i ID(s)', count => {
        // Arrange
        const ids = Array.from({ length: count }, (_, i) => `ID${i}`);

        // Act
        const result = validateInput(ids);

        // Assert - within-limit ID count passes validation
        expect(result).toBeUndefined();
    });

    test('returns error for empty array', () => {
        // Act
        const result = validateInput([]);

        // Assert - empty input returns minimum ID error message
        expect(result).toBe('Please enter at least one animal ID.');
    });

    test.each([101, 150])('returns error for %i IDs', count => {
        // Arrange
        const ids = Array.from({ length: count }, (_, i) => `ID${i}`);

        // Act
        const result = validateInput(ids);

        // Assert - exceeding 100 IDs returns maximum limit error with actual count
        expect(result).toBe(`Maximum of 100 animal IDs allowed. You entered ${count} IDs.`);
    });
});

describe('SearchByIdPanel', () => {
    const mockOnFilterChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockResolveAnimalIds.mockResolvedValue({
            resolved: [],
            notFound: [],
        });
    });

    describe('ID parsing', () => {
        test('parses IDs with mixed separators', async () => {
            // Arrange
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });
            fireEvent.change(textarea, { target: { value: 'ID1,ID2\nID3;ID4\tID5' } });
            mockResolveAnimalIds.mockResolvedValue({
                resolved: [
                    { inputId: 'ID1', resolvedId: 'ID1', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID2', resolvedId: 'ID2', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID3', resolvedId: 'ID3', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID4', resolvedId: 'ID4', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID5', resolvedId: 'ID5', resolvedBy: 'direct', aliasType: null },
                ],
                notFound: [],
            });

            // Act
            fireEvent.click(updateButton);

            // Assert - IDs split across different separator types are all parsed correctly
            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalledWith({
                    inputIds: ['ID1', 'ID2', 'ID3', 'ID4', 'ID5'],
                });
            });
            await waitFor(() => {
                expect(mockOnFilterChange).toHaveBeenCalledWith(FILTER_TYPE_ID_SEARCH, [
                    'ID1',
                    'ID2',
                    'ID3',
                    'ID4',
                    'ID5',
                ]);
            });
        });

        test('de-duplicates IDs across different separators', async () => {
            // Arrange
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });
            fireEvent.change(textarea, { target: { value: 'ID123,ID456\nID123;ID456' } });
            mockResolveAnimalIds.mockResolvedValue({
                resolved: [
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                ],
                notFound: [],
            });

            // Act
            fireEvent.click(updateButton);

            // Assert - duplicate IDs across separators are resolved to unique set
            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalledWith({
                    inputIds: ['ID123', 'ID456'],
                });
            });
            await waitFor(() => {
                expect(mockOnFilterChange).toHaveBeenCalledWith(FILTER_TYPE_ID_SEARCH, ['ID123', 'ID456']);
            });
        });
    });

    describe('validation', () => {
        test('shows validation error when input is empty', () => {
            // Arrange
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            // Act
            fireEvent.click(updateButton);

            // Assert - empty input shows validation error and prevents resolution
            expect(screen.getByText(/please enter at least one animal id/i)).toBeVisible();
            expect(mockResolveAnimalIds).not.toHaveBeenCalled();
            expect(mockOnFilterChange).toHaveBeenCalledWith(FILTER_TYPE_ID_SEARCH, []);
        });

        test('treats whitespace-only input as empty', () => {
            // Arrange
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });
            fireEvent.change(textarea, { target: { value: '   \n\t  ' } });

            // Act
            fireEvent.click(updateButton);

            // Assert - whitespace-only input triggers empty validation error
            expect(screen.getByText(/please enter at least one animal id/i)).toBeVisible();
            expect(mockResolveAnimalIds).not.toHaveBeenCalled();
            expect(mockOnFilterChange).toHaveBeenCalledWith(FILTER_TYPE_ID_SEARCH, []);
        });

        test('allows exactly 100 IDs without validation error', async () => {
            // Arrange
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });
            const ids = Array.from({ length: 100 }, (_, i) => `ID${i}`).join(',');
            fireEvent.change(textarea, { target: { value: ids } });

            // Assert - no validation error shown for exactly 100 IDs
            expect(screen.queryByText(/maximum of 100 animal ids/i)).not.toBeInTheDocument();

            // Arrange
            mockResolveAnimalIds.mockResolvedValue({
                resolved: Array.from({ length: 100 }, (_, i) => ({
                    inputId: `ID${i}`,
                    resolvedId: `ID${i}`,
                    resolvedBy: 'direct' as const,
                    aliasType: null,
                })),
                notFound: [],
            });

            // Act
            fireEvent.click(updateButton);

            // Assert - resolution proceeds with all 100 IDs
            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalled();
            });
            const expectedIds = Array.from({ length: 100 }, (_, i) => `ID${i}`);
            await waitFor(() => {
                expect(mockOnFilterChange).toHaveBeenCalledWith(FILTER_TYPE_ID_SEARCH, expectedIds);
            });
        });

        test('shows validation error when more than 100 IDs entered', () => {
            // Arrange
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');
            const ids = Array.from({ length: 101 }, (_, i) => `ID${i}`).join(',');

            // Act
            fireEvent.change(textarea, { target: { value: ids } });

            // Assert - exceeding 100 IDs shows validation error with count
            expect(screen.getByText(/maximum of 100 animal ids allowed\. you entered 101 ids/i)).toBeVisible();
        });

        test('button remains enabled when validation fails', () => {
            // Arrange
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });
            const ids = Array.from({ length: 101 }, (_, i) => `ID${i}`).join(',');

            // Act - enter more than 100 IDs
            fireEvent.change(textarea, { target: { value: ids } });

            // Assert - validation error is shown
            expect(screen.getByText(/maximum of 100 animal ids/i)).toBeVisible();

            // Assert - button remains enabled despite validation error
            expect(updateButton).not.toBeDisabled();

            // Act - click button with validation error present
            fireEvent.click(updateButton);

            // Assert - filter is set to empty and resolution is skipped
            expect(mockOnFilterChange).toHaveBeenCalledWith(FILTER_TYPE_ID_SEARCH, []);
            expect(mockResolveAnimalIds).not.toHaveBeenCalled();
        });

        test('clears validation error when IDs reduced below limit', () => {
            // Arrange
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');

            // Act - enter 101 IDs to trigger validation error
            const ids101 = Array.from({ length: 101 }, (_, i) => `ID${i}`).join(',');
            fireEvent.change(textarea, { target: { value: ids101 } });

            // Assert - validation error appears
            expect(screen.getByText(/maximum of 100 animal ids/i)).toBeVisible();

            // Act - reduce to 100 IDs
            const ids100 = Array.from({ length: 100 }, (_, i) => `ID${i}`).join(',');
            fireEvent.change(textarea, { target: { value: ids100 } });

            // Assert - validation error is cleared
            expect(screen.queryByText(/maximum of 100 animal ids/i)).not.toBeInTheDocument();
        });
    });

    describe('filter mode toggles', () => {
        test('filter buttons visible in all modes except URL Params', () => {
            // Arrange
            const { rerender } = render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );

            // Assert - Search by IDs and All Animals buttons are visible in ID Search mode
            expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /all animals/i })).toBeInTheDocument();

            // Act - switch to all animals mode
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ALL}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );

            // Assert - Search by IDs and All Animals buttons remain visible in all animals mode
            expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /all animals/i })).toBeInTheDocument();

            // Act - switch to all alive at center mode
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ALIVE_AT_CENTER}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );

            // Assert - Search by IDs and All Alive at Center buttons are visible in all alive at center mode
            expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /all alive at center/i })).toBeInTheDocument();

            // Act - switch to URL Params mode
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_URL_PARAMS}
                    initialSubjects={['ID123']}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );

            // Assert - Search by IDs and All Animals buttons are hidden in URL Params mode
            expect(screen.queryByRole('button', { name: /search by ids/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /all animals/i })).not.toBeInTheDocument();
        });

        test('switches between filter modes', () => {
            // Arrange
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const allRecordsButton = screen.getByRole('button', { name: /all animals/i });

            // Act
            fireEvent.click(allRecordsButton);

            // Assert - clicking all animals button triggers filter change
            expect(mockOnFilterChange).toHaveBeenCalledWith(FILTER_TYPE_ALL, undefined);
        });

        test('search by ids button sets filter mode even with validation error', () => {
            // Arrange
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );

            // Act - switch to All Animals mode
            const allAnimalsButton = screen.getByRole('button', { name: /all animals/i });
            fireEvent.click(allAnimalsButton);

            // Assert - All Animals is active
            expect(allAnimalsButton).toHaveClass('search-by-id-panel__filter-button--active');

            // Act - click Search By Ids with no input
            const searchByIdsButton = screen.getByRole('button', { name: /search by ids/i });
            fireEvent.click(searchByIdsButton);

            // Assert - validation error appears and search mode becomes active
            expect(screen.getByRole('alert')).toHaveTextContent('Please enter at least one animal ID');
            expect(searchByIdsButton).toHaveClass('search-by-id-panel__search-button--active');
            expect(allAnimalsButton).toHaveClass('search-by-id-panel__filter-button--inactive');
        });

        test.each([
            {
                buttonPattern: /all animals/i,
                filterType: 'All Animals',
                expectedFilterType: FILTER_TYPE_ALL,
            },
            {
                buttonPattern: /all alive at center/i,
                filterType: 'All Alive at Center',
                expectedFilterType: FILTER_TYPE_ALIVE_AT_CENTER,
            },
        ])('clears input when switching to $filterType mode', ({ buttonPattern, expectedFilterType }) => {
            // Arrange
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');
            fireEvent.change(textarea, { target: { value: 'ID123,ID456' } });

            // Act
            const filterButton = screen.getByRole('button', { name: buttonPattern });
            fireEvent.click(filterButton);

            // Assert - input is cleared and filter change is triggered
            expect(textarea).toHaveValue('');
            expect(mockOnFilterChange).toHaveBeenCalledWith(expectedFilterType, undefined);
        });

        test.each([
            { buttonPattern: /all animals/i, filterType: 'All Animals' },
            { buttonPattern: /all alive at center/i, filterType: 'All Alive at Center' },
        ])('clears validation error when switching to $filterType mode', ({ buttonPattern }) => {
            // Arrange
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');
            const manyIds = Array.from({ length: 101 }, (_, i) => `ID${i + 1}`).join(',');
            fireEvent.change(textarea, { target: { value: manyIds } });
            expect(screen.getByRole('alert')).toHaveTextContent('Maximum of 100 animal IDs allowed');

            // Act
            const filterButton = screen.getByRole('button', { name: buttonPattern });
            fireEvent.click(filterButton);

            // Assert - validation error is cleared and input is emptied
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(textarea).toHaveValue('');
        });
    });

    describe('textarea and button visibility', () => {
        test('textarea and search by ids button always visible in non-URL modes', () => {
            // Arrange
            const { rerender } = render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );

            // Assert - textarea and search button visible in ID Search mode
            expect(screen.getByRole('textbox')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();

            // Act - switch to all animals mode
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ALL}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );

            // Assert - textarea and search button still visible in all animals mode
            expect(screen.getByRole('textbox')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();

            // Act - switch to all alive at center mode
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ALIVE_AT_CENTER}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );

            // Assert - textarea and search button still visible in all alive at center mode
            expect(screen.getByRole('textbox')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();

            // Act - switch to URL Params mode
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_URL_PARAMS}
                    initialSubjects={['ID123']}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );

            // Assert - textarea and search button hidden in URL Params mode
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /search by ids/i })).not.toBeInTheDocument();
        });

        test('shows loading state while resolving IDs', async () => {
            // Arrange
            let resolvePromise: (value: IdResolutionResult) => void;
            const slowPromise = new Promise<IdResolutionResult>(resolve => {
                resolvePromise = resolve;
            });
            mockResolveAnimalIds.mockReturnValue(slowPromise);
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });
            fireEvent.change(textarea, { target: { value: 'ID123' } });

            // Act
            fireEvent.click(updateButton);

            // Assert - button is disabled while loading
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /search by ids/i })).toBeDisabled();
            });

            // Act - resolve the promise
            resolvePromise!({
                resolved: [{ inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null }],
                notFound: [],
            });

            // Assert - button is re-enabled after loading completes
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /search by ids/i })).toBeEnabled();
            });
        });
    });

    describe('resolution feedback visibility', () => {
        test('resolution feedback always visible when there are aliases or not-found IDs', async () => {
            // Arrange
            mockResolveAnimalIds.mockResolvedValue({
                resolved: [{ inputId: 'alias1', resolvedId: 'ID123', resolvedBy: 'alias', aliasType: 'tattoo' }],
                notFound: ['notfound1'],
            });
            const { rerender } = render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });
            fireEvent.change(textarea, { target: { value: 'alias1,notfound1' } });

            // Act
            fireEvent.click(updateButton);

            // Assert - resolution feedback is visible after resolution
            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalled();
            });
            await waitFor(() => {
                expect(screen.getByText(/id resolution/i)).toBeInTheDocument();
            });

            // Act - switch to all animals mode
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ALL}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );

            // Assert - resolution feedback persists in all animals mode
            expect(screen.getByText(/id resolution/i)).toBeInTheDocument();

            // Act - switch to all alive at center mode
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ALIVE_AT_CENTER}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );

            // Assert - resolution feedback persists in all alive at center mode
            expect(screen.getByText(/id resolution/i)).toBeInTheDocument();
        });

        test('shows resolution feedback when aliases are resolved', async () => {
            // Arrange
            mockResolveAnimalIds.mockResolvedValue({
                resolved: [
                    { inputId: 'alias1', resolvedId: 'ID123', resolvedBy: 'alias', aliasType: 'tattoo' },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                ],
                notFound: [],
            });
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });
            fireEvent.change(textarea, { target: { value: 'alias1,ID456' } });

            // Act
            fireEvent.click(updateButton);

            // Assert - alias resolution details are displayed with arrow and type
            await waitFor(() => {
                expect(screen.getByText(/id resolution/i)).toBeInTheDocument();
            });
            expect(screen.getByText('alias1')).toBeInTheDocument();
            expect(screen.getByText('→')).toBeInTheDocument();
            expect(screen.getByText('ID123')).toBeInTheDocument();
            expect(screen.getByText('(tattoo)')).toBeInTheDocument();
            expect(screen.getByText(/Resolved \(2\)/)).toBeInTheDocument();
        });

        test('shows resolution feedback when IDs are not found', async () => {
            // Arrange
            mockResolveAnimalIds.mockResolvedValue({
                resolved: [{ inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null }],
                notFound: ['notfound1', 'notfound2'],
            });
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });
            fireEvent.change(textarea, { target: { value: 'ID123,notfound1,notfound2' } });

            // Act
            fireEvent.click(updateButton);

            // Assert - not-found IDs are displayed with count
            await waitFor(() => {
                expect(screen.getByText(/id resolution/i)).toBeInTheDocument();
            });
            expect(screen.getByText('notfound1')).toBeInTheDocument();
            expect(screen.getByText('notfound2')).toBeInTheDocument();
            expect(screen.getByText(/Not Found \(2\)/)).toBeInTheDocument();
        });

        test('hides resolution feedback when all IDs resolve directly', async () => {
            // Arrange
            mockResolveAnimalIds.mockResolvedValue({
                resolved: [
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                ],
                notFound: [],
            });
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });
            fireEvent.change(textarea, { target: { value: 'ID123,ID456' } });

            // Act
            fireEvent.click(updateButton);

            // Assert - no resolution feedback shown when all IDs resolve directly
            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalled();
            });
            expect(screen.queryByText(/id resolution/i)).not.toBeInTheDocument();
        });
    });

    describe('URL Params mode (read-only)', () => {
        test('shows read-only summary in URL Params mode', () => {
            // Act - render panel in URL Params mode
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_URL_PARAMS}
                    initialSubjects={['ID123', 'ID456', 'ID789']}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );

            // Assert - read-only summary shows count and lists all subject IDs
            expect(screen.getByText(/viewing 3 animal\(s\)/i)).toBeVisible();
            expect(screen.getByText(/ID123/)).toBeVisible();
            expect(screen.getByText(/ID456/)).toBeVisible();
            expect(screen.getByText(/ID789/)).toBeVisible();
        });

        test('Modify Search button switches to ID Search mode with subjects pre-populated', () => {
            // Arrange
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_URL_PARAMS}
                    initialSubjects={['ID123', 'ID456']}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const modifyButton = screen.getByRole('button', { name: /modify search/i });

            // Act
            fireEvent.click(modifyButton);

            // Assert - filter changes to ID Search with existing subjects
            expect(mockOnFilterChange).toHaveBeenCalledWith(FILTER_TYPE_ID_SEARCH, ['ID123', 'ID456']);
        });
    });

    describe('component behavior with initialSubjects prop', () => {
        test('pre-populates textarea when transitioning from URL Params to ID Search', () => {
            // Arrange
            const { rerender } = render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_URL_PARAMS}
                    initialSubjects={['ID123', 'ID456']}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );

            // Act - switch to ID Search mode
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={['ID123', 'ID456']}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );

            // Assert - textarea is pre-populated with the initial subjects
            const textarea = screen.getByRole('textbox');
            expect(textarea).toHaveValue('ID123,ID456');
        });
    });

    describe('accessibility', () => {
        test('textarea has accessible label', () => {
            // Act - render panel
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );

            // Assert - textarea has an accessible name for screen readers
            const textarea = screen.getByRole('textbox');
            expect(textarea).toHaveAccessibleName();
        });

        test('all alive at center button exposes disabled semantics and helper title when unsupported', () => {
            // Act - render panel with non-ID filters unsupported
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={false}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );

            // Assert - disabled control has accessible name and explanatory title when unsupported
            const aliveAtCenterButton = screen.getByRole('button', { name: /all alive at center/i });
            expect(aliveAtCenterButton).toBeDisabled();
            expect(aliveAtCenterButton).toHaveAttribute('title', 'This filter type is not supported for this report');
        });

        test('validation errors have role="alert" for screen readers', () => {
            // Arrange
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');
            const ids = Array.from({ length: 101 }, (_, i) => `ID${i}`).join(',');

            // Act
            fireEvent.change(textarea, { target: { value: ids } });

            // Assert - validation error uses alert role for screen reader announcement
            const alert = screen.getByRole('alert');
            expect(alert).toBeInTheDocument();
            expect(alert).toHaveTextContent(/maximum of 100 animal ids/i);
        });

        test('keyboard navigation works correctly', async () => {
            // Arrange
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            // Act & Assert - tab navigates to textarea first
            await userEvent.tab();
            expect(textarea).toHaveFocus();

            // Act - type IDs into focused textarea
            await userEvent.keyboard('ID123');

            // Act & Assert - tab navigates to search by ids button
            await userEvent.tab();
            expect(updateButton).toHaveFocus();

            // Act - tab through remaining filter buttons
            await userEvent.tab(); // all animals button
            // Assert - focus moves to all animals button
            expect(screen.getByRole('button', { name: /all animals/i })).toHaveFocus();

            await userEvent.tab(); // all alive at center button
            // Assert - focus moves to all alive at center button
            expect(screen.getByRole('button', { name: /all alive at center/i })).toHaveFocus();
        });
    });

    describe('security - SQL injection protection', () => {
        test('treats IDs with SQL injection patterns as literal strings', async () => {
            // Arrange
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType={FILTER_TYPE_ID_SEARCH}
                    initialSubjects={[]}
                    onFilterChange={mockOnFilterChange}
                    resolveAnimalIds={mockResolveAnimalIds}
                />
            );
            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });
            // Note: Semicolons are treated as separators, so this input will be split
            const maliciousInput = "'; DROP TABLE--;,ID123' OR '1'='1";
            fireEvent.change(textarea, { target: { value: maliciousInput } });
            mockResolveAnimalIds.mockResolvedValue({
                resolved: [],
                notFound: ["'", 'DROP TABLE--', "ID123' OR '1'='1"],
            });

            // Act
            fireEvent.click(updateButton);

            // Assert - SQL injection patterns are treated as literal ID strings
            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalledWith({
                    inputIds: ["'", 'DROP TABLE--', "ID123' OR '1'='1"],
                });
            });
        });
    });
});
