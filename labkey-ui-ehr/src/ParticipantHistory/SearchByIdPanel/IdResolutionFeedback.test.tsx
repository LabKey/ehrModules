import React from 'react';
import { render, screen } from '@testing-library/react';

import { IdResolutionFeedback } from './IdResolutionFeedback';
import { IdResolutionResult } from '../models';

describe('IdResolutionFeedback', () => {
    describe('resolved section display', () => {
        test('displays direct matches without arrow', () => {
            const resolutionResult: IdResolutionResult = {
                resolved: [
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                ],
                notFound: [],
            };

            render(<IdResolutionFeedback isVisible={true} resolutionResult={resolutionResult} />);

            expect(screen.getByText('ID123')).toBeVisible();
            expect(screen.getByText('ID456')).toBeVisible();
            // Should not contain arrow symbols for direct matches
            expect(screen.queryByText(/→/)).not.toBeInTheDocument();
        });

        test('displays alias matches with arrow and type', () => {
            const resolutionResult: IdResolutionResult = {
                resolved: [{ inputId: 'TATTOO_001', resolvedId: 'ID123', resolvedBy: 'alias', aliasType: 'tattoo' }],
                notFound: [],
            };

            render(<IdResolutionFeedback isVisible={true} resolutionResult={resolutionResult} />);

            // Should show: "TATTOO_001 → ID123 (tattoo)"
            expect(screen.getByText(/TATTOO_001/)).toBeVisible();
            expect(screen.getByText(/→/)).toBeVisible();
            expect(screen.getByText(/ID123/)).toBeVisible();
            expect(screen.getByText('(tattoo)')).toBeVisible();
        });

        test('displays multiple alias matches with different types', () => {
            const resolutionResult: IdResolutionResult = {
                resolved: [
                    { inputId: 'TATTOO_001', resolvedId: 'ID123', resolvedBy: 'alias', aliasType: 'tattoo' },
                    { inputId: 'CHIP_12345', resolvedId: 'ID456', resolvedBy: 'alias', aliasType: 'chip' },
                ],
                notFound: [],
            };

            render(<IdResolutionFeedback isVisible={true} resolutionResult={resolutionResult} />);

            expect(screen.getByText(/TATTOO_001/)).toBeVisible();
            expect(screen.getByText('(tattoo)')).toBeVisible();
            expect(screen.getByText(/CHIP_12345/)).toBeVisible();
            expect(screen.getByText('(chip)')).toBeVisible();
        });

        test('displays mixed direct and alias matches correctly', () => {
            const resolutionResult: IdResolutionResult = {
                resolved: [
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'TATTOO_001', resolvedId: 'ID456', resolvedBy: 'alias', aliasType: 'tattoo' },
                    { inputId: 'ID789', resolvedId: 'ID789', resolvedBy: 'direct', aliasType: null },
                ],
                notFound: [],
            };

            render(<IdResolutionFeedback isVisible={true} resolutionResult={resolutionResult} />);

            // Direct matches should not have arrow
            expect(screen.getByText('ID123')).toBeVisible();
            expect(screen.getByText('ID789')).toBeVisible();

            // Alias match should have arrow and type
            expect(screen.getByText(/TATTOO_001/)).toBeVisible();
            expect(screen.getByText('(tattoo)')).toBeVisible();
        });
    });

    describe('not found section display', () => {
        test('displays unresolved IDs in not found section', () => {
            const resolutionResult: IdResolutionResult = {
                resolved: [],
                notFound: ['INVALID_ID_1', 'INVALID_ID_2'],
            };

            render(<IdResolutionFeedback isVisible={true} resolutionResult={resolutionResult} />);

            expect(screen.getByText(/not found/i)).toBeVisible();
            expect(screen.getByText('INVALID_ID_1')).toBeVisible();
            expect(screen.getByText('INVALID_ID_2')).toBeVisible();
        });

        test('displays single not found ID', () => {
            const resolutionResult: IdResolutionResult = {
                resolved: [{ inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null }],
                notFound: ['INVALID_ID'],
            };

            render(<IdResolutionFeedback isVisible={true} resolutionResult={resolutionResult} />);

            expect(screen.getByText(/not found/i)).toBeVisible();
            expect(screen.getByText('INVALID_ID')).toBeVisible();
        });
    });

    describe('multiple inputs resolving to same ID', () => {
        test('displays all inputs that resolved to same ID', () => {
            const resolutionResult: IdResolutionResult = {
                resolved: [
                    { inputId: 'TATTOO_001', resolvedId: 'ID123', resolvedBy: 'alias', aliasType: 'tattoo' },
                    { inputId: 'CHIP_12345', resolvedId: 'ID123', resolvedBy: 'alias', aliasType: 'chip' },
                ],
                notFound: [],
            };

            render(<IdResolutionFeedback isVisible={true} resolutionResult={resolutionResult} />);

            // Both inputs should be displayed even though they resolve to the same ID
            expect(screen.getByText(/TATTOO_001/)).toBeVisible();
            expect(screen.getByText(/CHIP_12345/)).toBeVisible();
            // ID123 should appear twice (once for each resolution)
            const id123Elements = screen.getAllByText(/ID123/);
            expect(id123Elements.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('empty results', () => {
        test('renders container with title but no sections when no resolved and no not found IDs', () => {
            const resolutionResult: IdResolutionResult = {
                resolved: [],
                notFound: [],
            };

            const { container } = render(
                <IdResolutionFeedback resolutionResult={resolutionResult} />
            );

            // Component renders container with title
            expect(container.firstChild).not.toBeNull();
            expect(screen.getByText('ID Resolution')).toBeVisible();
            // But no sections are rendered
            expect(screen.queryByText(/Resolved/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Not Found/)).not.toBeInTheDocument();
        });
    });

    describe('section headings', () => {
        test('resolved section has proper heading', () => {
            const resolutionResult: IdResolutionResult = {
                resolved: [{ inputId: 'TATTOO_001', resolvedId: 'ID123', resolvedBy: 'alias', aliasType: 'tattoo' }],
                notFound: [],
            };

            render(<IdResolutionFeedback isVisible={true} resolutionResult={resolutionResult} />);

            const heading = screen.getByRole('heading', { name: /resolved/i });
            expect(heading).toBeInTheDocument();
        });

        test('not found section has proper heading', () => {
            const resolutionResult: IdResolutionResult = {
                resolved: [],
                notFound: ['INVALID_ID'],
            };

            render(<IdResolutionFeedback isVisible={true} resolutionResult={resolutionResult} />);

            const heading = screen.getByRole('heading', { name: /not found/i });
            expect(heading).toBeInTheDocument();
        });
    });

    describe('accessibility', () => {
        test('displays resolved IDs with proper structure', () => {
            const resolutionResult: IdResolutionResult = {
                resolved: [
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'TATTOO_001', resolvedId: 'ID456', resolvedBy: 'alias', aliasType: 'tattoo' },
                ],
                notFound: [],
            };

            const { container } = render(<IdResolutionFeedback isVisible={true} resolutionResult={resolutionResult} />);

            const resolvedItems = container.querySelectorAll('.resolved-item');
            expect(resolvedItems).toHaveLength(2);
        });

        test('displays not found IDs with proper structure', () => {
            const resolutionResult: IdResolutionResult = {
                resolved: [],
                notFound: ['INVALID_ID_1', 'INVALID_ID_2'],
            };

            const { container } = render(<IdResolutionFeedback isVisible={true} resolutionResult={resolutionResult} />);

            const notFoundItems = container.querySelectorAll('.not-found-item');
            expect(notFoundItems).toHaveLength(2);
        });
    });

    describe('special characters in IDs', () => {
        test('handles IDs with spaces', () => {
            const resolutionResult: IdResolutionResult = {
                resolved: [{ inputId: 'ID 123', resolvedId: 'ID 123', resolvedBy: 'direct', aliasType: null }],
                notFound: ['INVALID ID'],
            };

            render(<IdResolutionFeedback isVisible={true} resolutionResult={resolutionResult} />);

            expect(screen.getByText('ID 123')).toBeVisible();
            expect(screen.getByText('INVALID ID')).toBeVisible();
        });

        test('handles IDs with special characters', () => {
            const resolutionResult: IdResolutionResult = {
                resolved: [
                    { inputId: 'ID-123', resolvedId: 'ID-123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'TAG_456', resolvedId: 'ID.789', resolvedBy: 'alias', aliasType: 'tag' },
                ],
                notFound: ['INVALID@ID'],
            };

            render(<IdResolutionFeedback isVisible={true} resolutionResult={resolutionResult} />);

            expect(screen.getByText('ID-123')).toBeVisible();
            expect(screen.getByText(/TAG_456/)).toBeVisible();
            expect(screen.getByText(/ID\.789/)).toBeVisible();
            expect(screen.getByText('INVALID@ID')).toBeVisible();
        });
    });
});
