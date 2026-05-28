/*
 * Copyright (c) 2023-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './AnimalHistoryPage';

import './index.scss';

const render = (): void => {
    createRoot(document.getElementById('app')).render(<App />);
};

render();
