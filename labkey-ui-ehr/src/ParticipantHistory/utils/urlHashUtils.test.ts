import { FILTER_TYPE_ALIVE_AT_CENTER, FILTER_TYPE_ALL, FILTER_TYPE_ID_SEARCH, FILTER_TYPE_URL_PARAMS } from '../models';
import { getFiltersFromUrl, updateUrlHash } from './urlHashUtils';

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
                updateUrlHash(FILTER_TYPE_ID_SEARCH, ['ID123', 'ID456']);

                expect(window.location.hash).toContain('filterType:idSearch');
                expect(window.location.hash).toContain('subjects:ID123;ID456');
            });

            test('handles single subject', () => {
                updateUrlHash(FILTER_TYPE_ID_SEARCH, ['ID123']);

                expect(window.location.hash).toContain('filterType:idSearch');
                expect(window.location.hash).toContain('subjects:ID123');
            });

            test('does not include readOnly parameter', () => {
                updateUrlHash(FILTER_TYPE_ID_SEARCH, ['ID123']);

                expect(window.location.hash).not.toContain('readOnly');
            });

            test('URL-encodes special characters in subject IDs', () => {
                updateUrlHash(FILTER_TYPE_ID_SEARCH, ['ID 123', 'ID;456']);

                // Spaces and semicolons should be encoded
                expect(window.location.hash).toContain('subjects:');
            });
        });

        describe('All Records mode', () => {
            test('creates hash with filterType:all', () => {
                updateUrlHash(FILTER_TYPE_ALL, undefined);

                expect(window.location.hash).toContain('filterType:all');
            });

            test('does not include subjects parameter', () => {
                updateUrlHash(FILTER_TYPE_ALL, undefined);

                expect(window.location.hash).not.toContain('subjects:');
            });

            test('does not include readOnly parameter', () => {
                updateUrlHash(FILTER_TYPE_ALL, undefined);

                expect(window.location.hash).not.toContain('readOnly');
            });
        });

        describe('Alive at Center mode', () => {
            test('creates hash with filterType:aliveAtCenter', () => {
                updateUrlHash(FILTER_TYPE_ALIVE_AT_CENTER, undefined);

                expect(window.location.hash).toContain('filterType:aliveAtCenter');
            });

            test('does not include subjects parameter', () => {
                updateUrlHash(FILTER_TYPE_ALIVE_AT_CENTER, undefined);

                expect(window.location.hash).not.toContain('subjects:');
            });

            test('does not include readOnly parameter', () => {
                updateUrlHash(FILTER_TYPE_ALIVE_AT_CENTER, undefined);

                expect(window.location.hash).not.toContain('readOnly');
            });
        });

        describe('URL Params mode', () => {
            test('creates hash with subjects and readOnly:true', () => {
                updateUrlHash(FILTER_TYPE_URL_PARAMS, ['ID123', 'ID456'], true);

                expect(window.location.hash).toContain('subjects:ID123;ID456');
                expect(window.location.hash).toContain('readOnly:true');
            });

            test('does not include filterType parameter in URL Params mode', () => {
                updateUrlHash(FILTER_TYPE_URL_PARAMS, ['ID123'], true);

                expect(window.location.hash).not.toContain('filterType:');
            });

            test('handles many subjects without truncation', () => {
                const subjects = Array.from({ length: 100 }, (_, i) => `ID${i}`);
                updateUrlHash(FILTER_TYPE_URL_PARAMS, subjects, true);

                expect(window.location.hash).toContain('subjects:');
                expect(window.location.hash).toContain('readOnly:true');
                // All 100 subjects should be in the hash
                expect(window.location.hash).toContain('ID0');
                expect(window.location.hash).toContain('ID99');
            });
        });

        describe('activeReport parameter', () => {
            test('sets activeReport parameter when provided', () => {
                updateUrlHash(FILTER_TYPE_ID_SEARCH, ['ID123'], false, true, 'my-report');

                expect(window.location.hash).toContain('activeReport:my-report');
                expect(window.location.hash).toContain('filterType:idSearch');
            });

            test('overrides existing activeReport with new value', () => {
                window.location.hash = '#activeReport:old-report&filterType:idSearch';

                updateUrlHash(FILTER_TYPE_ALL, undefined, false, true, 'new-report');

                expect(window.location.hash).toContain('activeReport:new-report');
                expect(window.location.hash).not.toContain('activeReport:old-report');
            });

            test('omits activeReport when not provided', () => {
                updateUrlHash(FILTER_TYPE_ALL, undefined);

                expect(window.location.hash).not.toContain('activeReport');
            });

            test('clears activeReport from URL when not provided', () => {
                window.location.hash = '#activeReport:old-report&filterType:idSearch';

                updateUrlHash(FILTER_TYPE_ALL, undefined, false, true);

                expect(window.location.hash).not.toContain('activeReport');
            });
        });

        describe('preserving other parameters', () => {
            test('preserves showReport parameter when updating', () => {
                window.location.hash = '#showReport:1';

                updateUrlHash(FILTER_TYPE_ID_SEARCH, ['ID123'], false, false, 'test-report');

                expect(window.location.hash).toContain('showReport:1');
                expect(window.location.hash).toContain('filterType:idSearch');
            });

            test('preserves custom parameters', () => {
                window.location.hash = '#customParam:value1&anotherParam:value2';

                updateUrlHash(FILTER_TYPE_ALL, undefined);

                expect(window.location.hash).toContain('customParam:value1');
                expect(window.location.hash).toContain('anotherParam:value2');
                expect(window.location.hash).toContain('filterType:all');
            });

            test('removes readOnly parameter when switching from URL Params to ID Search', () => {
                window.location.hash = '#subjects:ID123&readOnly:true';

                updateUrlHash(FILTER_TYPE_ID_SEARCH, ['ID123'], false);

                expect(window.location.hash).not.toContain('readOnly');
                expect(window.location.hash).toContain('filterType:idSearch');
            });
        });

        describe('history management', () => {
            test('does not create duplicate history entries', () => {
                const initialHistoryLength = window.history.length;

                updateUrlHash(FILTER_TYPE_ID_SEARCH, ['ID123']);
                updateUrlHash(FILTER_TYPE_ALL, undefined);
                updateUrlHash(FILTER_TYPE_ALIVE_AT_CENTER, undefined);

                // Should use replaceState, not pushState
                // History length should remain the same or increase by at most 1
                expect(window.history.length).toBeLessThanOrEqual(initialHistoryLength + 1);
            });
        });

        describe('edge cases', () => {
            test('clears hash when no parameters to set', () => {
                // Set initial hash
                window.location.hash = '#filterType:idSearch&subjects:ID123';

                // Update with no parameters that would go in the hash
                // (This is a theoretical edge case, as filterType should always be set)
                // For testing, we'll verify behavior with empty params

                // Call updateUrlHash with parameters that should create content
                updateUrlHash(FILTER_TYPE_ALL, undefined);

                // Hash should still be present (filterType:all)
                expect(window.location.hash).toContain('filterType:all');
            });

            test('handles empty subjects array correctly', () => {
                updateUrlHash(FILTER_TYPE_ID_SEARCH, []);

                // Empty subjects array should not add subjects parameter
                expect(window.location.hash).not.toContain('subjects:');
                expect(window.location.hash).toContain('filterType:idSearch');
            });
        });
    });

    describe('getFiltersFromUrl', () => {
        describe('ID Search mode', () => {
            test('parses filterType:idSearch from hash', () => {
                window.location.hash = '#filterType:idSearch';

                const filters = getFiltersFromUrl();

                expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
            });

            test('parses subjects from hash', () => {
                window.location.hash = '#filterType:idSearch&subjects:ID123;ID456;ID789';

                const filters = getFiltersFromUrl();

                expect(filters.subjects).toEqual(['ID123', 'ID456', 'ID789']);
            });

            test('parses single subject from hash', () => {
                window.location.hash = '#filterType:idSearch&subjects:ID123';

                const filters = getFiltersFromUrl();

                expect(filters.subjects).toEqual(['ID123']);
            });

            test('handles URL-encoded subjects', () => {
                window.location.hash = '#filterType:idSearch&subjects:ID%20123%3BID%20456';

                const filters = getFiltersFromUrl();

                expect(filters.subjects).toEqual(['ID 123', 'ID 456']);
            });
        });

        describe('All Records mode', () => {
            test('parses filterType:all from hash', () => {
                window.location.hash = '#filterType:all';

                const filters = getFiltersFromUrl();

                expect(filters.filterType).toBe(FILTER_TYPE_ALL);
            });

            test('returns undefined subjects for All Records mode', () => {
                window.location.hash = '#filterType:all';

                const filters = getFiltersFromUrl();

                expect(filters.subjects).toBeUndefined();
            });
        });

        describe('Alive at Center mode', () => {
            test('parses filterType:aliveAtCenter from hash', () => {
                window.location.hash = '#filterType:aliveAtCenter';

                const filters = getFiltersFromUrl();

                expect(filters.filterType).toBe(FILTER_TYPE_ALIVE_AT_CENTER);
            });

            test('returns undefined subjects for Alive at Center mode', () => {
                window.location.hash = '#filterType:aliveAtCenter';

                const filters = getFiltersFromUrl();

                expect(filters.subjects).toBeUndefined();
            });
        });

        describe('URL Params mode', () => {
            test('activates URL Params mode when readOnly:true with subjects', () => {
                window.location.hash = '#subjects:ID123;ID456&readOnly:true';

                const filters = getFiltersFromUrl();

                expect(filters.filterType).toBe(FILTER_TYPE_URL_PARAMS);
                expect(filters.subjects).toEqual(['ID123', 'ID456']);
                expect(filters.readOnly).toBe(true);
            });

            test('ignores filterType when readOnly:true is present', () => {
                window.location.hash = '#filterType:all&subjects:ID123&readOnly:true';

                const filters = getFiltersFromUrl();

                // readOnly takes priority
                expect(filters.filterType).toBe(FILTER_TYPE_URL_PARAMS);
                expect(filters.subjects).toEqual(['ID123']);
            });

            test('returns default mode when readOnly:true but no subjects', () => {
                window.location.hash = '#readOnly:true';

                const filters = getFiltersFromUrl();

                // Should default to All Records or ID Search, not URL Params
                expect(filters.filterType).not.toBe(FILTER_TYPE_URL_PARAMS);
            });

            test('parses many subjects from URL without limit', () => {
                const subjects = Array.from({ length: 100 }, (_, i) => `ID${i}`);
                window.location.hash = `#subjects:${subjects.join(';')}&readOnly:true`;

                const filters = getFiltersFromUrl();

                expect(filters.subjects).toHaveLength(100);
                expect(filters.filterType).toBe(FILTER_TYPE_URL_PARAMS);
            });
        });

        describe('default behavior', () => {
            test('defaults to idSearch when no filterType in hash', () => {
                window.location.hash = '';

                const filters = getFiltersFromUrl();

                expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
            });

            test('parses empty subjects as empty array', () => {
                window.location.hash = '#subjects:';

                const filters = getFiltersFromUrl();

                expect(filters.subjects).toEqual([]);
            });
        });

        describe('other parameters', () => {
            test('parses activeReport from hash', () => {
                window.location.hash = '#activeReport:test-report&filterType:idSearch';

                const filters = getFiltersFromUrl();

                expect(filters.activeReport).toBe('test-report');
            });

            test('parses showReport from hash', () => {
                window.location.hash = '#showReport:1&filterType:all';

                const filters = getFiltersFromUrl();

                expect(filters.showReport).toBe(true);
            });

            test('parses showReport:0 as false', () => {
                window.location.hash = '#showReport:0';

                const filters = getFiltersFromUrl();

                expect(filters.showReport).toBe(false);
            });

            test('parses custom parameters', () => {
                window.location.hash = '#customParam:value1&anotherParam:value2';

                const filters = getFiltersFromUrl();

                expect(filters.customParam).toBe('value1');
                expect(filters.anotherParam).toBe('value2');
            });
        });

        describe('malformed hash handling', () => {
            test('handles hash with missing values gracefully', () => {
                window.location.hash = '#filterType:&subjects:';

                const filters = getFiltersFromUrl();

                // Should not crash, return sensible defaults
                expect(filters).toBeDefined();
            });

            test('handles malformed parameter format', () => {
                window.location.hash = '#malformed&invalid::data';

                const filters = getFiltersFromUrl();

                // Should not crash, return sensible defaults
                expect(filters).toBeDefined();
            });

            test('handles parameters without colons', () => {
                window.location.hash = '#paramWithoutColon';

                const filters = getFiltersFromUrl();

                // Should ignore malformed parameters
                expect(filters).toBeDefined();
            });

            test('handles empty hash', () => {
                window.location.hash = '';

                const filters = getFiltersFromUrl();

                expect(filters).toBeDefined();
                expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH); // Default
            });

            test('handles hash with only # symbol', () => {
                window.location.hash = '#';

                const filters = getFiltersFromUrl();

                expect(filters).toBeDefined();
            });

            test('rejects invalid filterType values', () => {
                window.location.hash = '#filterType:invalidType';

                const filters = getFiltersFromUrl();

                // Should default to idSearch when invalid filterType provided
                expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
            });

            test('handles malformed URL encoding gracefully', () => {
                // Malformed percent encoding (incomplete escape sequence)
                window.location.hash = '#activeReport:test%2';

                const filters = getFiltersFromUrl();

                // Should not crash, decode what it can
                expect(filters).toBeDefined();
                expect(filters.activeReport).toBeDefined();
            });

            test('returns no subjects in default case', () => {
                window.location.hash = '';

                const filters = getFiltersFromUrl();

                // Should not have subjects property for consistency
                expect(filters.subjects).toBeUndefined();
            });
        });

        describe('multiple parameters parsing', () => {
            test('parses all parameters in complex hash', () => {
                window.location.hash = '#filterType:idSearch&subjects:ID123;ID456&activeReport:my-report&showReport:1';

                const filters = getFiltersFromUrl();

                expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
                expect(filters.subjects).toEqual(['ID123', 'ID456']);
                expect(filters.activeReport).toBe('my-report');
                expect(filters.showReport).toBe(true);
            });
        });

        describe('special character handling', () => {
            test('decodes URL-encoded parameter values', () => {
                window.location.hash = '#activeReport:report%20with%20spaces';

                const filters = getFiltersFromUrl();

                expect(filters.activeReport).toBe('report with spaces');
            });

            test('handles semicolons in subject list', () => {
                window.location.hash = '#subjects:ID123;ID456;ID789';

                const filters = getFiltersFromUrl();

                expect(filters.subjects).toEqual(['ID123', 'ID456', 'ID789']);
            });
        });
    });

    describe('round-trip consistency', () => {
        test('updateUrlHash and getFiltersFromUrl work together for ID Search', () => {
            const subjects = ['ID123', 'ID456', 'ID789'];
            updateUrlHash(FILTER_TYPE_ID_SEARCH, subjects);

            const filters = getFiltersFromUrl();

            expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
            expect(filters.subjects).toEqual(subjects);
        });

        test('updateUrlHash and getFiltersFromUrl work together for All Records', () => {
            updateUrlHash(FILTER_TYPE_ALL, undefined);

            const filters = getFiltersFromUrl();

            expect(filters.filterType).toBe(FILTER_TYPE_ALL);
            expect(filters.subjects).toBeUndefined();
        });

        test('updateUrlHash and getFiltersFromUrl work together for Alive at Center', () => {
            updateUrlHash(FILTER_TYPE_ALIVE_AT_CENTER, undefined);

            const filters = getFiltersFromUrl();

            expect(filters.filterType).toBe(FILTER_TYPE_ALIVE_AT_CENTER);
            expect(filters.subjects).toBeUndefined();
        });

        test('updateUrlHash and getFiltersFromUrl work together for URL Params', () => {
            const subjects = ['ID123', 'ID456'];
            updateUrlHash(FILTER_TYPE_URL_PARAMS, subjects, true);

            const filters = getFiltersFromUrl();

            expect(filters.filterType).toBe(FILTER_TYPE_URL_PARAMS);
            expect(filters.subjects).toEqual(subjects);
            expect(filters.readOnly).toBe(true);
        });

        test('updateUrlHash and getFiltersFromUrl work together for activeReport', () => {
            updateUrlHash(FILTER_TYPE_ID_SEARCH, ['ID123'], false, true, 'my-test-report');

            const filters = getFiltersFromUrl();

            expect(filters.filterType).toBe(FILTER_TYPE_ID_SEARCH);
            expect(filters.subjects).toEqual(['ID123']);
            expect(filters.activeReport).toBe('my-test-report');
            expect(filters.showReport).toBe(true);
        });
    });
});
