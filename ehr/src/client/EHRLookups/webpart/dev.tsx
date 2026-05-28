/*
 * Copyright (c) 2022-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from '@labkey/api';
import { EHRLookups } from '../EHRLookupsPage';
import '../../ehr.scss';

App.registerApp<any>('demoWebpart', (target: string) => {
    ReactDOM.render(<EHRLookups />, document.getElementById('target'));
}, true /* hot */);

