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

export interface IdResolutionFeedbackProps {
    resolutionResult: IdResolutionResult;
}

export const IdResolutionFeedback: FC<IdResolutionFeedbackProps> = ({ resolutionResult }) => {
    const { resolved, notFound } = resolutionResult;

    // Separate direct matches from alias matches
    const directMatches = resolved.filter(r => r.resolvedBy === 'direct');
    const aliasMatches = resolved.filter(r => r.resolvedBy === 'alias');

    return (
        <div className="id-resolution-feedback">
            <h3 className="title">ID Resolution</h3>

            {resolved.length > 0 && (
                <div className="section">
                    <h4 className="section-title resolved">Resolved ({resolved.length})</h4>
                    <div className="items">
                        {directMatches.map(match => (
                            <div className="item resolved-item" key={match.inputId}>
                                <span className="resolved-id">{match.resolvedId}</span>
                            </div>
                        ))}
                        {aliasMatches.map(match => (
                            <div className="item resolved-item" key={match.inputId}>
                                <span className="input-id">{match.inputId}</span>
                                <span className="arrow">→</span>
                                <span className="resolved-id">{match.resolvedId}</span>
                                {match.aliasType && <span className="alias-type">({match.aliasType})</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {notFound.length > 0 && (
                <div className="section">
                    <h4 className="section-title not-found">Not Found ({notFound.length})</h4>
                    <div className="items">
                        {notFound.map(id => (
                            <div className="item not-found-item" key={id}>
                                {id}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
