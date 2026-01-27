import { ParticipantHistoryAPIWrapper } from '../APIWrapper';

/**
 * Creates a test-friendly API wrapper with mocked methods.
 * Use this to inject test dependencies into components without mocking @labkey/api.
 *
 * @param overrides - Partial implementation to override default mock behavior
 * @returns A fully mocked ParticipantHistoryAPIWrapper
 *
 * @example
 * // Basic usage with defaults
 * const wrapper = createTestAPIWrapper();
 *
 * @example
 * // Override specific methods
 * const wrapper = createTestAPIWrapper({
 *     resolveAnimalIds: jest.fn().mockResolvedValue({
 *         resolved: [{ inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null }],
 *         notFound: [],
 *     }),
 * });
 */
export const createTestAPIWrapper = (
    overrides: Partial<ParticipantHistoryAPIWrapper> = {}
): ParticipantHistoryAPIWrapper => {
    const defaultWrapper: ParticipantHistoryAPIWrapper = {
        resolveAnimalIds: jest.fn().mockResolvedValue({ resolved: [], notFound: [] }),
        fetchReports: jest.fn().mockResolvedValue({ reports: [] }),
    };
    return { ...defaultWrapper, ...overrides };
};
