import React, { FC, memo, useEffect, useMemo, useRef, useState } from 'react';
import { Filter, Query } from '@labkey/api';

import { JSReportWrapper } from './JSReportWrapper';
import { QueryReportWrapper } from './QueryReportWrapper';
import { OtherReportWrapper } from './OtherReportWrapper';

// Declare global variables for ExtJS
declare const Ext4: any;

export interface ReportConfig {
    [key: string]: any; // Allow other config options
    category?: string;
    containerPath?: string;
    id: string;
    queryName?: string;
    reportId?: string;
    reportType: string;
    schemaName?: string;
    title: string;
    viewName?: string;
}

interface TabbedReportPanelProps {
    activeReport?: string;
    filters: any;
    onTabChange?: (reportId: string) => void;
    reportNamespace?: any;
    reports?: ReportConfig[];
    reportsQuery?: string;
    reportsSchema?: string;
    showReport?: boolean;
}

const ReportTab: FC<{ children: (tab: any) => React.ReactNode; filters: any; report: ReportConfig }> = ({
    report,
    filters,
    children,
}) => {
    const targetRef = useRef<HTMLDivElement>(null);
    const [tab, setTab] = useState<any>(null);

    useEffect(() => {
        if (!targetRef.current || !Ext4) return;

        const newTab = Ext4.create('Ext.container.Container', {
            renderTo: targetRef.current,
            border: false,
            defaults: {
                border: false,
            },
        });
        newTab.report = report;
        newTab.filters = filters;

        // Add getFilterArray function to tab for use by report wrappers
        newTab.getFilterArray = () => {
            const filterArray: { nonRemovable: any[]; removable: any[] } = {
                removable: [],
                nonRemovable: [],
            };

            const subjectFieldName = report.subjectFieldName || 'Id';

            if (filters && filters.subjects && filters.subjects.length) {
                const subjects = filters.subjects;
                if (subjects.length === 1) {
                    filterArray.nonRemovable.push(Filter.create(subjectFieldName, subjects[0], Filter.Types.EQUAL));
                } else {
                    filterArray.nonRemovable.push(
                        Filter.create(subjectFieldName, subjects.join(';'), Filter.Types.EQUALS_ONE_OF)
                    );
                }
            }

            return filterArray;
        };

        // Add getQWPConfig function to tab for use by report wrappers
        newTab.getQWPConfig = () => {
            const filterArray = newTab.getFilterArray();

            const queryConfig: any = {
                partName: 'Report',
                suppressRenderErrors: true,
                title: report.title,
                schemaName: report.schemaName,
                queryName: report.queryName,
                viewName: report.viewName,
                allowChooseQuery: false,
                allowChooseView: true,
                showInsertNewButton: false,
                showDeleteButton: false,
                showDetailsColumn: true,
                showUpdateColumn: false,
                showRecordSelectors: true,
                allowHeaderLock: false,
                frame: 'portal',
                buttonBarPosition: 'top',
                timeout: 0,
                linkTarget: '_blank',
                filters: filterArray.nonRemovable,
                removeableFilters: filterArray.removable,
                // Add other properties from report config, excluding internal ones
                ...Object.keys(report).reduce((acc, key) => {
                    if (key !== 'id' && key !== 'title' && key !== 'reportType') {
                        acc[key] = report[key];
                    }
                    return acc;
                }, {} as any),
                tab: newTab,
            };

            return queryConfig;
        };

        setTab(newTab);

        return () => {
            if (newTab) {
                newTab.destroy();
            }
            setTab(null);
        };
    }, [report, filters]);

    return (
        <>
            <div ref={targetRef} style={{ minHeight: '300px' }} />
            {tab && children(tab)}
        </>
    );
};

