import React, { FC, memo } from 'react';
import { ParticipantReports  } from '@labkey/ehr/participanthistory';
import { withServerContext } from '@labkey/components';

export const AnimalHistoryPage: FC = memo(() => {
    return (
        <div>
            <div>This is Animal History</div>
            <ParticipantReports />
            <hr />
        </div>
    );
});

export const App = withServerContext(AnimalHistoryPage);
