import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Filter } from '@labkey/api';

import { OtherReportWrapper } from './OtherReportWrapper';
import { ExtReportTab, FILTER_TYPE_ID_SEARCH, OtherReportConfig } from '../models';

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
};

// Mock LABKEY global
const mockWebPart = {
    render: jest.fn(),
};

(global as any).LABKEY = {
    WebPart: jest.fn(() => mockWebPart),
    Utils: {
        encodeHtml: jest.fn((s: string) => s),
    },
};

describe('OtherReportWrapper', () => {
    const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123', 'ID456'] };

    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });

    const reportConfig: OtherReportConfig = {
        id: 'other-report-1',
        title: 'Other Report',
        reportType: 'report',
        schemaName: 'study',
        queryName: 'demographics',
        reportId: 'db:123',
        category: null,
        containerPath: null,
        subjectIdFieldName: null,
        supportsnonidfilters: null,
        viewName: null,
    };

    test('renders other-report-wrapper__target div and other-report-wrapper__content div', () => {
        const { container } = render(<OtherReportWrapper filters={filters} report={reportConfig} />);

        expect(container.querySelector('.other-report-wrapper__target')).toBeInTheDocument();
        const targetDiv = container.querySelector('.other-report-wrapper__content');
        expect(targetDiv).toBeInTheDocument();
        expect(targetDiv?.id).toMatch(/^report-target-other-report-1-/);
    });

    test('creates LABKEY.WebPart with correct configuration', async () => {
        render(<OtherReportWrapper filters={filters} report={reportConfig} />);

        await waitFor(() => {
            expect((global as any).LABKEY.WebPart).toHaveBeenCalledWith(
                expect.objectContaining({
                    partName: 'Report',
                    renderTo: expect.stringMatching(/^report-target-other-report-1-/),
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
        render(<OtherReportWrapper filters={filters} report={reportConfig} />);

        await waitFor(() => {
            expect(mockWebPart.render).toHaveBeenCalled();
        });
    });

    test('adds title suffix from subjects', async () => {
        const filtersWithSubjects = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123', 'ID456', 'ID789'] };

        render(<OtherReportWrapper filters={filtersWithSubjects} report={reportConfig} />);

        await waitFor(() => {
            const webPartCall = (global as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.partConfig.title).toBe('Other Report - ID123, ID456, ID789');
        });
    });

    test('does not add title suffix when no subjects', async () => {
        const emptyFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: [] as string[] };

        render(<OtherReportWrapper filters={emptyFilters} report={reportConfig} />);

        await waitFor(() => {
            const webPartCall = (global as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.partConfig.title).toBe('Other Report');
        });
    });

    test('includes viewName in partConfig when provided', async () => {
        const reportWithView = { ...reportConfig, viewName: 'CustomView' };

        render(<OtherReportWrapper filters={filters} report={reportWithView} />);

        await waitFor(() => {
            const webPartCall = (global as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.partConfig.showSection).toBe('CustomView');
        });
    });

    test('includes containerPath when provided', async () => {
        const reportWithContainer = { ...reportConfig, containerPath: '/MyProject/MyFolder' };

        render(<OtherReportWrapper filters={filters} report={reportWithContainer} />);

        await waitFor(() => {
            const webPartCall = (global as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.containerPath).toBe('/MyProject/MyFolder');
        });
    });

    test('displays error message when WebPart failure callback is triggered', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        const { container } = render(<OtherReportWrapper filters={filters} report={reportConfig} />);

        await waitFor(() => {
            const webPartCall = (global as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.failure).toBeDefined();
            webPartCall.failure({ message: 'Test error' });
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load report', { message: 'Test error' });

        const targetDiv = container.querySelector('.other-report-wrapper__content');
        expect(targetDiv?.innerHTML).toContain('labkey-error');
        expect(targetDiv?.innerHTML).toContain("Failed to load report 'Other Report'");

        consoleErrorSpy.mockRestore();
    });

    test('displays error when WebPart creation throws', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const originalWebPart = (global as any).LABKEY.WebPart;
        (global as any).LABKEY.WebPart = jest.fn(() => {
            throw new Error('WebPart creation failed');
        });

        const { container } = render(<OtherReportWrapper filters={filters} report={reportConfig} />);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading report', expect.any(Error));

        const targetDiv = container.querySelector('.other-report-wrapper__content');
        expect(targetDiv?.innerHTML).toContain('labkey-error');
        expect(targetDiv?.innerHTML).toContain("Error loading report 'Other Report'");

        consoleErrorSpy.mockRestore();
        (global as any).LABKEY.WebPart = originalWebPart;
    });

    test('generates unique IDs for multiple instances', () => {
        const { container: container1 } = render(<OtherReportWrapper filters={filters} report={reportConfig} />);
        const { container: container2 } = render(<OtherReportWrapper filters={filters} report={reportConfig} />);

        const targetDiv1 = container1.querySelector('.other-report-wrapper__content');
        const targetDiv2 = container2.querySelector('.other-report-wrapper__content');

        expect(targetDiv1?.id).not.toBe(targetDiv2?.id);
    });

    test('handles single subject in filters', async () => {
        const singleFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

        render(<OtherReportWrapper filters={singleFilters} report={reportConfig} />);

        await waitFor(() => {
            const webPartCall = (global as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.partConfig.title).toBe('Other Report - ID123');
        });
    });

    test('replaces colons in useId for valid HTML ID', () => {
        jest.spyOn(React, 'useId').mockReturnValue(':r1:');

        const { container } = render(<OtherReportWrapper filters={filters} report={reportConfig} />);

        const targetDiv = container.querySelector('.other-report-wrapper__content');
        expect(targetDiv?.id).not.toContain(':');
        expect(targetDiv?.id).toContain('-');

        jest.restoreAllMocks();
    });
});
