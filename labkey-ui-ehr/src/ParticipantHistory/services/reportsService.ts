import { Query, Filter } from '@labkey/api';

import { ReportConfig } from '../models';

export interface FetchReportsResult {
    error?: string;
    reports: ReportConfig[];
}

export type FetchReportsFn = () => Promise<FetchReportsResult>;

/**
 * Fetches all visible reports from the EHR schema.
 * Returns a promise that resolves with the report configurations.
 */
export const fetchReports: FetchReportsFn = (): Promise<FetchReportsResult> => {
    return new Promise(resolve => {
        Query.selectRows({
            schemaName: 'ehr',
            queryName: 'reports',
            filterArray: [Filter.create('visible', true, Filter.Types.EQUAL)],
            sort: 'category,sort_order,reporttitle,reportstatus',
            success: (data: any) => {
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
                            console.error('Failed to parse jsonConfig for report: ' + row.reportname, e);
                        }
                    }
                    return report;
                });
                resolve({ reports: loadedReports });
            },
            failure: (error: any) => {
                console.error('Failed to load reports', error);
                resolve({ reports: [], error: error?.message || 'Failed to load reports' });
            },
        });
    });
};
