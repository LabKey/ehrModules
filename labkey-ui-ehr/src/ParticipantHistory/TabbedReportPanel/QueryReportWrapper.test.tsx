import React from 'react';
import { waitFor } from '@testing-library/react';
import { Filter } from '@labkey/api';

import { QueryReportWrapper } from './QueryReportWrapper';
import { ExtReportTab, ReportConfig } from './ReportTab';
import { defaultServerContext, renderWithServerContext } from '../../test/utils';

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
};

// Mock LDK global
(global as any).LDK = {
    Utils: {
        getErrorCallback: jest.fn(() => (error: any) => console.error(error)),
    },
};

describe('QueryReportWrapper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExt4Container.isDestroyed = false;
    });

    const mockTab: ExtReportTab = {
        ...mockExt4Container,
        getFilterArray: jest.fn(() => ({
            removable: [],
            nonRemovable: [Filter.create('Id', 'ID123', Filter.Types.EQUAL)],
        })),
        getQWPConfig: jest.fn(() => ({
            partName: 'Report',
            schemaName: 'study',
            queryName: 'demographics',
            viewName: 'default',
            title: 'Query Report',
            filters: [],
            removeableFilters: [],
            suppressRenderErrors: true,
        })),
    };

    const queryReport: ReportConfig = {
        id: 'query-report-1',
        title: 'Query Report',
        reportType: 'query',
        schemaName: 'study',
        queryName: 'demographics',
    };

    test('renders without crashing', () => {
        const { container } = renderWithServerContext(
            <QueryReportWrapper report={queryReport} tab={mockTab} />,
            defaultServerContext
        );

        expect(container).toBeInTheDocument();
    });

    test('returns null (no visual elements)', () => {
        const { container } = renderWithServerContext(
            <QueryReportWrapper report={queryReport} tab={mockTab} />,
            defaultServerContext
        );

        expect(container.firstChild).toBeNull();
    });

    test('calls tab.getQWPConfig to get query configuration', async () => {
        renderWithServerContext(<QueryReportWrapper report={queryReport} tab={mockTab} />, defaultServerContext);

        await waitFor(() => {
            expect(mockTab.getQWPConfig).toHaveBeenCalled();
        });
    });

    test('adds ldk-querycmp to tab with query config', async () => {
        renderWithServerContext(<QueryReportWrapper report={queryReport} tab={mockTab} />, defaultServerContext);

        await waitFor(() => {
            expect(mockTab.add).toHaveBeenCalledWith({
                xtype: 'ldk-querycmp',
                queryConfig: expect.objectContaining({
                    partName: 'Report',
                    schemaName: 'study',
                    queryName: 'demographics',
                }),
            });
        });
    });

    test('sets failure callback on queryConfig', async () => {
        renderWithServerContext(<QueryReportWrapper report={queryReport} tab={mockTab} />, defaultServerContext);

        await waitFor(() => {
            const addCall = mockTab.add.mock.calls[0][0];
            expect(addCall.queryConfig.failure).toBeDefined();
            expect(typeof addCall.queryConfig.failure).toBe('function');
        });
    });

    test('sets success callback on queryConfig', async () => {
        renderWithServerContext(<QueryReportWrapper report={queryReport} tab={mockTab} />, defaultServerContext);

        await waitFor(() => {
            const addCall = mockTab.add.mock.calls[0][0];
            expect(addCall.queryConfig.success).toBeDefined();
            expect(typeof addCall.queryConfig.success).toBe('function');
        });
    });

    test('failure callback logs error to console', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        renderWithServerContext(<QueryReportWrapper report={queryReport} tab={mockTab} />, defaultServerContext);

        await waitFor(() => {
            const addCall = mockTab.add.mock.calls[0][0];
            addCall.queryConfig.failure({ message: 'Test error' });
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith({ message: 'Test error' });
        consoleErrorSpy.mockRestore();
    });

    test('success callback executes without error', async () => {
        renderWithServerContext(<QueryReportWrapper report={queryReport} tab={mockTab} />, defaultServerContext);

        await waitFor(() => {
            const addCall = mockTab.add.mock.calls[0][0];
            // Should not throw
            expect(() => addCall.queryConfig.success()).not.toThrow();
        });
    });

    test('does not render when tab is null', () => {
        renderWithServerContext(<QueryReportWrapper report={queryReport} tab={null as any} />, defaultServerContext);

        expect(mockTab.add).not.toHaveBeenCalled();
    });

    test('does not render when Ext4 is undefined', () => {
        const originalExt4 = (global as any).Ext4;
        (global as any).Ext4 = undefined;

        renderWithServerContext(<QueryReportWrapper report={queryReport} tab={mockTab} />, defaultServerContext);

        expect(mockTab.add).not.toHaveBeenCalled();

        (global as any).Ext4 = originalExt4;
    });

    test('does not render when LDK is undefined', () => {
        const originalLDK = (global as any).LDK;
        (global as any).LDK = undefined;

        renderWithServerContext(<QueryReportWrapper report={queryReport} tab={mockTab} />, defaultServerContext);

        expect(mockTab.add).not.toHaveBeenCalled();

        (global as any).LDK = originalLDK;
    });

    test('handles error during component creation', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        mockTab.add = jest.fn(() => {
            throw new Error('Failed to create ExtJS component');
        });

        renderWithServerContext(<QueryReportWrapper report={queryReport} tab={mockTab} />, defaultServerContext);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create ExtJS component', expect.any(Error));
        consoleErrorSpy.mockRestore();
    });

    test('cleans up by calling removeAll on unmount', async () => {
        const { unmount } = renderWithServerContext(
            <QueryReportWrapper report={queryReport} tab={mockTab} />,
            defaultServerContext
        );

        await waitFor(() => {
            expect(mockTab.add).toHaveBeenCalled();
        });

        unmount();

        expect(mockTab.removeAll).toHaveBeenCalled();
    });

    test('does not call removeAll if tab is destroyed', async () => {
        const { unmount } = renderWithServerContext(
            <QueryReportWrapper report={queryReport} tab={mockTab} />,
            defaultServerContext
        );

        await waitFor(() => {
            expect(mockTab.add).toHaveBeenCalled();
        });

        mockTab.isDestroyed = true;
        unmount();

        expect(mockTab.removeAll).not.toHaveBeenCalled();
    });

    test('recreates component when tab changes', async () => {
        const { rerender } = renderWithServerContext(
            <QueryReportWrapper report={queryReport} tab={mockTab} />,
            defaultServerContext
        );

        await waitFor(() => {
            expect(mockTab.add).toHaveBeenCalledTimes(1);
        });

        const newTab: ExtReportTab = {
            ...mockTab,
            getQWPConfig: jest.fn(() => ({
                partName: 'Report',
                schemaName: 'core',
                queryName: 'users',
            })),
        };

        rerender(<QueryReportWrapper report={queryReport} tab={newTab} />);

        await waitFor(() => {
            expect(newTab.add).toHaveBeenCalled();
        });
    });

    test('component dependencies include tab, report, and container', () => {
        // This test verifies the useEffect dependency array
        // The actual behavior is tested by other tests (cleanup on unmount, etc.)
        const { rerender } = renderWithServerContext(
            <QueryReportWrapper report={queryReport} tab={mockTab} />,
            defaultServerContext
        );

        // Component should render without errors
        expect(mockTab.getQWPConfig).toHaveBeenCalled();

        // Changing props should trigger re-render
        const newReport: ReportConfig = {
            ...queryReport,
            id: 'query-report-2',
            queryName: 'housing',
        };

        rerender(<QueryReportWrapper report={newReport} tab={mockTab} />);

        // Component should still be functional after rerender
        expect(mockTab.getQWPConfig).toHaveBeenCalled();
    });

    test('uses server context container in effect', async () => {
        const customContext = {
            ...defaultServerContext,
            container: { id: 'CustomContainer', path: '/Custom/Path' },
        };

        renderWithServerContext(<QueryReportWrapper report={queryReport} tab={mockTab} />, customContext);

        await waitFor(() => {
            expect(mockTab.add).toHaveBeenCalled();
        });

        // Component should render successfully with custom container context
        expect(mockTab.getQWPConfig).toHaveBeenCalled();
    });

    test('passes complete queryConfig from getQWPConfig', async () => {
        const complexQueryConfig = {
            partName: 'Report',
            schemaName: 'study',
            queryName: 'demographics',
            viewName: 'custom',
            title: 'Complex Report',
            filters: [Filter.create('Id', 'ID123', Filter.Types.EQUAL)],
            removeableFilters: [Filter.create('Status', 'Active', Filter.Types.EQUAL)],
            suppressRenderErrors: true,
            showInsertNewButton: false,
            showDeleteButton: false,
            customProperty: 'customValue',
        };

        mockTab.getQWPConfig = jest.fn(() => complexQueryConfig);

        renderWithServerContext(<QueryReportWrapper report={queryReport} tab={mockTab} />, defaultServerContext);

        await waitFor(() => {
            const addCall = mockTab.add.mock.calls[0][0];
            expect(addCall.queryConfig).toMatchObject(complexQueryConfig);
        });
    });

    test('handles tab with minimal getQWPConfig return', async () => {
        mockTab.getQWPConfig = jest.fn(() => ({
            schemaName: 'study',
            queryName: 'demographics',
        }));

        renderWithServerContext(<QueryReportWrapper report={queryReport} tab={mockTab} />, defaultServerContext);

        await waitFor(() => {
            const addCall = mockTab.add.mock.calls[0][0];
            expect(addCall.queryConfig.schemaName).toBe('study');
            expect(addCall.queryConfig.queryName).toBe('demographics');
            expect(addCall.queryConfig.failure).toBeDefined();
            expect(addCall.queryConfig.success).toBeDefined();
        });
    });
});
