import React from 'react';
import { waitFor } from '@testing-library/react';
import { Filter } from '@labkey/api';

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

(global as any).Ext4 = {
    create: jest.fn(() => {
        mockExt4Container = createMockContainer();
        return mockExt4Container;
    }),
};

// Mock LDK global
(global as any).LDK = {
    Utils: {
        getErrorCallback: jest.fn(() => (error: any) => console.error(error)),
    },
};

// Mock LABKEY global
(global as any).LABKEY = {
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
        renderWithServerContext(<QueryReportWrapper filters={filters} report={queryReport} />, defaultServerContext());

        await waitFor(() => {
            expect((global as any).Ext4.create).toHaveBeenCalledWith(
                'Ext.container.Container',
                expect.objectContaining({
                    border: false,
                })
            );
        });

        await waitFor(() => {
            expect(mockExt4Container.add).toHaveBeenCalledWith({
                xtype: 'ldk-querycmp',
                queryConfig: expect.objectContaining({
                    partName: 'Report',
                }),
            });
        });
    });

    test('sets failure callback on queryConfig', async () => {
        renderWithServerContext(<QueryReportWrapper filters={filters} report={queryReport} />, defaultServerContext());

        await waitFor(() => {
            const addCall = (mockExt4Container.add as jest.Mock).mock.calls[0][0];
            expect(addCall.queryConfig.failure).toBeDefined();
            expect(typeof addCall.queryConfig.failure).toBe('function');
        });
    });

    test('failure callback logs error and displays error in tab', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        renderWithServerContext(<QueryReportWrapper filters={filters} report={queryReport} />, defaultServerContext());

        await waitFor(() => {
            const addCall = (mockExt4Container.add as jest.Mock).mock.calls[0][0];
            addCall.queryConfig.failure({ message: 'Test error' });
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load query report', { message: 'Test error' });

        // Verify error is displayed in tab
        const addCalls = (mockExt4Container.add as jest.Mock).mock.calls;
        const errorCall = addCalls.find((call: any) => call[0].html?.includes('labkey-error'));
        expect(errorCall).toBeDefined();
        expect(errorCall[0].html).toContain("Failed to load 'Query Report'");

        consoleErrorSpy.mockRestore();
    });

    test('displays error in tab when component creation throws', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        // Override Ext4.create to return a container whose add throws on first call, then succeeds
        const originalCreate = (global as any).Ext4.create;
        const errorContainer = createMockContainer();
        let firstCall = true;
        errorContainer.add = jest.fn(() => {
            if (firstCall) {
                firstCall = false;
                throw new Error('Failed to create ExtJS component');
            }
        });
        (global as any).Ext4.create = jest.fn(() => errorContainer);

        renderWithServerContext(<QueryReportWrapper filters={filters} report={queryReport} />, defaultServerContext());

        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create ExtJS component', expect.any(Error));

        // Verify error is displayed in tab
        const addCalls = (errorContainer.add as jest.Mock).mock.calls;
        const errorCall = addCalls.find((call: any) => call[0].html?.includes('labkey-error'));
        expect(errorCall).toBeDefined();
        expect(errorCall[0].html).toContain("Error loading 'Query Report'");

        consoleErrorSpy.mockRestore();
        (global as any).Ext4.create = originalCreate;
    });

    test('cleans up by calling destroy on unmount', async () => {
        const { unmount } = renderWithServerContext(
            <QueryReportWrapper filters={filters} report={queryReport} />,
            defaultServerContext()
        );

        await waitFor(() => {
            expect(mockExt4Container.add).toHaveBeenCalled();
        });

        unmount();

        expect(mockExt4Container.destroy).toHaveBeenCalled();
    });

    test('renders without server context dependency', async () => {
        renderWithServerContext(<QueryReportWrapper filters={filters} report={queryReport} />, defaultServerContext());

        await waitFor(() => {
            expect(mockExt4Container.add).toHaveBeenCalled();
        });
    });
});
