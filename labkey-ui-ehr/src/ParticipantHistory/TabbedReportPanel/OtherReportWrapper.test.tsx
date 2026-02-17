import React from 'react';
import { render, waitFor } from '@testing-library/react';

import { OtherReportWrapper } from './OtherReportWrapper';
import { ExtReportTab, FILTER_TYPE_ID_SEARCH, OtherReportConfig } from '../models';

const createMockContainer = (): ExtReportTab =>
    ({
        add: jest.fn(),
        removeAll: jest.fn(),
        destroy: jest.fn(),
    } as unknown as ExtReportTab);

(globalThis as any).Ext4 = {
    create: jest.fn(() => createMockContainer()),
};

// Mock LABKEY global
const mockWebPart = {
    render: jest.fn(),
};

(globalThis as any).LABKEY = {
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
        // Act
        const { container } = render(<OtherReportWrapper filters={filters} report={reportConfig} />);

        // Assert - wrapper divs are rendered with correct BEM classes and the content div has a report-prefixed ID
        expect(container.querySelector('.other-report-wrapper__target')).toBeInTheDocument();
        const targetDiv = container.querySelector('.other-report-wrapper__content');
        expect(targetDiv).toBeInTheDocument();
        expect(targetDiv?.id).toMatch(/^report-target-other-report-1-/);
    });

    test('creates and renders LABKEY.WebPart with correct configuration', async () => {
        // Act
        render(<OtherReportWrapper filters={filters} report={reportConfig} />);

        // Assert - WebPart is created with correct config and render() is invoked
        await waitFor(() => {
            expect((globalThis as any).LABKEY.WebPart).toHaveBeenCalledWith(
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
            expect(mockWebPart.render).toHaveBeenCalled();
        });
    });

    test.each([
        { subjects: ['ID123', 'ID456', 'ID789'], expectedTitle: 'Other Report - ID123, ID456, ID789' },
        { subjects: [] as string[], expectedTitle: 'Other Report' },
        { subjects: ['ID123'], expectedTitle: 'Other Report - ID123' },
    ])('sets title based on subjects: $subjects', async ({ subjects, expectedTitle }) => {
        // Arrange
        const caseFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects };

        // Act
        render(<OtherReportWrapper filters={caseFilters} report={reportConfig} />);

        // Assert - title reflects the expected suffix derived from subject IDs
        await waitFor(() => {
            const webPartCall = (globalThis as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.partConfig.title).toBe(expectedTitle);
        });
    });

    test('includes viewName in partConfig when provided', async () => {
        // Arrange
        const reportWithView = { ...reportConfig, viewName: 'CustomView' };

        // Act
        render(<OtherReportWrapper filters={filters} report={reportWithView} />);

        // Assert - viewName is passed as showSection in partConfig
        await waitFor(() => {
            const webPartCall = (globalThis as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.partConfig.showSection).toBe('CustomView');
        });
    });

    test('includes containerPath when provided', async () => {
        // Arrange
        const reportWithContainer = { ...reportConfig, containerPath: '/MyProject/MyFolder' };

        // Act
        render(<OtherReportWrapper filters={filters} report={reportWithContainer} />);

        // Assert - containerPath is passed through to WebPart config
        await waitFor(() => {
            const webPartCall = (globalThis as any).LABKEY.WebPart.mock.calls[0][0];
            expect(webPartCall.containerPath).toBe('/MyProject/MyFolder');
        });
    });

    test('displays error message when WebPart failure callback is triggered', async () => {
        // Arrange
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        try {
            // Act
            const { container } = render(<OtherReportWrapper filters={filters} report={reportConfig} />);

            // Assert - failure callback is available on the created WebPart config
            let webPartCall: any;
            await waitFor(() => {
                webPartCall = (globalThis as any).LABKEY.WebPart.mock.calls[0][0];
                expect(webPartCall.failure).toBeDefined();
            });

            // Act
            webPartCall.failure({ message: 'Test error' });

            // Assert - error is logged to console and error message is rendered in the content div
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load report', { message: 'Test error' });

            const targetDiv = container.querySelector('.other-report-wrapper__content');
            expect(targetDiv?.innerHTML).toContain('labkey-error');
            expect(targetDiv?.innerHTML).toContain("Failed to load report 'Other Report'");
        } finally {
            consoleErrorSpy.mockRestore();
        }
    });

    test('displays error when WebPart creation throws', async () => {
        // Arrange
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const originalWebPart = (globalThis as any).LABKEY.WebPart;
        (globalThis as any).LABKEY.WebPart = jest.fn(() => {
            throw new Error('WebPart creation failed');
        });

        try {
            // Act
            const { container } = render(<OtherReportWrapper filters={filters} report={reportConfig} />);

            // Assert - error is logged and the component renders the fallback error message
            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading report', expect.any(Error));

                const targetDiv = container.querySelector('.other-report-wrapper__content');
                expect(targetDiv?.innerHTML).toContain('labkey-error');
                expect(targetDiv?.innerHTML).toContain("Error loading report 'Other Report'");
            });
        } finally {
            consoleErrorSpy.mockRestore();
            (globalThis as any).LABKEY.WebPart = originalWebPart;
        }
    });

    test('generates unique IDs for multiple instances', () => {
        // Act
        const { container: container1 } = render(<OtherReportWrapper filters={filters} report={reportConfig} />);
        const { container: container2 } = render(<OtherReportWrapper filters={filters} report={reportConfig} />);

        const targetDiv1 = container1.querySelector('.other-report-wrapper__content');
        const targetDiv2 = container2.querySelector('.other-report-wrapper__content');

        // Assert - each instance receives a distinct content div ID
        expect(targetDiv1?.id).not.toBe(targetDiv2?.id);
    });

    test('replaces colons in useId for valid HTML ID', () => {
        // Arrange
        jest.spyOn(React, 'useId').mockReturnValue(':r1:');

        try {
            // Act
            const { container } = render(<OtherReportWrapper filters={filters} report={reportConfig} />);

            // Assert - colons from useId are replaced with hyphens in the target div ID
            const targetDiv = container.querySelector('.other-report-wrapper__content');
            expect(targetDiv?.id).not.toContain(':');
            expect(targetDiv?.id).toContain('-');
        } finally {
            jest.restoreAllMocks();
        }
    });
});
