import React from 'react';
import ReactDOM from 'react-dom'
import { App } from './AnimalHistoryPage';

import './index.scss'

const render = (): void => {
    ReactDOM.render(<App />, document.getElementById('app'));
};

render();