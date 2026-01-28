import React from 'react';
import { render, waitFor } from '@testing-library/react';

import { Query } from '@labkey/api';

import { JSReportWrapper } from './JSReportWrapper';
import { ExtReportTab, FILTER_TYPE_ID_SEARCH, ReportConfig } from '../models';

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

(global as any).Ext4 = {
    create: jest.fn(() => {
        mockExt4Container = createMockContainer();
        return mockExt4Container;
    }),
    Msg: {
        wait: jest.fn(),
        hide: jest.fn(),
    },
};

(global as any).LABKEY = {
    Utils: {
        encodeHtml: (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
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

    const jsReport: ReportConfig = {
        id: 'js-report-1',
        title: 'JS Report',
        reportType: 'js',
        queryName: 'testFunction',
        category: 'Category A',
    };

    test('renders a report-target div', () => {
        const { container } = render(
            <JSReportWrapper filters={filters} report={jsReport} reportNamespace="" />
        );

        expect(container.querySelector('.report-target')).toBeInTheDocument();
    });

    test('calls JS function from window namespace when available', async () => {
        const mockJsFunction = jest.fn();
        (window as any).testFunction = mockJsFunction;

        render(<JSReportWrapper filters={filters} report={jsReport} reportNamespace="" />);

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

    test('calls JS function from custom namespace when provided', async () => {
        const mockJsFunction = jest.fn();
        (window as any).EHR.reports.testFunction = mockJsFunction;

        render(<JSReportWrapper filters={filters} report={jsReport} reportNamespace="EHR.reports" />);

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
        let capturedPanel: any;
        const mockJsFunction = jest.fn((panel) => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        render(<JSReportWrapper filters={filters} report={jsReport} reportNamespace="" />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        // getFilterArray should return the tab's filter array
        const result = capturedPanel.getFilterArray();
        expect(result).toBeDefined();
        expect(result).toHaveProperty('removable');
        expect(result).toHaveProperty('nonRemovable');
    });

    test('panel getQWPConfig delegates to tab', async () => {
        let capturedPanel: any;
        const mockJsFunction = jest.fn((panel) => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        render(<JSReportWrapper filters={filters} report={jsReport} reportNamespace="" />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        const result = capturedPanel.getQWPConfig();
        expect(result).toBeDefined();
    });

    test('panel getTitleSuffix returns formatted subject list', async () => {
        let capturedPanel: any;
        const mockJsFunction = jest.fn((panel) => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        const filtersWithSubjects = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123', 'ID456', 'ID789'] };

        render(<JSReportWrapper filters={filtersWithSubjects} report={jsReport} reportNamespace="" />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        expect(capturedPanel.getTitleSuffix()).toBe(' - ID123, ID456, ID789');
    });

    test('panel getTitleSuffix returns empty string when no subjects', async () => {
        let capturedPanel: any;
        const mockJsFunction = jest.fn((panel) => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        const emptyFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: [] as string[] };

        render(<JSReportWrapper filters={emptyFilters} report={jsReport} reportNamespace="" />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        expect(capturedPanel.getTitleSuffix()).toBe('');
    });

    test('panel resolveSubjectsFromHousing queries demographicsCurLocation', async () => {
        let capturedPanel: any;
        const mockJsFunction = jest.fn((panel) => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        const mockSelectRows = Query.selectRows as jest.Mock;

        render(<JSReportWrapper filters={filters} report={jsReport} reportNamespace="" />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        const mockCallback = jest.fn();
        capturedPanel.resolveSubjectsFromHousing(mockExt4Container, mockCallback);

        expect(mockSelectRows).toHaveBeenCalledWith(
            expect.objectContaining({
                schemaName: 'study',
                queryName: 'demographicsCurLocation',
                sort: 'room,cage,id',
            })
        );
    });

    test('panel resolveSubjectsFromHousing calls callback with resolved subjects', async () => {
        let capturedPanel: any;
        const mockJsFunction = jest.fn((panel) => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        (Query.selectRows as jest.Mock).mockImplementation((config: any) => {
            config.success({
                rows: [{ Id: 'ID123' }, { Id: 'ID456' }, { Id: 'ID789' }],
            });
        });

        render(<JSReportWrapper filters={filters} report={jsReport} reportNamespace="" />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        const mockCallback = jest.fn();
        capturedPanel.resolveSubjectsFromHousing(mockExt4Container, mockCallback);

        await waitFor(() => {
            expect(mockCallback).toHaveBeenCalledWith(['ID123', 'ID456', 'ID789'], mockExt4Container);
        });
    });

    test('displays error when JS function not found', async () => {
        delete (window as any).testFunction;

        render(<JSReportWrapper filters={filters} report={jsReport} reportNamespace="" />);

        await waitFor(() => {
            expect(mockExt4Container.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining('Could not find JavaScript function'),
                })
            );
        });
    });

    test('displays error with report title when function not found', async () => {
        const reportWithTitle = { ...jsReport, title: 'Test Report Title' };

        render(<JSReportWrapper filters={filters} report={reportWithTitle} reportNamespace="" />);

        await waitFor(() => {
            expect(mockExt4Container.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining("for report 'Test Report Title'"),
                })
            );
        });
    });

    test('handles JS function execution error', async () => {
        const mockJsFunction = jest.fn(() => {
            throw new Error('Test error');
        });
        (window as any).testFunction = mockJsFunction;

        render(<JSReportWrapper filters={filters} report={jsReport} reportNamespace="" />);

        await waitFor(() => {
            expect(mockExt4Container.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining('Error loading JS report'),
                })
            );
        });
    });

    test('cleans up by calling removeAll on unmount', async () => {
        const mockJsFunction = jest.fn();
        (window as any).testFunction = mockJsFunction;

        const { unmount } = render(
            <JSReportWrapper filters={filters} report={jsReport} reportNamespace="" />
        );

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        unmount();

        expect(mockExt4Container.destroy).toHaveBeenCalled();
    });

    test('resolves function from nested namespace path', async () => {
        const mockJsFunction = jest.fn();
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

        render(<JSReportWrapper filters={filters} report={nestedReport} reportNamespace="" />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        delete (window as any).Nested;
    });

    test('accepts function reference as handlerName', async () => {
        const mockJsFunction = jest.fn();

        const functionReport = {
            ...jsReport,
            queryName: mockJsFunction,
        };

        render(<JSReportWrapper filters={filters} report={functionReport} reportNamespace="" />);

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
