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

    describe('resolveAnimalIds', () => {
        describe('direct ID matches', () => {
            test('resolves single direct ID match', async () => {
                const inputIds = ['ID123'];

                mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        expect(config.filterArray).toBeDefined();
                        config.success({
                            rows: [{ resolvedId: 'ID123' }],
                        });
                    }
                    return {} as XMLHttpRequest;
                });

                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                expect(result.resolved).toEqual([
                    {
                        inputId: 'ID123',
                        resolvedId: 'ID123',
                        resolvedBy: 'direct',
                        aliasType: null,
                    },
                ]);
                expect(result.notFound).toEqual([]);
                expect(result.error).toBeUndefined();
            });

            test('resolves multiple direct ID matches', async () => {
                const inputIds = ['ID123', 'ID456', 'ID789'];

                mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID123' }, { resolvedId: 'ID456' }, { resolvedId: 'ID789' }],
                        });
                    }
                    return {} as XMLHttpRequest;
                });

                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                expect(result.resolved).toEqual([
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID789', resolvedId: 'ID789', resolvedBy: 'direct', aliasType: null },
                ]);
                expect(result.notFound).toEqual([]);
                expect(result.error).toBeUndefined();
            });
        });

        describe('alias matches', () => {
            test('resolves single alias to animal ID', async () => {
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

                const result = await apiWrapper.resolveAnimalIds({ inputIds });

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
            });
        });

        describe('mixed valid/invalid IDs', () => {
            test('resolves mixed direct and alias IDs', async () => {
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

                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                expect(result.resolved).toEqual([
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'TATTOO_001', resolvedId: 'ID789', resolvedBy: 'alias', aliasType: 'tattoo' },
                ]);
                expect(result.notFound).toEqual([]);
                expect(result.error).toBeUndefined();
            });

            test('returns not-found IDs when some IDs cannot be resolved', async () => {
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

                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                expect(result.resolved).toEqual([
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                ]);
                expect(result.notFound).toEqual(['INVALID_ID']);
                expect(result.error).toBeUndefined();
            });
        });

        describe('case-insensitive matching', () => {
            test('resolves IDs regardless of input casing', async () => {
                const inputIds = ['id123', 'ID456', 'Id789'];

                mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID123' }, { resolvedId: 'ID456' }, { resolvedId: 'ID789' }],
                        });
                    }
                    return {} as XMLHttpRequest;
                });

                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                expect(result.resolved).toEqual([
                    { inputId: 'id123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'Id789', resolvedId: 'ID789', resolvedBy: 'direct', aliasType: null },
                ]);
                expect(result.notFound).toEqual([]);
                expect(result.error).toBeUndefined();
            });
        });

        describe('de-duplication', () => {
            test('de-duplicates input IDs before resolution', async () => {
                const inputIds = ['ID123', 'ID123', 'ID456'];

                mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID123' }, { resolvedId: 'ID456' }],
                        });
                    }
                    return {} as XMLHttpRequest;
                });

                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                expect(result.resolved).toEqual([
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                ]);
                expect(result.notFound).toEqual([]);
                expect(result.error).toBeUndefined();
            });
        });

        describe('empty input handling', () => {
            test('handles empty input array', async () => {
                const inputIds: string[] = [];

                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                expect(result.resolved).toEqual([]);
                expect(result.notFound).toEqual([]);
                expect(result.error).toBeUndefined();
                expect(mockSelectRows).not.toHaveBeenCalled();
            });

            test('filters out empty string IDs', async () => {
                const inputIds = ['ID123', '', 'ID456'];

                mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID123' }, { resolvedId: 'ID456' }],
                        });
                    }
                    return {} as XMLHttpRequest;
                });

                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                expect(result.resolved).toEqual([
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                ]);
                expect(result.notFound).toEqual([]);
                expect(result.error).toBeUndefined();
            });
        });

        describe('error handling', () => {
            test('handles API network errors', async () => {
                const inputIds = ['ID123'];

                mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                    config.failure!({
                        exception: 'Network error',
                        exceptionClass: 'NetworkException',
                    });
                    return {} as XMLHttpRequest;
                });

                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                expect(result.error).toBeDefined();
                expect(result.error).toContain('Network error');
                expect(result.resolved).toEqual([]);
                expect(result.notFound).toEqual([]);
            });

            test('handles malformed API response', async () => {
                const inputIds = ['ID123'];

                mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                    config.success({ rows: undefined });
                    return {} as XMLHttpRequest;
                });

                const result = await apiWrapper.resolveAnimalIds({ inputIds });

                expect(result.error).toBeDefined();
                expect(result.error).toContain('Malformed API response');
                expect(result.resolved).toEqual([]);
                expect(result.notFound).toEqual([]);
            });
        });
    });

    describe('fetchReports', () => {
        test('calls Query.selectRows with correct parameters', async () => {
            mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                config.success({ rows: [] });
                return {} as XMLHttpRequest;
            });

            await apiWrapper.fetchReports();

            expect(mockSelectRows).toHaveBeenCalledWith(
                expect.objectContaining({
                    schemaName: 'ehr',
                    queryName: 'reports',
                    sort: 'category,sort_order,reporttitle,reportstatus',
                })
            );
            expect(mockFilterCreate).toHaveBeenCalledWith('visible', true, Filter.Types.EQUAL);
        });

        test('fetches and maps reports correctly', async () => {
            mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                config.success({
                    rows: [
                        {
                            reportname: 'test-report',
                            reporttitle: 'Test Report',
                            reporttype: 'query',
                            schemaname: 'ehr',
                            queryname: 'testQuery',
                            viewname: null,
                            report: '123',
                            supportsnonidfilters: true,
                            category: 'General',
                        },
                    ],
                });
                return {} as XMLHttpRequest;
            });

            const result = await apiWrapper.fetchReports();

            expect(result.reports).toMatchObject([
                {
                    id: 'test-report',
                    title: 'Test Report',
                    reportType: 'query',
                    schemaName: 'ehr',
                    queryName: 'testQuery',
                    reportId: '123',
                    supportsnonidfilters: true,
                    category: 'General',
                },
            ]);
            expect(result.error).toBeUndefined();
        });

        test('maps multiple reports correctly', async () => {
            mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                config.success({
                    rows: [
                        {
                            reportname: 'report-1',
                            reporttitle: 'Report One',
                            reporttype: 'query',
                            schemaname: 'ehr',
                            queryname: 'query1',
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

            const result = await apiWrapper.fetchReports();

            expect(result.reports).toMatchObject([
                { id: 'report-1', title: 'Report One', reportType: 'query', category: 'General' },
                { id: 'report-2', title: 'Report Two', reportType: 'js', category: 'Custom' },
            ]);
            expect(result.error).toBeUndefined();
        });

        test('parses jsonConfig when present', async () => {
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

            const result = await apiWrapper.fetchReports();

            expect((result.reports[0] as any).customField).toBe('customValue');
            expect((result.reports[0] as any).anotherField).toBe(42);
        });

        test('handles invalid jsonConfig gracefully with console error', async () => {
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

            const result = await apiWrapper.fetchReports();

            expect(result.reports).toMatchObject([{ id: 'bad-json-report', title: 'Bad JSON Report' }]);
            expect(result.error).toBeUndefined();
            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to parse jsonConfig for report: bad-json-report',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });

        test('handles failure gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                config.failure!({ message: 'Network error' });
                return {} as XMLHttpRequest;
            });

            const result = await apiWrapper.fetchReports();

            expect(result.reports).toEqual([]);
            expect(result.error).toBe('Network error');
            expect(consoleSpy).toHaveBeenCalledWith('Failed to load reports', { message: 'Network error' });

            consoleSpy.mockRestore();
        });

        test('handles failure with default error message when message is missing', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                config.failure!({});
                return {} as XMLHttpRequest;
            });

            const result = await apiWrapper.fetchReports();

            expect(result.reports).toEqual([]);
            expect(result.error).toBe('Failed to load reports');

            consoleSpy.mockRestore();
        });

        test('handles empty result set', async () => {
            mockSelectRows.mockImplementation((config: MockSelectRowsConfig) => {
                config.success({ rows: [] });
                return {} as XMLHttpRequest;
            });

            const result = await apiWrapper.fetchReports();

            expect(result.reports).toEqual([]);
            expect(result.error).toBeUndefined();
        });
    });
});
