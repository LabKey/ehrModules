import React from 'react';
import ReactDOM from 'react-dom';
import { EHRLookups } from "./EHRLookupsPage";
import '../ehr.scss';

const render = () => {
    ReactDOM.render(<EHRLookups />, document.getElementById('app'));
};

render();