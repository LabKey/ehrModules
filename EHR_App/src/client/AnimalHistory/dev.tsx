import React, { useMemo } from 'react';
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader';
import { AnimalHistoryPage } from './AnimalHistoryPage';
import { getServerContext } from '@labkey/api';
import { ServerContextProvider, withAppUser } from '@labkey/components';

import './index.scss'

const render = () => {
    ReactDOM.render(
        <AppContainer>
            <ServerContextProvider initialContext={withAppUser(getServerContext())}>
                <AnimalHistoryPage/>
            </ServerContextProvider>
        </AppContainer>,
        document.getElementById('app')
    )
};

declare const module: any;

if (module.hot) {
    module.hot.accept();
}

render();