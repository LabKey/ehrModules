import { FILTER_TYPE_ALIVE_AT_CENTER, FILTER_TYPE_ALL, FILTER_TYPE_ID_SEARCH, FILTER_TYPE_URL_PARAMS } from '../models';
import { getFiltersFromUrl, updateUrlHash } from './urlHashUtils';

const getRawHashParams = (): Record<string, string> => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;

    if (!hash) return {};

    return hash.split('&').reduce<Record<string, string>>((acc, param) => {
        const colonIndex = param.indexOf(':');
        if (colonIndex === -1) return acc;

        const key = param.substring(0, colonIndex);
        const value = param.substring(colonIndex + 1);
        acc[key] = value;
        return acc;
    }, {});
};

describe('urlHashUtils', () => {
    let originalHash: string;

    beforeEach(() => {
        originalHash = window.location.hash;
        window.location.hash = '';
    });

    afterEach(() => {
        window.location.hash = originalHash;
    });

    describe('updateUrlHash', () => {
        describe('ID Search mode', () => {
            test('creates hash with filterType:idSearch and subjects', () => {
                // Act
                updateUrlHash(FILTER_TYPE_ID_SEARCH, ['ID123', 'ID456']);

                // Assert - hash contains only idSearch parameters with expected serialized values
                expect(getRawHashParams()).toEqual({
                    filterType: 'idSearch',
                    subjects: 'ID123;ID456',
                });
            });

            test('handles single subject', () => {
                // Act
                updateUrlHash(FILTER_TYPE_ID_SEARCH, ['ID123']);

                // Assert - hash contains only a single idSearch subject
                expect(getRawHashParams()).toEqual({
                    filterType: 'idSearch',
                    subjects: 'ID123',
                });
            });

            test('URL-encodes special characters in subject IDs', () => {
                // Arrange
                const subjectsWithSpaces = ['ID 123', 'ID&456'];

                // Act
                updateUrlHash(FILTER_TYPE_ID_SEARCH, subjectsWithSpaces);

                // Assert - spaces and ampersands are percent-encoded
                expect(getRawHashParams()).toEqual({
                    filterType: 'idSearch',
                    subjects: 'ID%20123;ID%26456',
                });
            });
        });

        describe('All Records mode', () => {
            test('creates hash with filterType:all', () => {
                // Act
                updateUrlHash(FILTER_TYPE_ALL, undefined);

                // Assert - hash contains only filterType for all mode
                expect(getRawHashParams()).toEqual({
                    filterType: 'all',
                });
            });
        });

        describe('Alive at Center mode', () => {
            test('creates hash with filterType:aliveAtCenter', () => {
                // Act
                updateUrlHash(FILTER_TYPE_ALIVE_AT_CENTER, undefined);

                // Assert - hash contains only filterType for aliveAtCenter mode
                expect(getRawHashParams()).toEqual({
                    filterType: 'aliveAtCenter',
                });
            });
        });

        test.each([
            {
                filterType: FILTER_TYPE_ID_SEARCH,
                subjects: ['ID123'] as string[] | undefined,
                label: 'ID Search',
            },
            {
                filterType: FILTER_TYPE_ALL,
                subjects: undefined as string[] | undefined,
                label: 'All Records',
            },
            {
                filterType: FILTER_TYPE_ALIVE_AT_CENTER,
                subjects: undefined as string[] | undefined,
                label: 'Alive at Center',
            },
        ])('does not include readOnly parameter for $label mode', ({ filterType, subjects }) => {
            // Act
            updateUrlHash(filterType, subjects);

            // Assert - readOnly is exclusive to URL Params mode
            const params = getRawHashParams();
            expect(params.readOnly).toBeUndefined();
        });

        test.each([
            { filterType: FILTER_TYPE_ALL, label: 'All Records' },
            { filterType: FILTER_TYPE_ALIVE_AT_CENTER, label: 'Alive at Center' },
        ])('does not include subjects parameter for $label mode', ({ filterType }) => {
            // Act
            updateUrlHash(filterType, undefined);

            // Assert - all/alive modes include only filterType
            expect(getRawHashParams()).toEqual({
                filterType,
            });
        });

        describe('URL Params mode', () => {
            test('creates hash with subjects and readOnly:true', () => {
                // Act
                updateUrlHash(FILTER_TYPE_URL_PARAMS, ['ID123', 'ID456'], true);

                // Assert - hash contains urlParams keys only, without filterType
                expect(getRawHashParams()).toEqual({
                    subjects: 'ID123;ID456',
                    readOnly: 'true',
                });
            });

            test('handles many subjects without truncation', () => {
                // Arrange
                const subjects = Array.from({ length: 100 }, (_, i) => `ID${i}`);

                // Act
                updateUrlHash(FILTER_TYPE_URL_PARAMS, subjects, true);

                // Assert - all 100 subjects are preserved with readOnly in urlParams mode
                const params = getRawHashParams();
                const parsedSubjects = params.subjects.split(';');
                expect(params.readOnly).toBe('true');
                expect(parsedSubjects).toHaveLength(100);
                expect(parsedSubjects[0]).toBe('ID0');
                expect(parsedSubjects[99]).toBe('ID99');
            });
        });

        describe('activeReport parameter', () => {
            test('sets activeReport parameter when provided', () => {
                // Act
                updateUrlHash(FILTER_TYPE_ID_SEARCH, ['ID123'], false, true, 'my-report');

                // Assert - activeReport is included alongside managed idSearch keys
                expect(getRawHashParams()).toEqual({
                    filterType: 'idSearch',
                    subjects: 'ID123',
                    showReport: '1',
                    activeReport: 'my-report',
                });
            });

            test('overrides existing activeReport with new value', () => {
                // Arrange
                window.location.hash = '#activeReport:old-report&filterType:idSearch';

                // Act
                updateUrlHash(FILTER_TYPE_ALL, undefined, false, true, 'new-report');

                // Assert - old report is replaced and all-mode params are present
                expect(getRawHashParams()).toEqual({
                    filterType: 'all',
                    showReport: '1',
                    activeReport: 'new-report',
                });
            });

            test('omits activeReport when not provided', () => {
                // Act
                updateUrlHash(FILTER_TYPE_ALL, undefined);

                // Assert - activeReport is omitted while all-mode filterType is set
                const params = getRawHashParams();
                expect(params.activeReport).toBeUndefined();
                expect(params.filterType).toBe('all');
            });

            test('clears activeReport from URL when not provided', () => {
                // Arrange
                window.location.hash = '#activeReport:old-report&filterType:idSearch';

                // Act
                updateUrlHash(FILTER_TYPE_ALL, undefined, false, true);

                // Assert - previous activeReport is removed while current keys remain valid
                expect(getRawHashParams()).toEqual({
                    filterType: 'all',
                    showReport: '1',
                });
            });
        });

        describe('preserving other parameters', () => {
            test('preserves showReport parameter when updating', () => {
                // Arrange
                window.location.hash = '#showReport:1';

                // Act
                updateUrlHash(FILTER_TYPE_ID_SEARCH, ['ID123'], false, false, 'test-report');

                // Assert - existing showReport is preserved with updated idSearch params
                expect(getRawHashParams()).toEqual({
                    showReport: '1',
                    subjects: 'ID123',
                    filterType: 'idSearch',
                    activeReport: 'test-report',
                });
            });

            test('preserves custom parameters', () => {
                // Arrange
                window.location.hash = '#customParam:value1&anotherParam:value2';

                // Act
                updateUrlHash(FILTER_TYPE_ALL, undefined);

                // Assert - unmanaged parameters survive while managed keys are refreshed
                expect(getRawHashParams()).toEqual({
                    customParam: 'value1',
                    anotherParam: 'value2',
                    filterType: 'all',
                });
            });

            test('removes readOnly parameter when switching from URL Params to ID Search', () => {
                // Arrange
                window.location.hash = '#subjects:ID123&readOnly:true';

                // Act
                updateUrlHash(FILTER_TYPE_ID_SEARCH, ['ID123'], false);

                // Assert - readOnly is stripped when leaving URL Params mode
                expect(getRawHashParams()).toEqual({
                    subjects: 'ID123',
                    filterType: 'idSearch',
                });
            });
        });

        describe('history management', () => {
            test('does not create duplicate history entries', () => {
                // Arrange
                const initialHistoryLength = window.history.length;

                // Act
                updateUrlHash(FILTER_TYPE_ID_SEARCH, ['ID123']);
                updateUrlHash(FILTER_TYPE_ALL, undefined);
                updateUrlHash(FILTER_TYPE_ALIVE_AT_CENTER, undefined);

                // Assert - replaceState is used, not pushState
                expect(window.history.length).toBeLessThanOrEqual(initialHistoryLength + 1);
            });
        });

        describe('edge cases', () => {
            test('replaces previous hash with all-mode params', () => {
                // Arrange
                window.location.hash = '#filterType:idSearch&subjects:ID123';

                // Act
                updateUrlHash(FILTER_TYPE_ALL, undefined);

                // Assert - stale idSearch subjects are removed and all-mode params remain
                expect(getRawHashParams()).toEqual({
                    filterType: 'all',
                });
            });

            test('handles empty subjects array correctly', () => {
                // Act
                updateUrlHash(FILTER_TYPE_ID_SEARCH, []);

                // Assert - empty array omits subjects while preserving idSearch filterType
                expect(getRawHashParams()).toEqual({
                    filterType: 'idSearch',
                });
            });
        });
    });

    describe('getFiltersFromUrl', () => {
        describe('ID Search mode', () => {
            test('parses filterType:idSearch from hash', () => {
                // Arrange
                window.location.hash = '#filterType:idSearch';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - filterType maps to the ID Search constant
                expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
            });

            test('parses subjects from hash', () => {
                // Arrange
                window.location.hash = '#filterType:idSearch&subjects:ID123;ID456;ID789';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - semicolon-separated subjects become an array
                expect(filters.subjects).toEqual(['ID123', 'ID456', 'ID789']);
            });

            test('parses single subject from hash', () => {
                // Arrange
                window.location.hash = '#filterType:idSearch&subjects:ID123';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - single subject becomes a one-element array
                expect(filters.subjects).toEqual(['ID123']);
            });

            test('handles URL-encoded subjects', () => {
                // Arrange
                window.location.hash = '#filterType:idSearch&subjects:ID%20123%3BID%20456';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - percent-encoded values are decoded back
                expect(filters.subjects).toEqual(['ID 123', 'ID 456']);
            });
        });

        describe('All Records mode', () => {
            test('parses filterType:all from hash with no subjects', () => {
                // Arrange
                window.location.hash = '#filterType:all';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - filterType maps to All Records and subjects remain unset
                expect(filters.filterType).toBe(FILTER_TYPE_ALL);
                expect(filters.subjects).toBeUndefined();
            });
        });

        describe('Alive at Center mode', () => {
            test('parses filterType:aliveAtCenter from hash with no subjects', () => {
                // Arrange
                window.location.hash = '#filterType:aliveAtCenter';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - filterType maps to Alive at Center and subjects remain unset
                expect(filters.filterType).toBe(FILTER_TYPE_ALIVE_AT_CENTER);
                expect(filters.subjects).toBeUndefined();
            });
        });

        describe('URL Params mode', () => {
            test('activates URL Params mode when readOnly:true with subjects', () => {
                // Arrange
                window.location.hash = '#subjects:ID123;ID456&readOnly:true';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - readOnly + subjects triggers URL Params mode
                expect(filters.filterType).toBe(FILTER_TYPE_URL_PARAMS);
                expect(filters.subjects).toEqual(['ID123', 'ID456']);
                expect(filters.readOnly).toBe(true);
            });

            test('ignores filterType when readOnly:true is present', () => {
                // Arrange
                window.location.hash = '#filterType:all&subjects:ID123&readOnly:true';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - readOnly takes priority over explicit filterType
                expect(filters.filterType).toBe(FILTER_TYPE_URL_PARAMS);
                expect(filters.subjects).toEqual(['ID123']);
            });

            test('returns default mode when readOnly:true but no subjects', () => {
                // Arrange
                window.location.hash = '#readOnly:true';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - readOnly without subjects falls back to default (idSearch)
                expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
            });

            test('parses many subjects from URL with 100 entries', () => {
                // Arrange
                const subjects = Array.from({ length: 100 }, (_, i) => `ID${i}`);
                window.location.hash = `#subjects:${subjects.join(';')}&readOnly:true`;

                // Act
                const filters = getFiltersFromUrl();

                // Assert - all 100 subjects are parsed in URL Params mode without truncation
                expect(filters.subjects).toHaveLength(100);
                expect(filters.filterType).toBe(FILTER_TYPE_URL_PARAMS);
            });
        });

        describe('default behavior', () => {
            test.each([
                { hash: '', label: 'empty hash' },
                { hash: '#', label: 'hash-only value' },
            ])('defaults to idSearch for $label', ({ hash }) => {
                // Arrange
                window.location.hash = hash;

                // Act
                const filters = getFiltersFromUrl();

                // Assert - empty or hash-only values default to ID Search mode
                expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
                expect(filters.subjects).toBeUndefined();
            });

            test('parses empty subjects as empty array', () => {
                // Arrange
                window.location.hash = '#subjects:';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - empty subjects value yields an empty array, not undefined
                expect(filters.subjects).toEqual([]);
            });
        });

        describe('other parameters', () => {
            test('parses activeReport from hash', () => {
                // Arrange
                window.location.hash = '#activeReport:test-report&filterType:idSearch';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - activeReport is extracted as a string
                expect(filters.activeReport).toBe('test-report');
            });

            test('parses showReport from hash', () => {
                // Arrange
                window.location.hash = '#showReport:1&filterType:all';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - showReport:1 maps to boolean true
                expect(filters.showReport).toBe(true);
            });

            test('parses showReport:0 as false', () => {
                // Arrange
                window.location.hash = '#showReport:0';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - showReport:0 maps to boolean false
                expect(filters.showReport).toBe(false);
            });

            test('parses custom parameters', () => {
                // Arrange
                window.location.hash = '#customParam:value1&anotherParam:value2';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - unrecognized keys are preserved as string values
                expect(filters.customParam).toBe('value1');
                expect(filters.anotherParam).toBe('value2');
            });
        });

        describe('malformed hash handling', () => {
            test('handles hash with missing values gracefully', () => {
                // Arrange
                window.location.hash = '#filterType:&subjects:';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - empty filterType is invalid, so falls back to default
                expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
                expect(filters.subjects).toEqual([]);
            });

            test('handles malformed parameter format', () => {
                // Arrange
                window.location.hash = '#malformed&invalid::data';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - colon-less segment is skipped; double-colon keeps the second colon in value
                expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
                expect(filters.subjects).toBeUndefined();
                expect(filters.invalid).toBe(':data');
            });

            test('handles parameters without colons', () => {
                // Arrange
                window.location.hash = '#paramWithoutColon';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - colon-less parameter is ignored, defaults apply
                expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
                expect(filters.subjects).toBeUndefined();
            });

            test('rejects invalid filterType values', () => {
                // Arrange
                window.location.hash = '#filterType:invalidType';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - unrecognized filterType falls back to default
                expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
            });

            test('handles malformed URL encoding gracefully', () => {
                // Arrange - incomplete percent-encoding sequence
                window.location.hash = '#activeReport:test%2';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - safeDecodeURIComponent returns the raw value on failure
                expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
                expect(filters.activeReport).toBe('test%2');
            });
        });

        describe('multiple parameters parsing', () => {
            test('parses all parameters in complex hash', () => {
                // Arrange
                window.location.hash = '#filterType:idSearch&subjects:ID123;ID456&activeReport:my-report&showReport:1';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - all four parameters are parsed correctly
                expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
                expect(filters.subjects).toEqual(['ID123', 'ID456']);
                expect(filters.activeReport).toBe('my-report');
                expect(filters.showReport).toBe(true);
            });
        });

        describe('special character handling', () => {
            test('decodes URL-encoded parameter values', () => {
                // Arrange
                window.location.hash = '#activeReport:report%20with%20spaces';

                // Act
                const filters = getFiltersFromUrl();

                // Assert - percent-encoded spaces are decoded
                expect(filters.activeReport).toBe('report with spaces');
            });
        });
    });

    describe('round-trip consistency', () => {
        test('updateUrlHash and getFiltersFromUrl work together for ID Search', () => {
            // Arrange
            const subjects = ['ID123', 'ID456', 'ID789'];

            // Act
            updateUrlHash(FILTER_TYPE_ID_SEARCH, subjects);
            const filters = getFiltersFromUrl();

            // Assert - round-trip preserves filterType and subjects
            expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
            expect(filters.subjects).toEqual(subjects);
        });

        test.each([
            { filterType: FILTER_TYPE_ALL, label: 'All Records' },
            { filterType: FILTER_TYPE_ALIVE_AT_CENTER, label: 'Alive at Center' },
        ])('updateUrlHash and getFiltersFromUrl work together for $label', ({ filterType }) => {
            // Act
            updateUrlHash(filterType, undefined);
            const filters = getFiltersFromUrl();

            // Assert - round-trip preserves filterType, no subjects
            expect(filters.filterType).toBe(filterType);
            expect(filters.subjects).toBeUndefined();
        });

        test('updateUrlHash and getFiltersFromUrl work together for URL Params', () => {
            // Arrange
            const subjects = ['ID123', 'ID456'];

            // Act
            updateUrlHash(FILTER_TYPE_URL_PARAMS, subjects, true);
            const filters = getFiltersFromUrl();

            // Assert - round-trip preserves filterType, subjects, and readOnly
            expect(filters.filterType).toBe(FILTER_TYPE_URL_PARAMS);
            expect(filters.subjects).toEqual(subjects);
            expect(filters.readOnly).toBe(true);
        });

        test('updateUrlHash and getFiltersFromUrl work together for activeReport', () => {
            // Act
            updateUrlHash(FILTER_TYPE_ID_SEARCH, ['ID123'], false, true, 'my-test-report');
            const filters = getFiltersFromUrl();

            // Assert - round-trip preserves all parameters including activeReport
            expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
            expect(filters.subjects).toEqual(['ID123']);
            expect(filters.activeReport).toBe('my-test-report');
            expect(filters.showReport).toBe(true);
        });
    });
});
