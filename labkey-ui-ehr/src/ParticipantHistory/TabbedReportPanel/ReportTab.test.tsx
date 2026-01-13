import React from 'react';
import { render, waitFor } from '@testing-library/react';

import { ReportTab } from './ReportTab';
import {
    FILTER_TYPE_ALIVE_AT_CENTER,
    FILTER_TYPE_ALL,
    FILTER_TYPE_ID_SEARCH,
    FILTER_TYPE_URL_PARAMS,
    ReportConfig,
} from '../models';

// Mock Ext4 global
const mockExt4Container = {
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

describe('ReportTab', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExt4Container.isDestroyed = false;
    });

    const queryReport: ReportConfig = {
        id: 'query-report-1',
        title: 'Query Report',
        reportType: 'query',
        schemaName: 'core',
        queryName: 'users',
        category: 'Category A',
    };

    test('creates Ext4 container with correct configuration', async () => {
        const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

        render(
            <ReportTab filters={filters} report={queryReport}>
                {() => <div>Child Content</div>}
            </ReportTab>
        );

        await waitFor(() => {
            expect((global as any).Ext4.create).toHaveBeenCalledWith(
                'Ext.container.Container',
                expect.objectContaining({
                    border: false,
                    defaults: { border: false },
                })
            );
        });
    });

    test('assigns report and filters to tab object', async () => {
        const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

        render(
            <ReportTab filters={filters} report={queryReport}>
                {() => <div>Child Content</div>}
            </ReportTab>
        );

        await waitFor(() => {
            expect(mockExt4Container.report).toBe(queryReport);
            expect(mockExt4Container.filters).toBe(filters);
        });
    });

    test('adds getFilterArray method to tab object', async () => {
        const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

        render(
            <ReportTab filters={filters} report={queryReport}>
                {() => <div>Child Content</div>}
            </ReportTab>
        );

        await waitFor(() => {
            expect(typeof mockExt4Container.getFilterArray).toBe('function');
        });
    });

    test('adds getQWPConfig method to tab object', async () => {
        const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

        render(
            <ReportTab filters={filters} report={queryReport}>
                {() => <div>Child Content</div>}
            </ReportTab>
        );

        await waitFor(() => {
            expect(typeof mockExt4Container.getQWPConfig).toBe('function');
        });
    });

    test('renders children with tab object', async () => {
        const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };
        const childRenderFn = jest.fn(() => <div>Child Content</div>);

        render(
            <ReportTab filters={filters} report={queryReport}>
                {childRenderFn}
            </ReportTab>
        );

        await waitFor(() => {
            expect(childRenderFn).toHaveBeenCalledWith(mockExt4Container);
        });
    });

    test('cleans up tab on unmount', async () => {
        const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

        const { unmount } = render(
            <ReportTab filters={filters} report={queryReport}>
                {() => <div>Child Content</div>}
            </ReportTab>
        );

        await waitFor(() => {
            expect((global as any).Ext4.create).toHaveBeenCalled();
        });

        unmount();

        expect(mockExt4Container.destroy).toHaveBeenCalled();
    });

    test('recreates tab when report changes', async () => {
        const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

        const { rerender } = render(
            <ReportTab filters={filters} report={queryReport}>
                {() => <div>Child Content</div>}
            </ReportTab>
        );

        await waitFor(() => {
            expect((global as any).Ext4.create).toHaveBeenCalledTimes(1);
        });

        const newReport: ReportConfig = {
            ...queryReport,
            id: 'query-report-2',
            title: 'New Query Report',
        };

        rerender(
            <ReportTab filters={filters} report={newReport}>
                {() => <div>Child Content</div>}
            </ReportTab>
        );

        await waitFor(() => {
            expect((global as any).Ext4.create).toHaveBeenCalledTimes(2);
            expect(mockExt4Container.destroy).toHaveBeenCalled();
        });
    });

    test('recreates tab when filters change', async () => {
        const initialFilters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

        const { rerender } = render(
            <ReportTab filters={initialFilters} report={queryReport}>
                {() => <div>Child Content</div>}
            </ReportTab>
        );

        await waitFor(() => {
            expect((global as any).Ext4.create).toHaveBeenCalledTimes(1);
        });

        const newFilters = { filterType: FILTER_TYPE_ALL, subjects: undefined };

        rerender(
            <ReportTab filters={newFilters} report={queryReport}>
                {() => <div>Child Content</div>}
            </ReportTab>
        );

        await waitFor(() => {
            expect((global as any).Ext4.create).toHaveBeenCalledTimes(2);
            expect(mockExt4Container.destroy).toHaveBeenCalled();
        });
    });

    test('does not create tab if Ext4 is undefined', () => {
        const originalExt4 = (global as any).Ext4;
        const originalCreateCallCount = (global as any).Ext4?.create?.mock?.calls?.length || 0;
        (global as any).Ext4 = undefined;

        const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

        render(
            <ReportTab filters={filters} report={queryReport}>
                {() => <div>Child Content</div>}
            </ReportTab>
        );

        // Restore Ext4 before assertions
        (global as any).Ext4 = originalExt4;

        // Verify that no new Ext4.create call was made
        expect((global as any).Ext4.create.mock.calls.length).toBe(originalCreateCallCount);
    });

    test('renders report-target div', () => {
        const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

        const { container } = render(
            <ReportTab filters={filters} report={queryReport}>
                {() => <div>Child Content</div>}
            </ReportTab>
        );

        expect(container.querySelector('.report-target')).toBeInTheDocument();
    });

    test('uses custom subjectFieldName from report config', async () => {
        const customReport: ReportConfig = {
            ...queryReport,
            subjectFieldName: 'ParticipantId',
        };
        const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

        render(
            <ReportTab filters={filters} report={customReport}>
                {() => <div>Child Content</div>}
            </ReportTab>
        );

        await waitFor(() => {
            // Verify the custom report was assigned to the container
            expect(mockExt4Container.report).toEqual(customReport);
        });
    });

    test('defaults to Id when subjectFieldName not specified', async () => {
        const filters = { filterType: FILTER_TYPE_ID_SEARCH, subjects: ['ID123'] };

        render(
            <ReportTab filters={filters} report={queryReport}>
                {() => <div>Child Content</div>}
            </ReportTab>
        );

        await waitFor(() => {
            // Verify the report was assigned without subjectFieldName
            expect(mockExt4Container.report).toEqual(queryReport);
            expect(mockExt4Container.report.subjectFieldName).toBeUndefined();
        });
    });
});
