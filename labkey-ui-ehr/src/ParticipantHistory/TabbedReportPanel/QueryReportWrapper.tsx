/*
 * Copyright (c) 2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
import React, { FC, memo, useEffect } from 'react';

import { QueryReportConfig, QueryWebPartConfig, ReportFilters } from '../models';

import { useReportTab } from './useReportTab';

interface QueryReportWrapperProps {
    filters: ReportFilters;
    report: QueryReportConfig;
}

const QueryReportWrapperComponent: FC<QueryReportWrapperProps> = ({ report, filters }) => {
    const { tab, targetRef } = useReportTab(report, filters);

    useEffect(() => {
        if (!tab) return;

        const queryConfig: QueryWebPartConfig = tab.getQWPConfig();
        queryConfig.failure = (error: unknown) => {
            console.error('Failed to load query report', error);
            if (tab && !tab.isDestroyed) {
                const safeTitle = report.title ? LABKEY.Utils.encodeHtml(report.title) : 'query report';
                const safeError = LABKEY.Utils.encodeHtml(String(error));
                tab.add({
                    html: `<div class="labkey-error">Failed to load '${safeTitle}': ${safeError}</div>`,
                });
            }
        };

        try {
            tab.add({
                xtype: 'ldk-querycmp',
                queryConfig: queryConfig,
            });
        } catch (e) {
            console.error('Failed to create ExtJS component', e);
            if (tab && !tab.isDestroyed) {
                const safeTitle = report.title ? LABKEY.Utils.encodeHtml(report.title) : 'query report';
                const safeError = LABKEY.Utils.encodeHtml(String(e));
                tab.add({
                    html: `<div class="labkey-error">Error loading '${safeTitle}': ${safeError}</div>`,
                });
            }
        }

        return () => {
            if (tab && !tab.isDestroyed) {
                tab.removeAll();
            }
        };
    }, [tab, report]);

    return <div className="query-report-wrapper__target report-target" ref={targetRef} />;
};

QueryReportWrapperComponent.displayName = 'QueryReportWrapper';

export const QueryReportWrapper = memo(QueryReportWrapperComponent);
