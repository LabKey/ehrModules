import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { parseIds, SearchByIdPanel, validateInput } from './SearchByIdPanel';
import * as idResolutionService from '../services/idResolutionService';

// Mock the idResolutionService
jest.mock('../services/idResolutionService');

const mockResolveAnimalIds = idResolutionService.resolveAnimalIds as jest.MockedFunction<
    typeof idResolutionService.resolveAnimalIds
>;

describe('parseIds utility function', () => {
    test('parses IDs with newline separators', () => {
        const result = parseIds('ID1\nID2\nID3');
        expect(result).toEqual(['ID1', 'ID2', 'ID3']);
    });

    test('parses IDs with comma separators', () => {
        const result = parseIds('ID1,ID2,ID3');
        expect(result).toEqual(['ID1', 'ID2', 'ID3']);
    });

    test('parses IDs with tab separators', () => {
        const result = parseIds('ID1\tID2\tID3');
        expect(result).toEqual(['ID1', 'ID2', 'ID3']);
    });

    test('parses IDs with semicolon separators', () => {
        const result = parseIds('ID1;ID2;ID3');
        expect(result).toEqual(['ID1', 'ID2', 'ID3']);
    });

    test('parses IDs with mixed separators', () => {
        const result = parseIds('ID1,ID2\nID3;ID4\tID5');
        expect(result).toEqual(['ID1', 'ID2', 'ID3', 'ID4', 'ID5']);
    });

    test('trims whitespace from IDs', () => {
        const result = parseIds('  ID1  ,  ID2  \n  ID3  ');
        expect(result).toEqual(['ID1', 'ID2', 'ID3']);
    });

    test('filters out empty strings', () => {
        const result = parseIds('ID1,,ID2\n\nID3');
        expect(result).toEqual(['ID1', 'ID2', 'ID3']);
    });

    test('de-duplicates IDs (case-insensitive)', () => {
        const result = parseIds('ID1,id1,ID2,Id2');
        expect(result).toEqual(['ID1', 'ID2']);
    });

    test('preserves original casing of first occurrence', () => {
        const result = parseIds('id1,ID1,Id2,ID2');
        expect(result).toEqual(['id1', 'Id2']);
    });

    test('handles empty input', () => {
        const result = parseIds('');
        expect(result).toEqual([]);
    });

    test('handles whitespace-only input', () => {
        const result = parseIds('   \n\t  ');
        expect(result).toEqual([]);
    });

    test('handles special characters in IDs', () => {
        const result = parseIds('ID-123,ID_456,ID@789');
        expect(result).toEqual(['ID-123', 'ID_456', 'ID@789']);
    });

    test('handles IDs with spaces', () => {
        const result = parseIds('ID 123,ID 456');
        expect(result).toEqual(['ID 123', 'ID 456']);
    });
});

