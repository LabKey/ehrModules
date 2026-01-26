import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Filter } from '@labkey/api';

import { OtherReportWrapper } from './OtherReportWrapper';
import { ExtReportTab, FILTER_TYPE_ID_SEARCH, ReportConfig } from '../models';

// Mock Ext4 global
(global as any).Ext4 = {
    create: jest.fn(),
};

// Mock LABKEY global
const mockWebPart = {
    render: jest.fn(),
};

(global as any).LABKEY = {
    WebPart: jest.fn(() => mockWebPart),
};

describe('OtherReportWrapper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });

    const mockTab: ExtReportTab = {
        report: null as any,
        filters: { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123', 'ID456'] },
        isDestroyed: false,
        add: jest.fn(),
        removeAll: jest.fn(),
        destroy: jest.fn(),
        getFilterArray: jest.fn(() => ({
            removable: [],
            nonRemovable: [Filter.create('Id', 'ID123', Filter.Types.EQUAL)],
        })),
        getQWPConfig: jest.fn(() => ({
            partName: 'Report',
            schemaName: 'study',
            queryName: 'demographics',
        })),
    };

    const reportConfig: ReportConfig = {
        id: 'other-report-1',
        title: 'Other Report',
        reportType: 'report',
        schemaName: 'study',
        queryName: 'demographics',
        reportId: 'db:123',
    };

    test('renders report-target div with unique ID', () => {
        const { container } = render(<OtherReportWrapper report={reportConfig} tab={mockTab} />);

        const targetDiv = container.querySelector('.other-report-wrapper');
        expect(targetDiv).toBeInTheDocument();
        expect(targetDiv?.id).toMatch(/^report-target-other-report-1-/);
    });

    test('creates LABKEY.WebPart with correct configuration', async () => {
        render(<OtherReportWrapper report={reportConfig} tab={mockTab} />);

        await waitFor(() => {
            expect((global as any).LABKEY.WebPart).toHaveBeenCalledWith(
                expect.objectContaining({
                    partName: 'Report',
                    renderTo: expect.stringMatching(/^report-target-other-report-1-/),
                    suppressRenderErrors: true,
                    partConfig: expect.objectContaining({
                        title: 'Other Report - ID123, ID456',
                        schemaName: 'study',
                        reportId: 'db:123',
                        'query.queryName': 'demographics',
                    }),
                })
            );
        });
    });

    test('calls render on WebPart instance', async () => {
        render(<OtherReportWrapper report={reportConfig} tab={mockTab} />);

        await waitFor(() => {
            expect(mockWebPart.render).toHaveBeenCalled();
        });
    });

    test('adds title suffix from subjects', async () => {
        mockTab.filters = { subjects: ['ID123', 'ID456', 'ID789'] };

        render(<OtherReportWrapper report={reportConfig} tab={mockTab} />);

        await waitFor(() => {
            const webPartCall = (global as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.partConfig.title).toBe('Other Report - ID123, ID456, ID789');
        });
    });

    test('does not add title suffix when no subjects', async () => {
        mockTab.filters = { subjects: [] };

        render(<OtherReportWrapper report={reportConfig} tab={mockTab} />);

        await waitFor(() => {
            const webPartCall = (global as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.partConfig.title).toBe('Other Report');
        });
    });

    test('includes filter parameters in partConfig', async () => {
        const filterArray = {
            removable: [],
            nonRemovable: [
                Filter.create('Id', 'ID123', Filter.Types.EQUAL),
                Filter.create('Species', 'Dog', Filter.Types.EQUAL),
            ],
        };
        mockTab.getFilterArray = jest.fn(() => filterArray);

        render(<OtherReportWrapper report={reportConfig} tab={mockTab} />);

        await waitFor(() => {
            const webPartCall = (global as any).LABKEY.WebPart.mock.calls[0][0];
            const partConfig = webPartCall.partConfig;
            expect(partConfig['query.Id~eq']).toBeDefined();
            expect(partConfig['query.Species~eq']).toBeDefined();
        });
    });

    test('includes viewName in partConfig when provided', async () => {
        const reportWithView = { ...reportConfig, viewName: 'CustomView' };

        render(<OtherReportWrapper report={reportWithView} tab={mockTab} />);

        await waitFor(() => {
            const webPartCall = (global as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.partConfig.showSection).toBe('CustomView');
        });
    });

    test('includes containerPath when provided', async () => {
        const reportWithContainer = { ...reportConfig, containerPath: '/MyProject/MyFolder' };

        render(<OtherReportWrapper report={reportWithContainer} tab={mockTab} />);

        await waitFor(() => {
            const webPartCall = (global as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.containerPath).toBe('/MyProject/MyFolder');
        });
    });

    test('passes filters array to WebPart config', async () => {
        const filterArray = {
            removable: [Filter.create('Status', 'Active', Filter.Types.EQUAL)],
            nonRemovable: [Filter.create('Id', 'ID123', Filter.Types.EQUAL)],
        };
        mockTab.getFilterArray = jest.fn(() => filterArray);

        render(<OtherReportWrapper report={reportConfig} tab={mockTab} />);

        await waitFor(() => {
            const webPartCall = (global as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.filters).toEqual([...filterArray.nonRemovable, ...filterArray.removable]);
        });
    });

    test('handles success callback', async () => {
        render(<OtherReportWrapper report={reportConfig} tab={mockTab} />);

        await waitFor(() => {
            const webPartCall = (global as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.success).toBeDefined();
            // Should not throw
            webPartCall.success();
        });
    });

    test('handles failure callback with error logging', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        render(<OtherReportWrapper report={reportConfig} tab={mockTab} />);

        await waitFor(() => {
            const webPartCall = (global as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.failure).toBeDefined();
            webPartCall.failure({ message: 'Test error' });
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load report', { message: 'Test error' });
        consoleErrorSpy.mockRestore();
    });

    test('does not render when target element is not found', () => {
        // Mock getElementById to return null
        const originalGetElementById = document.getElementById;
        document.getElementById = jest.fn(() => null);

        render(<OtherReportWrapper report={reportConfig} tab={mockTab} />);

        expect((global as any).LABKEY.WebPart).not.toHaveBeenCalled();

        document.getElementById = originalGetElementById;
    });

    test('handles error during WebPart creation', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const originalWebPart = (global as any).LABKEY.WebPart;
        (global as any).LABKEY.WebPart = jest.fn(() => {
            throw new Error('WebPart creation failed');
        });

        render(<OtherReportWrapper report={reportConfig} tab={mockTab} />);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading report', expect.any(Error));
        consoleErrorSpy.mockRestore();
        (global as any).LABKEY.WebPart = originalWebPart;
    });

    test('generates unique IDs for multiple instances', () => {
        const { container: container1 } = render(<OtherReportWrapper report={reportConfig} tab={mockTab} />);
        const { container: container2 } = render(<OtherReportWrapper report={reportConfig} tab={mockTab} />);

        const targetDiv1 = container1.querySelector('.other-report-wrapper');
        const targetDiv2 = container2.querySelector('.other-report-wrapper');

        expect(targetDiv1?.id).not.toBe(targetDiv2?.id);
    });

    test('handles single subject in filters', async () => {
        mockTab.filters = { subjects: ['ID123'] };
        mockTab.getFilterArray = jest.fn(() => ({
            removable: [],
            nonRemovable: [Filter.create('Id', 'ID123', Filter.Types.EQUAL)],
        }));

        render(<OtherReportWrapper report={reportConfig} tab={mockTab} />);

        await waitFor(() => {
            const webPartCall = (global as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.partConfig.title).toBe('Other Report - ID123');
        });
    });

    test('replaces colons in useId for valid HTML ID', () => {
        // Mock useId to return a value with colons
        jest.spyOn(React, 'useId').mockReturnValue(':r1:');

        const { container } = render(<OtherReportWrapper report={reportConfig} tab={mockTab} />);

        const targetDiv = container.querySelector('.other-report-wrapper');
        expect(targetDiv?.id).not.toContain(':');
        expect(targetDiv?.id).toContain('-');

        jest.restoreAllMocks();
    });
});
