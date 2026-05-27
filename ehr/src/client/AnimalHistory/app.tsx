/*
 * Copyright (c) 2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ParticipantView';

import './index.scss';

// Need to wait for container element to be available in labkey wrapper before render
window.addEventListener('DOMContentLoaded', event => {
    createRoot(document.getElementById('app')).render(<App />);
});
