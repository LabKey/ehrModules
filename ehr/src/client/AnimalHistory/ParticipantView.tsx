/*
 * Copyright (c) 2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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
