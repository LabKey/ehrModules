import React from 'react';
import ReactDOM from 'react-dom';
import { DynamicComponentContextProvider } from '@labkey/components';

import '../ehr.scss';
import { CustomComponents } from "./index";
import { TestForm } from "./TestForm";

// Need to wait for container element to be available in labkey wrapper before render
window.addEventListener('DOMContentLoaded', (event) => {
    ReactDOM.render(
        <DynamicComponentContextProvider hooks={CustomComponents}>
            <TestForm/>
        </DynamicComponentContextProvider>,
        document.getElementById('app')
    );
});