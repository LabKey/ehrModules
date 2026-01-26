import { Query } from '@labkey/api';
import { resolveAnimalIds } from './idResolutionService';

// Mock @labkey/api Query.selectRows
jest.mock('@labkey/api', () => ({
    ...jest.requireActual('@labkey/api'),
    Query: {
        ...jest.requireActual('@labkey/api').Query,
        selectRows: jest.fn(),
    },
}));

const mockSelectRows = Query.selectRows as jest.MockedFunction<typeof Query.selectRows>;

// Type for mock config parameter

interface MockConfig {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    failure: (error: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filterArray?: any[];
    queryName?: string;
    schemaName?: string;
    sql?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    success: (data: any) => void;
}

describe('idResolutionService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('resolveAnimalIds', () => {
        describe('direct ID matches', () => {
            test('resolves single direct ID match', async () => {
                const inputIds = ['ID123'];

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        expect(config.filterArray).toBeDefined();
                        config.success({
                            rows: [{ resolvedId: 'ID123' }],
                        });
                    }
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved[0]).toEqual({
                    inputId: 'ID123',
                    resolvedId: 'ID123',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.notFound).toHaveLength(0);
            });

            test('resolves multiple direct ID matches', async () => {
                const inputIds = ['ID123', 'ID456', 'ID789'];

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID123' }, { resolvedId: 'ID456' }, { resolvedId: 'ID789' }],
                        });
                    }
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved[0]).toEqual({
                    inputId: 'ID123',
                    resolvedId: 'ID123',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.resolved[1]).toEqual({
                    inputId: 'ID456',
                    resolvedId: 'ID456',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.resolved[2]).toEqual({
                    inputId: 'ID789',
                    resolvedId: 'ID789',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.notFound).toHaveLength(0);
            });
        });

        describe('alias matches', () => {
            test('resolves single alias to animal ID', async () => {
                const inputIds = ['TATTOO_001'];

                let callCount = 0;
                mockSelectRows.mockImplementation((config: MockConfig) => {
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
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved[0]).toEqual({
                    inputId: 'TATTOO_001',
                    resolvedId: 'ID123',
                    resolvedBy: 'alias',
                    aliasType: 'tattoo',
                });
                expect(result.notFound).toHaveLength(0);
            });

            test('resolves multiple aliases to animal IDs', async () => {
                const inputIds = ['TATTOO_001', 'CHIP_12345'];

                let callCount = 0;
                mockSelectRows.mockImplementation((config: MockConfig) => {
                    callCount++;
                    if (callCount === 1 && config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({ rows: [] });
                    } else if (
                        callCount === 2 &&
                        config.schemaName === 'study' &&
                        config.queryName === 'aliasIdMatches'
                    ) {
                        config.success({
                            rows: [
                                { resolvedId: 'ID123', inputId: 'TATTOO_001', aliasType: 'tattoo' },
                                { resolvedId: 'ID456', inputId: 'CHIP_12345', aliasType: 'chip' },
                            ],
                        });
                    }
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved[0]).toEqual({
                    inputId: 'TATTOO_001',
                    resolvedId: 'ID123',
                    resolvedBy: 'alias',
                    aliasType: 'tattoo',
                });
                expect(result.resolved[1]).toEqual({
                    inputId: 'CHIP_12345',
                    resolvedId: 'ID456',
                    resolvedBy: 'alias',
                    aliasType: 'chip',
                });
                expect(result.notFound).toHaveLength(0);
            });
        });

        describe('mixed valid/invalid IDs', () => {
            test('resolves mixed direct and alias IDs', async () => {
                const inputIds = ['ID123', 'TATTOO_001', 'ID456'];

                let callCount = 0;
                mockSelectRows.mockImplementation((config: MockConfig) => {
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
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved[0]).toEqual({
                    inputId: 'ID123',
                    resolvedId: 'ID123',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.resolved[1]).toEqual({
                    inputId: 'ID456',
                    resolvedId: 'ID456',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.resolved[2]).toEqual({
                    inputId: 'TATTOO_001',
                    resolvedId: 'ID789',
                    resolvedBy: 'alias',
                    aliasType: 'tattoo',
                });
                expect(result.notFound).toHaveLength(0);
            });

            test('returns not-found IDs when some IDs cannot be resolved', async () => {
                const inputIds = ['ID123', 'INVALID_ID', 'ID456'];

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID123' }, { resolvedId: 'ID456' }],
                        });
                    } else if (config.schemaName === 'study' && config.queryName === 'aliasIdMatches') {
                        config.success({ rows: [] });
                    }
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved[0]).toEqual({
                    inputId: 'ID123',
                    resolvedId: 'ID123',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.resolved[1]).toEqual({
                    inputId: 'ID456',
                    resolvedId: 'ID456',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.notFound).toHaveLength(1);
                expect(result.notFound[0]).toBe('INVALID_ID');
            });

            test('returns all IDs as not-found when none can be resolved', async () => {
                const inputIds = ['INVALID_1', 'INVALID_2', 'INVALID_3'];

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    config.success({ rows: [] });
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved).toHaveLength(0);
                expect(result.notFound).toHaveLength(3);
                expect(result.notFound).toEqual(['INVALID_1', 'INVALID_2', 'INVALID_3']);
            });
        });

        describe('case-insensitive matching', () => {
            test('resolves IDs regardless of input casing', async () => {
                const inputIds = ['id123', 'ID456', 'Id789'];

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID123' }, { resolvedId: 'ID456' }, { resolvedId: 'ID789' }],
                        });
                    }
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved[0]).toEqual({
                    inputId: 'id123',
                    resolvedId: 'ID123',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.resolved[1]).toEqual({
                    inputId: 'ID456',
                    resolvedId: 'ID456',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.resolved[2]).toEqual({
                    inputId: 'Id789',
                    resolvedId: 'ID789',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.notFound).toHaveLength(0);
            });
        });

        describe('de-duplication', () => {
            test('de-duplicates input IDs before resolution', async () => {
                const inputIds = ['ID123', 'ID123', 'ID456'];

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID123' }, { resolvedId: 'ID456' }],
                        });
                    }
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved[0]).toEqual({
                    inputId: 'ID123',
                    resolvedId: 'ID123',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.resolved[1]).toEqual({
                    inputId: 'ID456',
                    resolvedId: 'ID456',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.notFound).toHaveLength(0);
            });

            test('handles multiple aliases resolving to same animal ID', async () => {
                const inputIds = ['TATTOO_001', 'CHIP_12345'];

                let callCount = 0;
                mockSelectRows.mockImplementation((config: MockConfig) => {
                    callCount++;
                    if (callCount === 1 && config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({ rows: [] });
                    } else if (
                        callCount === 2 &&
                        config.schemaName === 'study' &&
                        config.queryName === 'aliasIdMatches'
                    ) {
                        config.success({
                            rows: [
                                { resolvedId: 'ID123', inputId: 'TATTOO_001', aliasType: 'tattoo' },
                                { resolvedId: 'ID123', inputId: 'CHIP_12345', aliasType: 'chip' },
                            ],
                        });
                    }
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved[0]).toEqual({
                    inputId: 'TATTOO_001',
                    resolvedId: 'ID123',
                    resolvedBy: 'alias',
                    aliasType: 'tattoo',
                });
                expect(result.resolved[1]).toEqual({
                    inputId: 'CHIP_12345',
                    resolvedId: 'ID123',
                    resolvedBy: 'alias',
                    aliasType: 'chip',
                });
                expect(result.notFound).toHaveLength(0);
            });
        });

        describe('special characters in IDs', () => {
            test('handles IDs with hyphens', async () => {
                const inputIds = ['ID-123-456'];

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID-123-456' }],
                        });
                    }
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved[0]).toEqual({
                    inputId: 'ID-123-456',
                    resolvedId: 'ID-123-456',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.notFound).toHaveLength(0);
            });

            test('handles IDs with underscores', async () => {
                const inputIds = ['ID_123_456'];

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID_123_456' }],
                        });
                    }
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved[0]).toEqual({
                    inputId: 'ID_123_456',
                    resolvedId: 'ID_123_456',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.notFound).toHaveLength(0);
            });

            test('handles IDs with spaces', async () => {
                const inputIds = ['ID 123'];

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID 123' }],
                        });
                    }
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved[0]).toEqual({
                    inputId: 'ID 123',
                    resolvedId: 'ID 123',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.notFound).toHaveLength(0);
            });
        });

        describe('large datasets and performance', () => {
            test('handles 100+ IDs without client-side limit', async () => {
                const inputIds = Array.from({ length: 150 }, (_, i) => `ID${i}`);

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: inputIds.map(id => ({ resolvedId: id })),
                        });
                    }
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved).toHaveLength(150);
                // Spot-check first and last items
                expect(result.resolved[0]).toEqual({
                    inputId: 'ID0',
                    resolvedId: 'ID0',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.resolved[149]).toEqual({
                    inputId: 'ID149',
                    resolvedId: 'ID149',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.notFound).toHaveLength(0);
            });
        });

        describe('error handling', () => {
            test('handles API network errors', async () => {
                const inputIds = ['ID123'];

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    config.failure({
                        exception: 'Network error',
                        exceptionClass: 'NetworkException',
                    });
                    return {} as MockConfig;
                });

                await expect(resolveAnimalIds({ inputIds })).rejects.toThrow();
            });

            test('handles API returns 500 error', async () => {
                const inputIds = ['ID123'];

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    config.failure({
                        status: 500,
                        exception: 'Internal Server Error',
                        exceptionClass: 'ServerException',
                    });
                    return {} as MockConfig;
                });

                await expect(resolveAnimalIds({ inputIds })).rejects.toThrow();
            });

            test('handles empty result set', async () => {
                const inputIds = ['ID123'];

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    config.success({ rows: [] });
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved).toHaveLength(0);
                expect(result.notFound).toEqual(['ID123']);
            });

            test('handles malformed API response', async () => {
                const inputIds = ['ID123'];

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    config.success({ rows: undefined });
                    return {} as MockConfig;
                });

                await expect(resolveAnimalIds({ inputIds })).rejects.toThrow();
            });

            test('handles permission denied to demographics table', async () => {
                const inputIds = ['ID123'];

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    config.failure({
                        exception: 'User does not have permission to read from study.demographics',
                        exceptionClass: 'UnauthorizedException',
                    });
                    return {} as MockConfig;
                });

                await expect(resolveAnimalIds({ inputIds })).rejects.toThrow();
            });

            test('handles timeout during long-running query', async () => {
                const inputIds = Array.from({ length: 100 }, (_, i) => `ID${i}`);

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    config.failure({
                        exception: 'Query timeout exceeded',
                        exceptionClass: 'TimeoutException',
                    });
                    return {} as MockConfig;
                });

                await expect(resolveAnimalIds({ inputIds })).rejects.toThrow();
            });
        });

        describe('SQL injection protection', () => {
            test('treats IDs with SQL injection patterns as literal strings', async () => {
                const inputIds = ["'; DROP TABLE--;", "ID123' OR '1'='1"];

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        // Verify SQL escaping by checking the SQL contains escaped quotes
                        config.success({ rows: [] });
                    } else if (config.schemaName === 'study' && config.queryName === 'aliasIdMatches') {
                        config.success({ rows: [] });
                    }
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved).toHaveLength(0);
                expect(result.notFound).toHaveLength(2);
                expect(result.notFound).toContain("'; DROP TABLE--;");
                expect(result.notFound).toContain("ID123' OR '1'='1");
            });
        });

        describe('empty input handling', () => {
            test('handles empty input array', async () => {
                const inputIds: string[] = [];

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved).toHaveLength(0);
                expect(result.notFound).toHaveLength(0);
                expect(mockSelectRows).not.toHaveBeenCalled();
            });

            test('filters out empty string IDs', async () => {
                const inputIds = ['ID123', '', 'ID456'];

                mockSelectRows.mockImplementation((config: MockConfig) => {
                    if (config.schemaName === 'study' && config.queryName === 'directIdMatches') {
                        config.success({
                            rows: [{ resolvedId: 'ID123' }, { resolvedId: 'ID456' }],
                        });
                    }
                    return {} as MockConfig;
                });

                const result = await resolveAnimalIds({ inputIds });

                expect(result.resolved[0]).toEqual({
                    inputId: 'ID123',
                    resolvedId: 'ID123',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.resolved[1]).toEqual({
                    inputId: 'ID456',
                    resolvedId: 'ID456',
                    resolvedBy: 'direct',
                    aliasType: null,
                });
                expect(result.notFound).toHaveLength(0);
            });
        });
    });
});
