import React from 'react';
import ReactDOM from 'react-dom';
import { EHRLookupsPage } from "./EHRLookupsPage";
import '../ehr.scss';

const render = () => {
    ReactDOM.render(<EHRLookupsPage />, document.getElementById('app'));
};

render();