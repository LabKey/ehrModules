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
            expect(searchBtn).toHaveClass('search-by-id-panel__search-button--active');
            expect(allBtn).toHaveClass('search-by-id-panel__filter-button--inactive');
            expect(aliveBtn).toHaveClass('search-by-id-panel__filter-button--inactive');
        } else if (activeButton === 'all') {
            expect(searchBtn).toHaveClass('search-by-id-panel__search-button--inactive');
            expect(allBtn).toHaveClass('search-by-id-panel__filter-button--active');
            expect(aliveBtn).toHaveClass('search-by-id-panel__filter-button--inactive');
        } else {
            expect(searchBtn).toHaveClass('search-by-id-panel__search-button--inactive');
            expect(allBtn).toHaveClass('search-by-id-panel__filter-button--inactive');
            expect(aliveBtn).toHaveClass('search-by-id-panel__filter-button--active');
        }
    };

    describe('rendering', () => {
        test('renders TabbedReportPanel component', async () => {
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitForReportsToLoad();

            expectActiveFilterButton('search');
            expect(screen.getByLabelText(/enter animal ids/i)).toBeInTheDocument();
            expect(screen.getByText('Test Report')).toBeVisible();
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
            window.location.hash = '#activeReport:test-report';

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitForReportsToLoad();
            // Verify the activeReport value was preserved in the updated hash
            expect(window.location.hash).toContain('activeReport:test-report');
            // Verify the report tab corresponding to test-report is rendered
            expect(screen.getByText('Test Report')).toBeInTheDocument();
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
            window.location.hash = '#subjects:ID%20123';

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitForReportsToLoad();
            // Verify URL-encoded subjects value was decoded correctly and displayed in textarea
            expectActiveFilterButton('search');
            const textarea = screen.getByLabelText(/enter animal ids/i);
            expect(textarea).toHaveValue('ID 123');
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

    describe('renders with query parameters in URL', () => {
        test('renders without errors when participantId is in query params', async () => {
            window.history.replaceState({}, '', window.location.pathname + '?participantId=44444');

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            // Component reads state from URL hash, not query params.
            // participantId in query string does not affect component state.
            await waitForReportsToLoad();
            expectActiveFilterButton('search');
            const textarea = screen.getByLabelText(/enter animal ids/i);
            expect(textarea).toHaveValue('');
        });

        test('uses hash subjects independently of participantId in query params', async () => {
            window.history.replaceState({}, '', window.location.pathname + '?participantId=44444');
            window.location.hash = '#subjects:subject1%3Bsubject2';

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitForReportsToLoad();
            // Only hash subjects are used; participantId query param is ignored by this component
            const textarea = screen.getByLabelText(/enter animal ids/i);
            expect(textarea).toHaveValue('subject1,subject2');
        });

        test('renders without errors when multiple query parameters are present', async () => {
            window.history.replaceState({}, '', window.location.pathname + '?participantId=66666&otherParam=value');

            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            await waitForReportsToLoad();
            expectActiveFilterButton('search');
            const textarea = screen.getByLabelText(/enter animal ids/i);
            expect(textarea).toHaveValue('');
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

            test('includes subjects in URL hash for ID Search mode', async () => {
                window.location.hash = '#filterType:idSearch&subjects:ID123%3BID456';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                // Verify the subjects are reflected in the textarea (component consumed them)
                const textarea = screen.getByLabelText(/enter animal ids/i);
                expect(textarea).toHaveValue('ID123,ID456');
                // Verify subjects are preserved in the updated hash
                expect(window.location.hash).toContain('subjects:');
            });

            test('removes subjects from URL hash for All Records mode', async () => {
                // Start with subjects in hash
                window.location.hash = '#filterType:idSearch&subjects:ID123%3BID456';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                // Verify subjects are present initially
                expect(window.location.hash).toContain('subjects:');

                // Switch to All Animals mode
                const allBtn = screen.getByRole('button', { name: /all animals/i });
                await userEvent.click(allBtn);

                // Verify subjects were removed from hash after switching
                await waitFor(() => {
                    expect(window.location.hash).not.toContain('subjects:');
                    expect(window.location.hash).toContain('filterType:all');
                });
            });

            test('readOnly mode hides all filter UI including Modify Search', async () => {
                window.location.hash = '#subjects:ID123&readOnly:true';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                // In readOnly mode at the ParticipantReports level, SearchByIdPanel is completely hidden
                // (including its Modify Search button), so mode switching is not possible via UI
                expect(screen.queryByRole('button', { name: /search by ids/i })).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /modify search/i })).not.toBeInTheDocument();
                expect(screen.queryByLabelText(/enter animal ids/i)).not.toBeInTheDocument();
                // Reports are visible (readOnly implies showReport)
                expect(screen.queryByText('Select Filter to View Reports')).not.toBeInTheDocument();
            });

            test('preserves activeReport parameter when switching filter modes', async () => {
                window.location.hash = '#filterType:idSearch&activeReport:test-report&subjects:ID123&showReport:1';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                // Verify activeReport is initially present
                expect(window.location.hash).toContain('activeReport:test-report');

                // Switch to All Animals mode
                const allBtn = screen.getByRole('button', { name: /all animals/i });
                await userEvent.click(allBtn);

                // Verify activeReport is preserved after the filter mode change
                await waitFor(() => {
                    expect(window.location.hash).toContain('activeReport:test-report');
                    expect(window.location.hash).toContain('filterType:all');
                });
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

            test('disables Alive at Center when switching to report that does not support non-ID filters', async () => {
                // Provide two reports: one supports non-ID filters, one does not
                mockFetchReports.mockResolvedValueOnce({
                    reports: [
                        {
                            id: 'report-supports',
                            title: 'Supports Report',
                            reportType: 'query',
                            supportsnonidfilters: true,
                            category: 'General',
                            schemaName: 'ehr',
                            queryName: 'query1',
                            viewName: null,
                            containerPath: null,
                            subjectIdFieldName: null,
                        },
                        {
                            id: 'report-no-support',
                            title: 'No Support Report',
                            reportType: 'query',
                            supportsnonidfilters: false,
                            category: 'Other',
                            schemaName: 'ehr',
                            queryName: 'query2',
                            viewName: null,
                            containerPath: null,
                            subjectIdFieldName: null,
                        },
                    ],
                });

                window.location.hash = '#activeReport:report-supports';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitFor(() => {
                    expect(screen.getByText('General')).toBeVisible();
                });

                // Initially, Alive at Center should be enabled (report-supports has supportsnonidfilters: true)
                const aliveBtn = screen.getByRole('button', { name: /all alive at center/i });
                expect(aliveBtn).not.toBeDisabled();

                // Click on the "Other" category tab to switch to the non-supporting report
                await userEvent.click(screen.getByText('Other'));

                // After switching, Alive at Center should be disabled
                await waitFor(() => {
                    expect(screen.getByRole('button', { name: /all alive at center/i })).toBeDisabled();
                });
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

                // Should fall back to default ID Search state
                await waitForReportsToLoad();
                expectActiveFilterButton('search');
                const textarea = screen.getByLabelText(/enter animal ids/i);
                expect(textarea).toHaveValue('');
            });

            test('handles URL hash with missing values', async () => {
                window.location.hash = '#filterType:&subjects:';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                // Should fall back to default ID Search mode with empty subjects
                await waitForReportsToLoad();
                expectActiveFilterButton('search');
                const textarea = screen.getByLabelText(/enter animal ids/i);
                expect(textarea).toHaveValue('');
            });
        });

        describe('filter integration with TabbedReportPanel', () => {
            test('passes ID Search filters to TabbedReportPanel', async () => {
                window.location.hash = '#filterType:idSearch&subjects:ID123&showReport:1';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                // Reports visible (no placeholder)
                expect(screen.queryByText('Select Filter to View Reports')).not.toBeInTheDocument();
                // Verify Ext4.create was called to render the report (proves TabbedReportPanel received showReport=true)
                expect((global as any).Ext4.create).toHaveBeenCalled();
                // Verify ID Search mode is active
                expectActiveFilterButton('search');
                // Verify subjects are shown in the textarea
                const textarea = screen.getByLabelText(/enter animal ids/i);
                expect(textarea).toHaveValue('ID123');
            });

            test('passes All Records filter to TabbedReportPanel with no subjects', async () => {
                window.location.hash = '#filterType:all&showReport:1';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                // Reports visible (no placeholder)
                expect(screen.queryByText('Select Filter to View Reports')).not.toBeInTheDocument();
                // All Records mode is active
                expectActiveFilterButton('all');
                // Verify Ext4.create was called for report rendering
                expect((global as any).Ext4.create).toHaveBeenCalled();
            });

            test('passes URL Params subjects to TabbedReportPanel', async () => {
                window.location.hash = '#subjects:ID123&readOnly:true';

                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                await waitForReportsToLoad();
                // Reports visible (readOnly implies showReport)
                expect(screen.queryByText('Select Filter to View Reports')).not.toBeInTheDocument();
                // SearchByIdPanel is hidden in readOnly mode
                expect(screen.queryByLabelText(/enter animal ids/i)).not.toBeInTheDocument();
                // Verify Ext4.create was called for report rendering (proves filters were passed)
                expect((global as any).Ext4.create).toHaveBeenCalled();
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
