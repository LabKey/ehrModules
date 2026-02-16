import React from 'react';
import { render, waitFor } from '@testing-library/react';

import { Filter, Query } from '@labkey/api';

import { JSReportWrapper } from './JSReportWrapper';
import { ExtReportTab, FILTER_TYPE_ID_SEARCH, JsReportConfig } from '../models';

// Mock @labkey/api Query.selectRows
jest.mock('@labkey/api', () => ({
    ...jest.requireActual('@labkey/api'),
    Query: {
        ...jest.requireActual('@labkey/api').Query,
        selectRows: jest.fn(),
    },
}));

// Track the container created by Ext4.create so we can inspect it
let mockExt4Container: ExtReportTab;

const createMockContainer = (): ExtReportTab => ({
    report: null as any,
    filters: null as any,
    isDestroyed: false,
    add: jest.fn(),
    removeAll: jest.fn(),
    destroy: jest.fn(),
    getFilterArray: jest.fn(() => ({ removable: [], nonRemovable: [] })),
    getQWPConfig: jest.fn(() => ({})),
});

(globalThis as any).Ext4 = {
    create: jest.fn(() => {
        mockExt4Container = createMockContainer();
        return mockExt4Container;
    }),
    Msg: {
        wait: jest.fn(),
        hide: jest.fn(),
    },
};

(globalThis as any).LABKEY = {
    Utils: {
        encodeHtml: (str: string) =>
            str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
    },
};

// Mock window for namespace resolution
(window as any).EHR = {
    reports: {},
};

