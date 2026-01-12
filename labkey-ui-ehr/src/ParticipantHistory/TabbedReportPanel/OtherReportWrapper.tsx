import React, { FC, memo, useEffect, useId } from 'react';
import { Filter } from '@labkey/api';

import { ExtReportTab, QueryWebPartConfig, ReportConfig } from './ReportTab';

// Declare global variables for ExtJS and LABKEY
declare const Ext4: any;
declare const LABKEY: any;

const OtherReportWrapperComponent: FC<{ report: ReportConfig; tab: ExtReportTab }> = ({ tab, report }) => {
    // Generate a unique ID for the render target - LABKEY.WebPart expects a string ID, not a DOM element
    const uniqueId = useId();
    const targetId = `report-target-${report.id}-${uniqueId.replace(/:/g, '-')}`;

    useEffect(() => {
        if (!tab || !Ext4 || !LABKEY) {
            return;
        }

        // Ensure the DOM element exists before rendering
        const targetElement = document.getElementById(targetId);
        if (!targetElement) {
            return;
        }

        try {
            const filterArray = tab.getFilterArray();
            const filters = filterArray.nonRemovable.concat(filterArray.removable);

            // Get title suffix from filters
            const getTitleSuffix = () => {
                const { subjects } = tab?.filters || {};
                if (subjects?.length > 0) {
                    return ' - ' + subjects.join(', ');
                }
                return '';
            };

            const partConfig: Record<string, any> = {
                title: report.title + getTitleSuffix(),
                schemaName: report.schemaName,
                reportId: report.reportId,
                'query.queryName': report.queryName,
            };

            // Add filter parameters to partConfig
            if (filters?.length) {
                filters.forEach((filter: Filter.IFilter) => {
                    partConfig[filter.getURLParameterName('query')] = filter.getURLParameterValue();
                });
            }

            if (report.viewName) {
                partConfig.showSection = report.viewName;
            }

            const queryConfig: QueryWebPartConfig = {
                partName: 'Report',
                renderTo: targetId,
                suppressRenderErrors: true,
                partConfig,
                filters,
                success: () => {
                    // Report loaded successfully
                },
                failure: (error: any) => console.error('Failed to load report', error),
            };

            if (report.containerPath) {
                queryConfig.containerPath = report.containerPath;
            }

            new LABKEY.WebPart(queryConfig).render();
        } catch (e) {
            console.error('Error loading report', e);
        }

        return () => {
            // Clean up if needed
        };
    }, [tab, report, targetId]);

    return <div className="other-report-wrapper" id={targetId} />;
};

OtherReportWrapperComponent.displayName = 'OtherReportWrapper';

export const OtherReportWrapper = memo(OtherReportWrapperComponent);
