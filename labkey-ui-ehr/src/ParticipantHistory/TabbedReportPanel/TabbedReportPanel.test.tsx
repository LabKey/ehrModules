/*
 * Copyright (c) 2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
import React from 'react';
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

// Mock @labkey/api Filter.create
jest.mock('@labkey/api', () => {
    const actual = jest.requireActual('@labkey/api');
    return {
        ...actual,
        Filter: {
            ...actual.Filter,
            create: (field: string, value: string, type: any) => {
                // Access the mock through a global reference that survives hoisting
                const mockFn = (globalThis as any).__mockFilterCreate__;
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
(globalThis as any).__mockFilterCreate__ = mockFilterCreate;

// Store the captured getFilterArray function from each container
let capturedGetFilterArray: (() => FilterArray) | null = null;

// Mock Ext4 global with Proxy to capture assigned methods
const createMockExt4Container = () => {
    const container = {
        add: jest.fn(),
        removeAll: jest.fn(),
        destroy: jest.fn(),
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

(globalThis as any).Ext4 = {
    create: jest.fn(() => createMockExt4Container()),
};

// Mock LABKEY.WebPart for OtherReportWrapper
(globalThis as any).LABKEY = {
    ...(globalThis as any).LABKEY,
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
 * Verifies no filters were created.
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
        // Arrange
        const reports = [queryReport];

        // Act
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

        // Assert - tab title visible and Ext4 container created for query report
        expect(await screen.findByText('Query Report')).toBeVisible();
        await waitFor(() => {
            expect((globalThis as any).Ext4.create).toHaveBeenCalledWith(
                'Ext.container.Container',
                expect.objectContaining({
                    border: false,
                })
            );
        });
    });

    test('renders js report tab and displays JSReportWrapper', async () => {
        // Arrange
        const reports = [jsReport];

        // Act
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

        // Assert - tab title visible and Ext4.create was called
        expect(await screen.findByText('JS Report')).toBeVisible();
        await waitFor(() => {
            expect((globalThis as any).Ext4.create).toHaveBeenCalled();
        });
    });

    test('renders other report tab and displays OtherReportWrapper', async () => {
        // Arrange
        const reports = [otherReport];

        // Act
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

        // Assert - tab title visible and LABKEY.WebPart was called
        expect(await screen.findByText('Other Report')).toBeVisible();
        await waitFor(() => {
            expect((globalThis as any).LABKEY.WebPart).toHaveBeenCalled();
        });
    });

    test('renders category tabs and allows switching between categories', async () => {
        // Arrange
        const reports = [queryReport, jsReport, otherReport];

        // Act
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

        // Assert - both category tabs are rendered
        expect(await screen.findByText('Category A')).toBeVisible();
        expect(await screen.findByText('Category B')).toBeVisible();

        // Act - click on Category B
        const user = userEvent.setup();
        const categoryBTab = screen.getByText('Category B');
        await user.click(categoryBTab);

        // Assert - Other Report is now visible after switching categories
        await waitFor(() => {
            expect(screen.getByText('Other Report')).toBeVisible();
        });
    });

    test('allows switching between reports in the same category', async () => {
        // Arrange
        const reports = [queryReport, jsReport];

        // Act
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

        // Assert - both report tabs are visible in Category A
        expect(await screen.findByText('Query Report')).toBeVisible();
        expect(await screen.findByText('JS Report')).toBeVisible();

        // Act - click on JS Report tab
        const user = userEvent.setup();
        const jsReportTab = screen.getByText('JS Report');
        await user.click(jsReportTab);

        // Assert - JS Report tab has active class after switching
        await waitFor(() => {
            const jsTab = screen.getByText('JS Report').closest('button');
            expect(jsTab).toHaveClass('tabbed-report-panel__report-tab--active');
        });
    });

    test('displays loading state when no reports provided initially', () => {
        // Act
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

        // Assert - loading message shown when reports prop is undefined
        expect(screen.getByText('Loading reports...')).toBeVisible();
    });

    test('displays message when reports array is empty', () => {
        // Act
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

        // Assert - empty configuration message shown when reports array is empty
        expect(screen.getByText('No reports configuration provided.')).toBeVisible();
    });

    test('calls onTabChange when switching tabs', async () => {
        // Arrange
        const onTabChange = jest.fn();
        const reports = [queryReport, jsReport];

        // Act
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
        await screen.findByText('Query Report');

        // Act - click on JS Report tab
        const user = userEvent.setup();
        const jsReportTab = screen.getByText('JS Report');
        await user.click(jsReportTab);

        // Assert - onTabChange called with the JS report id
        await waitFor(() => {
            expect(onTabChange).toHaveBeenCalledWith('js-report-1');
        });
    });

    test('selects the specified active report on initial render', async () => {
        // Arrange
        const reports = [queryReport, jsReport];

        // Act
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

        // Assert - JS Report tab is active based on activeReport prop
        await waitFor(() => {
            const jsTab = screen.getByText('JS Report').closest('button');
            expect(jsTab).toHaveClass('tabbed-report-panel__report-tab--active');
        });
    });

    describe('filter modes integration', () => {
        describe('ID Search mode', () => {
            test('creates subject ID filter for single subject', async () => {
                // Arrange
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

                // Act
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

                // Assert - EQUAL filter created for single subject ID
                expect(filterArray).not.toBeNull();
                expectSubjectFilter(['ID123']);
                expect(filterArray).toEqual({
                    removable: [],
                    nonRemovable: expect.arrayContaining([expect.objectContaining({ field: 'Id' })]),
                });
            });

            test.each([
                [['ID123', 'ID456', 'ID789'], 'ID123;ID456;ID789'],
                [['ID123', 'ID456'], 'ID123;ID456'],
            ])('creates EQUALS_ONE_OF subject filter for multiple subjects: %j', async (subjects, expectedValue) => {
                // Arrange
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects };

                // Act
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

                // Assert - multi-subject input becomes a semicolon-joined EQUALS_ONE_OF Id filter
                expect(filterArray).not.toBeNull();
                expectSubjectFilter(subjects);
                expectFilterCreated('Id', expectedValue, Filter.Types.EQUALS_ONE_OF);
            });
        });

        describe('URL Params mode', () => {
            test('creates subject ID filter from URL-provided subjects', async () => {
                // Arrange
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_URL_PARAMS, subjects: ['ID123', 'ID456'] };

                // Act
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

                // Assert - URL Params mode creates same filters as ID Search mode
                expectSubjectFilter(['ID123', 'ID456']);
            });

            test('handles single subject from URL params', async () => {
                // Arrange
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_URL_PARAMS, subjects: ['ID123'] };

                // Act
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

                // Assert - single subject uses EQUAL filter type
                expectSubjectFilter(['ID123']);
            });
        });

        describe('All Records mode', () => {
            test('creates no filters when filterType is all', async () => {
                // Arrange
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ALL, subjects: undefined };

                // Act
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

                // Assert - no filters created and both arrays are empty
                expectNoFiltersCreated();
                expect(filterArray?.nonRemovable).toHaveLength(0);
                expect(filterArray?.removable).toHaveLength(0);
            });

            test('ignores subjects when filterType is all', async () => {
                // Arrange
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ALL, subjects: ['ID123', 'ID456'] } as ReportFilters;

                // Act
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

                // Assert - no subject filters applied despite subjects being provided
                expectNoFiltersCreated();
                expect(filterArray?.nonRemovable).toHaveLength(0);
            });
        });

        describe('Alive at Center mode', () => {
            test('creates calculated_status = Alive filter and no subject filters', async () => {
                // Arrange
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ALIVE_AT_CENTER, subjects: undefined };

                // Act
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

                // Assert - status filter created with one nonRemovable entry and no Id subject filter
                expectAliveAtCenterFilter();
                expect(filterArray?.nonRemovable).toHaveLength(1);
                expect(mockFilterCreate).not.toHaveBeenCalledWith('Id', expect.any(String), expect.anything());
            });
        });

        describe('filter switching', () => {
            test('updates report filters when switching from ID Search to All Records', async () => {
                // Arrange
                const reports = [queryReport];
                const initialFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };
                const onTabChange = jest.fn();

                // Act - render with ID Search filters
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

                // Assert - initial ID Search filter was created
                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });
                invokeGetFilterArray();
                expectSubjectFilter(['ID123']);

                // Arrange - clear mocks before switching
                mockFilterCreate.mockClear();
                capturedGetFilterArray = null;

                // Act - switch to All Records mode
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
                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });
                const filterArray = invokeGetFilterArray();

                // Assert - no filters after switching to All Records
                expectNoFiltersCreated();
                expect(filterArray?.nonRemovable).toHaveLength(0);
            });

            test('updates report filters when switching from All Records to Alive at Center', async () => {
                // Arrange
                const reports = [queryReport];
                const initialFilters = { filterType: FILTER_TYPE_ALL, subjects: undefined };
                const onTabChange = jest.fn();

                // Act - render with All Records filters
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

                // Assert - initial All Records mode has no filters
                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });
                invokeGetFilterArray();
                expectNoFiltersCreated();

                // Arrange - clear mocks before switching
                mockFilterCreate.mockClear();
                capturedGetFilterArray = null;

                // Act - switch to Alive at Center mode
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
                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });
                invokeGetFilterArray();

                // Assert - status filter applied after switching to Alive at Center
                expectAliveAtCenterFilter();
            });

            test('updates report filters when switching from Alive at Center to ID Search', async () => {
                // Arrange
                const reports = [queryReport];
                const initialFilters = { filterType: FILTER_TYPE_ALIVE_AT_CENTER, subjects: undefined };
                const onTabChange = jest.fn();

                // Act - render with Alive at Center filters
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

                // Assert - initial Alive at Center filter was created
                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });
                invokeGetFilterArray();
                expectAliveAtCenterFilter();

                // Arrange - clear mocks before switching
                mockFilterCreate.mockClear();
                capturedGetFilterArray = null;

                // Act - switch to ID Search mode
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
                await waitFor(() => {
                    expect(capturedGetFilterArray).not.toBeNull();
                });
                invokeGetFilterArray();

                // Assert - subject filters applied after switching to ID Search
                expectSubjectFilter(['ID123', 'ID456']);
            });
        });

        describe('empty subjects validation', () => {
            test('creates no subject filters when ID Search mode has empty subjects array', async () => {
                // Arrange
                const reports = [queryReport];
                const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: [] };

                // Act
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

                // Assert - no filters created for empty subjects array
                expectNoFiltersCreated();
                expect(filterArray?.nonRemovable).toHaveLength(0);
            });
        });

        describe('report supportsNonIdFilters field', () => {
            test.each([false, true])(
                'applies Alive at Center filter when supportsnonidfilters is %s',
                async supportsnonidfilters => {
                    // Arrange
                    const report: ReportConfig = {
                        ...queryReport,
                        supportsnonidfilters,
                    };
                    const reports = [report];
                    const filters = { filterType: FILTER_TYPE_ALIVE_AT_CENTER, subjects: undefined };

                    // Act
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

                    // Assert - calculated_status filter is applied regardless of supportsnonidfilters value
                    expectAliveAtCenterFilter();
                }
            );
        });

        describe('custom subjectIdFieldName handling', () => {
            test('uses custom subjectIdFieldName from report config', async () => {
                // Arrange
                const customReport: ReportConfig = {
                    ...queryReport,
                    subjectIdFieldName: 'ParticipantId',
                };
                const reports = [customReport];
                const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

                // Act
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

                // Assert - filter uses custom ParticipantId field instead of default Id
                expectSubjectFilter(['ID123'], 'ParticipantId');
            });

            test.each([
                [undefined, 'not specified'],
                [null, 'null'],
            ])('defaults to Id when subjectIdFieldName is %s (%s case)', async (subjectIdFieldName, _label) => {
                // Arrange
                const report: ReportConfig = {
                    ...queryReport,
                    subjectIdFieldName: subjectIdFieldName as any,
                };
                const reports = [report];
                const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

                // Act
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

                // Assert - Id is used as fallback when subjectIdFieldName is missing or null
                expectSubjectFilter(['ID123'], 'Id');
            });
        });

        describe('edge cases for filter modes', () => {
            test.each([
                ['undefined filterType', { subjects: ['ID123'] } as any],
                ['null filters', null as any],
                ['empty filterType string', { filterType: '', subjects: ['ID123'] } as any],
            ])('handles %s gracefully', async (_caseLabel, filters) => {
                // Arrange
                const reports = [queryReport];

                // Act
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

                // Assert - invalid filter inputs do not crash and produce empty filter arrays
                expectNoFiltersCreated();
                expect(filterArray?.nonRemovable).toHaveLength(0);
                expect(filterArray?.removable).toHaveLength(0);
            });
        });
    });
});
