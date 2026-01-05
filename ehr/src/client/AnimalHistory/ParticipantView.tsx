import React, { FC, memo } from 'react';
import { ParticipantReports  } from '@labkey/ehr/participanthistory';
import {ServerContextProvider, withAppUser, withServerContext} from '@labkey/components';
import { getServerContext } from '@labkey/api';

export const ParticipantView: FC = memo(() => {
    return (
        <div>
            <ParticipantReports />
            <hr />
        </div>
    );
});

export const App = memo(() => (
    <ServerContextProvider initialContext={withAppUser(getServerContext())}>
        <ParticipantView />
    </ServerContextProvider>
));

App.displayName = 'App';
