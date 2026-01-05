import React, { FC, memo, useCallback, useMemo } from 'react';
import { useServerContext } from '@labkey/components';
import { TabbedReportPanel } from './TabbedReportPanel/TabbedReportPanel';

interface UrlFilters {
    [key: string]: any;
    activeReport?: string;
    inputType?: string;
    participantId?: string;
    showReport?: boolean;
    subjects?: string[];
}

const getFiltersFromUrl = (): UrlFilters => {
    const context: UrlFilters = {};

    // Parse participantId from URL query parameters (e.g., ?participantId=44444)
    const urlParams = new URLSearchParams(document.location.search);
    const participantId = urlParams.get('participantId');
    if (participantId) {
        context.participantId = participantId;
        context.subjects = [participantId];
    }

    if (document.location.hash) {
        const token = document.location.hash.split('#');
        const params = token[1]?.split('&') || [];

        for (let i = 0; i < params.length; i++) {
            const t = params[i].split(':');
            const key = decodeURIComponent(t[0]);
            const value = t.length > 1 ? decodeURIComponent(t[1]) : undefined;

            switch (key) {
                case 'activeReport':
                    context.activeReport = value;
                    break;
                case 'inputType':
                    context.inputType = value;
                    break;
                case 'showReport':
                    context.showReport = value === '1';
                    break;
                case 'subjects':
                    // If subjects are in hash, merge with participantId if present
                    const hashSubjects = value ? value.split(';') : [];
                    if (context.participantId && !hashSubjects.includes(context.participantId)) {
                        context.subjects = [context.participantId, ...hashSubjects];
                    } else {
                        context.subjects = hashSubjects;
                    }
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
    const urlFilters = useMemo(() => getFiltersFromUrl(), []);

    const filters = useMemo(
        () => ({
            subjects: urlFilters.subjects || [],
            ...urlFilters,
        }),
        [urlFilters]
    );

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
