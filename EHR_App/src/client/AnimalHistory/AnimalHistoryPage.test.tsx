/*
 * Copyright (c) 2023-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
import React from 'react';
import { screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { AnimalHistoryPage } from './AnimalHistoryPage';
import { defaultServerContext, renderWithServerContext } from '@labkey/ehr';

describe('AnimalHistoryPage', () => {
    test('render', async () => {
        renderWithServerContext(<AnimalHistoryPage />, defaultServerContext());

        expect(await screen.findByText('This is Animal History')).toBeVisible();

        const tab2 = await screen.findByText('tab2');
        expect(tab2).toBeVisible();
        await act(async () => {
            userEvent.click(tab2);
        });

        expect(await screen.findByText('User: FolderAdminDisplayName')).toBeVisible();
    });
});