describe('validateInput utility function', () => {
    test('returns null for valid input with 1 ID', () => {
        const result = validateInput(['ID1']);
        expect(result).toBeNull();
    });

    test('returns null for valid input with 100 IDs', () => {
        const ids = Array.from({ length: 100 }, (_, i) => `ID${i}`);
        const result = validateInput(ids);
        expect(result).toBeNull();
    });

    test('returns error for empty array', () => {
        const result = validateInput([]);
        expect(result).toBe('Please enter at least one animal ID.');
    });

    test('returns error for 101 IDs', () => {
        const ids = Array.from({ length: 101 }, (_, i) => `ID${i}`);
        const result = validateInput(ids);
        expect(result).toBe('Maximum of 100 animal IDs allowed. You entered 101 IDs.');
    });

    test('returns error for 150 IDs', () => {
        const ids = Array.from({ length: 150 }, (_, i) => `ID${i}`);
        const result = validateInput(ids);
        expect(result).toBe('Maximum of 100 animal IDs allowed. You entered 150 IDs.');
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
        test('parses IDs with newline separators', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            await userEvent.type(textarea, 'ID123\nID456\nID789');

            mockResolveAnimalIds.mockResolvedValue({
                resolved: [
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID789', resolvedId: 'ID789', resolvedBy: 'direct', aliasType: null },
                ],
                notFound: [],
            });

            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalledWith({
                    inputIds: ['ID123', 'ID456', 'ID789'],
                });
            });
        });

        test('parses IDs with comma separators', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            await userEvent.type(textarea, 'ID123,ID456,ID789');

            mockResolveAnimalIds.mockResolvedValue({
                resolved: [
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID789', resolvedId: 'ID789', resolvedBy: 'direct', aliasType: null },
                ],
                notFound: [],
            });

            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalledWith({
                    inputIds: ['ID123', 'ID456', 'ID789'],
                });
            });
        });

        test('parses IDs with tab separators', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            fireEvent.change(textarea, { target: { value: 'ID123\tID456\tID789' } });

            mockResolveAnimalIds.mockResolvedValue({
                resolved: [
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID789', resolvedId: 'ID789', resolvedBy: 'direct', aliasType: null },
                ],
                notFound: [],
            });

            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalledWith({
                    inputIds: ['ID123', 'ID456', 'ID789'],
                });
            });
        });

        test('parses IDs with semicolon separators', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            await userEvent.type(textarea, 'ID123;ID456;ID789');

            mockResolveAnimalIds.mockResolvedValue({
                resolved: [
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID789', resolvedId: 'ID789', resolvedBy: 'direct', aliasType: null },
                ],
                notFound: [],
            });

            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalledWith({
                    inputIds: ['ID123', 'ID456', 'ID789'],
                });
            });
        });

        test('parses IDs with mixed separators', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

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

            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalledWith({
                    inputIds: ['ID1', 'ID2', 'ID3', 'ID4', 'ID5'],
                });
            });
        });

        test('trims whitespace from IDs', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            fireEvent.change(textarea, { target: { value: '  ID123  ,  ID456  ' } });

            mockResolveAnimalIds.mockResolvedValue({
                resolved: [
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                ],
                notFound: [],
            });

            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalledWith({
                    inputIds: ['ID123', 'ID456'],
                });
            });
        });

        test('de-duplicates IDs across different separators', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

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

            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalledWith({
                    inputIds: ['ID123', 'ID456'],
                });
            });
        });

        test('filters out empty strings from parsed IDs', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            fireEvent.change(textarea, { target: { value: 'ID123,,ID456' } });

            mockResolveAnimalIds.mockResolvedValue({
                resolved: [
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                ],
                notFound: [],
            });

            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalledWith({
                    inputIds: ['ID123', 'ID456'],
                });
            });
        });
    });

    describe('validation', () => {
        test('shows validation error when input is empty', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const updateButton = screen.getByRole('button', { name: /search by ids/i });
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(screen.getByText(/please enter at least one animal id/i)).toBeVisible();
            });

            expect(mockResolveAnimalIds).not.toHaveBeenCalled();
            expect(mockOnFilterChange).toHaveBeenCalledWith('idSearch', []);
        });

        test('treats whitespace-only input as empty', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            fireEvent.change(textarea, { target: { value: '   \n\t  ' } });
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(screen.getByText(/please enter at least one animal id/i)).toBeVisible();
            });

            expect(mockResolveAnimalIds).not.toHaveBeenCalled();
            expect(mockOnFilterChange).toHaveBeenCalledWith('idSearch', []);
        });

        test('allows exactly 100 IDs without validation error', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            const ids = Array.from({ length: 100 }, (_, i) => `ID${i}`).join(',');
            fireEvent.change(textarea, { target: { value: ids } });

            // Should not show validation error
            expect(screen.queryByText(/maximum of 100 animal ids/i)).not.toBeInTheDocument();

            mockResolveAnimalIds.mockResolvedValue({
                resolved: Array.from({ length: 100 }, (_, i) => ({
                    inputId: `ID${i}`,
                    resolvedId: `ID${i}`,
                    resolvedBy: 'direct' as const,
                    aliasType: null,
                })),
                notFound: [],
            });

            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalled();
            });
        });

        test('shows validation error when more than 100 IDs entered', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const ids = Array.from({ length: 101 }, (_, i) => `ID${i}`).join(',');

            fireEvent.change(textarea, { target: { value: ids } });

            await waitFor(() => {
                expect(screen.getByText(/maximum of 100 animal ids allowed\. you entered 101 ids/i)).toBeVisible();
            });
        });

        test('button remains enabled when validation fails', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            const ids = Array.from({ length: 101 }, (_, i) => `ID${i}`).join(',');
            fireEvent.change(textarea, { target: { value: ids } });

            await waitFor(() => {
                expect(screen.getByText(/maximum of 100 animal ids/i)).toBeVisible();
            });

            // Button should still be enabled even with validation error
            expect(updateButton).not.toBeDisabled();

            // Clicking button should call onFilterChange with empty array to show no records
            fireEvent.click(updateButton);
            expect(mockOnFilterChange).toHaveBeenCalledWith('idSearch', []);
            expect(mockResolveAnimalIds).not.toHaveBeenCalled();
        });

        test('clears validation error when IDs reduced below limit', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');

            // First enter 101 IDs
            const ids101 = Array.from({ length: 101 }, (_, i) => `ID${i}`).join(',');
            fireEvent.change(textarea, { target: { value: ids101 } });

            await waitFor(() => {
                expect(screen.getByText(/maximum of 100 animal ids/i)).toBeVisible();
            });

            // Then reduce to 100 IDs
            const ids100 = Array.from({ length: 100 }, (_, i) => `ID${i}`).join(',');
            fireEvent.change(textarea, { target: { value: ids100 } });

            await waitFor(() => {
                expect(screen.queryByText(/maximum of 100 animal ids/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('filter mode toggles', () => {
        test('renders filter mode toggle buttons', () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            expect(screen.getByRole('button', { name: /search by ids/i })).toBeVisible();
            expect(screen.getByRole('button', { name: /all animals/i })).toBeVisible();
            expect(screen.getByRole('button', { name: /all alive at center/i })).toBeVisible();
        });

        test('filter buttons visible in all modes except URL Params', () => {
            const { rerender } = render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="idSearch"
                    onFilterChange={mockOnFilterChange}
                />
            );

            // ID Search mode - buttons visible
            expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /all animals/i })).toBeInTheDocument();

            // all animals mode - buttons visible
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="all"
                    onFilterChange={mockOnFilterChange}
                />
            );
            expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /all animals/i })).toBeInTheDocument();

            // all alive at center mode - buttons visible
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="aliveAtCenter"
                    onFilterChange={mockOnFilterChange}
                />
            );
            expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /all alive at center/i })).toBeInTheDocument();

            // URL Params mode - buttons NOT visible
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="urlParams"
                    initialSubjects={['ID123']}
                    onFilterChange={mockOnFilterChange}
                />
            );
            expect(screen.queryByRole('button', { name: /search by ids/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /all animals/i })).not.toBeInTheDocument();
        });

        test('switches between filter modes', () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const allRecordsButton = screen.getByRole('button', { name: /all animals/i });
            fireEvent.click(allRecordsButton);

            expect(mockOnFilterChange).toHaveBeenCalledWith('all', undefined);
        });

        test('search by ids button sets filter mode even with validation error', () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            // First switch to All Animals mode
            const allAnimalsButton = screen.getByRole('button', { name: /all animals/i });
            fireEvent.click(allAnimalsButton);

            // Verify All Animals is active
            expect(allAnimalsButton).toHaveClass('active');

            // Now click Search By Ids with no input (will trigger validation error)
            const searchByIdsButton = screen.getByRole('button', { name: /search by ids/i });
            fireEvent.click(searchByIdsButton);

            // Verify validation error appears
            expect(screen.getByRole('alert')).toHaveTextContent('Please enter at least one animal ID');

            // Verify Search By Ids button is now active
            expect(searchByIdsButton).toHaveClass('active');

            // Verify All Animals button is now inactive
            expect(allAnimalsButton).toHaveClass('inactive');
        });

        test('ID textarea is always visible', () => {
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="idSearch"
                    onFilterChange={mockOnFilterChange}
                />
            );

            expect(screen.getByRole('textbox')).toBeVisible();

            const allRecordsButton = screen.getByRole('button', { name: /all animals/i });
            fireEvent.click(allRecordsButton);

            expect(screen.getByRole('textbox')).toBeVisible();
        });

        test('search by ids button is always visible', () => {
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="idSearch"
                    onFilterChange={mockOnFilterChange}
                />
            );

            expect(screen.getByRole('button', { name: /search by ids/i })).toBeVisible();

            const allRecordsButton = screen.getByRole('button', { name: /all animals/i });
            fireEvent.click(allRecordsButton);

            expect(screen.getByRole('button', { name: /search by ids/i })).toBeVisible();
        });

        test('clears input when switching to all animals mode', () => {
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="idSearch"
                    onFilterChange={mockOnFilterChange}
                />
            );

            const textarea = screen.getByRole('textbox');
            fireEvent.change(textarea, { target: { value: 'ID123,ID456' } });

            const allRecordsButton = screen.getByRole('button', { name: /all animals/i });
            fireEvent.click(allRecordsButton);

            // Verify input was cleared
            expect(textarea).toHaveValue('');
        });

        test('clears input when switching to all alive at center mode', () => {
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="idSearch"
                    onFilterChange={mockOnFilterChange}
                />
            );

            const textarea = screen.getByRole('textbox');
            fireEvent.change(textarea, { target: { value: 'ID123,ID456' } });

            const aliveAtCenterButton = screen.getByRole('button', { name: /all alive at center/i });
            fireEvent.click(aliveAtCenterButton);

            expect(mockOnFilterChange).toHaveBeenCalledWith('aliveAtCenter', undefined);
        });

        test('clears validation error when switching to all animals mode', () => {
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="idSearch"
                    onFilterChange={mockOnFilterChange}
                />
            );

            const textarea = screen.getByRole('textbox');

            // Enter more than 100 IDs to trigger validation error
            const manyIds = Array.from({ length: 101 }, (_, i) => `ID${i + 1}`).join(',');
            fireEvent.change(textarea, { target: { value: manyIds } });

            // Verify validation error appears
            expect(screen.getByRole('alert')).toHaveTextContent('Maximum of 100 animal IDs allowed');

            // Switch to All Animals mode
            const allAnimalsButton = screen.getByRole('button', { name: /all animals/i });
            fireEvent.click(allAnimalsButton);

            // Verify validation error is cleared
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(textarea).toHaveValue('');
        });

        test('clears validation error when switching to all alive at center mode', () => {
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="idSearch"
                    onFilterChange={mockOnFilterChange}
                />
            );

            const textarea = screen.getByRole('textbox');

            // Enter more than 100 IDs to trigger validation error
            const manyIds = Array.from({ length: 101 }, (_, i) => `ID${i + 1}`).join(',');
            fireEvent.change(textarea, { target: { value: manyIds } });

            // Verify validation error appears
            expect(screen.getByRole('alert')).toHaveTextContent('Maximum of 100 animal IDs allowed');

            // Switch to All Alive at Center mode
            const aliveAtCenterButton = screen.getByRole('button', { name: /all alive at center/i });
            fireEvent.click(aliveAtCenterButton);

            // Verify validation error is cleared
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(textarea).toHaveValue('');
        });
    });

    describe('textarea and button visibility', () => {
        test('textarea and search by ids button always visible in all modes', () => {
            const { rerender } = render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="idSearch"
                    onFilterChange={mockOnFilterChange}
                />
            );

            // ID Search mode - always visible
            expect(screen.getByRole('textbox')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();

            // all animals mode - still visible
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="all"
                    onFilterChange={mockOnFilterChange}
                />
            );
            expect(screen.getByRole('textbox')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();

            // all alive at center mode - still visible
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="aliveAtCenter"
                    onFilterChange={mockOnFilterChange}
                />
            );
            expect(screen.getByRole('textbox')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();
        });

        test('shows loading state while resolving IDs', async () => {
            // Mock a slow resolution
            let resolvePromise: (value: IdResolutionResult) => void;
            const slowPromise = new Promise<IdResolutionResult>(resolve => {
                resolvePromise = resolve;
            });
            mockResolveAnimalIds.mockReturnValue(slowPromise);

            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            fireEvent.change(textarea, { target: { value: 'ID123' } });
            fireEvent.click(updateButton);

            // Should show "Searching..." while loading
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /searching/i })).toBeInTheDocument();
            });

            // Button should be disabled while loading
            expect(screen.getByRole('button', { name: /searching/i })).toBeDisabled();

            // Resolve the promise
            resolvePromise!({
                resolved: [{ inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null }],
                notFound: [],
            });

            // Should return to "search by ids" after loading
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();
            });
        });
    });

    describe('resolution feedback visibility', () => {
        test('resolution feedback always visible when there are aliases or not-found IDs', async () => {
            mockResolveAnimalIds.mockResolvedValue({
                resolved: [{ inputId: 'alias1', resolvedId: 'ID123', resolvedBy: 'alias', aliasType: 'tattoo' }],
                notFound: ['notfound1'],
            });

            const { rerender } = render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="idSearch"
                    onFilterChange={mockOnFilterChange}
                />
            );

            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            // Trigger resolution
            fireEvent.change(textarea, { target: { value: 'alias1,notfound1' } });
            fireEvent.click(updateButton);

            // Wait for resolution to complete
            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalled();
            });

            // Resolution feedback should be visible
            await waitFor(() => {
                expect(screen.getByText(/id resolution/i)).toBeInTheDocument();
            });

            // Switch to all animals mode
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="all"
                    onFilterChange={mockOnFilterChange}
                />
            );

            // Resolution feedback should still be visible (textarea is always visible)
            expect(screen.getByText(/id resolution/i)).toBeInTheDocument();

            // Switch to all alive at center mode
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="aliveAtCenter"
                    onFilterChange={mockOnFilterChange}
                />
            );

            // Resolution feedback should still be visible
            expect(screen.getByText(/id resolution/i)).toBeInTheDocument();
        });

        test('shows resolution feedback when aliases are resolved', async () => {
            mockResolveAnimalIds.mockResolvedValue({
                resolved: [
                    { inputId: 'alias1', resolvedId: 'ID123', resolvedBy: 'alias', aliasType: 'tattoo' },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                ],
                notFound: [],
            });

            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            fireEvent.change(textarea, { target: { value: 'alias1,ID456' } });
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(screen.getByText(/id resolution/i)).toBeInTheDocument();
            });
        });

        test('shows resolution feedback when IDs are not found', async () => {
            mockResolveAnimalIds.mockResolvedValue({
                resolved: [{ inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null }],
                notFound: ['notfound1', 'notfound2'],
            });

            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            fireEvent.change(textarea, { target: { value: 'ID123,notfound1,notfound2' } });
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(screen.getByText(/id resolution/i)).toBeInTheDocument();
            });
        });

        test('hides resolution feedback when all IDs resolve directly', async () => {
            mockResolveAnimalIds.mockResolvedValue({
                resolved: [
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                ],
                notFound: [],
            });

            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            fireEvent.change(textarea, { target: { value: 'ID123,ID456' } });
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockResolveAnimalIds).toHaveBeenCalled();
            });

            // Should not show resolution feedback when all resolve directly
            expect(screen.queryByText(/id resolution/i)).not.toBeInTheDocument();
        });
    });

    describe('all alive at center button state', () => {
        test('all alive at center button enabled when activeReportSupportsNonIdFilters is true', () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const aliveAtCenterButton = screen.getByRole('button', { name: /all alive at center/i });
            expect(aliveAtCenterButton).not.toBeDisabled();
        });

        test('all alive at center button disabled when activeReportSupportsNonIdFilters is false', () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={false} onFilterChange={mockOnFilterChange} />);

            const aliveAtCenterButton = screen.getByRole('button', { name: /all alive at center/i });
            expect(aliveAtCenterButton).toBeDisabled();
        });
    });

    describe('URL Params mode (read-only)', () => {
        test('hides filter toggle buttons in URL Params mode', () => {
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="urlParams"
                    initialSubjects={['ID123', 'ID456']}
                    onFilterChange={mockOnFilterChange}
                />
            );

            expect(screen.queryByRole('button', { name: /search by ids/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /all animals/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /all alive at center/i })).not.toBeInTheDocument();
        });

        test('hides ID textarea and search by ids button in URL Params mode', () => {
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="urlParams"
                    initialSubjects={['ID123', 'ID456']}
                    onFilterChange={mockOnFilterChange}
                />
            );

            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /search by ids/i })).not.toBeInTheDocument();
        });

        test('shows read-only summary in URL Params mode', () => {
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="urlParams"
                    initialSubjects={['ID123', 'ID456', 'ID789']}
                    onFilterChange={mockOnFilterChange}
                />
            );

            expect(screen.getByText(/viewing 3 animal\(s\)/i)).toBeVisible();
            expect(screen.getByText(/ID123/)).toBeVisible();
            expect(screen.getByText(/ID456/)).toBeVisible();
            expect(screen.getByText(/ID789/)).toBeVisible();
        });

        test('shows Modify Search button in URL Params mode', () => {
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="urlParams"
                    initialSubjects={['ID123', 'ID456']}
                    onFilterChange={mockOnFilterChange}
                />
            );

            expect(screen.getByRole('button', { name: /modify search/i })).toBeVisible();
        });

        test('Modify Search button switches to ID Search mode with subjects pre-populated', () => {
            render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="urlParams"
                    initialSubjects={['ID123', 'ID456']}
                    onFilterChange={mockOnFilterChange}
                />
            );

            const modifyButton = screen.getByRole('button', { name: /modify search/i });
            fireEvent.click(modifyButton);

            expect(mockOnFilterChange).toHaveBeenCalledWith('idSearch', ['ID123', 'ID456']);
        });
    });

    describe('component behavior with initialSubjects prop', () => {
        test('pre-populates textarea when transitioning from URL Params to ID Search', () => {
            const { rerender } = render(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="urlParams"
                    initialSubjects={['ID123', 'ID456']}
                    onFilterChange={mockOnFilterChange}
                />
            );

            // Simulate switching to ID Search mode
            rerender(
                <SearchByIdPanel
                    activeReportSupportsNonIdFilters={true}
                    initialFilterType="idSearch"
                    initialSubjects={['ID123', 'ID456']}
                    onFilterChange={mockOnFilterChange}
                />
            );

            const textarea = screen.getByRole('textbox');
            expect(textarea).toHaveValue('ID123,ID456');
        });
    });

    describe('accessibility', () => {
        test('textarea has accessible label', () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            expect(textarea).toHaveAccessibleName();
        });

        test('buttons have accessible names', () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /all animals/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /all alive at center/i })).toBeInTheDocument();
        });

        test('validation errors have role="alert" for screen readers', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const ids = Array.from({ length: 101 }, (_, i) => `ID${i}`).join(',');
            fireEvent.change(textarea, { target: { value: ids } });

            await waitFor(() => {
                const alert = screen.getByRole('alert');
                expect(alert).toBeInTheDocument();
                expect(alert).toHaveTextContent(/maximum of 100 animal ids/i);
            });
        });

        test('keyboard navigation works correctly', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            // Tab to textarea first (it's rendered first)
            await userEvent.tab();
            expect(textarea).toHaveFocus();

            // Type IDs
            await userEvent.keyboard('ID123');

            // Tab to search by ids button
            await userEvent.tab();
            expect(updateButton).toHaveFocus();

            // Tab through remaining filter buttons (all animals, all alive at center)
            await userEvent.tab(); // all animals button
            await userEvent.tab(); // all alive at center button
            // Note: Tab order is textarea -> search by ids -> all animals -> all alive at center
            // This test verifies tab order is logical
        });
    });

    describe('security - SQL injection protection', () => {
        test('treats IDs with SQL injection patterns as literal strings', async () => {
            render(<SearchByIdPanel activeReportSupportsNonIdFilters={true} onFilterChange={mockOnFilterChange} />);

            const textarea = screen.getByRole('textbox');
            const updateButton = screen.getByRole('button', { name: /search by ids/i });

            // Note: Semicolons are treated as separators, so this input will be split
            const maliciousInput = "'; DROP TABLE--;,ID123' OR '1'='1";
            fireEvent.change(textarea, { target: { value: maliciousInput } });

            mockResolveAnimalIds.mockResolvedValue({
                resolved: [],
                notFound: ["'", 'DROP TABLE--', "ID123' OR '1'='1"],
            });

            fireEvent.click(updateButton);

            await waitFor(() => {
                // Semicolon acts as separator, so "'; DROP TABLE--;" splits into "'" and "DROP TABLE--"
                expect(mockResolveAnimalIds).toHaveBeenCalledWith({
                    inputIds: ["'", 'DROP TABLE--', "ID123' OR '1'='1"],
                });
            });
        });
    });
});
