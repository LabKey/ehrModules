import {
    AnimalHistoryReports,
    getAnimalHistoryReports
} from './actions';

export interface EHRAPIWrapper {
    getAnimalHistoryReports: () => Promise<AnimalHistoryReports>;
}

let DEFAULT_API_WRAPPER: EHRAPIWrapper;

export function getDefaultEHRAPIWrapper(): EHRAPIWrapper {
    if (!DEFAULT_API_WRAPPER) {
        DEFAULT_API_WRAPPER = {
            getAnimalHistoryReports,
        };
    }

    return DEFAULT_API_WRAPPER;
}

export function getEHRTestAPIWrapper(overrides: Partial<EHRAPIWrapper> = {}): EHRAPIWrapper {
    return {
        getAnimalHistoryReports: jest.fn(),
        ...overrides,
    };
}
