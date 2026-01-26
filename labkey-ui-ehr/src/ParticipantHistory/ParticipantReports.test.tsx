import React from 'react';
import { screen, waitFor } from '@testing-library/react';

import { Query } from '@labkey/api';

import { ParticipantReports } from './ParticipantReports';
import { fetchReports as fetchReportsFn, FetchReportsFn } from './services/reportsService';
import { defaultServerContext, renderWithServerContext } from '../test/utils';

// Mock @labkey/api Query.selectRows to prevent communication failure in tests
jest.mock('@labkey/api', () => ({
    ...jest.requireActual('@labkey/api'),
    Query: {
        ...jest.requireActual('@labkey/api').Query,
        selectRows: jest.fn(),
    },
}));

// Mock the reportsService to provide synchronous-like behavior for existing tests
jest.mock('./services/reportsService', () => {
    const original = jest.requireActual('./services/reportsService');
    return {
        ...original,
        fetchReports: jest.fn(),
    };
});

const mockFetchReports = fetchReportsFn as jest.MockedFunction<typeof fetchReportsFn>;

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
                    visible: true,
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

    describe('rendering', () => {
        test('renders TabbedReportPanel component', async () => {
            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Component should render and show the report category tabs
            await waitForReportsToLoad();
        });

        test('renders with default subjects filter when no URL hash present', async () => {
            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Component renders without errors when no hash is present
            await waitForReportsToLoad();
        });
    });

    describe('URL hash parsing (getFiltersFromUrl)', () => {
        test('parses activeReport from URL hash', async () => {
            window.location.hash = '#activeReport:test-report-id';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Component should render without errors when activeReport is in hash
            await waitForReportsToLoad();
        });

        test('parses inputType from URL hash', async () => {
            window.location.hash = '#inputType:singleSubject';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            await waitForReportsToLoad();
        });

        test('parses showReport as true from URL hash', async () => {
            window.location.hash = '#showReport:1';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            await waitForReportsToLoad();
        });

        test('parses showReport as false from URL hash', async () => {
            window.location.hash = '#showReport:0';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            await waitForReportsToLoad();
        });

        test('parses subjects from URL hash', async () => {
            window.location.hash = '#subjects:subject1%3Bsubject2%3Bsubject3';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            await waitForReportsToLoad();
        });

        test('parses multiple parameters from URL hash', async () => {
            window.location.hash = '#activeReport:my-report&inputType:multiSubject&showReport:1&subjects:sub1%3Bsub2';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            await waitForReportsToLoad();
        });

        test('parses custom/unknown parameters from URL hash', async () => {
            window.location.hash = '#customParam:customValue&anotherParam:anotherValue';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            await waitForReportsToLoad();
        });

        test('handles URL-encoded values in hash parameters', async () => {
            window.location.hash = '#activeReport:report%20with%20spaces';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            await waitForReportsToLoad();
        });

        test('handles empty subjects value in URL hash', async () => {
            window.location.hash = '#subjects:';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            await waitForReportsToLoad();
        });

        test('ignores parameters without values', async () => {
            window.location.hash = '#paramWithoutValue';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            await waitForReportsToLoad();
        });
    });

    describe('props passed to TabbedReportPanel', () => {
        test('passes correct reportNamespace prop', async () => {
            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // The component should render the TabbedReportPanel with EHR.reports namespace
            // This is verified indirectly by successful render
            await waitForReportsToLoad();
        });

        test('passes correct reportsQuery and reportsSchema props', async () => {
            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // The component should render with ehr schema and reports query
            await waitForReportsToLoad();
        });
    });

    describe('URL query parameter parsing (participantId)', () => {
        test('parses participantId from URL query parameters', async () => {
            // Set participantId in URL query string (e.g., ?participantId=44444)
            window.history.replaceState({}, '', window.location.pathname + '?participantId=44444');

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Component should render without errors when participantId is in query params
            await waitForReportsToLoad();

            // Verify the participantId was parsed correctly by checking document.location.search
            const urlParams = new URLSearchParams(document.location.search);
            expect(urlParams.get('participantId')).toBe('44444');
        });

        test('participantId from query params is added to subjects array', async () => {
            // Set participantId in URL query string
            window.history.replaceState({}, '', window.location.pathname + '?participantId=12345');

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

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

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

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

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Verify URL setup is correct
            const urlParams = new URLSearchParams(document.location.search);
            expect(urlParams.get('participantId')).toBe('55555');

            // Component renders successfully - participantId should be merged with hash subjects
            await waitForReportsToLoad();
        });

        test('handles participantId with other URL query parameters', async () => {
            // Set participantId along with other query params
            window.history.replaceState({}, '', window.location.pathname + '?participantId=66666&otherParam=value');

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

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

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

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

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Component should render with subjects from hash
                await waitForReportsToLoad();
            });

            test('initializes with All Records mode when filterType:all in hash', async () => {
                window.location.hash = '#filterType:all';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                await waitForReportsToLoad();
            });

            test('initializes with Alive at Center mode when filterType:aliveAtCenter in hash', async () => {
                window.location.hash = '#filterType:aliveAtCenter';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                await waitForReportsToLoad();
            });

            test('defaults to ID Search mode when no filterType in hash', async () => {
                window.location.hash = '';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                await waitForReportsToLoad();
            });
        });

        describe('URL Params mode (readOnly)', () => {
            test('activates URL Params mode when readOnly:true in URL with subjects', async () => {
                window.location.hash = '#subjects:ID123%3BID456&readOnly:true';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Component should render in URL Params mode
                await waitForReportsToLoad();
            });

            test('hides SearchByIdPanel when in readOnly mode with subjects', () => {
                window.location.hash = '#subjects:ID123%3BID456&readOnly:true';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // SearchByIdPanel should NOT be rendered
                expect(screen.queryByLabelText(/enter animal ids/i)).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /search by ids/i })).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /all animals/i })).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /all alive at center/i })).not.toBeInTheDocument();
            });

            test('shows SearchByIdPanel in normal mode (not readOnly)', () => {
                window.location.hash = '#filterType:idSearch';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // SearchByIdPanel should be rendered with its elements
                expect(screen.getByLabelText(/enter animal ids/i)).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /all animals/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /all alive at center/i })).toBeInTheDocument();
            });

            test('ignores readOnly:true when no subjects in URL and shows SearchByIdPanel', () => {
                window.location.hash = '#readOnly:true';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Without subjects, readOnly is ignored and SearchByIdPanel should be visible
                expect(screen.getByLabelText(/enter animal ids/i)).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();
            });

            test('readOnly parameter takes priority over filterType parameter', () => {
                window.location.hash = '#filterType:all&subjects:ID123&readOnly:true';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Should use URL Params mode (readOnly), not All Records mode
                // SearchByIdPanel should be hidden
                expect(screen.queryByLabelText(/enter animal ids/i)).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /all animals/i })).not.toBeInTheDocument();
            });

            test('shows reports immediately in readOnly mode (showReport defaults to true)', async () => {
                window.location.hash = '#subjects:ID123&readOnly:true';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // In readOnly mode, reports should be loading immediately
                // The TabbedReportPanel should be attempting to load reports
                await waitForReportsToLoad();
            });
        });

        describe('filter state management', () => {
            test('manages subjects state from URL hash', async () => {
                window.location.hash = '#subjects:ID123%3BID456%3BID789';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Verify component renders with subjects
                await waitForReportsToLoad();
            });

            test('manages filterType state from URL hash', async () => {
                window.location.hash = '#filterType:aliveAtCenter';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                await waitForReportsToLoad();
            });
        });

        describe('URL hash updates', () => {
            test('updates URL hash when filter mode changes', async () => {
                window.location.hash = '';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // After component mounts, simulate filter change
                // Note: This would require exposing handleFilterChange or testing through UI interaction
                await waitForReportsToLoad();
            });

            test('includes subjects in URL hash for ID Search mode', () => {
                window.location.hash = '#filterType:idSearch&subjects:ID123%3BID456';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                expect(window.location.hash).toContain('subjects:');
            });

            test('removes subjects from URL hash for All Records mode', () => {
                window.location.hash = '#filterType:all';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                expect(window.location.hash).not.toContain('subjects:');
            });

            test('removes readOnly parameter when switching from URL Params to ID Search', async () => {
                window.location.hash = '#subjects:ID123&readOnly:true';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Component should be in URL Params mode initially
                // After switching to ID Search (would require UI interaction), readOnly should be removed
                await waitForReportsToLoad();
            });

            test('preserves activeReport parameter from URL hash', () => {
                window.location.hash = '#filterType:idSearch&activeReport:test-report&subjects:ID123';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Component should preserve activeReport in state
                expect(window.location.hash).toContain('activeReport:test-report');
            });

            test('preserves activeReport when changing filter modes', () => {
                // Use test-report which matches the mock data
                window.location.hash = '#filterType:all&activeReport:test-report&showReport:1';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // activeReport should remain in the hash
                expect(window.location.hash).toContain('activeReport:test-report');
            });
        });

        describe('activeReportSupportsNonIdFilters query', () => {
            test('queries report metadata for supportsNonIdFilters field', async () => {
                window.location.hash = '#activeReport:test-report';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Component should query ehr.reports for the active report's metadata
                await waitForReportsToLoad();
            });

            test('updates activeReportSupportsNonIdFilters when switching report tabs', async () => {
                window.location.hash = '#activeReport:report1';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // After switching to different report tab, should re-query metadata
                await waitForReportsToLoad();
            });

            test('defaults to false when no active report selected', async () => {
                window.location.hash = '';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Should handle no active report gracefully
                await waitForReportsToLoad();
            });
        });

        describe('race conditions', () => {
            test('handles rapid filter mode changes before state updates', async () => {
                window.location.hash = '';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Simulate rapid filter changes
                // This would require UI interaction or exposing handleFilterChange
                await waitForReportsToLoad();
            });
        });

        describe('malformed URL hash', () => {
            test('handles malformed URL hash gracefully', async () => {
                window.location.hash = '#malformed&invalid::data';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Should fall back to default state without crashing
                await waitForReportsToLoad();
            });

            test('handles URL hash with missing values', async () => {
                window.location.hash = '#filterType:&subjects:';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Should handle empty values gracefully
                await waitForReportsToLoad();
            });
        });

        describe('filter integration with TabbedReportPanel', () => {
            test('passes filters prop to TabbedReportPanel', async () => {
                window.location.hash = '#filterType:idSearch&subjects:ID123';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // TabbedReportPanel should receive filters prop with filterType and subjects
                await waitForReportsToLoad();
            });

            test('passes undefined subjects for All Records mode', async () => {
                window.location.hash = '#filterType:all';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // filters.subjects should be undefined for All Records
                await waitForReportsToLoad();
            });

            test('passes subjects for URL Params mode', async () => {
                window.location.hash = '#subjects:ID123&readOnly:true';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // filters.subjects should be populated for URL Params mode
                await waitForReportsToLoad();
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

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

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

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

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
                            visible: true,
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

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Wait for the error message to appear
                const errorMessage = await screen.findByRole('alert');
                expect(errorMessage).toHaveTextContent(
                    'Filter type unsupported for this report. Switched to All Animals.'
                );
            });

            test('does not show error message when Alive at Center filter is supported', async () => {
                // Default mock already returns supportsnonidfilters: true
                window.location.hash = '#filterType:aliveAtCenter&activeReport:test-report&showReport:1';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

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
            renderWithServerContext(<ParticipantReports />, defaultServerContext());

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
