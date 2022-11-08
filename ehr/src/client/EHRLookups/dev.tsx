import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import {EHRLookupsPage} from "./EHRLookupsPage";
import '../ehr.scss';

const render = () => {
    ReactDOM.render(
        <AppContainer>
            <EHRLookupsPage />
        </AppContainer>,
        document.getElementById('app')
    )
};

declare const module: any;

if (module.hot) {
    module.hot.accept();
}

render();