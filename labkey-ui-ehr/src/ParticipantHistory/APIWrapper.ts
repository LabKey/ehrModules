/*
 * Copyright (c) 2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
import { Filter, Query } from '@labkey/api';

import { IdResolutionResult, ReportConfig, ResolveIdsParams } from './models';

export interface FetchReportsResult {
    error?: string;
    reports: ReportConfig[];
}

export type FetchReportsFn = () => Promise<FetchReportsResult>;

export interface ParticipantHistoryAPIWrapper {
    fetchReports: () => Promise<FetchReportsResult>;
    resolveAnimalIds: (params: ResolveIdsParams) => Promise<IdResolutionResult>;
}

export class ServerAPIWrapper implements ParticipantHistoryAPIWrapper {
    resolveAnimalIds = async (params: ResolveIdsParams): Promise<IdResolutionResult> => {
        const { inputIds } = params;

        // Filter out empty strings and trim whitespace
        const cleanedIds = inputIds.filter(id => id && id.trim().length > 0).map(id => id.trim());

        if (cleanedIds.length === 0) {
            return {
                resolved: [],
                notFound: [],
            };
        }

        // De-duplicate based on lowercase comparison, preserving original casing
        const seenLower = new Set<string>();
        const uniqueIds: string[] = [];
        cleanedIds.forEach(id => {
            const lower = id.toLowerCase();
            if (!seenLower.has(lower)) {
                seenLower.add(lower);
                uniqueIds.push(id);
            }
        });

        const resolved: IdResolutionResult['resolved'] = [];
        const notFound: string[] = [];

        try {
            // Step 1: Query study.directIdMatches for direct ID matches
            const directMatches = await this.queryDirectIds(uniqueIds);
            resolved.push(...directMatches);

            // Track which input IDs were found
            const foundInputIds = new Set(directMatches.map(r => r.inputId.toLowerCase()));
            const unresolvedIds = uniqueIds.filter(id => !foundInputIds.has(id.toLowerCase()));

            // Step 2: Query study.aliasIdMatches for unresolved IDs if any remain
            if (unresolvedIds.length > 0) {
                const aliasMatches = await this.queryAliasIds(unresolvedIds);
                resolved.push(...aliasMatches);

                // Track which unresolved IDs were found via alias
                const aliasFoundIds = new Set(aliasMatches.map(r => r.inputId.toLowerCase()));
                const stillNotFound = unresolvedIds.filter(id => !aliasFoundIds.has(id.toLowerCase()));
                notFound.push(...stillNotFound);
            }

            return {
                resolved,
                notFound,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Failed to resolve animal IDs', error);
            return {
                resolved: [],
                notFound: [],
                error: `Failed to resolve animal IDs: ${errorMessage}`,
            };
        }
    };

    fetchReports = (): Promise<FetchReportsResult> => {
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

    /**
     * Query study.directIdMatches for direct ID matches using case-insensitive comparison
     * Uses the pre-defined directIdMatches query with lowerIdForMatching filter column
     */
    private queryDirectIds = (inputIds: string[]): Promise<IdResolutionResult['resolved']> => {
        return new Promise((resolve, reject) => {
            // Convert input IDs to lowercase for filter
            const lowercaseIds = inputIds.map(id => id.toLowerCase());

            Query.selectRows({
                schemaName: 'study',
                queryName: 'directIdMatches',
                filterArray: [Filter.create('lowerIdForMatching', lowercaseIds, Filter.Types.IN)],
                success: data => {
                    if (!data.rows) {
                        reject(new Error('Malformed API response: missing rows'));
                        return;
                    }

                    // Map results back to original input casing
                    const results = data.rows.map(row => {
                        // Find the original input ID that matches this resolved ID (case-insensitive)
                        const inputId =
                            inputIds.find(id => id.toLowerCase() === String(row.resolvedId).toLowerCase()) ||
                            String(row.resolvedId);
                        return {
                            inputId,
                            resolvedId: String(row.resolvedId),
                            resolvedBy: 'direct' as const,
                            aliasType: null,
                        };
                    });

                    resolve(results);
                },
                failure: error => {
                    const errorMessage = error?.exception || 'Query failed';
                    reject(new Error(errorMessage));
                },
            });
        });
    };

    /**
     * Query study.aliasIdMatches for alias matches using case-insensitive comparison
     * Uses the pre-defined aliasIdMatches query with lowerAliasForMatching filter column
     */
    private queryAliasIds = (inputIds: string[]): Promise<IdResolutionResult['resolved']> => {
        return new Promise((resolve, reject) => {
            // Convert input IDs to lowercase for filter
            const lowercaseIds = inputIds.map(id => id.toLowerCase());

            Query.selectRows({
                schemaName: 'study',
                queryName: 'aliasIdMatches',
                filterArray: [Filter.create('lowerAliasForMatching', lowercaseIds, Filter.Types.IN)],
                success: data => {
                    if (!data.rows) {
                        reject(new Error('Malformed API response: missing rows'));
                        return;
                    }

                    // Map results back to original input casing
                    const results = data.rows.map(row => {
                        // Find the original input ID that matches this alias (case-insensitive)
                        const inputId =
                            inputIds.find(id => id.toLowerCase() === String(row.inputId).toLowerCase()) ||
                            String(row.inputId);
                        return {
                            inputId,
                            resolvedId: String(row.resolvedId),
                            resolvedBy: 'alias' as const,
                            aliasType: row.aliasType ? String(row.aliasType) : null,
                        };
                    });

                    resolve(results);
                },
                failure: error => {
                    const errorMessage = error?.exception || 'Query failed';
                    reject(new Error(errorMessage));
                },
            });
        });
    };
}

let DEFAULT_API_WRAPPER: ParticipantHistoryAPIWrapper;

export const getDefaultParticipantHistoryAPIWrapper = (): ParticipantHistoryAPIWrapper => {
    if (!DEFAULT_API_WRAPPER) DEFAULT_API_WRAPPER = new ServerAPIWrapper();
    return DEFAULT_API_WRAPPER;
};
