import React from 'react';
import { waitFor } from '@testing-library/react';

import { QueryReportWrapper } from './QueryReportWrapper';
import { ExtReportTab, FILTER_TYPE_ID_SEARCH, QueryReportConfig } from '../models';
import { defaultServerContext, renderWithServerContext } from '../../test/utils';

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
};

// Mock LABKEY global
(globalThis as any).LABKEY = {
    Utils: {
        encodeHtml: jest.fn((s: string) => s),
    },
};

describe('QueryReportWrapper', () => {
    const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const queryReport: QueryReportConfig = {
        id: 'query-report-1',
        title: 'Query Report',
        reportType: 'query',
        schemaName: 'study',
        queryName: 'demographics',
        category: null,
        containerPath: null,
        subjectIdFieldName: null,
        supportsnonidfilters: null,
        viewName: null,
    };

    test('creates Ext4 container and adds ldk-querycmp to tab', async () => {
        // Act
        renderWithServerContext(<QueryReportWrapper filters={filters} report={queryReport} />, defaultServerContext());

        // Assert - Ext4 container is created with the expected base config
        await waitFor(() => {
            expect((globalThis as any).Ext4.create).toHaveBeenCalledWith(
                'Ext.container.Container',
                expect.objectContaining({
                    border: false,
                })
            );
        });

        // Assert - query component is added to the tab with the expected report config
        await waitFor(() => {
            expect(mockExt4Container.add).toHaveBeenCalledWith({
                xtype: 'ldk-querycmp',
                queryConfig: expect.objectContaining({
                    partName: 'Report',
                }),
            });
        });
    });

    test('failure callback logs error and displays error in tab', async () => {
        // Arrange
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        try {
            // Act
            renderWithServerContext(<QueryReportWrapper filters={filters} report={queryReport} />, defaultServerContext());

            let addCall: any;
            // Assert - failure callback is attached to queryConfig before invoking the failure path
            await waitFor(() => {
                addCall = (mockExt4Container.add as jest.Mock).mock.calls[0][0];
                expect(addCall?.queryConfig?.failure).toBeDefined();
            });

            // Act
            addCall.queryConfig.failure({ message: 'Test error' });

            // Assert - error is logged to console and error HTML is displayed in the tab
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load query report', { message: 'Test error' });

            const addCalls = (mockExt4Container.add as jest.Mock).mock.calls;
            const errorCall = addCalls.find((call: any) => call[0].html?.includes('labkey-error'));
            expect(errorCall).toBeDefined();
            expect(errorCall[0].html).toContain("Failed to load 'Query Report'");
        } finally {
            consoleErrorSpy.mockRestore();
        }
    });

    test('displays error in tab when component creation throws', async () => {
        // Arrange
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        const originalCreate = (globalThis as any).Ext4.create;
        const errorContainer = createMockContainer();
        let firstCall = true;
        errorContainer.add = jest.fn(() => {
            if (firstCall) {
                firstCall = false;
                throw new Error('Failed to create ExtJS component');
            }
        });
        (globalThis as any).Ext4.create = jest.fn(() => errorContainer);

        try {
            // Act
            renderWithServerContext(<QueryReportWrapper filters={filters} report={queryReport} />, defaultServerContext());

            // Assert - error is logged to console and error message is displayed in the tab
            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create ExtJS component', expect.any(Error));

                const addCalls = (errorContainer.add as jest.Mock).mock.calls;
                const errorCall = addCalls.find((call: any) => call[0].html?.includes('labkey-error'));
                expect(errorCall).toBeDefined();
                expect(errorCall[0].html).toContain("Error loading 'Query Report'");
            });
        } finally {
            consoleErrorSpy.mockRestore();
            (globalThis as any).Ext4.create = originalCreate;
        }
    });

    test('cleans up by calling destroy on unmount', async () => {
        // Arrange
        const { unmount } = renderWithServerContext(
            <QueryReportWrapper filters={filters} report={queryReport} />,
            defaultServerContext()
        );

        // Assert - query component was created before unmount to ensure cleanup path is exercised
        await waitFor(() => {
            expect(mockExt4Container.add).toHaveBeenCalled();
        });

        // Act
        unmount();

        // Assert - destroy is called on the Ext4 container
        expect(mockExt4Container.destroy).toHaveBeenCalled();
    });

});
