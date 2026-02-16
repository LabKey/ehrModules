import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ParticipantReports } from './ParticipantReports';
import { FetchReportsFn, FetchReportsResult } from './APIWrapper';
import * as APIWrapperModule from './APIWrapper';
import { defaultServerContext, renderWithServerContext } from '../test/utils';

const mockFetchReports = jest.fn<Promise<FetchReportsResult>, []>();

// Mock Ext4 global
const mockExt4Container = {
    filters: null as any,
    isDestroyed: false,
    add: jest.fn(),
    removeAll: jest.fn(),
    destroy: jest.fn(),
};

(globalThis as any).Ext4 = {
    create: jest.fn(() => mockExt4Container),
};

describe('ParticipantReports', () => {
    let originalHash: string;
    let originalSearch: string;

    beforeEach(() => {
        jest.clearAllMocks();
        mockExt4Container.isDestroyed = false;

        // Default fetchReports behavior for most tests: return a single report
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
            // Act
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
            await waitForReportsToLoad();

            // Assert - default state renders ID Search mode, empty textarea, and report tab
            expectActiveFilterButton('search');
            const textarea = screen.getByLabelText(/enter animal ids/i);
            expect(textarea).toBeInTheDocument();
            expect(textarea).toHaveValue('');
            expect(screen.getByText('Test Report')).toBeVisible();
        });
    });

    describe('URL hash parsing (getFiltersFromUrl)', () => {
        test('parses activeReport from URL hash', async () => {
            // Arrange
            mockFetchReports.mockResolvedValueOnce({
                reports: [
                    {
                        id: 'report-one',
                        title: 'Report One',
                        reportType: 'query',
                        supportsnonidfilters: true,
                        category: 'General',
                        schemaName: 'ehr',
                        queryName: 'queryOne',
                        viewName: null,
                        containerPath: null,
                        subjectIdFieldName: null,
                    },
                    {
                        id: 'report-two',
                        title: 'Report Two',
                        reportType: 'query',
                        supportsnonidfilters: true,
                        category: 'General',
                        schemaName: 'ehr',
                        queryName: 'queryTwo',
                        viewName: null,
                        containerPath: null,
                        subjectIdFieldName: null,
                    },
                ],
            });
            window.location.hash = '#activeReport:report-two';

            // Act
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

            // Act & Assert - Report Two tab has the active class
            await waitFor(() => {
                expect(screen.getByRole('button', { name: 'Report Two' })).toHaveClass(
                    'tabbed-report-panel__report-tab--active'
                );
            });

            // Assert - activeReport:report-two is preserved in URL hash
            expect(window.location.hash).toContain('activeReport:report-two');
        });

        test('ignores legacy inputType parameter from URL hash', async () => {
            // Arrange
            window.location.hash = '#inputType:singleSubject';

            // Act
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
            await waitForReportsToLoad();

            // Assert - defaults to ID Search mode despite inputType in hash
            expectActiveFilterButton('search');
        });

        test('parses showReport as true from URL hash', async () => {
            // Arrange
            window.location.hash = '#showReport:1';

            // Act
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
            await waitForReportsToLoad();

            // Assert - placeholder is hidden and Ext4 report wrapper was created
            expect(screen.queryByText('Select Filter to View Reports')).not.toBeInTheDocument();
            expect((globalThis as any).Ext4.create).toHaveBeenCalled();
        });

        test('parses showReport as false from URL hash', async () => {
            // Arrange
            window.location.hash = '#showReport:0';

            // Act
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
            await waitForReportsToLoad();

            // Assert - placeholder is shown and Ext4 report wrapper was not created
            expect(screen.getByText('Select Filter to View Reports')).toBeInTheDocument();
            expect((globalThis as any).Ext4.create).not.toHaveBeenCalled();
        });

        test('parses subjects from URL hash', async () => {
            // Arrange
            window.location.hash = '#subjects:subject1%3Bsubject2%3Bsubject3';

            // Act
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
            await waitForReportsToLoad();

            // Assert - semicolon-separated subjects are decoded into comma-separated textarea value
            const textarea = screen.getByLabelText(/enter animal ids/i);
            expect(textarea).toHaveValue('subject1,subject2,subject3');
        });

        test('parses multiple parameters from URL hash', async () => {
            // Arrange
            window.location.hash = '#activeReport:test-report&inputType:multiSubject&showReport:1&subjects:sub1%3Bsub2';

            // Act
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
            await waitForReportsToLoad();

            // Assert - subjects are shown in textarea and activeReport is preserved in hash
            const textarea = screen.getByLabelText(/enter animal ids/i);
            expect(textarea).toHaveValue('sub1,sub2');
            expect(window.location.hash).toContain('activeReport:test-report');
        });

        test('parses custom/unknown parameters from URL hash', async () => {
            // Arrange
            window.location.hash = '#customParam:customValue&anotherParam:anotherValue';

            // Act
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
            await waitForReportsToLoad();

            // Assert - defaults to ID Search mode and unknown params are preserved in hash
            expectActiveFilterButton('search');
            expect(window.location.hash).toContain('customParam:customValue');
            expect(window.location.hash).toContain('anotherParam:anotherValue');
        });

        test('handles URL-encoded values in hash parameters', async () => {
            // Arrange
            window.location.hash = '#subjects:ID%20123';

            // Act
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
            await waitForReportsToLoad();

            // Assert - ID Search mode is active and URL-encoded subject is decoded in textarea
            expectActiveFilterButton('search');
            const textarea = screen.getByLabelText(/enter animal ids/i);
            expect(textarea).toHaveValue('ID 123');
        });

        test('handles empty subjects value in URL hash', async () => {
            // Arrange
            window.location.hash = '#subjects:';

            // Act
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
            await waitForReportsToLoad();

            // Assert - textarea is empty and placeholder is shown
            const textarea = screen.getByLabelText(/enter animal ids/i);
            expect(textarea).toHaveValue('');
            expect(screen.getByText('Select Filter to View Reports')).toBeInTheDocument();
        });

        test('ignores parameters without values', async () => {
            // Arrange
            window.location.hash = '#paramWithoutValue';

            // Act
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
            await waitForReportsToLoad();

            // Assert - defaults to ID Search mode and valueless param is not preserved in hash
            expectActiveFilterButton('search');
            expect(window.location.hash).not.toContain('paramWithoutValue');
        });
    });

    describe('report fetching', () => {
        test('calls fetchReports on mount', async () => {
            // Act
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
            await waitForReportsToLoad();

            // Assert - fetchReports was called exactly once
            expect(mockFetchReports).toHaveBeenCalledTimes(1);
        });
    });

    describe('renders with query parameters in URL', () => {
        test.each(['?participantId=44444', '?participantId=66666&otherParam=value'])(
            'ignores query params and keeps default state (%s)',
            async queryString => {
                // Arrange
                window.history.replaceState({}, '', window.location.pathname + queryString);

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();

                // Assert - ID Search mode is active with empty textarea
                expectActiveFilterButton('search');
                const textarea = screen.getByLabelText(/enter animal ids/i);
                expect(textarea).toHaveValue('');
            }
        );

        test('uses hash subjects independently of participantId in query params', async () => {
            // Arrange
            window.history.replaceState({}, '', window.location.pathname + '?participantId=44444');
            window.location.hash = '#subjects:subject1%3Bsubject2';

            // Act
            renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
            await waitForReportsToLoad();

            // Assert - textarea shows hash subjects, participantId query param is ignored
            const textarea = screen.getByLabelText(/enter animal ids/i);
            expect(textarea).toHaveValue('subject1,subject2');
        });
    });

    describe('Search By Id integration', () => {
        describe('initial filter type from URL', () => {
            test('initializes with ID Search mode when filterType:idSearch in hash', async () => {
                // Arrange
                window.location.hash = '#filterType:idSearch&subjects:ID123%3BID456';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();

                // Assert - textarea contains parsed subjects and ID Search button is active
                const textarea = screen.getByLabelText(/enter animal ids/i);
                expect(textarea).toHaveValue('ID123,ID456');
                expectActiveFilterButton('search');
            });

            test('initializes with All Records mode when filterType:all in hash', async () => {
                // Arrange
                window.location.hash = '#filterType:all';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();

                // Assert - All Animals button is active with empty textarea
                expectActiveFilterButton('all');
                const textarea = screen.getByLabelText(/enter animal ids/i);
                expect(textarea).toHaveValue('');
            });

            test('initializes with Alive at Center mode when filterType:aliveAtCenter in hash', async () => {
                // Arrange
                window.location.hash = '#filterType:aliveAtCenter';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();

                // Assert - Alive at Center button is active
                expectActiveFilterButton('aliveAtCenter');
            });
        });

        describe('URL Params mode (readOnly)', () => {
            test('hides SearchByIdPanel when in readOnly mode with subjects', async () => {
                // Arrange
                window.location.hash = '#subjects:ID123%3BID456&readOnly:true';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();

                // Assert - SearchByIdPanel and filter buttons are absent
                expect(screen.queryByLabelText(/enter animal ids/i)).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /search by ids/i })).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /modify search/i })).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /all animals/i })).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /all alive at center/i })).not.toBeInTheDocument();
                expect(screen.queryByText('Select Filter to View Reports')).not.toBeInTheDocument();
            });

            test('shows SearchByIdPanel in normal mode (not readOnly)', async () => {
                // Arrange
                window.location.hash = '#filterType:idSearch';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();

                // Assert - textarea and primary filter buttons are present in DOM
                expect(screen.getByLabelText(/enter animal ids/i)).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /all animals/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /all alive at center/i })).toBeInTheDocument();
            });

            test('ignores readOnly:true when no subjects in URL and shows SearchByIdPanel', async () => {
                // Arrange
                window.location.hash = '#readOnly:true';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();

                // Assert - textarea and Search By IDs button are present in DOM
                expect(screen.getByLabelText(/enter animal ids/i)).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /search by ids/i })).toBeInTheDocument();
            });

            test('readOnly parameter takes priority over filterType parameter', async () => {
                // Arrange
                window.location.hash = '#filterType:all&subjects:ID123&readOnly:true';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();

                // Assert - SearchByIdPanel is hidden, readOnly is preserved, and filterType:all is dropped from hash
                expect(screen.queryByLabelText(/enter animal ids/i)).not.toBeInTheDocument();
                expect(screen.queryByRole('button', { name: /all animals/i })).not.toBeInTheDocument();
                expect(window.location.hash).toContain('readOnly:true');
                expect(window.location.hash).not.toContain('filterType:all');
            });
        });

        describe('URL hash updates', () => {
            const getHashParamValue = (hash: string, key: string): string | undefined => {
                const rawHash = hash.startsWith('#') ? hash.slice(1) : hash;
                const segment = rawHash
                    .split('&')
                    .find(param => param.startsWith(`${key}:`) && param.length > `${key}:`.length);

                return segment ? decodeURIComponent(segment.slice(key.length + 1)) : undefined;
            };

            test('updates URL hash when filter mode changes', async () => {
                // Arrange
                window.location.hash = '';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();
                const allBtn = screen.getByRole('button', { name: /all animals/i });
                await userEvent.click(allBtn);

                // Assert - URL hash contains filterType:all after clicking All Animals
                await waitFor(() => {
                    expect(window.location.hash).toContain('filterType:all');
                });
            });

            test('includes subjects in URL hash for ID Search mode', async () => {
                // Arrange
                window.location.hash = '#filterType:idSearch&subjects:ID123%3BID456';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();

                // Assert - textarea shows subjects and hash preserves them with semicolon encoding
                const textarea = screen.getByLabelText(/enter animal ids/i);
                expect(textarea).toHaveValue('ID123,ID456');
                expect(getHashParamValue(window.location.hash, 'subjects')).toBe('ID123;ID456');
            });

            test('removes subjects from URL hash for All Records mode', async () => {
                // Arrange
                window.location.hash = '#filterType:idSearch&subjects:ID123%3BID456';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();

                // Assert - subjects are initially present in hash
                expect(window.location.hash).toContain('subjects:');

                // Act
                const allBtn = screen.getByRole('button', { name: /all animals/i });
                await userEvent.click(allBtn);

                // Assert - subjects are removed and filterType is changed to all
                await waitFor(() => {
                    expect(window.location.hash).not.toContain('subjects:');
                    expect(window.location.hash).toContain('filterType:all');
                });
            });

            test('preserves activeReport parameter when switching filter modes', async () => {
                // Arrange
                window.location.hash = '#filterType:idSearch&activeReport:test-report&subjects:ID123&showReport:1';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();

                // Assert - activeReport is initially in hash
                expect(window.location.hash).toContain('activeReport:test-report');

                // Act
                const allBtn = screen.getByRole('button', { name: /all animals/i });
                await userEvent.click(allBtn);

                // Assert - activeReport is preserved and filterType is changed to all
                await waitFor(() => {
                    expect(window.location.hash).toContain('activeReport:test-report');
                    expect(window.location.hash).toContain('filterType:all');
                });
            });
        });

        describe('activeReportSupportsNonIdFilters query', () => {
            test('enables Alive at Center when active report supports non-ID filters', async () => {
                // Arrange
                window.location.hash = '#activeReport:test-report';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();

                // Assert - fetchReports was called and Alive at Center button is enabled
                expect(mockFetchReports).toHaveBeenCalled();
                const aliveBtn = screen.getByRole('button', { name: /all alive at center/i });
                expect(aliveBtn).not.toBeDisabled();
            });

            test('disables Alive at Center when switching to report that does not support non-ID filters', async () => {
                // Arrange
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

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitFor(() => {
                    expect(screen.getByText('General')).toBeVisible();
                });

                // Assert - Alive at Center button is initially enabled
                const aliveBtn = screen.getByRole('button', { name: /all alive at center/i });
                expect(aliveBtn).not.toBeDisabled();

                // Act
                await userEvent.click(screen.getByText('Other'));

                // Assert - Alive at Center button is disabled after switching category
                await waitFor(() => {
                    expect(screen.getByRole('button', { name: /all alive at center/i })).toBeDisabled();
                });
            });

            test('defaults to true when no active report selected', async () => {
                // Arrange
                window.location.hash = '';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();

                // Assert - Alive at Center button is enabled by default
                const aliveBtn = screen.getByRole('button', { name: /all alive at center/i });
                expect(aliveBtn).not.toBeDisabled();
            });
        });

        describe('race conditions', () => {
            test('handles rapid filter mode changes before state updates', async () => {
                // Arrange
                window.location.hash = '';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();
                const allBtn = screen.getByRole('button', { name: /all animals/i });
                const aliveBtn = screen.getByRole('button', { name: /all alive at center/i });
                await userEvent.click(allBtn);
                await userEvent.click(aliveBtn);
                await userEvent.click(allBtn);
                await userEvent.click(aliveBtn);

                // Assert - final state is Alive at Center after rapid clicks
                await waitFor(() => {
                    expectActiveFilterButton('aliveAtCenter');
                });
            });
        });

        describe('malformed URL hash', () => {
            test.each(['#malformed&invalid::data', '#filterType:&subjects:'])(
                'falls back to default state for malformed hash (%s)',
                async hashValue => {
                    // Arrange
                    window.location.hash = hashValue;

                    // Act
                    renderWithServerContext(
                        <ParticipantReports fetchReports={mockFetchReports} />,
                        defaultServerContext()
                    );
                    await waitForReportsToLoad();

                    // Assert - defaults to ID Search mode with empty textarea
                    expectActiveFilterButton('search');
                    const textarea = screen.getByLabelText(/enter animal ids/i);
                    expect(textarea).toHaveValue('');
                }
            );
        });

        describe('filter integration with TabbedReportPanel', () => {
            test('passes ID Search filters to TabbedReportPanel', async () => {
                // Arrange
                window.location.hash = '#filterType:idSearch&subjects:ID123&showReport:1';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();

                // Assert - placeholder hidden, Ext4 report created with idSearch filter and ['ID123'] subjects, ID Search mode active with ID123 in textarea
                expect(screen.queryByText('Select Filter to View Reports')).not.toBeInTheDocument();
                expect((globalThis as any).Ext4.create).toHaveBeenCalled();
                expect(mockExt4Container.filters).toEqual({
                    filterType: 'idSearch',
                    subjects: ['ID123'],
                });
                expectActiveFilterButton('search');
                const textarea = screen.getByLabelText(/enter animal ids/i);
                expect(textarea).toHaveValue('ID123');
            });

            test('passes All Records filter to TabbedReportPanel with no subjects', async () => {
                // Arrange
                window.location.hash = '#filterType:all&showReport:1';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();

                // Assert - placeholder hidden, All Animals active, Ext4 report created with all filter and no subjects
                expect(screen.queryByText('Select Filter to View Reports')).not.toBeInTheDocument();
                expectActiveFilterButton('all');
                expect((globalThis as any).Ext4.create).toHaveBeenCalled();
                expect(mockExt4Container.filters).toEqual({
                    filterType: 'all',
                    subjects: undefined,
                });
            });

            test('passes URL Params subjects to TabbedReportPanel', async () => {
                // Arrange
                window.location.hash = '#subjects:ID123&readOnly:true';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitForReportsToLoad();

                // Assert - placeholder hidden, SearchByIdPanel hidden, Ext4 report created with urlParams filter and ['ID123'] subjects
                expect(screen.queryByText('Select Filter to View Reports')).not.toBeInTheDocument();
                expect(screen.queryByLabelText(/enter animal ids/i)).not.toBeInTheDocument();
                expect((globalThis as any).Ext4.create).toHaveBeenCalled();
                expect(mockExt4Container.filters).toEqual({
                    filterType: 'urlParams',
                    subjects: ['ID123'],
                });
            });
        });

        describe('LABKEY query error handling', () => {
            test('handles LABKEY query failure gracefully', async () => {
                // Arrange
                const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
                mockFetchReports.mockResolvedValueOnce({
                    reports: [],
                    error: 'Query failed',
                });
                window.location.hash = '#activeReport:demographics';

                try {
                    // Act
                    renderWithServerContext(
                        <ParticipantReports fetchReports={mockFetchReports} />,
                        defaultServerContext()
                    );

                    // Act & Assert - empty state message is shown and error was logged to console
                    await waitFor(() => {
                        expect(screen.queryByText('No reports configuration provided.')).toBeInTheDocument();
                    });
                    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load reports:', 'Query failed');
                } finally {
                    consoleErrorSpy.mockRestore();
                }
            });

            test('defaults to supporting all filters when report metadata not found', async () => {
                // Arrange
                mockFetchReports.mockResolvedValueOnce({
                    reports: [],
                });
                window.location.hash = '#activeReport:nonexistent';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                // Act & Assert - empty state message is shown for nonexistent report
                await waitFor(() => {
                    expect(screen.queryByText('No reports configuration provided.')).toBeInTheDocument();
                });

                // Assert - Alive at Center button is enabled despite missing report metadata
                const aliveBtn = screen.getByRole('button', { name: /all alive at center/i });
                expect(aliveBtn).not.toBeDisabled();
            });
        });

        describe('filter unsupported error message', () => {
            test('shows error message when Alive at Center filter is not supported by report', async () => {
                // Arrange
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
                window.location.hash = '#filterType:aliveAtCenter&activeReport:test-report&showReport:1';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());

                // Assert - alert displays filter unsupported message with auto-switch notice
                const errorMessage = await screen.findByRole('alert');
                expect(errorMessage).toHaveTextContent(
                    'Filter type unsupported for this report. Switched to All Animals.'
                );
            });

            test('does not show error message when Alive at Center filter is supported', async () => {
                // Arrange
                window.location.hash = '#filterType:aliveAtCenter&activeReport:test-report&showReport:1';

                // Act
                renderWithServerContext(<ParticipantReports fetchReports={mockFetchReports} />, defaultServerContext());
                await waitFor(() => {
                    expect(screen.getByText('General')).toBeVisible();
                });

                // Assert - no filter unsupported error message is shown
                expect(
                    screen.queryByText('Filter type unsupported for this report. Switched to All Animals.')
                ).not.toBeInTheDocument();
            });
        });
    });

    describe('dependency injection', () => {
        test.each([
            {
                name: 'single category',
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
                expectedCategories: ['Injected'],
            },
            {
                name: 'multiple categories',
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
                expectedCategories: ['Category A', 'Category B'],
            },
        ])('accepts injected fetchReports for $name', async ({ reports, expectedCategories }) => {
            // Arrange
            const injectedFetchReports: FetchReportsFn = jest.fn().mockResolvedValue({ reports } as FetchReportsResult);

            // Act
            renderWithServerContext(<ParticipantReports fetchReports={injectedFetchReports} />, defaultServerContext());

            // Assert - injected fetchReports was called
            await waitFor(() => {
                expect(injectedFetchReports).toHaveBeenCalled();
            });

            // Assert - expected categories are visible
            expectedCategories.forEach(category => {
                expect(screen.getByText(category)).toBeVisible();
            });
        });

        test('uses default fetchReports when prop not provided', async () => {
            // Arrange
            const defaultFetchReports = jest.fn().mockResolvedValue({
                reports: [
                    {
                        id: 'default-report',
                        title: 'Default Report',
                        reportType: 'query',
                        supportsnonidfilters: true,
                        category: 'Default Category',
                        schemaName: 'ehr',
                        queryName: 'defaultQuery',
                    },
                ],
            });
            const apiWrapperSpy = jest
                .spyOn(APIWrapperModule, 'getDefaultParticipantHistoryAPIWrapper')
                .mockReturnValue({
                    fetchReports: defaultFetchReports,
                } as any);

            try {
                // Act
                renderWithServerContext(<ParticipantReports />, defaultServerContext());

                // Act & Assert - default fetchReports from API wrapper was called exactly once
                await waitFor(() => {
                    expect(defaultFetchReports).toHaveBeenCalledTimes(1);
                });

                // Assert - default report category 'Default Category' is visible
                expect(screen.getByText('Default Category')).toBeVisible();
            } finally {
                apiWrapperSpy.mockRestore();
            }
        });

        test('injected fetchReports handles errors', async () => {
            // Arrange
            const errorFetchReports: FetchReportsFn = jest.fn().mockResolvedValue({
                reports: [],
                error: 'Injected error for testing',
            });

            // Act
            renderWithServerContext(<ParticipantReports fetchReports={errorFetchReports} />, defaultServerContext());

            // Act & Assert - injected fetchReports was called
            await waitFor(() => {
                expect(errorFetchReports).toHaveBeenCalled();
            });

            // Assert - empty state message is shown
            expect(screen.queryByText('No reports configuration provided.')).toBeInTheDocument();
        });
    });
});
