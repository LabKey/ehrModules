import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { App } from '@labkey/api';

import { EHRLookupsPage } from "../EHRLookupsPage";
import '../../ehr.scss';

App.registerApp<any>('demoWebpart', (target: string) => {
    ReactDOM.render(
        <AppContainer>
            <EHRLookupsPage />
        </AppContainer>,
        document.getElementById(target)
    );
}, true /* hot */);

declare const module: any;

