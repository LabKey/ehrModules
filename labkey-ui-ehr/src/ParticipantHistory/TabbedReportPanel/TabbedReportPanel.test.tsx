import React, { act } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Filter } from '@labkey/api';

import { TabbedReportPanel } from './TabbedReportPanel';
import {
    FILTER_TYPE_ALIVE_AT_CENTER,
    FILTER_TYPE_ALL,
    FILTER_TYPE_ID_SEARCH,
    FILTER_TYPE_URL_PARAMS,
    FilterArray,
    ReportConfig,
    ReportFilters,
} from '../models';
import { defaultServerContext, renderWithServerContext } from '../../test/utils';

// Define mock function outside jest.mock for access in tests
// Jest hoists jest.mock calls, so we need to use a reference that jest.mock can see
const mockFilterCreateFn = jest.fn();

// Mock @labkey/api Query.selectRows and Filter.create
jest.mock('@labkey/api', () => {
    const actual = jest.requireActual('@labkey/api');
    return {
        ...actual,
        Query: {
            ...actual.Query,
            selectRows: jest.fn(),
        },
        Filter: {
            ...actual.Filter,
            create: (field: string, value: string, type: any) => {
                // Access the mock through a global reference that survives hoisting
                const mockFn = (global as any).__mockFilterCreate__;
                if (mockFn) {
                    return mockFn(field, value, type);
                }
                return { field, value, type };
            },
        },
    };
});

// Set up the global mock reference
const mockFilterCreate = jest.fn((field: string, value: string, type: any) => ({
    field,
    value,
    type,
    getColumnName: () => field,
    getValue: () => value,
    getFilterType: () => type,
    getURLParameterName: () => `query.${field}~${type?.getURLSuffix?.() || 'eq'}`,
    getURLParameterValue: () => value,
}));
(global as any).__mockFilterCreate__ = mockFilterCreate;

// Store the captured getFilterArray function from each container
let capturedGetFilterArray: (() => FilterArray) | null = null;

// Mock Ext4 global with Proxy to capture assigned methods
const createMockExt4Container = () => {
    const container = {
        report: null as any,
        filters: null as any,
        isDestroyed: false,
        add: jest.fn(),
        removeAll: jest.fn(),
        destroy: jest.fn(),
        getFilterArray: jest.fn(() => ({ removable: [], nonRemovable: [] })),
        getQWPConfig: jest.fn(() => ({})),
    };

    // Use Proxy to capture when getFilterArray is assigned
    return new Proxy(container, {
        set(target, prop, value) {
            if (prop === 'getFilterArray' && typeof value === 'function') {
                capturedGetFilterArray = value;
            }
            (target as any)[prop] = value;
            return true;
        },
    });
};

// Keep a reference for tests that need to check the container directly
let mockExt4Container: ReturnType<typeof createMockExt4Container>;

(global as any).Ext4 = {
    create: jest.fn(() => {
        mockExt4Container = createMockExt4Container();
        return mockExt4Container;
    }),
};

// Mock LDK global for QueryReportWrapper
(global as any).LDK = {
    Utils: {
        getErrorCallback: jest.fn(() => jest.fn()),
    },
};

// Mock LABKEY.WebPart for OtherReportWrapper
(global as any).LABKEY = {
    ...(global as any).LABKEY,
    WebPart: jest.fn().mockImplementation(() => ({
        render: jest.fn(),
    })),
};

// Mock testJsFunction for JSReportWrapper tests
(window as any).testJsFunction = jest.fn();

// ============================================================================
// Shared Validation Helper Functions
// ============================================================================

/**
 * Verifies Filter.create was called with expected arguments.
 * Use this for all tests that need to verify filter creation.
 */
const expectFilterCreated = (
    fieldName: string,
    value: string,
    filterType: typeof Filter.Types.EQUAL | typeof Filter.Types.EQUALS_ONE_OF
): void => {
    expect(mockFilterCreate).toHaveBeenCalledWith(fieldName, value, filterType);
};

/**
 * Verifies no filters were created - for All Records mode tests.
 */
