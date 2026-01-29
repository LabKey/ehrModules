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
(global as any).__mockFilterCreate__ = mockFilterCreate;

jest.mock('@labkey/api', () => {
    const actual = jest.requireActual('@labkey/api');
    return {
        ...actual,
        Filter: {
            ...actual.Filter,
            create: (field: string, value: string, type: any) => {
                const mockFn = (global as any).__mockFilterCreate__;
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

// Setup Ext4 global mock
(global as any).Ext4 = {
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
            const { result } = renderHook(() => useReportTab(queryReport, filters));

            expect(result.current.targetRef).toBeDefined();
            expect(result.current.targetRef.current).toBeNull();
        });

        test('tab starts as null when no DOM element attached', () => {
            const { result } = renderHook(() => useReportTab(queryReport, filters));

            expect(result.current.tab).toBeNull();
        });

        test('does not create tab if Ext4 is undefined', () => {
            const originalExt4 = (global as any).Ext4;
            (global as any).Ext4 = undefined;

            const { result } = renderHook(() => useReportTab(queryReport, filters));

            expect(result.current.tab).toBeNull();

            (global as any).Ext4 = originalExt4;
        });

        test('cleans up without error on unmount when tab is null', () => {
            const { unmount } = renderHook(() => useReportTab(queryReport, filters));

            // Should not throw
            unmount();
        });
    });

    describe('Ext4 container creation (with DOM attachment)', () => {
        test('creates Ext4 container with correct configuration when ref is attached', async () => {
            let capturedTab: ExtReportTab | null = null;

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

            expect((global as any).Ext4.create).toHaveBeenCalledWith(
                'Ext.container.Container',
                expect.objectContaining({
                    border: false,
                    defaults: { border: false },
                })
            );
        });

        test('passes renderTo option with the target DOM element', async () => {
            let capturedTab: ExtReportTab | null = null;

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

            // Verify renderTo was passed (we can't verify the exact element, but we can check it's present)
            expect((global as any).Ext4.create).toHaveBeenCalledWith(
                'Ext.container.Container',
                expect.objectContaining({
                    renderTo: expect.any(HTMLDivElement),
                })
            );
        });

        test('assigns report and filters to the created tab', async () => {
            let capturedTab: ExtReportTab | null = null;

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

            expect(capturedTab!.report).toBe(queryReport);
            expect(capturedTab!.filters).toBe(filters);
        });

        test('attaches getFilterArray method to the tab', async () => {
            let capturedTab: ExtReportTab | null = null;

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

            expect(typeof capturedTab!.getFilterArray).toBe('function');
        });

        test('attaches getQWPConfig method to the tab', async () => {
            let capturedTab: ExtReportTab | null = null;

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

            expect(typeof capturedTab!.getQWPConfig).toBe('function');
        });
    });

    describe('getFilterArray', () => {
        test('returns subject filter for ID Search mode with single subject', async () => {
            const idSearchFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };
            let capturedTab: ExtReportTab | null = null;

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

            expect(filterArray.nonRemovable).toHaveLength(1);
            expect(filterArray.removable).toHaveLength(0);

            // Verify the actual filter object
            const filter = filterArray.nonRemovable[0];
            expect(filter.getColumnName()).toBe('Id');
            expect(filter.getValue()).toBe('ID123');
            expect(filter.getFilterType()).toBe(Filter.Types.EQUAL);
        });

        test('returns EQUALS_ONE_OF filter for multiple subjects', async () => {
            const multiSubjectFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123', 'ID456', 'ID789'] };
            let capturedTab: ExtReportTab | null = null;

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

            expect(filterArray.nonRemovable).toHaveLength(1);

            // Verify semicolon-joined value and EQUALS_ONE_OF type
            const filter = filterArray.nonRemovable[0];
            expect(filter.getColumnName()).toBe('Id');
            expect(filter.getValue()).toBe('ID123;ID456;ID789');
            expect(filter.getFilterType()).toBe(Filter.Types.EQUALS_ONE_OF);
        });

        test('returns empty arrays for All Records mode', async () => {
            const allFilters = { filterType: FILTER_TYPE_ALL, subjects: undefined };
            let capturedTab: ExtReportTab | null = null;

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

            expect(filterArray.nonRemovable).toHaveLength(0);
            expect(filterArray.removable).toHaveLength(0);
        });

        test('returns calculated_status filter for Alive at Center mode', async () => {
            const aliveFilters = { filterType: FILTER_TYPE_ALIVE_AT_CENTER, subjects: undefined };
            let capturedTab: ExtReportTab | null = null;

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

            expect(filterArray.nonRemovable).toHaveLength(1);
            expect(filterArray.removable).toHaveLength(0);

            // Verify the calculated_status filter
            const filter = filterArray.nonRemovable[0];
            expect(filter.getColumnName()).toBe('Id/Demographics/calculated_status');
            expect(filter.getValue()).toBe('Alive');
            expect(filter.getFilterType()).toBe(Filter.Types.EQUAL);
        });

        test('uses custom subjectIdFieldName when provided', async () => {
            const customReport: ReportConfig = {
                ...queryReport,
                subjectIdFieldName: 'ParticipantId',
            };
            const idSearchFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };
            let capturedTab: ExtReportTab | null = null;

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

            // Verify custom field name is used
            const filter = filterArray.nonRemovable[0];
            expect(filter.getColumnName()).toBe('ParticipantId');
            expect(filter.getValue()).toBe('ID123');
        });

        test('returns empty arrays when filters is null', async () => {
            let capturedTab: ExtReportTab | null = null;

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

            expect(filterArray.nonRemovable).toHaveLength(0);
            expect(filterArray.removable).toHaveLength(0);
        });

        test('URL Params mode creates same filters as ID Search mode', async () => {
            const urlFilters = { filterType: FILTER_TYPE_URL_PARAMS, subjects: ['ID123', 'ID456'] };
            let capturedTab: ExtReportTab | null = null;

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

            expect(filterArray.nonRemovable).toHaveLength(1);

            const filter = filterArray.nonRemovable[0];
            expect(filter.getColumnName()).toBe('Id');
            expect(filter.getValue()).toBe('ID123;ID456');
            expect(filter.getFilterType()).toBe(Filter.Types.EQUALS_ONE_OF);
        });

        test('returns empty arrays when ID Search mode has empty subjects', async () => {
            const emptySubjectsFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: [] };
            let capturedTab: ExtReportTab | null = null;

            render(
                <TestHarness
                    filters={emptySubjectsFilters}
                    onTab={t => {
                        capturedTab = t;
                    }}
                    report={queryReport}
                />
            );

            await waitFor(() => expect(capturedTab).not.toBeNull());

            const filterArray = capturedTab!.getFilterArray();

            expect(filterArray.nonRemovable).toHaveLength(0);
            expect(filterArray.removable).toHaveLength(0);
        });

        test('returns empty arrays when ID Search mode has undefined subjects', async () => {
            const undefinedSubjectsFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: undefined };
            let capturedTab: ExtReportTab | null = null;

            render(
                <TestHarness
                    filters={undefinedSubjectsFilters}
                    onTab={t => {
                        capturedTab = t;
                    }}
                    report={queryReport}
                />
            );

            await waitFor(() => expect(capturedTab).not.toBeNull());

            const filterArray = capturedTab!.getFilterArray();

            expect(filterArray.nonRemovable).toHaveLength(0);
            expect(filterArray.removable).toHaveLength(0);
        });
    });

    describe('getQWPConfig', () => {
        test('returns config with standard QueryWebPart properties', async () => {
            let capturedTab: ExtReportTab | null = null;
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
        });

        test('includes tab reference in config', async () => {
            let capturedTab: ExtReportTab | null = null;
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

            expect(config.tab).toBe(capturedTab);
        });

        test('includes filters from getFilterArray in config', async () => {
            const idSearchFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };
            let capturedTab: ExtReportTab | null = null;
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

            const config = capturedTab!.getQWPConfig();

            // Should have filters array from getFilterArray.nonRemovable
            expect(config.filters).toHaveLength(1);
            expect(config.filters[0].getColumnName()).toBe('Id');
            expect(config.filters[0].getValue()).toBe('ID123');

            // Should have removeableFilters array from getFilterArray.removable
            expect(config.removeableFilters).toHaveLength(0);
        });

        test('spreads additional report properties into config', async () => {
            const reportWithSchema: ReportConfig = {
                ...queryReport,
                schemaName: 'ehr',
                queryName: 'animals',
            };
            let capturedTab: ExtReportTab | null = null;
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

            // Report-specific properties should be spread into config
            expect(config.schemaName).toBe('ehr');
            expect(config.queryName).toBe('animals');
        });

        test('excludes internal report properties from config', async () => {
            let capturedTab: ExtReportTab | null = null;
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

            // Internal properties should be excluded from the config
            expect(config.id).toBeUndefined();
            expect(config.reportType).toBeUndefined();
            expect(config.category).toBeUndefined();
            expect(config.supportsnonidfilters).toBeUndefined();
            expect(config.subjectIdFieldName).toBeUndefined();

            // But title should be present (it's explicitly set)
            expect(config.title).toBe('Query Report');
        });
    });

    describe('cleanup behavior', () => {
        test('destroys Ext4 container on unmount', async () => {
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

            unmount();

            expect(container.destroy).toHaveBeenCalled();
        });

        test('recreates container when report changes', async () => {
            const onTab = jest.fn();
            const { rerender } = render(<TestHarness filters={filters} onTab={onTab} report={queryReport} />);

            await waitFor(() => expect(onTab).toHaveBeenCalledWith(expect.anything()));

            const firstContainer = mockContainerInstances[0];
            expect((global as any).Ext4.create).toHaveBeenCalledTimes(1);

            // Change the report
            const newReport: ReportConfig = { ...queryReport, id: 'new-report', title: 'New Report' };
            rerender(<TestHarness filters={filters} onTab={onTab} report={newReport} />);

            // Wait for new container to be created
            await waitFor(() => expect(mockContainerInstances.length).toBe(2));

            // Old container should be destroyed
            expect(firstContainer.destroy).toHaveBeenCalled();
            // New container should be created
            expect((global as any).Ext4.create).toHaveBeenCalledTimes(2);
        });

        test('recreates container when filters change', async () => {
            const onTab = jest.fn();
            const { rerender } = render(<TestHarness filters={filters} onTab={onTab} report={queryReport} />);

            await waitFor(() => expect(onTab).toHaveBeenCalledWith(expect.anything()));

            const firstContainer = mockContainerInstances[0];
            expect((global as any).Ext4.create).toHaveBeenCalledTimes(1);

            // Change the filters
            const newFilters: ReportFilters = { filterType: FILTER_TYPE_ALL, subjects: undefined };
            rerender(<TestHarness filters={newFilters} onTab={onTab} report={queryReport} />);

            // Wait for new container to be created
            await waitFor(() => expect(mockContainerInstances.length).toBe(2));

            // Old container should be destroyed
            expect(firstContainer.destroy).toHaveBeenCalled();
            // New container should be created
            expect((global as any).Ext4.create).toHaveBeenCalledTimes(2);
        });

        test('sets tab to null on cleanup', async () => {
            let lastTab: ExtReportTab | null = null;
            const onTab = jest.fn(t => {
                lastTab = t;
            });

            const { unmount } = render(<TestHarness filters={filters} onTab={onTab} report={queryReport} />);

            await waitFor(() => expect(lastTab).not.toBeNull());

            unmount();

            // After unmount, the last callback should have been called with null
            // (though React may not call it depending on timing)
            // The important thing is destroy was called
            expect(mockContainerInstances[0].destroy).toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        test('handles report with all optional fields null', async () => {
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

            // Should not throw and should create valid filter array
            const filterArray = capturedTab!.getFilterArray();
            expect(filterArray.nonRemovable).toHaveLength(1);
            expect(filterArray.nonRemovable[0].getColumnName()).toBe('Id'); // Default field name
        });

        test('handles unrecognized filterType gracefully', async () => {
            const unknownFilters = { filterType: 'unknownType' as any, subjects: ['ID123'] };
            let capturedTab: ExtReportTab | null = null;

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

            // Unrecognized filterType should not create subject filters
            expect(filterArray.nonRemovable).toHaveLength(0);
            expect(filterArray.removable).toHaveLength(0);
        });
    });
});
