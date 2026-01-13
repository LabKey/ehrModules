import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Filter, Query } from '@labkey/api';

import { JSReportWrapper } from './JSReportWrapper';
import { QueryReportWrapper } from './QueryReportWrapper';
import { OtherReportWrapper } from './OtherReportWrapper';
import { ReportTab } from './ReportTab';
import { ReportConfig } from '../models';

interface TabbedReportPanelProps {
    activeReport?: string;
    filters: any;
    onTabChange?: (reportId: string) => void;
    reportNamespace?: string;
    reports?: ReportConfig[];
    reportsQuery?: string;
    reportsSchema?: string;
    showReport?: boolean;
}

const TabbedReportPanelComponent: FC<TabbedReportPanelProps> = ({
    activeReport,
    filters,
    onTabChange,
    reportNamespace,
    reports: propsReports,
    reportsQuery = 'reports',
    reportsSchema = 'ehr',
    showReport = true,
}) => {
    const [reports, setReports] = useState<ReportConfig[]>(propsReports || []);
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [activeTabId, setActiveTabId] = useState<string>(activeReport || '');
    const [isLoading, setIsLoading] = useState<boolean>(!propsReports);
    const [error, setError] = useState<null | string>(null);

    // Helper function to set active tab and category from reports
    const initializeActiveTab = useCallback(
        (reportsList: ReportConfig[]) => {
            if (reportsList.length === 0) return;

            // If activeReport prop is provided, try to find and select it
            if (activeReport) {
                const targetReport = reportsList.find(r => r.id === activeReport);
                if (targetReport) {
                    setActiveCategory(targetReport.category || 'Uncategorized');
                    setActiveTabId(targetReport.id);
                    // Notify parent about initial active report
                    onTabChange?.(targetReport.id);
                    return;
                }
            }

            // Default to first report
            const firstReport = reportsList[0];
            setActiveCategory(firstReport.category || 'Uncategorized');
            setActiveTabId(firstReport.id);
            // Notify parent about initial active report (first report)
            onTabChange?.(firstReport.id);
        },
        [activeReport, onTabChange]
    );

    useEffect(() => {
        if (propsReports) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
    }, [propsReports, activeReport, reportsSchema, reportsQuery, initializeActiveTab]);

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
        if (categoryReports?.length > 0) {
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
            {activeCategory && activeCategoryReports?.length > 0 && (
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
                {showReport && currentActiveReport ? (
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
                ) : (
                    <div className="empty-state-placeholder">Select Filter to View Reports</div>
                )}
            </div>
        </div>
    );
};

TabbedReportPanelComponent.displayName = 'TabbedReportPanel';

export const TabbedReportPanel = memo(TabbedReportPanelComponent);
