import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import '../ehr.scss';
import { CustomComponents } from "./index";
import { DynamicComponentContextProvider } from '@labkey/components';
import { TestForm } from "./TestForm";

const render = () => {
    ReactDOM.render(
        <AppContainer>
            <DynamicComponentContextProvider hooks={CustomComponents}>
                <TestForm />
            </DynamicComponentContextProvider>
        </AppContainer>,
        document.getElementById('app')
    )
};

declare const module: any;

if (module.hot) {
    module.hot.accept();
}

render();