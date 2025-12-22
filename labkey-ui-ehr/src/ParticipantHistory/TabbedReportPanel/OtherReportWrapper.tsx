import React, { FC, memo, useEffect, useId } from 'react';

import { ReportConfig } from './TabbedReportPanel';

// Declare global variables for ExtJS and LABKEY
declare const Ext4: any;
declare const LABKEY: any;

export const OtherReportWrapper: FC<{ report: ReportConfig; tab: any }> = memo(({ tab, report }) => {
    // Generate a unique ID for the render target - LABKEY.WebPart expects a string ID, not a DOM element
    // Down the
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
                const { subjects } = tab.filters || {};
                if (subjects && subjects.length > 0) {
                    return ' - ' + subjects.join(', ');
                }
                return '';
            };

            const partConfig: any = {
                title: report.title + getTitleSuffix(),
                schemaName: report.schemaName,
                reportId: report.reportId,
                'query.queryName': report.queryName,
                participantId: '12345',
            };

            // Add filter parameters to partConfig
            if (filters.length) {
                filters.forEach((filter: any) => {
                    partConfig[filter.getURLParameterName('query')] = filter.getURLParameterValue();
                });
            }

            if (report.viewName) {
                partConfig.showSection = report.viewName;
            }

            const queryConfig: any = {
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

    return <div id={targetId} style={{ minHeight: '50px' }} />;
});
