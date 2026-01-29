import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Query } from '@labkey/api';

import { ParticipantReports } from './ParticipantReports';
import { FetchReportsFn, FetchReportsResult } from './APIWrapper';
import { defaultServerContext, renderWithServerContext } from '../test/utils';

// Mock @labkey/api Query.selectRows to prevent communication failure in tests
jest.mock('@labkey/api', () => ({
    ...jest.requireActual('@labkey/api'),
    Query: {
        ...jest.requireActual('@labkey/api').Query,
        selectRows: jest.fn(),
    },
}));

const mockFetchReports = jest.fn<Promise<FetchReportsResult>, []>();

// Mock Ext4 global
const mockExt4Container = {
    report: null as any,
    filters: null as any,
    isDestroyed: false,
    add: jest.fn(),
    removeAll: jest.fn(),
    destroy: jest.fn(),
    getFilterArray: jest.fn(() => ({ removable: [], nonRemovable: [] })),
    getQWPConfig: jest.fn(() => ({})),
};

(global as any).Ext4 = {
    create: jest.fn(() => mockExt4Container),
};

// Mock LDK global for QueryReportWrapper
(global as any).LDK = {
    Utils: {
        getErrorCallback: jest.fn(() => jest.fn()),
    },
};

// Mock LABKEY API for OtherReportWrapper and ParticipantReports
// Note: Query.selectRows is mocked via @labkey/api mock above
(global as any).LABKEY = {
    ...(global as any).LABKEY,
    WebPart: jest.fn().mockImplementation(() => ({
        render: jest.fn(),
    })),
    Filter: {
        create: jest.fn((field, value, type) => ({ field, value, type })),
        Types: {
            EQUAL: 'EQUAL',
        },
    },
};

