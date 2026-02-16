import React, { FC, useEffect } from 'react';
import { render, renderHook, waitFor } from '@testing-library/react';
import { Filter } from '@labkey/api';

import {
    ExtReportTab,
    FILTER_TYPE_ALIVE_AT_CENTER,
    FILTER_TYPE_ALL,
    FILTER_TYPE_ID_SEARCH,
    FILTER_TYPE_URL_PARAMS,
    ReportConfig,
    ReportFilters,
} from '../models';

import { useReportTab } from './useReportTab';

// Mock Filter.create to return objects with accessor methods
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
const originalMockFilterCreate = (globalThis as any).__mockFilterCreate__;
(globalThis as any).__mockFilterCreate__ = mockFilterCreate;

jest.mock('@labkey/api', () => {
    const actual = jest.requireActual('@labkey/api');
    return {
        ...actual,
        Filter: {
            ...actual.Filter,
            create: (field: string, value: string, type: any) => {
                const mockFn = (globalThis as any).__mockFilterCreate__;
                if (mockFn) {
                    return mockFn(field, value, type);
                }
                return { field, value, type };
            },
        },
    };
});

// Track all created container instances
let mockContainerInstances: any[] = [];

// Factory to create mock containers that track method calls
const createMockContainer = (): any => {
    const container = {
        report: null as any,
        filters: null as any,
        isDestroyed: false,
        add: jest.fn(),
        removeAll: jest.fn(),
        destroy: jest.fn(() => {
            container.isDestroyed = true;
        }),
        getFilterArray: jest.fn(() => ({ removable: [], nonRemovable: [] })),
        getQWPConfig: jest.fn(() => ({})),
    };
    mockContainerInstances.push(container);
    return container;
};

// Setup Ext4 global mock and preserve original global for restoration
const originalExt4 = (globalThis as any).Ext4;
(globalThis as any).Ext4 = {
    create: jest.fn(() => createMockContainer()),
};

// Test harness component that renders a div and attaches the hook's ref
const TestHarness: FC<{
    filters: ReportFilters;
    onTab: (tab: ExtReportTab | null) => void;
    report: ReportConfig;
}> = ({ report, filters, onTab }) => {
    const { tab, targetRef } = useReportTab(report, filters);

    useEffect(() => {
        onTab(tab);
    }, [tab, onTab]);

    return <div data-testid="target" ref={targetRef} />;
};

