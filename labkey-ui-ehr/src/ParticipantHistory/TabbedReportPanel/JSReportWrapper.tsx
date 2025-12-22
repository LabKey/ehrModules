import React, { FC, memo, useEffect } from 'react';

import { ReportConfig } from './TabbedReportPanel';

// Declare global variables for ExtJS
declare const Ext4: any;

export const JSReportWrapper: FC<{ report: ReportConfig; reportNamespace?: any; tab: any }> = memo(
    ({ tab, report, reportNamespace }) => {
        useEffect(() => {
            if (!tab || !Ext4) {
                return;
            }

            try {
                let jsFunction;
                const handlerName = report.queryName;

                if (typeof handlerName === 'function') {
                    jsFunction = handlerName;
                } else {
                    // Try to resolve from namespace if provided
                    if (reportNamespace) {
                        let ns = reportNamespace;
                        if (typeof ns === 'string') {
                            const parts = ns.split('.');
                            let ctx = window as any;
                            for (const part of parts) {
                                ctx = ctx && ctx[part];
                            }
                            ns = ctx;
                        }

                        if (ns && ns[handlerName] && typeof ns[handlerName] === 'function') {
                            jsFunction = ns[handlerName];
                        }
                    }

                    // If not found in namespace, try global resolution
                    if (!jsFunction && typeof handlerName === 'string') {
                        const parts = handlerName.split('.');
                        let ctx = window as any;
                        for (const part of parts) {
                            ctx = ctx && ctx[part];
                        }
                        if (typeof ctx === 'function') {
                            jsFunction = ctx;
                        }
                    }
                }

                if (jsFunction) {
                    // Create panel object with getFilterArray, getQWPConfig, and getTitleSuffix functions using tab's methods
                    const panel = {
                        getFilterArray: () => tab.getFilterArray(),
                        getQWPConfig: () => tab.getQWPConfig(),
                        getTitleSuffix: () => {
                            // Get title from filters (similar to activeFilterType.getTitle in ExtJS version)
                            const { subjects } = tab.filters || {};
                            if (subjects && subjects.length > 0) {
                                return ' - ' + subjects.join(', ');
                            }
                            return '';
                        },
                    };

                    // Pass panel as the first argument, matching ExtJS TabbedReportPanel behavior
                    jsFunction.call(null, panel, tab);
                } else {
                    tab.add({
                        html: `<div class="labkey-error">Could not find JavaScript function '${handlerName}'</div>`,
                    });
                    console.error(`Could not find JavaScript function '${handlerName}'`);
                }
            } catch (e) {
                console.error('Error loading JS report', e);
                if (tab && !tab.isDestroyed) {
                    tab.add({
                        html: `<div class="labkey-error">Error loading JS report: ${e}</div>`,
                    });
                }
            }

            return () => {
                if (tab && !tab.isDestroyed) {
                    tab.removeAll();
                }
            };
        }, [tab, report, reportNamespace]);

        return null;
    }
);
