import React from 'react';
import ReactDOM from 'react-dom';
import {EHRLookupsPage} from "./EHRLookupsPage";

import '../ehr.scss';

// Need to wait for container element to be available in labkey wrapper before render
window.addEventListener('DOMContentLoaded', (event) => {
    ReactDOM.render(<EHRLookupsPage />, document.getElementById('app'));
});
