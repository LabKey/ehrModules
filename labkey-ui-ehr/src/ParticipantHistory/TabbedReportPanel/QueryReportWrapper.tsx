import React, { FC, memo, useEffect } from 'react';
import { useServerContext } from '@labkey/components';

import { ExtReportTab, QueryReportConfig, QueryWebPartConfig } from '../models';

// Declare global variables for ExtJS and LDK
declare const Ext4: any;
declare const LDK: any;

/** Props for QueryReportWrapper component */
interface QueryReportWrapperProps {
    report: QueryReportConfig;
    tab: ExtReportTab;
}

const QueryReportWrapperComponent: FC<QueryReportWrapperProps> = ({ tab, report }) => {
    const { container } = useServerContext();

    useEffect(() => {
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

    // This component manages ExtJS lifecycle imperatively via useEffect
    // and does not render any DOM elements
    return null;
};

QueryReportWrapperComponent.displayName = 'QueryReportWrapper';

export const QueryReportWrapper = memo(QueryReportWrapperComponent);
