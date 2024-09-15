import React from 'react';
import ReactDOM from 'react-dom';
import { App } from '@labkey/api';

import { EHRLookupsPage } from "../EHRLookupsPage";
import '../../ehr.scss';

App.registerApp<any>('demoWebpart', (target: string) => {
    ReactDOM.render(<EHRLookupsPage />, document.getElementById('target'));
}, true /* hot */);

