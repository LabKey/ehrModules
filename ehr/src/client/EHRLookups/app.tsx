import React from 'react';
import ReactDOM from 'react-dom';
import { EHRLookups } from "./EHRLookupsPage";

import '../ehr.scss';

// Need to wait for container element to be available in labkey wrapper before render
window.addEventListener('DOMContentLoaded', (event) => {
    ReactDOM.render(<EHRLookups />, document.getElementById('app'));
});
