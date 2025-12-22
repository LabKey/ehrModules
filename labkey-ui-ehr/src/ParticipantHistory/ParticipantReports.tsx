import React, { FC, memo, useCallback, useMemo } from 'react';
import { useServerContext } from '@labkey/components';
import { TabbedReportPanel } from './TabbedReportPanel/TabbedReportPanel';

interface UrlFilters {
    activeReport?: string;
    inputType?: string;
    showReport?: boolean;
    subjects?: string[];
    [key: string]: any;
}

const getFiltersFromUrl = (): UrlFilters => {
    const context: UrlFilters = {};

    if (document.location.hash) {
        const token = document.location.hash.split('#');
        const params = token[1]?.split('&') || [];

        for (let i = 0; i < params.length; i++) {
            const t = params[i].split(':');
            const key = decodeURIComponent(t[0]);
            const value = t.length > 1 ? decodeURIComponent(t[1]) : undefined;

            switch (key) {
                case 'inputType':
                    context.inputType = value;
                    break;
                case 'showReport':
                    context.showReport = value === '1';
                    break;
                case 'activeReport':
                    context.activeReport = value;
                    break;
                case 'subjects':
                    context.subjects = value ? value.split(';') : [];
                    break;
                default:
                    if (value !== undefined) {
                        context[key] = value;
                    }
            }
        }
    }

    return context;
};

export const ParticipantReports: FC = memo(() => {
    // const { user } = useServerContext();

    const urlFilters = useMemo(() => getFiltersFromUrl(), []);

    const filters = useMemo(() => ({
        subjects: urlFilters.subjects || ['12345'],
        ...urlFilters,
    }), [urlFilters]);

    const onTabChange = useCallback((reportId: string) => {
        const hash = document.location.hash;
        const params = hash ? hash.substring(1).split('&') : [];
        const newParams: string[] = [];
        let found = false;

        for (const param of params) {
            const [key] = param.split(':');
            if (decodeURIComponent(key) === 'activeReport') {
                newParams.push(`activeReport:${encodeURIComponent(reportId)}`);
                found = true;
            } else {
                newParams.push(param);
            }
        }

        if (!found) {
            newParams.push(`activeReport:${encodeURIComponent(reportId)}`);
        }

        document.location.hash = newParams.join('&');
    }, []);

    return (
        <div>
            <TabbedReportPanel
                activeReport={urlFilters.activeReport}
                filters={filters}
                onTabChange={onTabChange}
                reportNamespace="EHR.reports"
                reportsQuery="reports"
                reportsSchema="ehr"
                showReport={urlFilters.showReport}
            />
        </div>
    );
});