describe('useReportTab', () => {
    afterAll(() => {
        if (originalMockFilterCreate === undefined) {
            delete (globalThis as any).__mockFilterCreate__;
        } else {
            (globalThis as any).__mockFilterCreate__ = originalMockFilterCreate;
        }

        if (originalExt4 === undefined) {
            delete (globalThis as any).Ext4;
        } else {
            (globalThis as any).Ext4 = originalExt4;
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockFilterCreate.mockClear();
        mockContainerInstances = [];
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

    const filters: ReportFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

    describe('basic hook behavior (without DOM)', () => {
        test('returns a ref that can be attached to a DOM element', () => {
            // Act
            const { result } = renderHook(() => useReportTab(queryReport, filters));

            // Assert - ref object exists and initially points to null
            expect(result.current.targetRef).toBeDefined();
            expect(result.current.targetRef.current).toBeNull();
        });

        test('tab starts as null when no DOM element attached', () => {
            // Act
            const { result } = renderHook(() => useReportTab(queryReport, filters));

            // Assert - tab is null without a DOM element
            expect(result.current.tab).toBeNull();
        });

        test('does not create tab if Ext4 is undefined', () => {
            // Arrange
            const previousExt4 = (globalThis as any).Ext4;
            (globalThis as any).Ext4 = undefined;

            try {
                // Act
                const { result } = renderHook(() => useReportTab(queryReport, filters));

                // Assert - tab remains null when Ext4 is unavailable
                expect(result.current.tab).toBeNull();
            } finally {
                (globalThis as any).Ext4 = previousExt4;
            }
        });

        test('cleans up without error on unmount when tab is null', () => {
            // Act
            const { unmount } = renderHook(() => useReportTab(queryReport, filters));

            // Assert - cleanup runs without throwing when tab is null
            unmount();
        });
    });

    describe('Ext4 container creation (with DOM attachment)', () => {
        test('creates tab with expected container config, data, and helper behavior when ref is attached', async () => {
            // Arrange
            let capturedTab: ExtReportTab | null = null;

            // Act
            render(
                <TestHarness
                    filters={filters}
                    onTab={t => {
                        capturedTab = t;
                    }}
                    report={queryReport}
                />
            );
            await waitFor(() => {
                expect(capturedTab).not.toBeNull();
            });
            const filterArray = capturedTab!.getFilterArray();
            const qwpConfig = capturedTab!.getQWPConfig();

            // Assert - Ext4.create receives the target element and borderless container config
            expect((globalThis as any).Ext4.create).toHaveBeenCalledWith(
                'Ext.container.Container',
                expect.objectContaining({
                    renderTo: expect.any(HTMLDivElement),
                    border: false,
                    defaults: { border: false },
                })
            );

            // Assert - tab holds report/filter references and helper methods produce expected structures
            expect(capturedTab!.report).toBe(queryReport);
            expect(capturedTab!.filters).toBe(filters);
            expect(filterArray).toEqual(
                expect.objectContaining({
                    removable: expect.any(Array),
                    nonRemovable: expect.any(Array),
                })
            );
            expect(qwpConfig.tab).toBe(capturedTab);
        });
    });

    describe('getFilterArray', () => {
        test('returns subject filter for ID Search mode with single subject', async () => {
            // Arrange
            const idSearchFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };
            let capturedTab: ExtReportTab | null = null;

            // Act
            render(
                <TestHarness
                    filters={idSearchFilters}
                    onTab={t => {
                        capturedTab = t;
                    }}
                    report={queryReport}
                />
            );
            await waitFor(() => expect(capturedTab).not.toBeNull());
            const filterArray = capturedTab!.getFilterArray();

            // Assert - single subject produces an EQUAL filter on the Id field
            expect(filterArray.nonRemovable).toHaveLength(1);
            expect(filterArray.removable).toHaveLength(0);
            const filter = filterArray.nonRemovable[0];
            expect(filter.getColumnName()).toBe('Id');
            expect(filter.getValue()).toBe('ID123');
            expect(filter.getFilterType()).toBe(Filter.Types.EQUAL);
        });

        test('returns EQUALS_ONE_OF filter for multiple subjects', async () => {
            // Arrange
            const multiSubjectFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123', 'ID456', 'ID789'] };
            let capturedTab: ExtReportTab | null = null;

            // Act
            render(
                <TestHarness
                    filters={multiSubjectFilters}
                    onTab={t => {
                        capturedTab = t;
                    }}
                    report={queryReport}
                />
            );
            await waitFor(() => expect(capturedTab).not.toBeNull());
            const filterArray = capturedTab!.getFilterArray();

            // Assert - multiple subjects produce semicolon-joined EQUALS_ONE_OF filter
            expect(filterArray.nonRemovable).toHaveLength(1);
            const filter = filterArray.nonRemovable[0];
            expect(filter.getColumnName()).toBe('Id');
            expect(filter.getValue()).toBe('ID123;ID456;ID789');
            expect(filter.getFilterType()).toBe(Filter.Types.EQUALS_ONE_OF);
        });

        test('returns empty arrays for All Records mode', async () => {
            // Arrange
            const allFilters = { filterType: FILTER_TYPE_ALL, subjects: undefined };
            let capturedTab: ExtReportTab | null = null;

            // Act
            render(
                <TestHarness
                    filters={allFilters}
                    onTab={t => {
                        capturedTab = t;
                    }}
                    report={queryReport}
                />
            );
            await waitFor(() => expect(capturedTab).not.toBeNull());
            const filterArray = capturedTab!.getFilterArray();

            // Assert - All Records mode applies no filters
            expect(filterArray.nonRemovable).toHaveLength(0);
            expect(filterArray.removable).toHaveLength(0);
        });

        test('returns calculated_status filter for Alive at Center mode', async () => {
            // Arrange
            const aliveFilters = { filterType: FILTER_TYPE_ALIVE_AT_CENTER, subjects: undefined };
            let capturedTab: ExtReportTab | null = null;

            // Act
            render(
                <TestHarness
                    filters={aliveFilters}
                    onTab={t => {
                        capturedTab = t;
                    }}
                    report={queryReport}
                />
            );
            await waitFor(() => expect(capturedTab).not.toBeNull());
            const filterArray = capturedTab!.getFilterArray();

            // Assert - Alive at Center produces EQUAL filter on calculated_status
            expect(filterArray.nonRemovable).toHaveLength(1);
            expect(filterArray.removable).toHaveLength(0);
            const filter = filterArray.nonRemovable[0];
            expect(filter.getColumnName()).toBe('Id/Demographics/calculated_status');
            expect(filter.getValue()).toBe('Alive');
            expect(filter.getFilterType()).toBe(Filter.Types.EQUAL);
        });

        test('uses custom subjectIdFieldName when provided', async () => {
            // Arrange
            const customReport: ReportConfig = {
                ...queryReport,
                subjectIdFieldName: 'ParticipantId',
            };
            const idSearchFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };
            let capturedTab: ExtReportTab | null = null;

            // Act
            render(
                <TestHarness
                    filters={idSearchFilters}
                    onTab={t => {
                        capturedTab = t;
                    }}
                    report={customReport}
                />
            );
            await waitFor(() => expect(capturedTab).not.toBeNull());
            const filterArray = capturedTab!.getFilterArray();

            // Assert - filter uses custom field name instead of default 'Id'
            const filter = filterArray.nonRemovable[0];
            expect(filter.getColumnName()).toBe('ParticipantId');
            expect(filter.getValue()).toBe('ID123');
        });

        test('returns empty arrays when filters is null', async () => {
            // Arrange
            let capturedTab: ExtReportTab | null = null;

            // Act
            render(
                <TestHarness
                    filters={null as any}
                    onTab={t => {
                        capturedTab = t;
                    }}
                    report={queryReport}
                />
            );
            await waitFor(() => expect(capturedTab).not.toBeNull());
            const filterArray = capturedTab!.getFilterArray();

            // Assert - null filters produce empty filter arrays
            expect(filterArray.nonRemovable).toHaveLength(0);
            expect(filterArray.removable).toHaveLength(0);
        });

        test('URL Params mode creates same filters as ID Search mode', async () => {
            // Arrange
            const urlFilters = { filterType: FILTER_TYPE_URL_PARAMS, subjects: ['ID123', 'ID456'] };
            let capturedTab: ExtReportTab | null = null;

            // Act
            render(
                <TestHarness
                    filters={urlFilters}
                    onTab={t => {
                        capturedTab = t;
                    }}
                    report={queryReport}
                />
            );
            await waitFor(() => expect(capturedTab).not.toBeNull());
            const filterArray = capturedTab!.getFilterArray();

            // Assert - URL Params mode produces same subject filters as ID Search
            expect(filterArray.nonRemovable).toHaveLength(1);
            const filter = filterArray.nonRemovable[0];
            expect(filter.getColumnName()).toBe('Id');
            expect(filter.getValue()).toBe('ID123;ID456');
            expect(filter.getFilterType()).toBe(Filter.Types.EQUALS_ONE_OF);
        });

        test.each([
            { label: 'empty subjects', subjects: [] },
            { label: 'undefined subjects', subjects: undefined },
        ])('returns empty arrays when ID Search mode has $label', async ({ subjects }) => {
            // Arrange
            const noSubjectsFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects };
            let capturedTab: ExtReportTab | null = null;

            // Act
            render(
                <TestHarness
                    filters={noSubjectsFilters}
                    onTab={t => {
                        capturedTab = t;
                    }}
                    report={queryReport}
                />
            );
            await waitFor(() => expect(capturedTab).not.toBeNull());
            const filterArray = capturedTab!.getFilterArray();

            // Assert - missing subjects in ID Search mode produce no filters
            expect(filterArray.nonRemovable).toHaveLength(0);
            expect(filterArray.removable).toHaveLength(0);
        });
    });

    describe('getQWPConfig', () => {
        test('returns config with QueryWebPart defaults and expected derived values', async () => {
            // Arrange
            let capturedTab: ExtReportTab | null = null;

            // Act
            render(
                <TestHarness
                    filters={filters}
                    onTab={t => {
                        capturedTab = t;
                    }}
                    report={queryReport}
                />
            );
            await waitFor(() => expect(capturedTab).not.toBeNull());
            const config = capturedTab!.getQWPConfig();

            // Assert - config includes core defaults, derived filter fields, and excludes internal report fields
            expect(config.partName).toBe('Report');
            expect(config.suppressRenderErrors).toBe(true);
            expect(config.title).toBe('Query Report');
            expect(config.allowChooseQuery).toBe(false);
            expect(config.allowChooseView).toBe(true);
            expect(config.showInsertNewButton).toBe(false);
            expect(config.showDeleteButton).toBe(false);
            expect(config.showDetailsColumn).toBe(true);
            expect(config.showUpdateColumn).toBe(false);
            expect(config.showRecordSelectors).toBe(true);
            expect(config.allowHeaderLock).toBe(false);
            expect(config.frame).toBe('portal');
            expect(config.buttonBarPosition).toBe('top');
            expect(config.timeout).toBe(0);
            expect(config.linkTarget).toBe('_blank');
            expect(config.tab).toBe(capturedTab);
            expect(config.filters).toHaveLength(1);
            expect(config.filters[0].getColumnName()).toBe('Id');
            expect(config.filters[0].getValue()).toBe('ID123');
            expect(config.removeableFilters).toHaveLength(0);
            expect(config.id).toBeUndefined();
            expect(config.reportType).toBeUndefined();
            expect(config.category).toBeUndefined();
            expect(config.supportsnonidfilters).toBeUndefined();
            expect(config.subjectIdFieldName).toBeUndefined();
        });

        test('includes report schema and query properties in config', async () => {
            // Arrange
            const reportWithSchema: ReportConfig = {
                ...queryReport,
                schemaName: 'ehr',
                queryName: 'animals',
            };
            let capturedTab: ExtReportTab | null = null;

            // Act
            render(
                <TestHarness
                    filters={filters}
                    onTab={t => {
                        capturedTab = t;
                    }}
                    report={reportWithSchema}
                />
            );
            await waitFor(() => expect(capturedTab).not.toBeNull());
            const config = capturedTab!.getQWPConfig();

            // Assert - report-specific properties flow through to the config
            expect(config.schemaName).toBe('ehr');
            expect(config.queryName).toBe('animals');
        });
    });

    describe('cleanup behavior', () => {
        test('destroys Ext4 container on unmount', async () => {
            // Arrange
            let capturedTab: ExtReportTab | null = null;
            const { unmount } = render(
                <TestHarness
                    filters={filters}
                    onTab={t => {
                        capturedTab = t;
                    }}
                    report={queryReport}
                />
            );
            await waitFor(() => expect(capturedTab).not.toBeNull());
            const container = mockContainerInstances[0];
            expect(container.destroy).not.toHaveBeenCalled();

            // Act
            unmount();

            // Assert - container is destroyed on unmount
            expect(container.destroy).toHaveBeenCalled();
        });

        test('recreates container when report changes', async () => {
            // Arrange
            const onTab = jest.fn();
            const { rerender } = render(<TestHarness filters={filters} onTab={onTab} report={queryReport} />);
            await waitFor(() => expect(onTab).toHaveBeenCalledWith(expect.anything()));
            const firstContainer = mockContainerInstances[0];
            expect((globalThis as any).Ext4.create).toHaveBeenCalledTimes(1);

            // Act
            const newReport: ReportConfig = { ...queryReport, id: 'new-report', title: 'New Report' };
            rerender(<TestHarness filters={filters} onTab={onTab} report={newReport} />);

            // Assert - old container destroyed and new one created
            await waitFor(() => expect(mockContainerInstances.length).toBe(2));
            expect(firstContainer.destroy).toHaveBeenCalled();
            expect((globalThis as any).Ext4.create).toHaveBeenCalledTimes(2);
        });

        test('recreates container when filters change', async () => {
            // Arrange
            const onTab = jest.fn();
            const { rerender } = render(<TestHarness filters={filters} onTab={onTab} report={queryReport} />);
            await waitFor(() => expect(onTab).toHaveBeenCalledWith(expect.anything()));
            const firstContainer = mockContainerInstances[0];
            expect((globalThis as any).Ext4.create).toHaveBeenCalledTimes(1);

            // Act
            const newFilters: ReportFilters = { filterType: FILTER_TYPE_ALL, subjects: undefined };
            rerender(<TestHarness filters={newFilters} onTab={onTab} report={queryReport} />);

            // Assert - old container destroyed and new one created
            await waitFor(() => expect(mockContainerInstances.length).toBe(2));
            expect(firstContainer.destroy).toHaveBeenCalled();
            expect((globalThis as any).Ext4.create).toHaveBeenCalledTimes(2);
        });
    });

    describe('edge cases', () => {
        test('handles report with all optional fields null', async () => {
            // Arrange
            const minimalReport: ReportConfig = {
                id: 'minimal',
                title: 'Minimal Report',
                reportType: 'query',
                schemaName: 'core',
                queryName: 'users',
                category: null,
                containerPath: null,
                subjectIdFieldName: null,
                supportsnonidfilters: null,
                viewName: null,
            };
            let capturedTab: ExtReportTab | null = null;

            // Act
            render(
                <TestHarness
                    filters={filters}
                    onTab={t => {
                        capturedTab = t;
                    }}
                    report={minimalReport}
                />
            );
            await waitFor(() => expect(capturedTab).not.toBeNull());
            const filterArray = capturedTab!.getFilterArray();

            // Assert - null optional fields fall back to defaults without errors
            expect(filterArray.nonRemovable).toHaveLength(1);
            expect(filterArray.nonRemovable[0].getColumnName()).toBe('Id');
        });

        test('handles unrecognized filterType gracefully', async () => {
            // Arrange
            const unknownFilters = { filterType: 'unknownType' as any, subjects: ['ID123'] };
            let capturedTab: ExtReportTab | null = null;

            // Act
            render(
                <TestHarness
                    filters={unknownFilters}
                    onTab={t => {
                        capturedTab = t;
                    }}
                    report={queryReport}
                />
            );
            await waitFor(() => expect(capturedTab).not.toBeNull());
            const filterArray = capturedTab!.getFilterArray();

            // Assert - unrecognized filterType produces no filters
            expect(filterArray.nonRemovable).toHaveLength(0);
            expect(filterArray.removable).toHaveLength(0);
        });
    });
});
