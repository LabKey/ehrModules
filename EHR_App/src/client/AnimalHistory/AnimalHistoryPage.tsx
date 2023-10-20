import React, { FC, memo } from 'react';
import { ParticipantReports } from '@labkey/ehr/participanthistory';


export const AnimalHistoryPage: FC = memo(() => {

    return (
        <div>
            <div>This is Animal History</div>
            <ParticipantReports />
        </div>
    )

});