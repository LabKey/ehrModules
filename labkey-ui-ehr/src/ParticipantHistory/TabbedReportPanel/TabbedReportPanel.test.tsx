import React, { act } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReportConfig, TabbedReportPanel } from './TabbedReportPanel';
import { defaultServerContext, renderWithServerContext } from '../../test/utils';

// Mock @labkey/api Query.selectRows to prevent communication failure in tests
jest.mock('@labkey/api', () => ({
    ...jest.requireActual('@labkey/api'),
    Query: {
        ...jest.requireActual('@labkey/api').Query,
        selectRows: jest.fn(),
    },
}));

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

// Mock LDK global for QueryReportWrapper
(global as any).LDK = {
    Utils: {
        getErrorCallback: jest.fn(() => jest.fn()),
    },
};

// Mock LABKEY.WebPart for OtherReportWrapper
(global as any).LABKEY = {
    ...(global as any).LABKEY,
    WebPart: jest.fn().mockImplementation(() => ({
        render: jest.fn(),
    })),
};

// Mock testJsFunction for JSReportWrapper tests
(window as any).testJsFunction = jest.fn();

describe('TabbedReportPanel', () => {
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

    const jsReport: ReportConfig = {
        id: 'js-report-1',
        title: 'JS Report',
        reportType: 'js',
        queryName: 'testJsFunction',
        category: 'Category A',
    };

    const otherReport: ReportConfig = {
        id: 'other-report-1',
        title: 'Other Report',
        reportType: 'report',
        schemaName: 'core',
        queryName: 'users',
        reportId: 'report-123',
        category: 'Category B',
    };

    test('renders query report tab and displays QueryReportWrapper', async () => {
        const reports = [queryReport];

        renderWithServerContext(
            <TabbedReportPanel filters={{ subjects: ['test-subject'] }} reports={reports} />,
            defaultServerContext()
        );

        // Verify the report title is shown in the tab
        expect(await screen.findByText('Query Report')).toBeVisible();

        // Verify Ext4.create was called for the tab container
        await waitFor(() => {
            expect((global as any).Ext4.create).toHaveBeenCalledWith(
                'Ext.container.Container',
                expect.objectContaining({
                    border: false,
                })
            );
        });
    });

    test('renders js report tab and displays JSReportWrapper', async () => {
        const reports = [jsReport];

        renderWithServerContext(
            <TabbedReportPanel filters={{ subjects: ['test-subject'] }} reports={reports} />,
            defaultServerContext()
        );

        // Verify the report title is shown in the tab
        expect(await screen.findByText('JS Report')).toBeVisible();

        // Verify Ext4.create was called
        await waitFor(() => {
            expect((global as any).Ext4.create).toHaveBeenCalled();
        });
    });

    test('renders other report tab and displays OtherReportWrapper', async () => {
        const reports = [otherReport];

        renderWithServerContext(
            <TabbedReportPanel filters={{ subjects: ['test-subject'] }} reports={reports} />,
            defaultServerContext()
        );

        // Verify the report title is shown in the tab
        expect(await screen.findByText('Other Report')).toBeVisible();

        // Verify LABKEY.WebPart was instantiated for the report
        await waitFor(() => {
            expect((global as any).LABKEY.WebPart).toHaveBeenCalled();
        });
    });

    test('renders category tabs and allows switching between categories', async () => {
        const reports = [queryReport, jsReport, otherReport];

        renderWithServerContext(
            <TabbedReportPanel filters={{ subjects: ['test-subject'] }} reports={reports} />,
            defaultServerContext()
        );

        // Verify category tabs are rendered
        expect(await screen.findByText('Category A')).toBeVisible();
        expect(await screen.findByText('Category B')).toBeVisible();

        // Click on Category B
        const categoryBTab = screen.getByText('Category B');
        await act(async () => {
            userEvent.click(categoryBTab);
        });

        // Verify the Other Report is now active
        await waitFor(() => {
            expect(screen.getByText('Other Report')).toBeVisible();
        });
    });

    test('allows switching between reports in the same category', async () => {
        const reports = [queryReport, jsReport];

        renderWithServerContext(
            <TabbedReportPanel filters={{ subjects: ['test-subject'] }} reports={reports} />,
            defaultServerContext()
        );

        // Verify both report tabs are visible in Category A
        expect(await screen.findByText('Query Report')).toBeVisible();
        expect(await screen.findByText('JS Report')).toBeVisible();

        // Click on JS Report tab
        const jsReportTab = screen.getByText('JS Report');
        await act(async () => {
            userEvent.click(jsReportTab);
        });

        // The JS Report tab should now be active
        await waitFor(() => {
            const jsTab = screen.getByText('JS Report').closest('a');
            expect(jsTab).toHaveClass('report-tab-active');
        });
    });

    test('displays loading state when no reports provided initially', () => {
        // When reportsQuery is used but reports prop is not provided,
        // it should show loading until data is fetched
        renderWithServerContext(<TabbedReportPanel filters={{ subjects: [] }} />, defaultServerContext());

        expect(screen.getByText('Loading reports...')).toBeVisible();
    });

    test('displays message when reports array is empty', () => {
        renderWithServerContext(<TabbedReportPanel filters={{ subjects: [] }} reports={[]} />, defaultServerContext());

        expect(screen.getByText('No reports configuration provided.')).toBeVisible();
    });

    test('calls onTabChange when switching tabs', async () => {
        const onTabChange = jest.fn();
        const reports = [queryReport, jsReport];

        renderWithServerContext(
            <TabbedReportPanel filters={{ subjects: ['test-subject'] }} onTabChange={onTabChange} reports={reports} />,
            defaultServerContext()
        );

        // Wait for initial render
        await screen.findByText('Query Report');

        // Click on JS Report tab
        const jsReportTab = screen.getByText('JS Report');
        await act(async () => {
            userEvent.click(jsReportTab);
        });

        // Verify onTabChange was called with the new tab id
        await waitFor(() => {
            expect(onTabChange).toHaveBeenCalledWith('js-report-1');
        });
    });

    test('selects the specified active report on initial render', async () => {
        const reports = [queryReport, jsReport];

        renderWithServerContext(
            <TabbedReportPanel activeReport="js-report-1" filters={{ subjects: ['test-subject'] }} reports={reports} />,
            defaultServerContext()
        );

        // Wait for render and verify JS Report tab is active
        await waitFor(() => {
            const jsTab = screen.getByText('JS Report').closest('a');
            expect(jsTab).toHaveClass('report-tab-active');
        });
    });
});
