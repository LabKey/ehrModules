import React, { FC, memo, useEffect, useId, useRef } from 'react';
import { Filter } from '@labkey/api';

import { OtherReportConfig, QueryWebPartConfig, ReportFilters } from '../models';

import { useReportTab } from './useReportTab';
import { getTitleSuffix } from './JSReportWrapper';

interface OtherReportWrapperProps {
    filters: ReportFilters;
    report: OtherReportConfig;
}

const OtherReportWrapperComponent: FC<OtherReportWrapperProps> = ({ report, filters }) => {
    const { tab, targetRef } = useReportTab(report, filters);
    const otherReportRef = useRef<HTMLDivElement>(null);

    // Generate a unique ID for the render target - LABKEY.WebPart expects a string ID, not a DOM element
    const uniqueId = useId();
    const targetId = `report-target-${report.id}-${uniqueId.replace(/:/g, '-')}`;

    useEffect(() => {
        if (!tab) return;

        // Ensure the DOM element exists before rendering
        const targetElement = otherReportRef.current;
        if (!targetElement) {
            return;
        }

        try {
            const filterArray = tab.getFilterArray();
            const filterList = filterArray.nonRemovable.concat(filterArray.removable);

            const { subjects } = tab?.filters || {};

            // partConfig requires an index signature because filter.getURLParameterName()
            // generates dynamic keys (e.g., "query.Id~eq") that can't be statically typed.
            // The LABKEY.WebPart API accepts these as arbitrary string keys.
            const partConfig: Record<string, unknown> = {
                title: report.title + getTitleSuffix(subjects),
                schemaName: report.schemaName,
                reportId: report.reportId,
                'query.queryName': report.queryName,
            };

            // Add filter parameters to partConfig
            if (filterList?.length) {
                filterList.forEach((filter: Filter.IFilter) => {
                    partConfig[filter.getURLParameterName('query')] = filter.getURLParameterValue();
                });
            }

            if (report.viewName) {
                partConfig.showSection = report.viewName;
            }

            const queryConfig: QueryWebPartConfig = {
                partName: 'Report',
                renderTo: targetId,
                partConfig,
                filters: filterList,
                failure: (error: unknown) => {
                    console.error('Failed to load report', error);
                    const safeTitle = report.title ? LABKEY.Utils.encodeHtml(report.title) : 'report';
                    const safeError = LABKEY.Utils.encodeHtml(String(error));
                    targetElement.innerHTML = `<div class="labkey-error">Failed to load report '${safeTitle}': ${safeError}</div>`;
                },
            };

            if (report.containerPath) {
                queryConfig.containerPath = report.containerPath;
            }

            new LABKEY.WebPart(queryConfig).render();
        } catch (e) {
            console.error('Error loading report', e);
            const safeTitle = report.title ? LABKEY.Utils.encodeHtml(report.title) : 'report';
            const safeError = LABKEY.Utils.encodeHtml(String(e));
            targetElement.innerHTML = `<div class="labkey-error">Error loading report '${safeTitle}': ${safeError}</div>`;
        }

        return () => {
            if (targetElement) {
                targetElement.innerHTML = '';
            }
        };
    }, [tab, report, targetId]);

    return (
        <>
            <div className="other-report-wrapper__target" ref={targetRef} />
            <div className="other-report-wrapper__content" id={targetId} ref={otherReportRef} />
        </>
    );
};

OtherReportWrapperComponent.displayName = 'OtherReportWrapper';

export const OtherReportWrapper = memo(OtherReportWrapperComponent);
