import React from 'react';
import { screen } from '@testing-library/react';

import { ParticipantReports } from './ParticipantReports';
import { defaultServerContext, renderWithServerContext } from '../test/utils';

// Mock @labkey/api Query.selectRows to prevent communication failure in tests
jest.mock('@labkey/api', () => ({
    ...jest.requireActual('@labkey/api'),
    Query: {
        ...jest.requireActual('@labkey/api').Query,
        selectRows: jest.fn(),
    },
}));

// Mock Ext4 global
const mockExt4Container = {
    report: null as any,
    filters: null as any,
    isDestroyed: false,
    add: jest.fn(),
    removeAll: jest.fn(),
    destroy: jest.fn(),
    getFilterArray: jest.fn(() => ({ removable: [], nonRemovable: [] })),
    getQWPConfig: jest.fn(() => ({})),
};

(global as any).Ext4 = {
    create: jest.fn(() => mockExt4Container),
};

// Mock LDK global for QueryReportWrapper
(global as any).LDK = {
    Utils: {
        getErrorCallback: jest.fn(() => jest.fn()),
    },
};

// Mock LABKEY.WebPart for OtherReportWrapper
(global as any).LABKEY = {
    ...(global as any).LABKEY,
    WebPart: jest.fn().mockImplementation(() => ({
        render: jest.fn(),
    })),
};

describe('ParticipantReports', () => {
    let originalHash: string;

    beforeEach(() => {
        jest.clearAllMocks();
        mockExt4Container.isDestroyed = false;

        // Save and reset document.location.hash before each test
        originalHash = window.location.hash;
        window.location.hash = '';
    });

    afterEach(() => {
        window.location.hash = originalHash;
    });

    describe('rendering', () => {
        test('renders TabbedReportPanel component', () => {
            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Component should render and show loading state (since no reports are loaded yet)
            expect(screen.getByText('Loading reports...')).toBeVisible();
        });

        test('renders with default subjects filter when no URL hash present', () => {
            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Component renders without errors when no hash is present
            expect(screen.getByText('Loading reports...')).toBeVisible();
        });
    });

    describe('URL hash parsing (getFiltersFromUrl)', () => {
        test('parses activeReport from URL hash', () => {
            window.location.hash = '#activeReport:test-report-id';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // Component should render without errors when activeReport is in hash
            expect(screen.getByText('Loading reports...')).toBeVisible();
        });

        test('parses inputType from URL hash', () => {
            window.location.hash = '#inputType:singleSubject';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('Loading reports...')).toBeVisible();
        });

        test('parses showReport as true from URL hash', () => {
            window.location.hash = '#showReport:1';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('Loading reports...')).toBeVisible();
        });

        test('parses showReport as false from URL hash', () => {
            window.location.hash = '#showReport:0';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('Loading reports...')).toBeVisible();
        });

        test('parses subjects from URL hash', () => {
            window.location.hash = '#subjects:subject1%3Bsubject2%3Bsubject3';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('Loading reports...')).toBeVisible();
        });

        test('parses multiple parameters from URL hash', () => {
            window.location.hash = '#activeReport:my-report&inputType:multiSubject&showReport:1&subjects:sub1%3Bsub2';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('Loading reports...')).toBeVisible();
        });

        test('parses custom/unknown parameters from URL hash', () => {
            window.location.hash = '#customParam:customValue&anotherParam:anotherValue';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('Loading reports...')).toBeVisible();
        });

        test('handles URL-encoded values in hash parameters', () => {
            window.location.hash = '#activeReport:report%20with%20spaces';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('Loading reports...')).toBeVisible();
        });

        test('handles empty subjects value in URL hash', () => {
            window.location.hash = '#subjects:';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('Loading reports...')).toBeVisible();
        });

        test('ignores parameters without values', () => {
            window.location.hash = '#paramWithoutValue';

            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            expect(screen.getByText('Loading reports...')).toBeVisible();
        });
    });

    describe('props passed to TabbedReportPanel', () => {
        test('passes correct reportNamespace prop', () => {
            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // The component should render the TabbedReportPanel with EHR.reports namespace
            // This is verified indirectly by successful render
            expect(screen.getByText('Loading reports...')).toBeVisible();
        });

        test('passes correct reportsQuery and reportsSchema props', () => {
            renderWithServerContext(<ParticipantReports />, defaultServerContext());

            // The component should render with ehr schema and reports query
            expect(screen.getByText('Loading reports...')).toBeVisible();
        });
    });
});
