import React from 'react';
import ReactDOM from 'react-dom';
import { App } from '@labkey/api';
import { EHRLookups } from '../EHRLookupsPage';
import '../../ehr.scss';

App.registerApp<any>('EHRLookupsWebpart', target => {
    ReactDOM.render(<EHRLookups />, document.getElementById(target));
});