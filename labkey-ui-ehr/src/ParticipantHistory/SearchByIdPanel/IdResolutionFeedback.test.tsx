import React from 'react';
import { render, screen } from '@testing-library/react';

import { IdResolutionFeedback } from './IdResolutionFeedback';
import { IdResolutionResult } from '../models';

describe('IdResolutionFeedback', () => {
    describe('resolved section display', () => {
        test('displays direct matches without arrow', () => {
            // Arrange
            const resolutionResult: IdResolutionResult = {
                resolved: [
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'ID456', resolvedId: 'ID456', resolvedBy: 'direct', aliasType: null },
                ],
                notFound: [],
            };

            // Act
            render(<IdResolutionFeedback resolutionResult={resolutionResult} />);

            // Assert - both direct-match IDs are visible and no arrow symbol is rendered
            expect(screen.getByText('ID123')).toBeVisible();
            expect(screen.getByText('ID456')).toBeVisible();
            expect(screen.queryByText(/→/)).not.toBeInTheDocument();
        });

        test.each([
            {
                scenario: 'single alias match',
                resolved: [{ inputId: 'TATTOO_001', resolvedId: 'ID123', resolvedBy: 'alias' as const, aliasType: 'tattoo' }],
                expectedAliasRows: [{ inputId: 'TATTOO_001', resolvedId: 'ID123', aliasType: 'tattoo' }],
            },
            {
                scenario: 'multiple alias matches with different types',
                resolved: [
                    { inputId: 'TATTOO_001', resolvedId: 'ID123', resolvedBy: 'alias' as const, aliasType: 'tattoo' },
                    { inputId: 'CHIP_12345', resolvedId: 'ID456', resolvedBy: 'alias' as const, aliasType: 'chip' },
                ],
                expectedAliasRows: [
                    { inputId: 'TATTOO_001', resolvedId: 'ID123', aliasType: 'tattoo' },
                    { inputId: 'CHIP_12345', resolvedId: 'ID456', aliasType: 'chip' },
                ],
            },
        ])('displays alias matches with arrow and type for $scenario', ({ resolved, expectedAliasRows }) => {
            // Arrange
            const resolutionResult: IdResolutionResult = {
                resolved,
                notFound: [],
            };

            // Act
            render(<IdResolutionFeedback resolutionResult={resolutionResult} />);

            // Assert - each alias row shows input ID, arrow, resolved ID, and alias type label
            expect(screen.getAllByText(/→/)).toHaveLength(expectedAliasRows.length);
            expectedAliasRows.forEach(({ inputId, resolvedId, aliasType }) => {
                expect(screen.getByText(inputId)).toBeVisible();
                expect(screen.getByText(resolvedId)).toBeVisible();
                expect(screen.getByText(`(${aliasType})`)).toBeVisible();
            });
        });

        test('displays mixed direct and alias matches correctly', () => {
            // Arrange
            const resolutionResult: IdResolutionResult = {
                resolved: [
                    { inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'TATTOO_001', resolvedId: 'ID456', resolvedBy: 'alias', aliasType: 'tattoo' },
                    { inputId: 'ID789', resolvedId: 'ID789', resolvedBy: 'direct', aliasType: null },
                ],
                notFound: [],
            };

            // Act
            render(<IdResolutionFeedback resolutionResult={resolutionResult} />);

            // Assert - direct-match IDs are visible, and the alias match shows arrow plus type label
            expect(screen.getByText('ID123')).toBeVisible();
            expect(screen.getByText('ID789')).toBeVisible();

            // Alias match should have arrow and type
            expect(screen.getByText(/TATTOO_001/)).toBeVisible();
            expect(screen.getByText(/→/)).toBeVisible();
            expect(screen.getByText('(tattoo)')).toBeVisible();
        });
    });

    describe('not found section display', () => {
        test.each([
            {
                scenario: 'single unresolved ID alongside resolved content',
                resolved: [{ inputId: 'ID123', resolvedId: 'ID123', resolvedBy: 'direct' as const, aliasType: null }],
                notFound: ['INVALID_ID'],
            },
            {
                scenario: 'multiple unresolved IDs',
                resolved: [],
                notFound: ['INVALID_ID_1', 'INVALID_ID_2'],
            },
        ])('displays not found section for $scenario', ({ resolved, notFound }) => {
            // Arrange
            const resolutionResult: IdResolutionResult = {
                resolved,
                notFound,
            };

            // Act
            render(<IdResolutionFeedback resolutionResult={resolutionResult} />);

            // Assert - "not found" heading and each unresolved ID are visible
            expect(screen.getByRole('heading', { name: /not found/i })).toBeInTheDocument();
            notFound.forEach(id => {
                expect(screen.getByText(id)).toBeVisible();
            });
        });
    });

    describe('multiple inputs resolving to same ID', () => {
        test('displays all inputs that resolved to same ID', () => {
            // Arrange
            const resolutionResult: IdResolutionResult = {
                resolved: [
                    { inputId: 'TATTOO_001', resolvedId: 'ID123', resolvedBy: 'alias', aliasType: 'tattoo' },
                    { inputId: 'CHIP_12345', resolvedId: 'ID123', resolvedBy: 'alias', aliasType: 'chip' },
                ],
                notFound: [],
            };

            // Act
            render(<IdResolutionFeedback resolutionResult={resolutionResult} />);

            // Assert - both alias inputs are visible and the shared resolved ID appears twice
            expect(screen.getByText(/TATTOO_001/)).toBeVisible();
            expect(screen.getByText(/CHIP_12345/)).toBeVisible();
            // ID123 should appear twice (once for each resolution)
            const id123Elements = screen.getAllByText(/ID123/);
            expect(id123Elements).toHaveLength(2);
        });
    });

    describe('empty results', () => {
        test('renders container with title but no sections when no resolved and no not found IDs', () => {
            // Arrange
            const resolutionResult: IdResolutionResult = {
                resolved: [],
                notFound: [],
            };

            // Act
            render(<IdResolutionFeedback resolutionResult={resolutionResult} />);

            // Assert - title renders but neither Resolved nor Not Found sections appear
            expect(screen.getByText('ID Resolution')).toBeVisible();
            // But no sections are rendered
            expect(screen.queryByText(/Resolved/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Not Found/)).not.toBeInTheDocument();
        });
    });

    describe('special characters in IDs', () => {
        test('handles IDs with spaces', () => {
            // Arrange
            const resolutionResult: IdResolutionResult = {
                resolved: [{ inputId: 'ID 123', resolvedId: 'ID 123', resolvedBy: 'direct', aliasType: null }],
                notFound: ['INVALID ID'],
            };

            // Act
            render(<IdResolutionFeedback resolutionResult={resolutionResult} />);

            // Assert - IDs containing spaces render correctly in both resolved and not-found sections
            expect(screen.getByText('ID 123')).toBeVisible();
            expect(screen.getByText('INVALID ID')).toBeVisible();
        });

        test('handles IDs with special characters', () => {
            // Arrange
            const resolutionResult: IdResolutionResult = {
                resolved: [
                    { inputId: 'ID-123', resolvedId: 'ID-123', resolvedBy: 'direct', aliasType: null },
                    { inputId: 'TAG_456', resolvedId: 'ID.789', resolvedBy: 'alias', aliasType: 'tag' },
                ],
                notFound: ['INVALID@ID'],
            };

            // Act
            render(<IdResolutionFeedback resolutionResult={resolutionResult} />);

            // Assert - IDs with hyphens, underscores, dots, and @ symbols all render correctly
            expect(screen.getByText('ID-123')).toBeVisible();
            expect(screen.getByText(/TAG_456/)).toBeVisible();
            expect(screen.getByText(/ID\.789/)).toBeVisible();
            expect(screen.getByText('INVALID@ID')).toBeVisible();
        });
    });
});
