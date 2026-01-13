import { Filter, Query } from '@labkey/api';

import { IdResolutionResult, ResolveIdsParams } from '../models';

/**
 * Service for resolving animal IDs and aliases
 *
 * This service handles:
 * - Direct ID lookups via study.directIdMatches query
 * - Alias resolution via study.aliasIdMatches query
 * - Case-insensitive matching using lowercase filter columns
 * - De-duplication of results
 */

/**
 * Resolves animal IDs by querying study.directIdMatches and study.aliasIdMatches
 *
 * Process:
 * 1. Query study.directIdMatches for direct ID matches (case-insensitive)
 * 2. Query study.aliasIdMatches for unresolved IDs (case-insensitive)
 * 3. Return consolidated results with resolution source
 *
 * @param params - Object containing array of input IDs to resolve
 * @returns Promise resolving to IdResolutionResult with resolved and not-found IDs
 */
export async function resolveAnimalIds(params: ResolveIdsParams): Promise<IdResolutionResult> {
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
        const directMatches = await queryDirectIds(uniqueIds);
        resolved.push(...directMatches);

        // Track which input IDs were found
        const foundInputIds = new Set(directMatches.map(r => r.inputId.toLowerCase()));
        const unresolvedIds = uniqueIds.filter(id => !foundInputIds.has(id.toLowerCase()));

        // Step 2: Query study.aliasIdMatches for unresolved IDs if any remain
        if (unresolvedIds.length > 0) {
            const aliasMatches = await queryAliasIds(unresolvedIds);
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
        // Re-throw error with context
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to resolve animal IDs: ${errorMessage}`);
    }
}

/**
 * Query study.directIdMatches for direct ID matches using case-insensitive comparison
 * Uses the pre-defined directIdMatches query with lowerIdForMatching filter column
 */
function queryDirectIds(inputIds: string[]): Promise<IdResolutionResult['resolved']> {
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
}

/**
 * Query study.aliasIdMatches for alias matches using case-insensitive comparison
 * Uses the pre-defined aliasIdMatches query with lowerAliasForMatching filter column
 */
function queryAliasIds(inputIds: string[]): Promise<IdResolutionResult['resolved']> {
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
}
