import React from 'react'
import ReactDOM from 'react-dom'
import { AnimalHistoryPage } from './AnimalHistoryPage';
import { getServerContext } from '@labkey/api';
import { ServerContextProvider, withAppUser } from '@labkey/components';

import './index.scss'

// Need to wait for container element to be available in labkey wrapper before render
window.addEventListener('DOMContentLoaded', (event) => {
    ReactDOM.render(
        <ServerContextProvider initialContext={withAppUser(getServerContext())}>
            <AnimalHistoryPage/>
        </ServerContextProvider>
        , document.getElementById('app'));
});