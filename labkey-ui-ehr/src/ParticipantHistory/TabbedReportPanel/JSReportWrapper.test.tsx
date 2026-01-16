import React from 'react';
import { render, waitFor } from '@testing-library/react';

import { Query } from '@labkey/api';

import { JSReportWrapper } from './JSReportWrapper';
import { ExtReportTab, ReportConfig } from '../models';

// Mock @labkey/api Query.selectRows
jest.mock('@labkey/api', () => ({
    ...jest.requireActual('@labkey/api'),
    Query: {
        ...jest.requireActual('@labkey/api').Query,
        selectRows: jest.fn(),
    },
}));

// Mock Ext4 global
const mockExt4Container: ExtReportTab = {
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
    Msg: {
        wait: jest.fn(),
        hide: jest.fn(),
    },
};

// Mock window for namespace resolution
(window as any).EHR = {
    reports: {},
};

describe('JSReportWrapper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExt4Container.isDestroyed = false;
        mockExt4Container.filters = { subjects: ['ID123', 'ID456'] };
        delete (window as any).testFunction;
        delete (window as any).EHR.reports.testFunction;
    });

    const mockTab: ExtReportTab = {
        ...mockExt4Container,
        getFilterArray: jest.fn(() => ({
            removable: [],
            nonRemovable: [],
        })),
        getQWPConfig: jest.fn(() => ({
            partName: 'Report',
            schemaName: 'study',
            queryName: 'demographics',
        })),
    };

    const jsReport: ReportConfig = {
        id: 'js-report-1',
        title: 'JS Report',
        reportType: 'js',
        queryName: 'testFunction',
    };

    test('calls JS function from window namespace when available', async () => {
        const mockJsFunction = jest.fn();
        (window as any).testFunction = mockJsFunction;

        render(<JSReportWrapper report={jsReport} tab={mockTab} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    getFilterArray: expect.any(Function),
                    getQWPConfig: expect.any(Function),
                    getTitleSuffix: expect.any(Function),
                    resolveSubjectsFromHousing: expect.any(Function),
                }),
                mockTab
            );
        });
    });

    test('calls JS function from custom namespace when provided', async () => {
        const mockJsFunction = jest.fn();
        (window as any).EHR.reports.testFunction = mockJsFunction;

        render(<JSReportWrapper report={jsReport} reportNamespace="EHR.reports" tab={mockTab} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    getFilterArray: expect.any(Function),
                    getQWPConfig: expect.any(Function),
                    getTitleSuffix: expect.any(Function),
                    resolveSubjectsFromHousing: expect.any(Function),
                }),
                mockTab
            );
        });
    });

    test('panel getFilterArray returns tab filter array', async () => {
        let capturedPanel: any;
        const mockJsFunction = jest.fn((panel, tab) => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        const mockFilterArray = {
            removable: [],
            nonRemovable: [{ fieldKey: 'Id', value: 'test' }],
        };
        mockTab.getFilterArray = jest.fn(() => mockFilterArray);

        render(<JSReportWrapper report={jsReport} tab={mockTab} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        expect(capturedPanel.getFilterArray()).toEqual(mockFilterArray);
    });

    test('panel getQWPConfig returns tab query config', async () => {
        let capturedPanel: any;
        const mockJsFunction = jest.fn((panel, tab) => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        const mockQueryConfig = {
            partName: 'Report',
            schemaName: 'study',
            queryName: 'demographics',
        };
        mockTab.getQWPConfig = jest.fn(() => mockQueryConfig);

        render(<JSReportWrapper report={jsReport} tab={mockTab} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        expect(capturedPanel.getQWPConfig()).toEqual(mockQueryConfig);
    });

    test('panel getTitleSuffix returns formatted subject list', async () => {
        let capturedPanel: any;
        const mockJsFunction = jest.fn((panel, tab) => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        mockTab.filters = { subjects: ['ID123', 'ID456', 'ID789'] };

        render(<JSReportWrapper report={jsReport} tab={mockTab} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        expect(capturedPanel.getTitleSuffix()).toBe(' - ID123, ID456, ID789');
    });

    test('panel getTitleSuffix returns empty string when no subjects', async () => {
        let capturedPanel: any;
        const mockJsFunction = jest.fn((panel, tab) => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        mockTab.filters = { subjects: [] };

        render(<JSReportWrapper report={jsReport} tab={mockTab} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        expect(capturedPanel.getTitleSuffix()).toBe('');
    });

    test('panel resolveSubjectsFromHousing queries demographicsCurLocation', async () => {
        let capturedPanel: any;
        const mockJsFunction = jest.fn((panel, tab) => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        const mockSelectRows = Query.selectRows as jest.Mock;

        render(<JSReportWrapper report={jsReport} tab={mockTab} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        const mockCallback = jest.fn();
        capturedPanel.resolveSubjectsFromHousing(mockTab, mockCallback);

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
        const mockJsFunction = jest.fn((panel, tab) => {
            capturedPanel = panel;
        });
        (window as any).testFunction = mockJsFunction;

        (Query.selectRows as jest.Mock).mockImplementation((config: any) => {
            // Simulate successful query
            config.success({
                rows: [{ Id: 'ID123' }, { Id: 'ID456' }, { Id: 'ID789' }],
            });
        });

        render(<JSReportWrapper report={jsReport} tab={mockTab} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        const mockCallback = jest.fn();
        capturedPanel.resolveSubjectsFromHousing(mockTab, mockCallback);

        await waitFor(() => {
            expect(mockCallback).toHaveBeenCalledWith(['ID123', 'ID456', 'ID789'], mockTab);
        });
    });

    test('displays error when JS function not found', async () => {
        // Don't define the function
        delete (window as any).testFunction;

        render(<JSReportWrapper report={jsReport} tab={mockTab} />);

        await waitFor(() => {
            expect(mockTab.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining('Could not find JavaScript function'),
                })
            );
        });
    });

    test('displays error with report title when function not found', async () => {
        const reportWithTitle = { ...jsReport, title: 'Test Report Title' };

        render(<JSReportWrapper report={reportWithTitle} tab={mockTab} />);

        await waitFor(() => {
            expect(mockTab.add).toHaveBeenCalledWith(
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

        render(<JSReportWrapper report={jsReport} tab={mockTab} />);

        await waitFor(() => {
            expect(mockTab.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining('Error loading JS report'),
                })
            );
        });
    });

    test('does not render when tab is null', () => {
        const { container } = render(<JSReportWrapper report={jsReport} tab={null as any} />);

        expect(container.firstChild).toBeNull();
    });

    test('does not render when Ext4 is undefined', () => {
        const originalExt4 = (global as any).Ext4;
        (global as any).Ext4 = undefined;

        const { container } = render(<JSReportWrapper report={jsReport} tab={mockTab} />);

        expect(container.firstChild).toBeNull();

        (global as any).Ext4 = originalExt4;
    });

    test('cleans up by calling removeAll on unmount', async () => {
        const mockJsFunction = jest.fn();
        (window as any).testFunction = mockJsFunction;

        const { unmount } = render(<JSReportWrapper report={jsReport} tab={mockTab} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        unmount();

        expect(mockTab.removeAll).toHaveBeenCalled();
    });

    test('does not call removeAll if tab is destroyed', async () => {
        const mockJsFunction = jest.fn();
        (window as any).testFunction = mockJsFunction;

        const { unmount } = render(<JSReportWrapper report={jsReport} tab={mockTab} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalled();
        });

        mockTab.isDestroyed = true;
        unmount();

        expect(mockTab.removeAll).not.toHaveBeenCalled();
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

        render(<JSReportWrapper report={nestedReport} tab={mockTab} />);

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

        render(<JSReportWrapper report={functionReport} tab={mockTab} />);

        await waitFor(() => {
            expect(mockJsFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    getFilterArray: expect.any(Function),
                }),
                mockTab
            );
        });
    });
});