export const TabbedReportPanel: FC<TabbedReportPanelProps> = memo(
    ({
        activeReport,
        filters,
        onTabChange,
        reportNamespace,
        reports: propsReports,
        reportsQuery = 'reports',
        reportsSchema = 'ehr',
        showReport,
    }) => {
        const [reports, setReports] = useState<ReportConfig[]>(propsReports || []);
        const [activeCategory, setActiveCategory] = useState<string>('');
        const [activeTabId, setActiveTabId] = useState<string>(activeReport || '');
        const [isLoading, setIsLoading] = useState<boolean>(!propsReports);
        const [error, setError] = useState<null | string>(null);
        const [isReportTabSelected, setIsReportTabSelected] = useState<boolean>(showReport ?? false);

        // Helper function to set active tab and category from reports
        const initializeActiveTab = (reportsList: ReportConfig[]) => {
            if (reportsList.length === 0) return;

            // If activeReport prop is provided, try to find and select it
            if (activeReport) {
                const targetReport = reportsList.find(r => r.id === activeReport);
                if (targetReport) {
                    setActiveCategory(targetReport.category || 'Uncategorized');
                    setActiveTabId(targetReport.id);
                    return;
                }
            }

            // Default to first report
            const firstReport = reportsList[0];
            setActiveCategory(firstReport.category || 'Uncategorized');
            setActiveTabId(firstReport.id);
        };

        useEffect(() => {
            if (propsReports) {
                setReports(propsReports);
                initializeActiveTab(propsReports);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            Query.selectRows({
                schemaName: reportsSchema,
                queryName: reportsQuery,
                filterArray: [Filter.create('visible', true, Filter.Types.EQUAL)],
                sort: 'category,sort_order,reporttitle,reportstatus',
                success: data => {
                    const loadedReports: ReportConfig[] = data.rows.map((row: any) => {
                        const report: ReportConfig = {
                            id: row.reportname,
                            title: row.reporttitle,
                            reportType: row.reporttype,
                            schemaName: row.schemaname,
                            queryName: row.queryname,
                            viewName: row.viewname,
                            reportId: row.report,
                            ...row,
                        };

                        if (row.jsonConfig) {
                            try {
                                const json = JSON.parse(row.jsonConfig);
                                Object.assign(report, json);
                            } catch (e) {
                                console.warn('Failed to parse jsonConfig for report: ' + row.reportname, e);
                            }
                        }
                        return report;
                    });
                    setReports(loadedReports);
                    initializeActiveTab(loadedReports);
                    setIsLoading(false);
                },
                failure: e => {
                    console.error('Failed to load reports', e);
                    setError('Failed to load reports.');
                    setIsLoading(false);
                },
            });
        }, [propsReports, activeReport, reportsSchema, reportsQuery]);

        // Group reports by category, preserving order
        const { categories, reportsByCategory } = useMemo(() => {
            const cats: string[] = [];
            const grouped: Record<string, ReportConfig[]> = {};

            reports.forEach(report => {
                const category = report.category || 'Uncategorized';
                if (!grouped[category]) {
                    grouped[category] = [];
                    cats.push(category);
                }
                grouped[category].push(report);
            });

            return { categories: cats, reportsByCategory: grouped };
        }, [reports]);

        if (isLoading) {
            return <div>Loading reports...</div>;
        }

        if (error) {
            return <div className="text-danger">{error}</div>;
        }

        if (!reports || reports.length === 0) {
            return <div>No reports configuration provided.</div>;
        }

        const handleCategoryClick = (category: string) => {
            setActiveCategory(category);
            const categoryReports = reportsByCategory[category];
            if (categoryReports && categoryReports.length > 0) {
                const newTabId = categoryReports[0].id;
                setActiveTabId(newTabId);
                onTabChange?.(newTabId);
            } else {
                setActiveTabId('');
            }
        };

        const currentActiveReport = reports.find(r => r.id === activeTabId);
        const activeCategoryReports = reportsByCategory[activeCategory] || [];

        return (
            <div className="tabbed-report-panel panel-body">
                {/* First Layer: Categories (Top Level - Primary Navigation) */}
                <ul className="nav nav-tabs category-tabs">
                    {categories.map(category => (
                        <li className={activeCategory === category ? 'active' : ''} key={category}>
                            <a
                                className={activeCategory === category ? 'category-tab-active' : 'category-tab'}
                                href="#"
                                onClick={e => {
                                    e.preventDefault();
                                    handleCategoryClick(category);
                                }}
                            >
                                {category}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Second Layer: Reports in selected category (Subordinate Navigation) */}
                {activeCategory && activeCategoryReports.length > 0 && (
                    <ul className="nav nav-tabs report-tabs">
                        {activeCategoryReports.map(report => (
                            <li className={activeTabId === report.id ? 'active' : ''} key={report.id}>
                                <a
                                    className={activeTabId === report.id ? 'report-tab-active' : 'report-tab'}
                                    href="#"
                                    onClick={e => {
                                        e.preventDefault();
                                        setActiveTabId(report.id);
                                        onTabChange?.(report.id);
                                    }}
                                >
                                    {report.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="tab-content">
                    {currentActiveReport && (
                        <div key={currentActiveReport.id}>
                            <ReportTab filters={filters} report={currentActiveReport}>
                                {tab => (
                                    <>
                                        {currentActiveReport.reportType === 'query' ? (
                                            <QueryReportWrapper report={currentActiveReport} tab={tab} />
                                        ) : currentActiveReport.reportType === 'js' ? (
                                            <JSReportWrapper
                                                report={currentActiveReport}
                                                reportNamespace={reportNamespace}
                                                tab={tab}
                                            />
                                        ) : currentActiveReport.reportType === 'report' ? (
                                            <OtherReportWrapper report={currentActiveReport} tab={tab} />
                                        ) : (
                                            <div>
                                                Placeholder for {currentActiveReport.title} (Type:{' '}
                                                {currentActiveReport.reportType})
                                            </div>
                                        )}
                                    </>
                                )}
                            </ReportTab>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);