describe('JSReportWrapper', () => {
    const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123', 'ID456'] };

    beforeEach(() => {
        jest.clearAllMocks();
        delete (window as any).testFunction;
        delete (window as any).EHR.reports.testFunction;
    });

    const jsReport: JsReportConfig = {
        id: 'js-report-1',
        title: 'JS Report',
        reportType: 'js',
        queryName: 'testFunction',
        category: 'Category A',
        containerPath: null,
        subjectIdFieldName: null,
        supportsnonidfilters: null,
        viewName: null,
    };

    test('calls JS function from window namespace when available', async () => {
        // Arrange
        const mockJsFunction = jest.fn();
        (window as any).testFunction = mockJsFunction;

        // Act
        render(<JSReportWrapper filters={filters} report={jsReport} />);

        // Assert - JS function is called with panel providing filter, config, title, and housing methods
        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    getFilterArray: expect.any(Function),
                    getQWPConfig: expect.any(Function),
                    getTitleSuffix: expect.any(Function),
                    resolveSubjectsFromHousing: expect.any(Function),
                }),
                expect.anything() // tab object
            );
        });
    });

    test('calls JS function from EHR.reports namespace', async () => {
        // Arrange
        const mockJsFunction = jest.fn();
        (window as any).EHR.reports.testFunction = mockJsFunction;

        // Act
        render(<JSReportWrapper filters={filters} report={jsReport} />);

        // Assert - JS function from EHR.reports namespace is called with panel object
        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    getFilterArray: expect.any(Function),
                    getQWPConfig: expect.any(Function),
                    getTitleSuffix: expect.any(Function),
                    resolveSubjectsFromHousing: expect.any(Function),
                }),
                expect.anything()
            );
        });
    });

    test('panel getFilterArray delegates to tab', async () => {
        // Arrange - render component and capture panel reference
        let capturedPanel: any;
        const mockJsFunction = jest.fn(panel => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        render(<JSReportWrapper filters={filters} report={jsReport} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        // Act
        const result = capturedPanel.getFilterArray();

        // Assert - filter array has one non-removable EQUALS_ONE_OF filter for both subject IDs
        expect(result.removable).toHaveLength(0);
        expect(result.nonRemovable).toHaveLength(1);
        expect(result.nonRemovable[0].getColumnName()).toBe('Id');
        expect(result.nonRemovable[0].getValue()).toEqual(['ID123', 'ID456']);
        expect(result.nonRemovable[0].getFilterType().getURLSuffix()).toBe(Filter.Types.EQUALS_ONE_OF.getURLSuffix());
    });

    test('panel getQWPConfig delegates to tab', async () => {
        // Arrange - render component and capture panel reference
        let capturedPanel: any;
        const mockJsFunction = jest.fn(panel => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        render(<JSReportWrapper filters={filters} report={jsReport} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        // Act
        const result = capturedPanel.getQWPConfig();

        // Assert - QWP config has correct query name, title, disabled options, and subject filter
        expect(result.partName).toBe('Report');
        expect(result.queryName).toBe('testFunction');
        expect(result.title).toBe('JS Report');
        expect(result.allowChooseQuery).toBe(false);
        expect(result.showInsertNewButton).toBe(false);
        expect(result.filters).toHaveLength(1);
        expect(result.filters[0].getColumnName()).toBe('Id');
    });

    test('panel getTitleSuffix returns formatted subject list', async () => {
        // Arrange - render component with three subjects and capture panel reference
        let capturedPanel: any;
        const mockJsFunction = jest.fn(panel => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        const filtersWithSubjects = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123', 'ID456', 'ID789'] };

        render(<JSReportWrapper filters={filtersWithSubjects} report={jsReport} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        // Act
        const titleSuffix = capturedPanel.getTitleSuffix();

        // Assert - title suffix joins all subject IDs with comma separator
        expect(titleSuffix).toBe(' - ID123, ID456, ID789');
    });

    test('panel getTitleSuffix returns empty string when no subjects', async () => {
        // Arrange - render component with empty subjects and capture panel reference
        let capturedPanel: any;
        const mockJsFunction = jest.fn(panel => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        const emptyFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: [] as string[] };

        render(<JSReportWrapper filters={emptyFilters} report={jsReport} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        // Act
        const titleSuffix = capturedPanel.getTitleSuffix();

        // Assert - returns empty string when subjects array is empty
        expect(titleSuffix).toBe('');
    });

    test('panel resolveSubjectsFromHousing queries demographicsCurLocation', async () => {
        // Arrange - render component and capture panel reference
        let capturedPanel: any;
        const mockJsFunction = jest.fn(panel => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        const mockSelectRows = Query.selectRows as jest.Mock;

        render(<JSReportWrapper filters={filters} report={jsReport} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        // Act
        const mockCallback = jest.fn();
        capturedPanel.resolveSubjectsFromHousing(mockExt4Container, mockCallback);

        // Assert - selectRows is called with study schema, demographicsCurLocation query, and room/cage/id sort
        expect(mockSelectRows).toHaveBeenCalledWith(
            expect.objectContaining({
                schemaName: 'study',
                queryName: 'demographicsCurLocation',
                sort: 'room,cage,id',
            })
        );
    });

    test('panel resolveSubjectsFromHousing calls callback with resolved subjects', async () => {
        // Arrange - mock selectRows to return three IDs, render component, and capture panel reference
        let capturedPanel: any;
        const mockJsFunction = jest.fn(panel => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        (Query.selectRows as jest.Mock).mockImplementation((config: any) => {
            config.success({
                rows: [{ Id: 'ID123' }, { Id: 'ID456' }, { Id: 'ID789' }],
            });
        });

        render(<JSReportWrapper filters={filters} report={jsReport} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        // Act
        const mockCallback = jest.fn();
        capturedPanel.resolveSubjectsFromHousing(mockExt4Container, mockCallback);

        // Assert - callback receives the three resolved subject IDs
        await waitFor(() => {
            expect(mockCallback).toHaveBeenCalledWith(['ID123', 'ID456', 'ID789'], mockExt4Container);
        });
    });

    test('displays error with function name and report title when JS function not found', async () => {
        // Arrange
        delete (window as any).testFunction;

        // Act
        render(<JSReportWrapper filters={filters} report={jsReport} />);

        // Assert - error message includes both the function name and the report title
        await waitFor(() => {
            expect(mockExt4Container.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining('Could not find JavaScript function'),
                })
            );
            expect(mockExt4Container.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining("'testFunction'"),
                })
            );
            expect(mockExt4Container.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining("for report 'JS Report'"),
                })
            );
        });
    });

    test('displays error without report title when title is null', async () => {
        // Arrange
        delete (window as any).testFunction;
        const reportWithoutTitle = { ...jsReport, title: null };

        // Act
        render(<JSReportWrapper filters={filters} report={reportWithoutTitle as any} />);

        // Assert - error message includes function name but not "for report"
        await waitFor(() => {
            expect(mockExt4Container.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining('Could not find JavaScript function'),
                })
            );
            expect(mockExt4Container.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.not.stringContaining('for report'),
                })
            );
        });
    });

    test('handles JS function execution error', async () => {
        // Arrange
        const mockJsFunction = jest.fn(() => {
            throw new Error('Test error');
        });
        (window as any).testFunction = mockJsFunction;

        // Act
        render(<JSReportWrapper filters={filters} report={jsReport} />);

        // Assert - error message indicates JS report loading failure
        await waitFor(() => {
            expect(mockExt4Container.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining('Error loading JS report'),
                })
            );
        });
    });

    test('cleans up by calling removeAll on unmount', async () => {
        // Arrange - render component and wait for JS function to be called
        const mockJsFunction = jest.fn();
        (window as any).testFunction = mockJsFunction;

        const { unmount } = render(<JSReportWrapper filters={filters} report={jsReport} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        // Act
        unmount();

        // Assert - wrapper cleanup clears tab content on unmount
        expect(mockExt4Container.removeAll).toHaveBeenCalled();
    });

    test('resolves function from nested namespace path', async () => {
        // Arrange
        const mockJsFunction = jest.fn();
        try {
            (window as any).Nested = {
                Deep: {
                    Path: {
                        testFunction: mockJsFunction,
                    },
                },
            };

            const nestedReport = {
                ...jsReport,
                queryName: 'Nested.Deep.Path.testFunction',
            };

            // Act
            render(<JSReportWrapper filters={filters} report={nestedReport} />);

            // Assert - JS function from nested namespace is resolved and called
            await waitFor(() => {
                expect(mockJsFunction).toHaveBeenCalled();
            });
        } finally {
            delete (window as any).Nested;
        }
    });

    test('accepts function reference as handlerName', async () => {
        // Arrange
        const mockJsFunction = jest.fn();

        const functionReport = {
            ...jsReport,
            queryName: mockJsFunction as any,
        };

        // Act
        render(<JSReportWrapper filters={filters} report={functionReport as any} />);

        // Assert - direct function reference is called with panel providing filter methods
        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    getFilterArray: expect.any(Function),
                }),
                expect.anything()
            );
        });
    });
});
