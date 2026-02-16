import React, { FC } from 'react';

import { IdResolutionResult } from '../models';

/**
 * Component to display ID resolution feedback
 *
 * Shows two sections:
 * - "Resolved" section: IDs that were found (directly or via alias)
 *   - Direct matches: "ID123"
 *   - Alias matches: "TATTOO_001 → ID123 (tattoo)"
 * - "Not Found" section: IDs that could not be resolved
 *
 * Only visible when there are aliases or not-found IDs (hidden for all direct matches)
 */

interface IdResolutionFeedbackProps {
    resolutionResult: IdResolutionResult;
}

export const IdResolutionFeedback: FC<IdResolutionFeedbackProps> = ({ resolutionResult }) => {
    const { resolved, notFound } = resolutionResult;

    // Separate direct matches from alias matches
    const directMatches = resolved.filter(r => r.resolvedBy === 'direct');
    const aliasMatches = resolved.filter(r => r.resolvedBy === 'alias');

    return (
        <div className="id-resolution-feedback">
            <h3 className="id-resolution-feedback__title">ID Resolution</h3>

            {resolved.length > 0 && (
                <div className="id-resolution-feedback__section">
                    <h4 className="id-resolution-feedback__section-title id-resolution-feedback__section-title--resolved">
                        Resolved ({resolved.length})
                    </h4>
                    <div className="id-resolution-feedback__items">
                        {directMatches.map(match => (
                            <div
                                className="id-resolution-feedback__item id-resolution-feedback__item--resolved"
                                key={match.inputId}
                            >
                                <span className="id-resolution-feedback__resolved-id">{match.resolvedId}</span>
                            </div>
                        ))}
                        {aliasMatches.map(match => (
                            <div
                                className="id-resolution-feedback__item id-resolution-feedback__item--resolved"
                                key={match.inputId}
                            >
                                <span className="id-resolution-feedback__input-id">{match.inputId}</span>
                                <span className="id-resolution-feedback__arrow">→</span>
                                <span className="id-resolution-feedback__resolved-id">{match.resolvedId}</span>
                                {match.aliasType && (
                                    <span className="id-resolution-feedback__alias-type">({match.aliasType})</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {notFound.length > 0 && (
                <div className="id-resolution-feedback__section">
                    <h4 className="id-resolution-feedback__section-title id-resolution-feedback__section-title--not-found">
                        Not Found ({notFound.length})
                    </h4>
                    <div className="id-resolution-feedback__items">
                        {notFound.map(id => (
                            <div
                                className="id-resolution-feedback__item id-resolution-feedback__item--not-found"
                                key={id}
                            >
                                {id}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
