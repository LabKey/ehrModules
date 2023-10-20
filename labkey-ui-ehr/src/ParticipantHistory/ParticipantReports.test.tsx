import React from 'react';
import { ParticipantReports } from './ParticipantReports';
import { screen } from '@testing-library/react';
import { defaultServerContext, renderWithServerContext } from '../test/utils';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event'

describe('ParticipantReports', () => {
    test('render', async () => {
        renderWithServerContext(<ParticipantReports />, defaultServerContext());

        expect(await screen.findByText('tab1')).toBeVisible();

        const tab2 = await screen.findByText('tab2');
        expect(tab2).toBeVisible();
        await act(async () => {
            userEvent.click(tab2);
        });

        expect(await screen.findByText('User: FolderAdminDisplayName')).toBeVisible();

    });
});