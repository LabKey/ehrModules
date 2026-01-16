import React, { FC, memo, useEffect, useMemo, useRef, useState } from 'react';

import { JSReportWrapper } from './JSReportWrapper';
import { QueryReportWrapper } from './QueryReportWrapper';
import { OtherReportWrapper } from './OtherReportWrapper';
import { ReportTab } from './ReportTab';
import { ReportConfig, ReportFilters } from '../models';

interface TabbedReportPanelProps {
    activeReport?: string;
    filters: ReportFilters;
    onTabChange?: (reportId: string) => void;
    reportNamespace?: string;
    reports?: ReportConfig[];
    showReport?: boolean;
}

const TabbedReportPanelComponent: FC<TabbedReportPanelProps> = ({
    activeReport,
    filters,
    onTabChange,
    reportNamespace,
    reports,
    showReport = true,
}) => {
    // Track user-initiated selections (null means use computed default)
    const [userSelectedCategory, setUserSelectedCategory] = useState<null | string>(null);
    const [userSelectedTabId, setUserSelectedTabId] = useState<null | string>(null);
    const hasNotifiedParent = useRef(false);

    // Compute default active tab based on reports and activeReport prop
    const defaultActive = useMemo(() => {
        if (!reports || reports.length === 0) {
            return { category: '', tabId: '' };
        }

        // If activeReport prop is provided, try to find and select it
        if (activeReport) {
            const targetReport = reports.find(r => r.id === activeReport);
            if (targetReport) {
                return {
                    category: targetReport.category || 'Uncategorized',
                    tabId: targetReport.id,
                };
            }
        }

        // Default to first report
        const firstReport = reports[0];
        return {
            category: firstReport.category || 'Uncategorized',
            tabId: firstReport.id,
        };
    }, [reports, activeReport]);

    // Effective active values: user selection takes precedence over defaults
    const activeCategory = userSelectedCategory ?? defaultActive.category;
    const activeTabId = userSelectedTabId ?? defaultActive.tabId;

    // Notify parent about initial active report (side effect only, no setState)
    useEffect(() => {
        if (reports && reports.length > 0 && !hasNotifiedParent.current && defaultActive.tabId) {
            hasNotifiedParent.current = true;
            onTabChange?.(defaultActive.tabId);
        }
    }, [reports, defaultActive.tabId, onTabChange]);

    // Setters that update user selection
    const setActiveCategory = (category: string) => setUserSelectedCategory(category);
    const setActiveTabId = (tabId: string) => setUserSelectedTabId(tabId);

    // Group reports by category, preserving order
    const { categories, reportsByCategory } = useMemo(() => {
        const cats: string[] = [];
        const grouped: Record<string, ReportConfig[]> = {};

        if (reports) {
            reports.forEach(report => {
                const category = report.category || 'Uncategorized';
                if (!grouped[category]) {
                    grouped[category] = [];
                    cats.push(category);
                }
                grouped[category].push(report);
            });
        }

        return { categories: cats, reportsByCategory: grouped };
    }, [reports]);

    if (!reports) {
        return <div>Loading reports...</div>;
    }

    if (reports.length === 0) {
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
                    <div>
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