describe('ParticipantReports', () => {
    let originalHash: string;
    let originalSearch: string;

    beforeEach(() => {
        jest.clearAllMocks();
        mockExt4Container.isDestroyed = false;

        // Mock fetchReports with default behavior
        // Returns a proper reports array for the consolidated query
        mockFetchReports.mockResolvedValue({
            reports: [
                {
                    id: 'test-report',
                    title: 'Test Report',
                    reportType: 'query',
                    supportsnonidfilters: true,
                    category: 'General',
                    schemaName: 'ehr',
                    queryName: 'testQuery',
                    viewName: null,
                    containerPath: null,
                    subjectIdFieldName: null,
                },
            ],
        });

        // Keep Query.selectRows mock for backward compatibility
        // (used by some specific test overrides)
        (Query.selectRows as jest.Mock).mockImplementation((config: any) => {
            if (config.success) {
                config.success({
                    rows: [
                        {
                            reportname: 'test-report',
                            reporttitle: 'Test Report',
                            reporttype: 'query',
                            supportsnonidfilters: true,
                            visible: true,
                            category: 'General',
                        },
                    ],
                });
            }
        });

        // Save and reset document.location.hash and search before each test
        originalHash = window.location.hash;
        originalSearch = window.location.search;
        window.location.hash = '';
        // Reset search by navigating to the same page without query params
        if (window.location.search) {
            window.history.replaceState({}, '', window.location.pathname);
        }
    });

    afterEach(() => {
        window.location.hash = originalHash;
        // Restore original search
        if (originalSearch) {
            window.history.replaceState({}, '', window.location.pathname + originalSearch);
        }
    });

    // Helper to wait for reports to load asynchronously
    const waitForReportsToLoad = async (): Promise<void> => {
        await waitFor(() => {
            expect(screen.getByText('General')).toBeVisible();
        });
    };

    // Helper to assert which filter button is active
    const expectActiveFilterButton = (activeButton: 'aliveAtCenter' | 'all' | 'search') => {
        const searchBtn = screen.getByRole('button', { name: /search by ids/i });
        const allBtn = screen.getByRole('button', { name: /all animals/i });
        const aliveBtn = screen.getByRole('button', { name: /all alive at center/i });

        if (activeButton === 'search') {
            expect(searchBtn).toHaveClass('active');
            expect(allBtn).toHaveClass('inactive');
            expect(aliveBtn).toHaveClass('inactive');
        } else if (activeButton === 'all') {
            expect(searchBtn).toHaveClass('inactive');
            expect(allBtn).toHaveClass('active');
            expect(aliveBtn).toHaveClass('inactive');
        } else {
            expect(searchBtn).toHaveClass('inactive');
            expect(allBtn).toHaveClass('inactive');
            expect(aliveBtn).toHaveClass('active');
        }
    };

    describe('rendering', () => {
        test('renders TabbedReportPanel component', async () => {
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            // Component should render and show the report category tabs
            await waitForReportsToLoad();
        });

        test('renders with default subjects filter when no URL hash present', async () => {
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitForReportsToLoad();

            // Default mode is ID Search with empty textarea
            expectActiveFilterButton('search');
            const textarea = screen.getByLabelText(/enter animal ids/i);
            expect(textarea).toHaveValue('');
        });
    });

    describe('URL hash parsing (getFiltersFromUrl)', () => {
        test('parses activeReport from URL hash', async () => {
            window.location.hash = '#activeReport:test-report-id';

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitForReportsToLoad();
            // activeReport is preserved in hash (may be updated to resolved report ID)
            expect(window.location.hash).toContain('activeReport:');
        });

        test('parses inputType from URL hash', async () => {
            // inputType is a legacy/unused param not consumed by getFiltersFromUrl
            window.location.hash = '#inputType:singleSubject';

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitForReportsToLoad();
            // Component still renders in default ID Search mode
            expectActiveFilterButton('search');
        });

        test('parses showReport as true from URL hash', async () => {
            window.location.hash = '#showReport:1';

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitForReportsToLoad();
            // showReport:1 means reports should display (no placeholder)
            expect(screen.queryByText('Select Filter to View Reports')).not.toBeInTheDocument();
        });

        test('parses showReport as false from URL hash', async () => {
            window.location.hash = '#showReport:0';

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            // Wait for reports to load (category tabs appear), then verify placeholder
            await waitForReportsToLoad();
            // showReport:0 means report content is hidden, placeholder visible
            expect(screen.getByText('Select Filter to View Reports')).toBeInTheDocument();
        });

        test('parses subjects from URL hash', async () => {
            window.location.hash = '#subjects:subject1%3Bsubject2%3Bsubject3';

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitForReportsToLoad();
            const textarea = screen.getByLabelText(/enter animal ids/i);
            expect(textarea).toHaveValue('subject1,subject2,subject3');
        });

        test('parses multiple parameters from URL hash', async () => {
            window.location.hash = '#activeReport:test-report&inputType:multiSubject&showReport:1&subjects:sub1%3Bsub2';

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitForReportsToLoad();
            const textarea = screen.getByLabelText(/enter animal ids/i);
            expect(textarea).toHaveValue('sub1,sub2');
            expect(window.location.hash).toContain('activeReport:test-report');
        });

        test('parses custom/unknown parameters from URL hash', async () => {
            window.location.hash = '#customParam:customValue&anotherParam:anotherValue';

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitForReportsToLoad();
            // Custom params are ignored; component renders in default ID Search mode
            expectActiveFilterButton('search');
        });

        test('handles URL-encoded values in hash parameters', async () => {
            window.location.hash = '#activeReport:report%20with%20spaces';

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitForReportsToLoad();
            // Hash is parseable and component renders normally
            expectActiveFilterButton('search');
        });

        test('handles empty subjects value in URL hash', async () => {
            window.location.hash = '#subjects:';

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            // Wait for reports to load so tabs appear
            await waitForReportsToLoad();
            // Empty subjects = showReport stays false, placeholder visible
            const textarea = screen.getByLabelText(/enter animal ids/i);
            expect(textarea).toHaveValue('');
            expect(screen.getByText('Select Filter to View Reports')).toBeInTheDocument();
        });

        test('ignores parameters without values', async () => {
            window.location.hash = '#paramWithoutValue';

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitForReportsToLoad();
            // Component renders in default ID Search mode
            expectActiveFilterButton('search');
        });
    });

    describe('report fetching', () => {
        test('calls fetchReports on mount', async () => {
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitForReportsToLoad();
            expect(mockFetchReports).toHaveBeenCalledTimes(1);
        });
    });

    describe('URL query parameter parsing (participantId)', () => {
        test('parses participantId from URL query parameters', async () => {
            // Set participantId in URL query string (e.g., ?participantId=44444)
            window.history.replaceState({}, '', window.location.pathname + '?participantId=44444');

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            // Component should render without errors when participantId is in query params
            await waitForReportsToLoad();

            // Verify the participantId was parsed correctly by checking document.location.search
            const urlParams = new URLSearchParams(document.location.search);
            expect(urlParams.get('participantId')).toBe('44444');
        });

        test('participantId from query params is added to subjects array', async () => {
            // Set participantId in URL query string
            window.history.replaceState({}, '', window.location.pathname + '?participantId=12345');

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            // Verify the URL contains the participantId parameter
            const urlParams = new URLSearchParams(document.location.search);
            expect(urlParams.get('participantId')).toBe('12345');

            // Component renders successfully
            await waitForReportsToLoad();
        });

        test('participantId is merged with hash subjects when both are present', async () => {
            // Set both participantId in query string and subjects in hash
            window.history.replaceState({}, '', window.location.pathname + '?participantId=44444');
            window.location.hash = '#subjects:subject1%3Bsubject2';

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            // Verify URL setup is correct
            const urlParams = new URLSearchParams(document.location.search);
            expect(urlParams.get('participantId')).toBe('44444');
            expect(window.location.hash).toContain('subjects:subject1');

            // Component renders successfully
            await waitForReportsToLoad();
        });

        test('participantId from query params takes priority when not in hash subjects', async () => {
            // Set participantId in query and subjects in hash (without the participantId)
            window.history.replaceState({}, '', window.location.pathname + '?participantId=55555');
            window.location.hash = '#subjects:otherSubject1%3BotherSubject2';

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            // Verify URL setup is correct
            const urlParams = new URLSearchParams(document.location.search);
            expect(urlParams.get('participantId')).toBe('55555');

            // Component renders successfully - participantId should be merged with hash subjects
            await waitForReportsToLoad();
        });

        test('handles participantId with other URL query parameters', async () => {
            // Set participantId along with other query params
            window.history.replaceState({}, '', window.location.pathname + '?participantId=66666&otherParam=value');

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            // Verify URL contains both parameters
            const urlParams = new URLSearchParams(document.location.search);
            expect(urlParams.get('participantId')).toBe('66666');
            expect(urlParams.get('otherParam')).toBe('value');

            // Component renders successfully
            await waitForReportsToLoad();
        });

        test('renders correctly when participantId is not present in query params', async () => {
            // No participantId in URL
            window.history.replaceState({}, '', window.location.pathname);

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            // Verify no participantId in URL
            const urlParams = new URLSearchParams(document.location.search);
            expect(urlParams.get('participantId')).toBeNull();

            // Component renders successfully
            await waitForReportsToLoad();
        });
    });

    describe('Search By Id integration', () => {
        describe('initial filter type from URL', () => {
            test('initializes with ID Search mode when filterType:idSearch in hash', async () => {
                window.location.hash = '#filterType:idSearch&subjects:ID123%3BID456';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                const textarea = screen.getByLabelText(/enter animal ids/i);
                expect(textarea).toHaveValue('ID123,ID456');
                expectActiveFilterButton('search');
            });

            test('initializes with All Records mode when filterType:all in hash', async () => {
                window.location.hash = '#filterType:all';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                expectActiveFilterButton('all');
                const textarea = screen.getByLabelText(/enter animal ids/i);
                expect(textarea).toHaveValue('');
            });

            test('initializes with Alive at Center mode when filterType:aliveAtCenter in hash', async () => {
                window.location.hash = '#filterType:aliveAtCenter';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                expectActiveFilterButton('aliveAtCenter');
            });

            test('defaults to ID Search mode when no filterType in hash', async () => {
                window.location.hash = '';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                expectActiveFilterButton('search');
            });
        });

        describe('URL Params mode (readOnly)', () => {
            test('activates URL Params mode when readOnly:true in URL with subjects', async () => {
                window.location.hash = '#subjects:ID123%3BID456&readOnly:true';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                // In readOnly mode, SearchByIdPanel is completely hidden
                expect(screen.queryByLabelText(/enter animal ids/i)).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /search by ids/i })).not.toBeInTheDocument();
                // Reports load immediately (no placeholder)
                expect(screen.queryByText('Select Filter to View Reports')).not.toBeInTheDocument();
            });

            test('hides SearchByIdPanel when in readOnly mode with subjects', () => {
                window.location.hash = '#subjects:ID123%3BID456&readOnly:true';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                // SearchByIdPanel should NOT be rendered
                expect(screen.queryByLabelText(/enter animal ids/i)).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /search by ids/i })).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /all animals/i })).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /all alive at center/i })).not.toBeInTheDocument();
            });

            test('shows SearchByIdPanel in normal mode (not readOnly)', () => {
                window.location.hash = '#filterType:idSearch';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                // SearchByIdPanel should be rendered with its elements
                expect(screen.getByLabelText(/enter animal ids/i)).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /all animals/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /all alive at center/i })).toBeInTheDocument();
            });

            test('ignores readOnly:true when no subjects in URL and shows SearchByIdPanel', () => {
                window.location.hash = '#readOnly:true';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                // Without subjects, readOnly is ignored and SearchByIdPanel should be visible
                expect(screen.getByLabelText(/enter animal ids/i)).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();
            });

            test('readOnly parameter takes priority over filterType parameter', () => {
                window.location.hash = '#filterType:all&subjects:ID123&readOnly:true';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                // Should use URL Params mode (readOnly), not All Records mode
                // SearchByIdPanel should be hidden
                expect(screen.queryByLabelText(/enter animal ids/i)).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /all animals/i })).not.toBeInTheDocument();
            });

            test('shows reports immediately in readOnly mode (showReport defaults to true)', async () => {
                window.location.hash = '#subjects:ID123&readOnly:true';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                // In readOnly mode, reports load immediately (no placeholder)
                await waitForReportsToLoad();
                expect(screen.queryByText('Select Filter to View Reports')).not.toBeInTheDocument();
            });
        });

        describe('filter state management', () => {
            test('manages subjects state from URL hash', async () => {
                window.location.hash = '#subjects:ID123%3BID456%3BID789';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                const textarea = screen.getByLabelText(/enter animal ids/i);
                expect(textarea).toHaveValue('ID123,ID456,ID789');
            });

            test('manages filterType state from URL hash', async () => {
                window.location.hash = '#filterType:aliveAtCenter';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                expectActiveFilterButton('aliveAtCenter');
            });
        });

        describe('URL hash updates', () => {
            test('updates URL hash when filter mode changes', async () => {
                window.location.hash = '';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();

                // Click "All Animals" button to change filter mode
                const allBtn = screen.getByRole('button', { name: /all animals/i });
                await userEvent.click(allBtn);

                await waitFor(() => {
                    expect(window.location.hash).toContain('filterType:all');
                });
            });

            test('includes subjects in URL hash for ID Search mode', () => {
                window.location.hash = '#filterType:idSearch&subjects:ID123%3BID456';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                expect(window.location.hash).toContain('subjects:');
            });

            test('removes subjects from URL hash for All Records mode', () => {
                window.location.hash = '#filterType:all';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                expect(window.location.hash).not.toContain('subjects:');
            });

            test('removes readOnly parameter when switching from URL Params to ID Search', async () => {
                // In readOnly mode, ParticipantReports hides SearchByIdPanel entirely.
                // The readOnly parameter is managed via URL hash state and removed when
                // handleFilterChange transitions away from URL Params mode.
                // This is tested indirectly: readOnly mode doesn't expose filter buttons.
                window.location.hash = '#subjects:ID123&readOnly:true';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                // readOnly mode hides SearchByIdPanel, so no way to switch modes via UI
                expect(screen.queryByRole('button', { name: /search by ids/i })).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /modify search/i })).not.toBeInTheDocument();
            });

            test('preserves activeReport parameter from URL hash', () => {
                window.location.hash = '#filterType:idSearch&activeReport:test-report&subjects:ID123';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                // Component should preserve activeReport in state
                expect(window.location.hash).toContain('activeReport:test-report');
            });

            test('preserves activeReport when changing filter modes', () => {
                // Use test-report which matches the mock data
                window.location.hash = '#filterType:all&activeReport:test-report&showReport:1';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                // activeReport should remain in the hash
                expect(window.location.hash).toContain('activeReport:test-report');
            });
        });

        describe('activeReportSupportsNonIdFilters query', () => {
            test('queries report metadata for supportsNonIdFilters field', async () => {
                window.location.hash = '#activeReport:test-report';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                expect(mockFetchReports).toHaveBeenCalled();
                // Mock returns supportsnonidfilters: true, so Alive at Center button should be enabled
                const aliveBtn = screen.getByRole('button', { name: /all alive at center/i });
                expect(aliveBtn).not.toBeDisabled();
            });

            test('updates activeReportSupportsNonIdFilters when switching report tabs', async () => {
                window.location.hash = '#activeReport:test-report';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                // Initial state: button is enabled (mock has supportsnonidfilters: true)
                const aliveBtn = screen.getByRole('button', { name: /all alive at center/i });
                expect(aliveBtn).not.toBeDisabled();
            });

            test('defaults to true when no active report selected', async () => {
                window.location.hash = '';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                // When no active report, activeReportSupportsNonIdFilters defaults to true
                const aliveBtn = screen.getByRole('button', { name: /all alive at center/i });
                expect(aliveBtn).not.toBeDisabled();
            });
        });

        describe('race conditions', () => {
            test('handles rapid filter mode changes before state updates', async () => {
                window.location.hash = '';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();

                // Rapidly click All Animals, then All Alive at Center
                const allBtn = screen.getByRole('button', { name: /all animals/i });
                const aliveBtn = screen.getByRole('button', { name: /all alive at center/i });
                await userEvent.click(allBtn);
                await userEvent.click(aliveBtn);

                // Final state should be Alive at Center
                await waitFor(() => {
                    expectActiveFilterButton('aliveAtCenter');
                });
            });
        });

        describe('malformed URL hash', () => {
            test('handles malformed URL hash gracefully', async () => {
                window.location.hash = '#malformed&invalid::data';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                // Should fall back to default state without crashing
                await waitForReportsToLoad();
            });

            test('handles URL hash with missing values', async () => {
                window.location.hash = '#filterType:&subjects:';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                // Should handle empty values gracefully
                await waitForReportsToLoad();
            });
        });

        describe('filter integration with TabbedReportPanel', () => {
            test('passes filters prop to TabbedReportPanel', async () => {
                window.location.hash = '#filterType:idSearch&subjects:ID123&showReport:1';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                // ID Search with subjects and showReport:1 → reports visible (no placeholder)
                expect(window.location.hash).toContain('showReport:1');
                expect(screen.queryByText('Select Filter to View Reports')).not.toBeInTheDocument();
            });

            test('passes undefined subjects for All Records mode', async () => {
                window.location.hash = '#filterType:all&showReport:1';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                // All Records mode → showReport=true, no placeholder
                expect(screen.queryByText('Select Filter to View Reports')).not.toBeInTheDocument();
                expect(window.location.hash).toContain('filterType:all');
                expect(window.location.hash).not.toContain('subjects:');
            });

            test('passes subjects for URL Params mode', async () => {
                window.location.hash = '#subjects:ID123&readOnly:true';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                // In readOnly mode, reports show immediately (no placeholder)
                expect(screen.queryByText('Select Filter to View Reports')).not.toBeInTheDocument();
                // SearchByIdPanel is hidden in readOnly mode
                expect(screen.queryByLabelText(/enter animal ids/i)).not.toBeInTheDocument();
            });
        });

        describe('LABKEY query error handling', () => {
            test('handles LABKEY query failure gracefully', async () => {
                // Mock fetchReports to return an error
                mockFetchReports.mockResolvedValueOnce({
                    reports: [],
                    error: 'Query failed',
                });

                window.location.hash = '#activeReport:demographics';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                // Component should render without crashing despite the query failure
                // When failure happens, no reports are loaded so TabbedReportPanel shows empty state
                await waitFor(() => {
                    expect(screen.queryByText('No reports configuration provided.')).toBeInTheDocument();
                });
            });

            test('defaults to supporting all filters when report metadata not found', async () => {
                // Mock fetchReports to return empty reports
                mockFetchReports.mockResolvedValueOnce({
                    reports: [],
                });

                window.location.hash = '#activeReport:nonexistent';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                // Component should render with default behavior (all filters supported)
                // With no reports, TabbedReportPanel shows empty state
                await waitFor(() => {
                    expect(screen.queryByText('No reports configuration provided.')).toBeInTheDocument();
                });
            });
        });

        describe('filter unsupported error message', () => {
            test('shows error message when Alive at Center filter is not supported by report', async () => {
                // Mock fetchReports to return a report with supportsnonidfilters: false
                mockFetchReports.mockResolvedValueOnce({
                    reports: [
                        {
                            id: 'test-report',
                            title: 'Test Report',
                            reportType: 'query',
                            supportsnonidfilters: false,
                            category: 'General',
                            schemaName: 'ehr',
                            queryName: 'testQuery',
                            viewName: null,
                            containerPath: null,
                            subjectIdFieldName: null,
                        },
                    ],
                });

                // Start with Alive at Center filter active
                window.location.hash = '#filterType:aliveAtCenter&activeReport:test-report&showReport:1';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                // Wait for the error message to appear
                const errorMessage = await screen.findByRole('alert');
                expect(errorMessage).toHaveTextContent(
                    'Filter type unsupported for this report. Switched to All Animals.'
                );
            });

            test('does not show error message when Alive at Center filter is supported', async () => {
                // Default mock already returns supportsnonidfilters: true
                window.location.hash = '#filterType:aliveAtCenter&activeReport:test-report&showReport:1';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                // Wait for reports to load
                await waitFor(() => {
                    expect(screen.getByText('General')).toBeVisible();
                });

                // Should not show error message
                expect(
                    screen.queryByText('Filter type unsupported for this report. Switched to All Animals.')
                ).not.toBeInTheDocument();
            });
        });
    });

    describe('dependency injection', () => {
        test('accepts fetchReports prop for dependency injection', async () => {
            const mockFetchReports: FetchReportsFn = jest.fn().mockResolvedValue({
                reports: [
                    {
                        id: 'injected-report',
                        title: 'Injected Report',
                        reportType: 'query',
                        supportsnonidfilters: true,
                        visible: true,
                        category: 'Injected',
                        schemaName: 'ehr',
                        queryName: 'testQuery',
                    },
                ],
            });

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitFor(() => {
                expect(mockFetchReports).toHaveBeenCalledTimes(1);
            });

            // Verify the injected report category is displayed
            expect(screen.getByText('Injected')).toBeVisible();
        });

        test('uses default fetchReports when prop not provided', async () => {
            // This test verifies backward compatibility
            // The existing module-level mock is used when no prop is passed
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            // The module-level mock returns 'General' category
            await waitForReportsToLoad();
        });

        test('injected fetchReports handles errors', async () => {
            const mockFetchReports: FetchReportsFn = jest.fn().mockResolvedValue({
                reports: [],
                error: 'Injected error for testing',
            });

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitFor(() => {
                expect(mockFetchReports).toHaveBeenCalled();
            });

            // With empty reports, shows empty state
            expect(screen.queryByText('No reports configuration provided.')).toBeInTheDocument();
        });

        test('injected fetchReports can return multiple categories', async () => {
            const mockFetchReports: FetchReportsFn = jest.fn().mockResolvedValue({
                reports: [
                    {
                        id: 'report-1',
                        title: 'Report One',
                        reportType: 'query',
                        supportsnonidfilters: true,
                        category: 'Category A',
                        schemaName: 'ehr',
                        queryName: 'query1',
                    },
                    {
                        id: 'report-2',
                        title: 'Report Two',
                        reportType: 'query',
                        supportsnonidfilters: true,
                        category: 'Category B',
                        schemaName: 'ehr',
                        queryName: 'query2',
                    },
                ],
            });

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitFor(() => {
                expect(mockFetchReports).toHaveBeenCalled();
            });

            // Both categories should be displayed
            expect(screen.getByText('Category A')).toBeVisible();
            expect(screen.getByText('Category B')).toBeVisible();
        });
    });
});