const expectNoFiltersCreated = (): void => {
    expect(mockFilterCreate).not.toHaveBeenCalled();
};

/**
 * Verifies subject ID filter was created with correct format.
 * Handles both single and multiple subjects automatically.
 */
const expectSubjectFilter = (subjects: string[], fieldName = 'Id'): void => {
    if (subjects.length === 1) {
        expectFilterCreated(fieldName, subjects[0], Filter.Types.EQUAL);
    } else {
        expectFilterCreated(fieldName, subjects.join(';'), Filter.Types.EQUALS_ONE_OF);
    }
};

/**
 * Verifies Alive at Center filter was created.
 */
const expectAliveAtCenterFilter = (): void => {
    expectFilterCreated('Id/Demographics/calculated_status', 'Alive', Filter.Types.EQUAL);
};

/**
 * Invokes the captured getFilterArray function and returns the result.
 * Returns null if no getFilterArray was captured.
 */
const invokeGetFilterArray = (): FilterArray | null => {
    if (capturedGetFilterArray) {
        return capturedGetFilterArray();
    }
    return null;
};

describe('TabbedReportPanel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFilterCreate.mockClear();
        capturedGetFilterArray = null;
    });

    const queryReport: ReportConfig = {
        id: 'query-report-1',
        title: 'Query Report',
        reportType: 'query',
        schemaName: 'core',
        queryName: 'users',
        category: 'Category A',
        containerPath: null,
        subjectIdFieldName: null,
        supportsnonidfilters: null,
        viewName: null,
    };

    const jsReport: ReportConfig = {
        id: 'js-report-1',
        title: 'JS Report',
        reportType: 'js',
        queryName: 'testJsFunction',
        category: 'Category A',
        containerPath: null,
        subjectIdFieldName: null,
        supportsnonidfilters: null,
        viewName: null,
    };

    const otherReport: ReportConfig = {
        id: 'other-report-1',
        title: 'Other Report',
        reportType: 'report',
        schemaName: 'core',
        queryName: 'users',
        reportId: 'report-123',
        category: 'Category B',
        containerPath: null,
        subjectIdFieldName: null,
        supportsnonidfilters: null,
        viewName: null,
    };

    test('renders query report tab and displays QueryReportWrapper', async () => {
        const reports = [queryReport];

        renderWithServerContext(
            <TabbedReportPanel
                activeReport={undefined}
                filters={{ filterType: FILTER_TYPE_ID_SEARCH, subjects: ['test-subject'] }}
                onTabChange={jest.fn()}
                reports={reports}
                showReport={true}
            />,
            defaultServerContext()
        );

        // Verify the report title is shown in the tab
        expect(await screen.findByText('Query Report')).toBeVisible();

        // Verify Ext4.create was called for the tab container
        await waitFor(() => {
            expect((global as any).Ext4.create).toHaveBeenCalledWith(
                'Ext.container.Container',
                expect.objectContaining({
                    border: false,
                })
            );
        });
    });

    test('renders js report tab and displays JSReportWrapper', async () => {
        const reports = [jsReport];

        renderWithServerContext(
            <TabbedReportPanel
                activeReport={undefined}
                filters={{ filterType: FILTER_TYPE_ID_SEARCH, subjects: ['test-subject'] }}
                onTabChange={jest.fn()}
                reports={reports}
                showReport={true}
            />,
            defaultServerContext()
        );

        // Verify the report title is shown in the tab
        expect(await screen.findByText('JS Report')).toBeVisible();

        // Verify Ext4.create was called
        await waitFor(() => {
            expect((global as any).Ext4.create).toHaveBeenCalled();
        });
    });

    test('renders other report tab and displays OtherReportWrapper', async () => {
        const reports = [otherReport];

        renderWithServerContext(
            <TabbedReportPanel
                activeReport={undefined}
                filters={{ filterType: FILTER_TYPE_ID_SEARCH, subjects: ['test-subject'] }}
                onTabChange={jest.fn()}
                reports={reports}
                showReport={true}
            />,
            defaultServerContext()
        );

        // Verify the report title is shown in the tab
        expect(await screen.findByText('Other Report')).toBeVisible();

        // Verify LABKEY.WebPart was instantiated for the report
        await waitFor(() => {
            expect((global as any).LABKEY.WebPart).toHaveBeenCalled();
        });
    });

    test('renders category tabs and allows switching between categories', async () => {
        const reports = [queryReport, jsReport, otherReport];

        renderWithServerContext(
            <TabbedReportPanel
                activeReport={undefined}
                filters={{ filterType: FILTER_TYPE_ID_SEARCH, subjects: ['test-subject'] }}
                onTabChange={jest.fn()}
                reports={reports}
                showReport={false}
            />,
            defaultServerContext()
        );

        // Verify category tabs are rendered
        expect(await screen.findByText('Category A')).toBeVisible();
        expect(await screen.findByText('Category B')).toBeVisible();

        // Click on Category B
        const categoryBTab = screen.getByText('Category B');
        await act(async () => {
            userEvent.click(categoryBTab);
        });

        // Verify the Other Report is now active
        await waitFor(() => {
            expect(screen.getByText('Other Report')).toBeVisible();
        });
    });

    test('allows switching between reports in the same category', async () => {
        const reports = [queryReport, jsReport];

        renderWithServerContext(
            <TabbedReportPanel
                activeReport={undefined}
                filters={{ filterType: FILTER_TYPE_ID_SEARCH, subjects: ['test-subject'] }}
                onTabChange={jest.fn()}
                reports={reports}
                showReport={false}
            />,
            defaultServerContext()
        );

        // Verify both report tabs are visible in Category A
        expect(await screen.findByText('Query Report')).toBeVisible();
        expect(await screen.findByText('JS Report')).toBeVisible();

        // Click on JS Report tab
        const jsReportTab = screen.getByText('JS Report');
        await act(async () => {
            userEvent.click(jsReportTab);
        });

        // The JS Report tab should now be active
        await waitFor(() => {
            const jsTab = screen.getByText('JS Report').closest('button');
            expect(jsTab).toHaveClass('report-tab-active');
        });
    });

    test('displays loading state when no reports provided initially', () => {
        // When reportsQuery is used but reports prop is not provided,
        // it should show loading until data is fetched
        renderWithServerContext(
            <TabbedReportPanel
                activeReport={undefined}
                filters={{ filterType: FILTER_TYPE_ID_SEARCH, subjects: [] }}
                onTabChange={jest.fn()}
                reports={undefined}
                showReport={false}
            />,
            defaultServerContext()
        );

        expect(screen.getByText('Loading reports...')).toBeVisible();
    });

    test('displays message when reports array is empty', () => {
        renderWithServerContext(
            <TabbedReportPanel
                activeReport={undefined}
                filters={{ filterType: FILTER_TYPE_ID_SEARCH, subjects: [] }}
                onTabChange={jest.fn()}
                reports={[]}
                showReport={false}
            />,
            defaultServerContext()
        );

        expect(screen.getByText('No reports configuration provided.')).toBeVisible();
    });

    test('calls onTabChange when switching tabs', async () => {
        const onTabChange = jest.fn();
        const reports = [queryReport, jsReport];

        renderWithServerContext(
            <TabbedReportPanel
                activeReport={undefined}
                filters={{ filterType: FILTER_TYPE_ID_SEARCH, subjects: ['test-subject'] }}
                onTabChange={onTabChange}
                reports={reports}
                showReport={false}
            />,
            defaultServerContext()
        );

        // Wait for initial render
        await screen.findByText('Query Report');

        // Click on JS Report tab
        const jsReportTab = screen.getByText('JS Report');
        await act(async () => {
            userEvent.click(jsReportTab);
        });

        // Verify onTabChange was called with the new tab id
        await waitFor(() => {
            expect(onTabChange).toHaveBeenCalledWith('js-report-1');
        });
    });

    test('selects the specified active report on initial render', async () => {
        const reports = [queryReport, jsReport];

        renderWithServerContext(
            <TabbedReportPanel
                activeReport="js-report-1"
                filters={{ filterType: FILTER_TYPE_ID_SEARCH, subjects: ['test-subject'] }}
                onTabChange={jest.fn()}
                reports={reports}
                showReport={false}
            />,
            defaultServerContext()
        );

        // Wait for render and verify JS Report tab is active
        await waitFor(() => {
            const jsTab = screen.getByText('JS Report').closest('button');
            expect(jsTab).toHaveClass('report-tab-active');
        });
    });

    describe('filter modes integration', () => {
        describe('ID Search mode', () => {
            test('creates subject ID filter for single subject', async () => {
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Invoke getFilterArray to trigger filter creation
                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                const filterArray = invokeGetFilterArray();
                expect(filterArray).not.toBeNull();

                // Verify Filter.create was called with correct arguments for single subject
                expectSubjectFilter(['ID123']);
            });

            test('creates subject ID filter for multiple subjects', async () => {
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123', 'ID456', 'ID789'] };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                const filterArray = invokeGetFilterArray();
                expect(filterArray).not.toBeNull();

                // Verify Filter.create was called with semicolon-separated subjects
                expectSubjectFilter(['ID123', 'ID456', 'ID789']);
            });

            test('uses EQUALS_ONE_OF filter type for multiple subjects', async () => {
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123', 'ID456'] };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                invokeGetFilterArray();

                // Verify EQUALS_ONE_OF filter type is used for multiple subjects
                expectFilterCreated('Id', 'ID123;ID456', Filter.Types.EQUALS_ONE_OF);
            });
        });

        describe('URL Params mode', () => {
            test('creates subject ID filter from URL-provided subjects', async () => {
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_URL_PARAMS, subjects: ['ID123', 'ID456'] };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                invokeGetFilterArray();

                // URL Params mode should create same filters as ID Search mode
                expectSubjectFilter(['ID123', 'ID456']);
            });

            test('handles single subject from URL params', async () => {
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_URL_PARAMS, subjects: ['ID123'] };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                invokeGetFilterArray();

                // Single subject should use EQUAL filter type
                expectSubjectFilter(['ID123']);
            });
        });

        describe('All Records mode', () => {
            test('creates no filters when filterType is all', async () => {
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ALL, subjects: undefined };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                const filterArray = invokeGetFilterArray();

                // All Records mode should not create any filters
                expectNoFiltersCreated();
                expect(filterArray?.nonRemovable).toHaveLength(0);
                expect(filterArray?.removable).toHaveLength(0);
            });

            test('ignores subjects when filterType is all', async () => {
                const reports = [queryReport];
                // Provide subjects that should be ignored in All Records mode
                const filters = { filterType: FILTER_TYPE_ALL, subjects: ['ID123', 'ID456'] } as ReportFilters;

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                const filterArray = invokeGetFilterArray();

                // Should not apply subject filters even when subjects are provided
                expectNoFiltersCreated();
                expect(filterArray?.nonRemovable).toHaveLength(0);
            });
        });

        describe('Alive at Center mode', () => {
            test('creates calculated_status = Alive filter', async () => {
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ALIVE_AT_CENTER, subjects: undefined };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                const filterArray = invokeGetFilterArray();

                // Should create filter on Id/Demographics/calculated_status field
                expectAliveAtCenterFilter();
                expect(filterArray?.nonRemovable).toHaveLength(1);
            });

            test('does not create subject filters in Alive at Center mode', async () => {
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ALIVE_AT_CENTER, subjects: undefined };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                // Clear mocks to get fresh counts for this specific getFilterArray call
                mockFilterCreate.mockClear();

                invokeGetFilterArray();

                // Only status filter should be created, not subject filter
                expectAliveAtCenterFilter();
                // Verify Filter.create was called only for status filter, not for subject ID
                expect(mockFilterCreate).not.toHaveBeenCalledWith('Id', expect.any(String), expect.anything());
            });
        });

        describe('filter switching', () => {
            test('updates report filters when switching from ID Search to All Records', async () => {
                const reports = [queryReport];
                const initialFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };
                const onTabChange = jest.fn();

                const { rerender } = renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={initialFilters}
                        onTabChange={onTabChange}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Verify initial ID Search filter was created
                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });
                invokeGetFilterArray();
                expectSubjectFilter(['ID123']);

                // Clear mocks before switching
                mockFilterCreate.mockClear();
                capturedGetFilterArray = null;

                // Switch to All Records mode
                const newFilters = { filterType: FILTER_TYPE_ALL, subjects: undefined };
                rerender(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={newFilters}
                        onTabChange={onTabChange}
                        reports={reports}
                        showReport={true}
                    />
                );

                // Report should update with no filters
                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                const filterArray = invokeGetFilterArray();
                expectNoFiltersCreated();
                expect(filterArray?.nonRemovable).toHaveLength(0);
            });

            test('updates report filters when switching from All Records to Alive at Center', async () => {
                const reports = [queryReport];
                const initialFilters = { filterType: FILTER_TYPE_ALL, subjects: undefined };
                const onTabChange = jest.fn();

                const { rerender } = renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={initialFilters}
                        onTabChange={onTabChange}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Verify initial All Records mode has no filters
                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });
                invokeGetFilterArray();
                expectNoFiltersCreated();

                // Clear mocks before switching
                mockFilterCreate.mockClear();
                capturedGetFilterArray = null;

                // Switch to Alive at Center mode
                const newFilters = { filterType: FILTER_TYPE_ALIVE_AT_CENTER, subjects: undefined };
                rerender(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={newFilters}
                        onTabChange={onTabChange}
                        reports={reports}
                        showReport={true}
                    />
                );

                // Report should update with status filter
                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                invokeGetFilterArray();
                expectAliveAtCenterFilter();
            });

            test('updates report filters when switching from Alive at Center to ID Search', async () => {
                const reports = [queryReport];
                const initialFilters = { filterType: FILTER_TYPE_ALIVE_AT_CENTER, subjects: undefined };
                const onTabChange = jest.fn();

                const { rerender } = renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={initialFilters}
                        onTabChange={onTabChange}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Verify initial Alive at Center filter was created
                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });
                invokeGetFilterArray();
                expectAliveAtCenterFilter();

                // Clear mocks before switching
                mockFilterCreate.mockClear();
                capturedGetFilterArray = null;

                // Switch to ID Search mode
                const newFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123', 'ID456'] };
                rerender(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={newFilters}
                        onTabChange={onTabChange}
                        reports={reports}
                        showReport={true}
                    />
                );

                // Report should update with subject filters
                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                invokeGetFilterArray();
                expectSubjectFilter(['ID123', 'ID456']);
            });
        });

        describe('empty subjects validation', () => {
            test('creates no subject filters when ID Search mode has empty subjects array', async () => {
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: [] };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                const filterArray = invokeGetFilterArray();

                // Empty subjects array should not create any filters
                expectNoFiltersCreated();
                expect(filterArray?.nonRemovable).toHaveLength(0);
            });
        });

        describe('report supportsNonIdFilters field', () => {
            test('applies Alive at Center filter regardless of supportsnonidfilters setting', async () => {
                // Note: The getFilterArray function applies filters based on filterType
                // regardless of supportsnonidfilters. The parent component is responsible
                // for showing error messages or hiding reports that don't support non-ID filters.
                const unsupportedReport: ReportConfig = {
                    ...queryReport,
                    supportsnonidfilters: false,
                };
                const reports = [unsupportedReport];
                const filters = { filterType: FILTER_TYPE_ALIVE_AT_CENTER, subjects: undefined };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                invokeGetFilterArray();

                // Filter is still created - parent component handles the error display
                expectAliveAtCenterFilter();
            });

            test('applies Alive at Center filter when report supports non-ID filters', async () => {
                const supportedReport: ReportConfig = {
                    ...queryReport,
                    supportsnonidfilters: true,
                };
                const reports = [supportedReport];
                const filters = { filterType: FILTER_TYPE_ALIVE_AT_CENTER, subjects: undefined };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                invokeGetFilterArray();

                // Should apply calculated_status filter
                expectAliveAtCenterFilter();
            });
        });

        describe('LabKey Filter API format', () => {
            test('creates filters in correct LabKey Filter.create() format for single subject', async () => {
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                invokeGetFilterArray();

                // Should use Filter.Types.EQUAL for single subject
                expect(mockFilterCreate).toHaveBeenCalledWith('Id', 'ID123', Filter.Types.EQUAL);
            });

            test('creates filters in correct LabKey Filter.create() format for multiple subjects', async () => {
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123', 'ID456'] };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                invokeGetFilterArray();

                // Should use Filter.Types.EQUALS_ONE_OF for multiple subjects
                // Subjects should be joined with semicolon: 'ID123;ID456'
                expect(mockFilterCreate).toHaveBeenCalledWith('Id', 'ID123;ID456', Filter.Types.EQUALS_ONE_OF);
            });
        });

        describe('custom subjectIdFieldName handling', () => {
            test('uses custom subjectIdFieldName from report config', async () => {
                const customReport: ReportConfig = {
                    ...queryReport,
                    subjectIdFieldName: 'ParticipantId',
                };
                const reports = [customReport];
                const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                invokeGetFilterArray();

                // Should use custom subjectIdFieldName instead of default 'Id'
                expectSubjectFilter(['ID123'], 'ParticipantId');
            });

            test('defaults to Id when subjectIdFieldName not specified', async () => {
                const reports = [queryReport]; // No subjectIdFieldName specified
                const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                invokeGetFilterArray();

                // Should default to 'Id' field
                expectSubjectFilter(['ID123'], 'Id');
            });

            test('defaults to Id when subjectIdFieldName is null', async () => {
                const reportWithNullField: ReportConfig = {
                    ...queryReport,
                    subjectIdFieldName: null,
                };
                const reports = [reportWithNullField];
                const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                invokeGetFilterArray();

                // Should default to 'Id' when subjectIdFieldName is null
                expectSubjectFilter(['ID123'], 'Id');
            });
        });

        describe('edge cases for filter modes', () => {
            test('handles undefined filterType gracefully', async () => {
                const reports = [queryReport];
                // Intentionally testing invalid filter object - cast to bypass type checking
                const filters = { subjects: ['ID123'] } as any; // No filterType specified

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                const filterArray = invokeGetFilterArray();

                // Should not crash, should create no filters (unrecognized filterType)
                expectNoFiltersCreated();
                expect(filterArray?.nonRemovable).toHaveLength(0);
            });

            test('handles null filters gracefully', async () => {
                const reports = [queryReport];

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        // Intentionally testing null filter - cast to bypass type checking
                        filters={null as any}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                const filterArray = invokeGetFilterArray();

                // Should not crash with null filters, return empty filter array
                expectNoFiltersCreated();
                expect(filterArray?.nonRemovable).toHaveLength(0);
                expect(filterArray?.removable).toHaveLength(0);
            });

            test('handles empty filterType string', async () => {
                const reports = [queryReport];
                // Intentionally testing invalid empty string - cast to bypass type checking
                const filters = { filterType: '', subjects: ['ID123'] } as any;

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                const filterArray = invokeGetFilterArray();

                // Should treat empty string as unrecognized filterType, creating no filters
                expectNoFiltersCreated();
                expect(filterArray?.nonRemovable).toHaveLength(0);
            });
        });

        describe('FilterArray structure validation', () => {
            test('getFilterArray returns correct structure with nonRemovable filters', async () => {
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                const filterArray = invokeGetFilterArray();

                // Verify the structure of the returned FilterArray
                expect(filterArray).toEqual({
                    removable: [],
                    nonRemovable: expect.arrayContaining([expect.objectContaining({ field: 'Id' })]),
                });
            });

            test('getFilterArray returns empty arrays for All Records mode', async () => {
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ALL, subjects: undefined };

                renderWithServerContext(
                    <TabbedReportPanel
                        activeReport={undefined}
                        filters={filters}
                        onTabChange={jest.fn()}
                        reports={reports}
                        showReport={true}
                    />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });

                const filterArray = invokeGetFilterArray();

                // Verify empty structure for All Records mode
                expect(filterArray).toEqual({
                    removable: [],
                    nonRemovable: [],
                });
            });
        });
    });
});
