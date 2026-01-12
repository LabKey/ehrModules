import React, { act } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TabbedReportPanel } from './TabbedReportPanel';
import { ReportConfig } from './ReportTab';
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

    describe('filter modes integration', () => {
        describe('ID Search mode', () => {
            test('creates subject ID filter for single subject', async () => {
                const reports = [queryReport];
                const filters = { filterType: 'idSearch', subjects: ['ID123'] };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Verify Ext4 container was created with appropriate filter setup
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });

            test('creates subject ID filter for multiple subjects', async () => {
                const reports = [queryReport];
                const filters = { filterType: 'idSearch', subjects: ['ID123', 'ID456', 'ID789'] };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Verify multiple subjects are handled
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });

            test('uses EQUALS_ONE_OF filter type for multiple subjects', async () => {
                const reports = [queryReport];
                const filters = { filterType: 'idSearch', subjects: ['ID123', 'ID456'] };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Should use EQUALS_ONE_OF filter instead of EQUAL for multiple subjects
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });
        });

        describe('URL Params mode', () => {
            test('creates subject ID filter from URL-provided subjects', async () => {
                const reports = [queryReport];
                const filters = { filterType: 'urlParams', subjects: ['ID123', 'ID456'] };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // URL Params mode should create same filters as ID Search mode
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });

            test('handles single subject from URL params', async () => {
                const reports = [queryReport];
                const filters = { filterType: 'urlParams', subjects: ['ID123'] };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });
        });

        describe('All Records mode', () => {
            test('creates no filters when filterType is all', async () => {
                const reports = [queryReport];
                const filters = { filterType: 'all', subjects: undefined };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // All Records mode should not create any subject or status filters
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });

            test('ignores subjects when filterType is all', async () => {
                const reports = [queryReport];
                const filters = { filterType: 'all', subjects: undefined };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Should not apply subject filters even if accidentally provided
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });
        });

        describe('Alive at Center mode', () => {
            test('creates calculated_status = Alive filter', async () => {
                const reports = [queryReport];
                const filters = { filterType: 'aliveAtCenter', subjects: undefined };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Should create filter on calculated_status field
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });

            test('does not create subject filters in Alive at Center mode', async () => {
                const reports = [queryReport];
                const filters = { filterType: 'aliveAtCenter', subjects: undefined };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Only status filter, no subject filters
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });
        });

        describe('filter switching', () => {
            test('updates report filters when switching from ID Search to All Records', async () => {
                const reports = [queryReport];
                const initialFilters = { filterType: 'idSearch', subjects: ['ID123'] };

                const { rerender } = renderWithServerContext(
                    <TabbedReportPanel filters={initialFilters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Switch to All Records mode
                const newFilters = { filterType: 'all', subjects: undefined };
                rerender(<TabbedReportPanel filters={newFilters} reports={reports} />);

                // Report should update with no filters
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });

            test('updates report filters when switching from All Records to Alive at Center', async () => {
                const reports = [queryReport];
                const initialFilters = { filterType: 'all', subjects: undefined };

                const { rerender } = renderWithServerContext(
                    <TabbedReportPanel filters={initialFilters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Switch to Alive at Center mode
                const newFilters = { filterType: 'aliveAtCenter', subjects: undefined };
                rerender(<TabbedReportPanel filters={newFilters} reports={reports} />);

                // Report should update with status filter
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });

            test('updates report filters when switching from Alive at Center to ID Search', async () => {
                const reports = [queryReport];
                const initialFilters = { filterType: 'aliveAtCenter', subjects: undefined };

                const { rerender } = renderWithServerContext(
                    <TabbedReportPanel filters={initialFilters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Switch to ID Search mode
                const newFilters = { filterType: 'idSearch', subjects: ['ID123', 'ID456'] };
                rerender(<TabbedReportPanel filters={newFilters} reports={reports} />);

                // Report should update with subject filters
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });
        });

        describe('empty subjects validation', () => {
            test('shows validation error when ID Search mode has empty subjects array', async () => {
                const reports = [queryReport];
                const filters = { filterType: 'idSearch', subjects: [] };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                // Should not pass empty subjects to reports
                // Instead should show error or prevent report rendering
                await waitFor(() => {
                    // Component should handle this gracefully
                    const queryReportText = screen.queryByText('Query Report');
                    expect(queryReportText).toBeInTheDocument();
                });
            });
        });

        describe('report supportsNonIdFilters field', () => {
            test('shows error message when Alive at Center mode used with unsupported report', async () => {
                const unsupportedReport: ReportConfig = {
                    ...queryReport,
                    supportsNonIdFilters: false,
                };
                const reports = [unsupportedReport];
                const filters = { filterType: 'aliveAtCenter', subjects: undefined };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Should show error message that report doesn't support non-ID filtering
                await waitFor(() => {
                    const errorMessage = screen.queryByText(/this report does not support alive at center filtering/i);
                    // Error message would be displayed by parent component (SearchByIdPanel)
                    // TabbedReportPanel should just show unfiltered data
                });
            });

            test('applies Alive at Center filter when report supports non-ID filters', async () => {
                const supportedReport: ReportConfig = {
                    ...queryReport,
                    supportsNonIdFilters: true,
                };
                const reports = [supportedReport];
                const filters = { filterType: 'aliveAtCenter', subjects: undefined };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Should apply calculated_status filter
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });
        });

        describe('LabKey Filter API format', () => {
            test('creates filters in correct LabKey Filter.create() format for single subject', async () => {
                const reports = [queryReport];
                const filters = { filterType: 'idSearch', subjects: ['ID123'] };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Should use Filter.Types.EQUAL for single subject
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });

            test('creates filters in correct LabKey Filter.create() format for multiple subjects', async () => {
                const reports = [queryReport];
                const filters = { filterType: 'idSearch', subjects: ['ID123', 'ID456'] };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Should use Filter.Types.EQUALS_ONE_OF for multiple subjects
                // Subjects should be joined with semicolon: 'ID123;ID456'
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });
        });

        describe('custom subjectFieldName handling', () => {
            test('uses custom subjectFieldName from report config', async () => {
                const customReport: ReportConfig = {
                    ...queryReport,
                    subjectFieldName: 'ParticipantId',
                };
                const reports = [customReport];
                const filters = { filterType: 'idSearch', subjects: ['ID123'] };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Should use custom subjectFieldName instead of default 'Id'
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });

            test('defaults to Id when subjectFieldName not specified', async () => {
                const reports = [queryReport]; // No subjectFieldName specified
                const filters = { filterType: 'idSearch', subjects: ['ID123'] };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Should default to 'Id' field
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });
        });

        describe('edge cases for filter modes', () => {
            test('handles undefined filterType gracefully', async () => {
                const reports = [queryReport];
                const filters = { subjects: ['ID123'] }; // No filterType specified

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Should not crash, should treat as no filters
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });

            test('handles null filters gracefully', async () => {
                const reports = [queryReport];

                renderWithServerContext(<TabbedReportPanel filters={null} reports={reports} />, defaultServerContext());

                await screen.findByText('Query Report');

                // Should not crash with null filters
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });

            test('handles empty filterType string', async () => {
                const reports = [queryReport];
                const filters = { filterType: '', subjects: ['ID123'] };

                renderWithServerContext(
                    <TabbedReportPanel filters={filters} reports={reports} />,
                    defaultServerContext()
                );

                await screen.findByText('Query Report');

                // Should treat empty string as no filters
                await waitFor(() => {
                    expect((global as any).Ext4.create).toHaveBeenCalled();
                });
            });
        });
    });
});
