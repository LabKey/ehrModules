import { Filter, Query } from '@labkey/api';

import { ServerAPIWrapper } from './APIWrapper';

// Mock Filter.create function
const mockFilterCreate = jest.fn((field: string, value: boolean | string | string[], type: string) => ({
    field,
    value,
    type,
}));

// Mock @labkey/api Query.selectRows
jest.mock('@labkey/api', () => ({
    ...jest.requireActual('@labkey/api'),
    Query: {
        ...jest.requireActual('@labkey/api').Query,
        selectRows: jest.fn(),
    },
    Filter: {
        create: (field: string, value: boolean | string | string[], type: string) =>
            mockFilterCreate(field, value, type),
        Types: {
            EQUAL: 'EQUAL',
            IN: 'IN',
        },
    },
}));

const mockSelectRows = Query.selectRows as jest.MockedFunction<typeof Query.selectRows>;

// Mock-friendly version of SelectRowsOptions where callbacks take a single argument,
// matching how the production code invokes them in this codebase.
type MockSelectRowsConfig = Omit<Query.SelectRowsOptions, 'failure' | 'success'> & {
    failure?: (error: any) => void;
    success?: (data: any) => void;
};

describe('ServerAPIWrapper', () => {
    let apiWrapper: ServerAPIWrapper;

    beforeEach(() => {
        jest.clearAllMocks();
        apiWrapper = new ServerAPIWrapper();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('resolveAnimalIds', () => {
        describe('direct ID matches', () => {
            test('resolves direct ID matches', async () => {
                // Arrange
                const inputIds = ['ID123', 'ID456', 'ID789'];
                mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID123' }, { resolvedId: 'ID456' }, { resolvedId: 'ID789' }],
                        });
                    }
                    return {} as XMLHttpRequest;
                });

                // Act
                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                // Assert - all IDs resolve as direct matches with no errors, and selectRows receives a filterArray
                expect(result.resolved).toEqual([
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID789', resolvedId: 'ID789', resolvedBy: 'direct', aliasType: null },
                ]);
                expect(result.notFound).toEqual([]);
                expect(result.error).toBeUndefined();
                expect(mockSelectRows).toHaveBeenCalledWith(
                    expect.objectContaining({
                        schemaName: 'study',
                        queryName: 'directIdMatches',
                        filterArray: [{ field: 'lowerIdForMatching', value: ['id123', 'id456', 'id789'], type: 'IN' }],
                    })
                );
                expect(mockSelectRows).toHaveBeenCalledTimes(1);
            });
        });

        describe('alias matches', () => {
            test('resolves single alias to animal ID', async () => {
                // Arrange
                const inputIds = ['TATTOO_001'];
                let callCount = 0;
                mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                    callCount++;
                    if (callCount === 1 && config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({ rows: [] });
                    } else if (
                        callCount === 2 &&
                        config.schemaName === 'study' &&
                        config.queryName === 'aliasIdMatches'
                    ) {
                        config.success({
                            rows: [{ resolvedId: 'ID123', inputId: 'TATTOO_001', aliasType: 'tattoo' }],
                        });
                    }
                    return {} as XMLHttpRequest;
                });

                // Act
                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                // Assert - alias is resolved with correct type and original input ID preserved
                expect(result.resolved).toEqual([
                    {
                        inputId: 'TATTOO_001',
                        resolvedId: 'ID123',
                        resolvedBy: 'alias',
                        aliasType: 'tattoo',
                    },
                ]);
                expect(result.notFound).toEqual([]);
                expect(result.error).toBeUndefined();
                expect(mockSelectRows).toHaveBeenNthCalledWith(
                    1,
                    expect.objectContaining({
                        schemaName: 'study',
                        queryName: 'directIdMatches',
                        filterArray: [{ field: 'lowerIdForMatching', value: ['tattoo_001'], type: 'IN' }],
                    })
                );
                expect(mockSelectRows).toHaveBeenNthCalledWith(
                    2,
                    expect.objectContaining({
                        schemaName: 'study',
                        queryName: 'aliasIdMatches',
                        filterArray: [{ field: 'lowerAliasForMatching', value: ['tattoo_001'], type: 'IN' }],
                    })
                );
                expect(mockSelectRows).toHaveBeenCalledTimes(2);
            });
        });

        describe('mixed valid/invalid IDs', () => {
            test('resolves mixed direct and alias IDs', async () => {
                // Arrange
                const inputIds = ['ID123', 'TATTOO_001', 'ID456'];
                let callCount = 0;
                mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                    callCount++;
                    if (callCount === 1 && config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID123' }, { resolvedId: 'ID456' }],
                        });
                    } else if (
                        callCount === 2 &&
                        config.schemaName === 'study' &&
                        config.queryName === 'aliasIdMatches'
                    ) {
                        config.success({
                            rows: [{ resolvedId: 'ID789', inputId: 'TATTOO_001', aliasType: 'tattoo' }],
                        });
                    }
                    return {} as XMLHttpRequest;
                });

                // Act
                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                // Assert - direct IDs resolve first, then unresolved alias falls back to alias lookup
                expect(result.resolved).toEqual([
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'TATTOO_001', resolvedId: 'ID789', resolvedBy: 'alias', aliasType: 'tattoo' },
                ]);
                expect(result.notFound).toEqual([]);
                expect(result.error).toBeUndefined();
                expect(mockSelectRows).toHaveBeenNthCalledWith(
                    1,
                    expect.objectContaining({
                        schemaName: 'study',
                        queryName: 'directIdMatches',
                        filterArray: [
                            { field: 'lowerIdForMatching', value: ['id123', 'tattoo_001', 'id456'], type: 'IN' },
                        ],
                    })
                );
                expect(mockSelectRows).toHaveBeenNthCalledWith(
                    2,
                    expect.objectContaining({
                        schemaName: 'study',
                        queryName: 'aliasIdMatches',
                        filterArray: [{ field: 'lowerAliasForMatching', value: ['tattoo_001'], type: 'IN' }],
                    })
                );
                expect(mockSelectRows).toHaveBeenCalledTimes(2);
            });

            test('returns not-found IDs when some IDs cannot be resolved', async () => {
                // Arrange
                const inputIds = ['ID123', 'INVALID_ID', 'ID456'];
                mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID123' }, { resolvedId: 'ID456' }],
                        });
                    } else if (config.schemaName === 'study' && config.queryName === 'aliasIdMatches') {
                        config.success({ rows: [] });
                    }
                    return {} as XMLHttpRequest;
                });

                // Act
                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                // Assert - valid IDs resolve and unmatched ID appears in notFound
                expect(result.resolved).toEqual([
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                ]);
                expect(result.notFound).toEqual(['INVALID_ID']);
                expect(result.error).toBeUndefined();
                expect(mockSelectRows).toHaveBeenNthCalledWith(
                    1,
                    expect.objectContaining({
                        schemaName: 'study',
                        queryName: 'directIdMatches',
                        filterArray: [
                            { field: 'lowerIdForMatching', value: ['id123', 'invalid_id', 'id456'], type: 'IN' },
                        ],
                    })
                );
                expect(mockSelectRows).toHaveBeenNthCalledWith(
                    2,
                    expect.objectContaining({
                        schemaName: 'study',
                        queryName: 'aliasIdMatches',
                        filterArray: [{ field: 'lowerAliasForMatching', value: ['invalid_id'], type: 'IN' }],
                    })
                );
                expect(mockSelectRows).toHaveBeenCalledTimes(2);
            });
        });

        describe('case-insensitive matching', () => {
            test('resolves IDs regardless of input casing', async () => {
                // Arrange
                const inputIds = ['id123', 'ID456', 'Id789'];
                mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID123' }, { resolvedId: 'ID456' }, { resolvedId: 'ID789' }],
                        });
                    }
                    return {} as XMLHttpRequest;
                });

                // Act
                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                // Assert - original input casing is preserved while resolvedId uses canonical casing
                expect(result.resolved).toEqual([
                    { inputId: 'id123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'Id789', resolvedId: 'ID789', resolvedBy: 'direct', aliasType: null },
                ]);
                expect(result.notFound).toEqual([]);
                expect(result.error).toBeUndefined();
                expect(mockSelectRows).toHaveBeenCalledWith(
                    expect.objectContaining({
                        schemaName: 'study',
                        queryName: 'directIdMatches',
                        filterArray: [{ field: 'lowerIdForMatching', value: ['id123', 'id456', 'id789'], type: 'IN' }],
                    })
                );
            });
        });

        describe('de-duplication', () => {
            test('de-duplicates input IDs before resolution', async () => {
                // Arrange
                const inputIds = ['ID123', 'ID123', 'ID456'];
                mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID123' }, { resolvedId: 'ID456' }],
                        });
                    }
                    return {} as XMLHttpRequest;
                });

                // Act
                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                // Assert - duplicate ID123 appears only once in resolved results
                expect(result.resolved).toEqual([
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                ]);
                expect(result.notFound).toEqual([]);
                expect(result.error).toBeUndefined();
                expect(mockSelectRows).toHaveBeenCalledWith(
                    expect.objectContaining({
                        schemaName: 'study',
                        queryName: 'directIdMatches',
                        filterArray: [{ field: 'lowerIdForMatching', value: ['id123', 'id456'], type: 'IN' }],
                    })
                );
                expect(mockSelectRows).toHaveBeenCalledTimes(1);
            });
        });

        describe('empty input handling', () => {
            test('handles empty input array', async () => {
                // Arrange
                const inputIds: string[] = [];

                // Act
                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                // Assert - returns empty results without making any API calls
                expect(result.resolved).toEqual([]);
                expect(result.notFound).toEqual([]);
                expect(result.error).toBeUndefined();
                expect(mockSelectRows).not.toHaveBeenCalled();
            });

            test('filters out empty string IDs', async () => {
                // Arrange
                const inputIds = ['ID123', '', 'ID456'];
                mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID123' }, { resolvedId: 'ID456' }],
                        });
                    }
                    return {} as XMLHttpRequest;
                });

                // Act
                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                // Assert - empty string is silently dropped and valid IDs resolve normally
                expect(result.resolved).toEqual([
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                ]);
                expect(result.notFound).toEqual([]);
                expect(result.error).toBeUndefined();
                expect(mockSelectRows).toHaveBeenCalledWith(
                    expect.objectContaining({
                        schemaName: 'study',
                        queryName: 'directIdMatches',
                        filterArray: [{ field: 'lowerIdForMatching', value: ['id123', 'id456'], type: 'IN' }],
                    })
                );
                expect(mockSelectRows).toHaveBeenCalledTimes(1);
            });
        });

        describe('error handling', () => {
            test('handles API network errors', async () => {
                // Arrange
                const inputIds = ['ID123'];
                mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                    config.failure!({
                        exception: 'Network error',
                        exceptionClass: 'NetworkException',
                    });
                    return {} as XMLHttpRequest;
                });

                // Act
                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                // Assert - error message is propagated and resolved/notFound are empty
                expect(result.error).toBeDefined();
                expect(result.error).toContain('Network error');
                expect(result.resolved).toEqual([]);
                expect(result.notFound).toEqual([]);
                expect(mockSelectRows).toHaveBeenCalledWith(
                    expect.objectContaining({
                        schemaName: 'study',
                        queryName: 'directIdMatches',
                        filterArray: [{ field: 'lowerIdForMatching', value: ['id123'], type: 'IN' }],
                    })
                );
                expect(mockSelectRows).toHaveBeenCalledTimes(1);
            });

            test('handles malformed API response', async () => {
                // Arrange
                const inputIds = ['ID123'];
                mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                    config.success({ rows: undefined });
                    return {} as XMLHttpRequest;
                });

                // Act
                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                // Assert - malformed response is caught and reported as an error
                expect(result.error).toBeDefined();
                expect(result.error).toContain('Malformed API response');
                expect(result.resolved).toEqual([]);
                expect(result.notFound).toEqual([]);
                expect(mockSelectRows).toHaveBeenCalledWith(
                    expect.objectContaining({
                        schemaName: 'study',
                        queryName: 'directIdMatches',
                        filterArray: [{ field: 'lowerIdForMatching', value: ['id123'], type: 'IN' }],
                    })
                );
                expect(mockSelectRows).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('fetchReports', () => {
        test('calls Query.selectRows with correct parameters and handles empty result set', async () => {
            // Arrange
            mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                config.success({ rows: [] });
                return {} as XMLHttpRequest;
            });

            // Act
            const result = await apiWrapper.fetchReports();

            // Assert - query options are correct and empty rows return empty reports with no error
            expect(mockSelectRows).toHaveBeenCalledWith(
                expect.objectContaining({
                    schemaName: 'ehr',
                    queryName: 'reports',
                    sort: 'category,sort_order,reporttitle,reportstatus',
                })
            );
            expect(mockFilterCreate).toHaveBeenCalledWith('visible', true, Filter.Types.EQUAL);
            expect(result.reports).toEqual([]);
            expect(result.error).toBeUndefined();
        });

        test('fetches and maps reports correctly', async () => {
            // Arrange
            mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                config.success({
                    rows: [
                        {
                            reportname: 'report-1',
                            reporttitle: 'Report One',
                            reporttype: 'query',
                            schemaname: 'ehr',
                            queryname: 'query1',
                            viewname: null,
                            report: '123',
                            supportsnonidfilters: true,
                            category: 'General',
                        },
                        {
                            reportname: 'report-2',
                            reporttitle: 'Report Two',
                            reporttype: 'js',
                            schemaname: null,
                            queryname: 'jsFunction',
                            category: 'Custom',
                        },
                    ],
                });
                return {} as XMLHttpRequest;
            });

            // Act
            const result = await apiWrapper.fetchReports();

            // Assert - row fields are mapped to ReportConfig properties for both report types
            expect(result.reports).toHaveLength(2);
            expect(result.reports[0]).toEqual(
                expect.objectContaining({
                    id: 'report-1',
                    title: 'Report One',
                    reportType: 'query',
                    schemaName: 'ehr',
                    queryName: 'query1',
                    reportId: '123',
                    supportsnonidfilters: true,
                    category: 'General',
                })
            );
            expect(result.reports[1]).toEqual(
                expect.objectContaining({
                    id: 'report-2',
                    title: 'Report Two',
                    reportType: 'js',
                    category: 'Custom',
                })
            );
            expect(result.error).toBeUndefined();
        });

        test('parses jsonConfig when present', async () => {
            // Arrange
            mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                config.success({
                    rows: [
                        {
                            reportname: 'json-report',
                            reporttitle: 'JSON Report',
                            reporttype: 'query',
                            schemaname: 'ehr',
                            queryname: 'testQuery',
                            jsonConfig: JSON.stringify({ customField: 'customValue', anotherField: 42 }),
                        },
                    ],
                });
                return {} as XMLHttpRequest;
            });

            // Act
            const result = await apiWrapper.fetchReports();

            // Assert - jsonConfig fields are merged into the report object
            expect((result.reports[0] as any).customField).toBe('customValue');
            expect((result.reports[0] as any).anotherField).toBe(42);
        });

        test('handles invalid jsonConfig gracefully with console error', async () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                config.success({
                    rows: [
                        {
                            reportname: 'bad-json-report',
                            reporttitle: 'Bad JSON Report',
                            reporttype: 'query',
                            schemaname: 'ehr',
                            queryname: 'testQuery',
                            jsonConfig: 'not valid json {{{',
                        },
                    ],
                });
                return {} as XMLHttpRequest;
            });

            // Act
            const result = await apiWrapper.fetchReports();

            // Assert - report is still returned and parse error is logged
            expect(result.reports).toMatchObject([{ id: 'bad-json-report', title: 'Bad JSON Report' }]);
            expect(result.error).toBeUndefined();
            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to parse jsonConfig for report: bad-json-report',
                expect.any(Error)
            );
        });

        test('handles failure gracefully', async () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                config.failure!({ message: 'Network error' });
                return {} as XMLHttpRequest;
            });

            // Act
            const result = await apiWrapper.fetchReports();

            // Assert - error message is extracted and reports array is empty
            expect(result.reports).toEqual([]);
            expect(result.error).toBe('Network error');
            expect(consoleSpy).toHaveBeenCalledWith('Failed to load reports', { message: 'Network error' });
        });

        test('handles failure with default error message when message is missing', async () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                config.failure!({});
                return {} as XMLHttpRequest;
            });

            // Act
            const result = await apiWrapper.fetchReports();

            // Assert - fallback error message is used when error object has no message property
            expect(result.reports).toEqual([]);
            expect(result.error).toBe('Failed to load reports');
            expect(consoleSpy).toHaveBeenCalledWith('Failed to load reports', {});
        });
    });
});
