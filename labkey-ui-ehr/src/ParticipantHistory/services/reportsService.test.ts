import { Query, Filter } from '@labkey/api';

import { fetchReports } from './reportsService';

// Mock Filter.create function
const mockFilterCreate = jest.fn((field, value, type) => ({ field, value, type }));

// Mock the @labkey/api module
jest.mock('@labkey/api', () => ({
    ...jest.requireActual('@labkey/api'),
    Query: {
        ...jest.requireActual('@labkey/api').Query,
        selectRows: jest.fn(),
    },
    Filter: {
        create: (...args: any[]) => mockFilterCreate(...args),
        Types: { EQUAL: 'EQUAL' },
    },
}));

const mockSelectRows = Query.selectRows as jest.MockedFunction<typeof Query.selectRows>;

// Type for mock config parameter
interface MockConfig {
    failure: (error: any) => void;
    filterArray?: any[];
    queryName?: string;
    schemaName?: string;
    sort?: string;
    success: (data: any) => void;
}

describe('reportsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('fetchReports', () => {

        test('calls Query.selectRows with correct parameters', async () => {
            mockSelectRows.mockImplementation((config: MockConfig) => {
                config.success({ rows: [] });
                return {} as any;
            });

            await fetchReports();

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
            mockSelectRows.mockImplementation((config: MockConfig) => {
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
                return {} as any;
            });

            const result = await fetchReports();

            expect(result.reports).toHaveLength(1);
            expect(result.reports[0]).toMatchObject({
                id: 'test-report',
                title: 'Test Report',
                reportType: 'query',
                schemaName: 'ehr',
                queryName: 'testQuery',
                reportId: '123',
                supportsnonidfilters: true,
                category: 'General',
            });
            expect(result.error).toBeUndefined();
        });

        test('maps multiple reports correctly', async () => {
            mockSelectRows.mockImplementation((config: MockConfig) => {
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
                        {
                            reportname: 'report-3',
                            reporttitle: 'Report Three',
                            reporttype: 'report',
                            schemaname: 'ehr',
                            queryname: 'query3',
                            report: 'report-id-456',
                            category: 'Other',
                        },
                    ],
                });
                return {} as any;
            });

            const result = await fetchReports();

            expect(result.reports).toHaveLength(3);
            expect(result.reports[0].id).toBe('report-1');
            expect(result.reports[1].id).toBe('report-2');
            expect(result.reports[2].id).toBe('report-3');
        });

        test('parses jsonConfig when present', async () => {
            mockSelectRows.mockImplementation((config: MockConfig) => {
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
                return {} as any;
            });

            const result = await fetchReports();

            expect(result.reports[0].customField).toBe('customValue');
            expect(result.reports[0].anotherField).toBe(42);
        });

        test('handles invalid jsonConfig gracefully with console error', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            mockSelectRows.mockImplementation((config: MockConfig) => {
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
                return {} as any;
            });

            const result = await fetchReports();

            expect(result.reports).toHaveLength(1);
            expect(result.reports[0].id).toBe('bad-json-report');
            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to parse jsonConfig for report: bad-json-report',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });

        test('handles failure gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            mockSelectRows.mockImplementation((config: MockConfig) => {
                config.failure({ message: 'Network error' });
                return {} as any;
            });

            const result = await fetchReports();

            expect(result.reports).toEqual([]);
            expect(result.error).toBe('Network error');
            expect(consoleSpy).toHaveBeenCalledWith('Failed to load reports', { message: 'Network error' });

            consoleSpy.mockRestore();
        });

        test('handles failure with default error message when message is missing', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            mockSelectRows.mockImplementation((config: MockConfig) => {
                config.failure({});
                return {} as any;
            });

            const result = await fetchReports();

            expect(result.reports).toEqual([]);
            expect(result.error).toBe('Failed to load reports');

            consoleSpy.mockRestore();
        });

        test('handles empty result set', async () => {
            mockSelectRows.mockImplementation((config: MockConfig) => {
                config.success({ rows: [] });
                return {} as any;
            });

            const result = await fetchReports();

            expect(result.reports).toEqual([]);
            expect(result.error).toBeUndefined();
        });

        test('preserves all row fields via spread operator', async () => {
            mockSelectRows.mockImplementation((config: MockConfig) => {
                config.success({
                    rows: [
                        {
                            reportname: 'test-report',
                            reporttitle: 'Test Report',
                            reporttype: 'query',
                            schemaname: 'ehr',
                            queryname: 'testQuery',
                            customRowField: 'customValue',
                            anotherField: true,
                            numericField: 123,
                        },
                    ],
                });
                return {} as any;
            });

            const result = await fetchReports();

            expect(result.reports[0].customRowField).toBe('customValue');
            expect(result.reports[0].anotherField).toBe(true);
            expect(result.reports[0].numericField).toBe(123);
        });
    });
});
