import React, { FC, memo, useEffect } from 'react';
import { useServerContext } from '@labkey/components';

import { ExtReportTab, QueryWebPartConfig, ReportConfig } from './ReportTab';

// Declare global variables for ExtJS and LDK
declare const Ext4: any;
declare const LDK: any;

const QueryReportWrapperComponent: FC<{ report: ReportConfig; tab: ExtReportTab }> = ({ tab, report }) => {
    const { container } = useServerContext();

    useEffect(() => {
        if (!tab || !Ext4 || !LDK) {
            return;
        }

        const queryConfig: QueryWebPartConfig = tab.getQWPConfig();

        // Use LDK.Utils.getErrorCallback() if available, otherwise simple console error
        const failureCallback = (error: any) => console.error(error);

        queryConfig.failure = failureCallback;
        queryConfig.success = () => {
            // Optional: signal loaded
        };

        try {
            // Add ldk-querycmp to the tab
            tab.add({
                xtype: 'ldk-querycmp',
                queryConfig: queryConfig,
            });
        } catch (e) {
            console.error('Failed to create ExtJS component', e);
        }

        return () => {
            if (tab && !tab.isDestroyed) {
                tab.removeAll();
            }
        };
    }, [tab, report, container]);

    return null;
};

QueryReportWrapperComponent.displayName = 'QueryReportWrapper';

export const QueryReportWrapper = memo(QueryReportWrapperComponent);
