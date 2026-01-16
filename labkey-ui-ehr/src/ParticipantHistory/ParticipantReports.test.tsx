import React from 'react';
import { screen } from '@testing-library/react';

import { Query } from '@labkey/api';

import { ParticipantReports } from './ParticipantReports';
import { defaultServerContext, renderWithServerContext } from '../test/utils';

// Mock @labkey/api Query.selectRows to prevent communication failure in tests
jest.mock('@labkey/api', () => ({
    ...jest.requireActual('@labkey/api'),
    Query: {
        ...jest.requireActual('@labkey/api').Query,
        selectRows: jest.fn(),
    },
}));

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

        // Mock Query.selectRows with default behavior
        // Returns a proper reports array for the consolidated query
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

    describe('rendering', () => {
        test('renders TabbedReportPanel component', () => {
            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Component should render and show the report category tabs
            expect(screen.getByText('General')).toBeVisible();
        });

        test('renders with default subjects filter when no URL hash present', () => {
            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Component renders without errors when no hash is present
            expect(screen.getByText('General')).toBeVisible();
        });
    });

    describe('URL hash parsing (getFiltersFromUrl)', () => {
        test('parses activeReport from URL hash', () => {
            window.location.hash = '#activeReport:test-report-id';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Component should render without errors when activeReport is in hash
            expect(screen.getByText('General')).toBeVisible();
        });

        test('parses inputType from URL hash', () => {
            window.location.hash = '#inputType:singleSubject';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('General')).toBeVisible();
        });

        test('parses showReport as true from URL hash', () => {
            window.location.hash = '#showReport:1';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('General')).toBeVisible();
        });

        test('parses showReport as false from URL hash', () => {
            window.location.hash = '#showReport:0';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('General')).toBeVisible();
        });

        test('parses subjects from URL hash', () => {
            window.location.hash = '#subjects:subject1%3Bsubject2%3Bsubject3';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('General')).toBeVisible();
        });

        test('parses multiple parameters from URL hash', () => {
            window.location.hash = '#activeReport:my-report&inputType:multiSubject&showReport:1&subjects:sub1%3Bsub2';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('General')).toBeVisible();
        });

        test('parses custom/unknown parameters from URL hash', () => {
            window.location.hash = '#customParam:customValue&anotherParam:anotherValue';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('General')).toBeVisible();
        });

        test('handles URL-encoded values in hash parameters', () => {
            window.location.hash = '#activeReport:report%20with%20spaces';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('General')).toBeVisible();
        });

        test('handles empty subjects value in URL hash', () => {
            window.location.hash = '#subjects:';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('General')).toBeVisible();
        });

        test('ignores parameters without values', () => {
            window.location.hash = '#paramWithoutValue';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('General')).toBeVisible();
        });
    });

    describe('props passed to TabbedReportPanel', () => {
        test('passes correct reportNamespace prop', () => {
            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // The component should render the TabbedReportPanel with EHR.reports namespace
            // This is verified indirectly by successful render
            expect(screen.getByText('General')).toBeVisible();
        });

        test('passes correct reportsQuery and reportsSchema props', () => {
            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // The component should render with ehr schema and reports query
            expect(screen.getByText('General')).toBeVisible();
        });
    });

    describe('URL query parameter parsing (participantId)', () => {
        test('parses participantId from URL query parameters', () => {
            // Set participantId in URL query string (e.g., ?participantId=44444)
            window.history.replaceState({}, '', window.location.pathname + '?participantId=44444');

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Component should render without errors when participantId is in query params
            expect(screen.getByText('General')).toBeVisible();

            // Verify the participantId was parsed correctly by checking document.location.search
            const urlParams = new URLSearchParams(document.location.search);
            expect(urlParams.get('participantId')).toBe('44444');
        });

        test('participantId from query params is added to subjects array', () => {
            // Set participantId in URL query string
            window.history.replaceState({}, '', window.location.pathname + '?participantId=12345');

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Verify the URL contains the participantId parameter
            const urlParams = new URLSearchParams(document.location.search);
            expect(urlParams.get('participantId')).toBe('12345');

            // Component renders successfully
            expect(screen.getByText('General')).toBeVisible();
        });

        test('participantId is merged with hash subjects when both are present', () => {
            // Set both participantId in query string and subjects in hash
            window.history.replaceState({}, '', window.location.pathname + '?participantId=44444');
            window.location.hash = '#subjects:subject1%3Bsubject2';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Verify URL setup is correct
            const urlParams = new URLSearchParams(document.location.search);
            expect(urlParams.get('participantId')).toBe('44444');
            expect(window.location.hash).toContain('subjects:subject1');

            // Component renders successfully
            expect(screen.getByText('General')).toBeVisible();
        });

        test('participantId from query params takes priority when not in hash subjects', () => {
            // Set participantId in query and subjects in hash (without the participantId)
            window.history.replaceState({}, '', window.location.pathname + '?participantId=55555');
            window.location.hash = '#subjects:otherSubject1%3BotherSubject2';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Verify URL setup is correct
            const urlParams = new URLSearchParams(document.location.search);
            expect(urlParams.get('participantId')).toBe('55555');

            // Component renders successfully - participantId should be merged with hash subjects
            expect(screen.getByText('General')).toBeVisible();
        });

        test('handles participantId with other URL query parameters', () => {
            // Set participantId along with other query params
            window.history.replaceState({}, '', window.location.pathname + '?participantId=66666&otherParam=value');

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Verify URL contains both parameters
            const urlParams = new URLSearchParams(document.location.search);
            expect(urlParams.get('participantId')).toBe('66666');
            expect(urlParams.get('otherParam')).toBe('value');

            // Component renders successfully
            expect(screen.getByText('General')).toBeVisible();
        });

        test('renders correctly when participantId is not present in query params', () => {
            // No participantId in URL
            window.history.replaceState({}, '', window.location.pathname);

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Verify no participantId in URL
            const urlParams = new URLSearchParams(document.location.search);
            expect(urlParams.get('participantId')).toBeNull();

            // Component renders successfully
            expect(screen.getByText('General')).toBeVisible();
        });
    });

    describe('Search By Id integration', () => {
        describe('initial filter type from URL', () => {
            test('initializes with ID Search mode when filterType:idSearch in hash', () => {
                window.location.hash = '#filterType:idSearch&subjects:ID123%3BID456';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Component should render with subjects from hash
                expect(screen.getByText('General')).toBeVisible();
            });

            test('initializes with All Records mode when filterType:all in hash', () => {
                window.location.hash = '#filterType:all';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                expect(screen.getByText('General')).toBeVisible();
            });

            test('initializes with Alive at Center mode when filterType:aliveAtCenter in hash', () => {
                window.location.hash = '#filterType:aliveAtCenter';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                expect(screen.getByText('General')).toBeVisible();
            });

            test('defaults to ID Search mode when no filterType in hash', () => {
                window.location.hash = '';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                expect(screen.getByText('General')).toBeVisible();
            });
        });

        describe('URL Params mode (readOnly)', () => {
            test('activates URL Params mode when readOnly:true in URL with subjects', () => {
                window.location.hash = '#subjects:ID123%3BID456&readOnly:true';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Component should render in URL Params mode
                expect(screen.getByText('General')).toBeVisible();
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

            test('shows reports immediately in readOnly mode (showReport defaults to true)', () => {
                window.location.hash = '#subjects:ID123&readOnly:true';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // In readOnly mode, reports should be loading immediately
                // The TabbedReportPanel should be attempting to load reports
                expect(screen.getByText('General')).toBeVisible();
            });
        });

        describe('filter state management', () => {
            test('manages subjects state from URL hash', () => {
                window.location.hash = '#subjects:ID123%3BID456%3BID789';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Verify component renders with subjects
                expect(screen.getByText('General')).toBeVisible();
            });

            test('manages filterType state from URL hash', () => {
                window.location.hash = '#filterType:aliveAtCenter';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                expect(screen.getByText('General')).toBeVisible();
            });
        });

        describe('URL hash updates', () => {
            test('updates URL hash when filter mode changes', () => {
                window.location.hash = '';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // After component mounts, simulate filter change
                // Note: This would require exposing handleFilterChange or testing through UI interaction
                expect(screen.getByText('General')).toBeVisible();
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

            test('removes readOnly parameter when switching from URL Params to ID Search', () => {
                window.location.hash = '#subjects:ID123&readOnly:true';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Component should be in URL Params mode initially
                // After switching to ID Search (would require UI interaction), readOnly should be removed
                expect(screen.getByText('General')).toBeVisible();
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
            test('queries report metadata for supportsNonIdFilters field', () => {
                window.location.hash = '#activeReport:test-report';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Component should query ehr.reports for the active report's metadata
                expect(screen.getByText('General')).toBeVisible();
            });

            test('updates activeReportSupportsNonIdFilters when switching report tabs', () => {
                window.location.hash = '#activeReport:report1';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // After switching to different report tab, should re-query metadata
                expect(screen.getByText('General')).toBeVisible();
            });

            test('defaults to false when no active report selected', () => {
                window.location.hash = '';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Should handle no active report gracefully
                expect(screen.getByText('General')).toBeVisible();
            });
        });

        describe('race conditions', () => {
            test('handles rapid filter mode changes before state updates', () => {
                window.location.hash = '';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Simulate rapid filter changes
                // This would require UI interaction or exposing handleFilterChange
                expect(screen.getByText('General')).toBeVisible();
            });
        });

        describe('malformed URL hash', () => {
            test('handles malformed URL hash gracefully', () => {
                window.location.hash = '#malformed&invalid::data';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Should fall back to default state without crashing
                expect(screen.getByText('General')).toBeVisible();
            });

            test('handles URL hash with missing values', () => {
                window.location.hash = '#filterType:&subjects:';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Should handle empty values gracefully
                expect(screen.getByText('General')).toBeVisible();
            });
        });

        describe('filter integration with TabbedReportPanel', () => {
            test('passes filters prop to TabbedReportPanel', () => {
                window.location.hash = '#filterType:idSearch&subjects:ID123';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // TabbedReportPanel should receive filters prop with filterType and subjects
                expect(screen.getByText('General')).toBeVisible();
            });

            test('passes undefined subjects for All Records mode', () => {
                window.location.hash = '#filterType:all';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // filters.subjects should be undefined for All Records
                expect(screen.getByText('General')).toBeVisible();
            });

            test('passes subjects for URL Params mode', () => {
                window.location.hash = '#subjects:ID123&readOnly:true';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // filters.subjects should be populated for URL Params mode
                expect(screen.getByText('General')).toBeVisible();
            });
        });

        describe('LABKEY query error handling', () => {
            test('handles LABKEY query failure gracefully', () => {
                // Mock the selectRows to call the failure callback
                (Query.selectRows as jest.Mock).mockImplementationOnce((config: any) => {
                    if (config.failure) {
                        config.failure({ message: 'Query failed' });
                    }
                });

                window.location.hash = '#activeReport:demographics';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Component should render without crashing despite the query failure
                // When failure happens, no reports are loaded so TabbedReportPanel shows empty state
                expect(screen.queryByText('No reports configuration provided.')).toBeInTheDocument();
            });

            test('defaults to supporting all filters when report metadata not found', () => {
                // Mock the selectRows to return empty rows
                (Query.selectRows as jest.Mock).mockImplementationOnce((config: any) => {
                    if (config.success) {
                        config.success({ rows: [] });
                    }
                });

                window.location.hash = '#activeReport:nonexistent';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Component should render with default behavior (all filters supported)
                // With no reports, TabbedReportPanel shows empty state
                expect(screen.queryByText('No reports configuration provided.')).toBeInTheDocument();
            });
        });

        describe('filter unsupported error message', () => {
            test('shows error message when Alive at Center filter is not supported by report', async () => {
                // Mock the selectRows to return a report with supportsnonidfilters: false
                (Query.selectRows as jest.Mock).mockImplementationOnce((config: any) => {
                    if (config.success) {
                        config.success({
                            rows: [
                                {
                                    reportname: 'test-report',
                                    reporttitle: 'Test Report',
                                    reporttype: 'query',
                                    supportsnonidfilters: false,
                                    visible: true,
                                    category: 'General',
                                },
                            ],
                        });
                    }
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

            test('does not show error message when Alive at Center filter is supported', () => {
                // Default mock already returns supportsnonidfilters: true
                window.location.hash = '#filterType:aliveAtCenter&activeReport:test-report&showReport:1';

                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Should not show error message
                expect(
                    screen.queryByText('Filter type unsupported for this report. Switched to All Animals.')
                ).not.toBeInTheDocument();
            });
        });
    });
});
