import React from 'react';
import { ParticipantView } from './ParticipantView';
import { screen } from '@testing-library/react';
import { defaultServerContext, renderWithServerContext } from '../test/utils';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event'

describe('ParticipantView', () => {
    test('render', async () => {
        renderWithServerContext(<ParticipantView />, defaultServerContext());

        // Check Top Level Tabs
        expect(await screen.findByText('General')).toBeVisible();
        expect(await screen.findByText('Clinical')).toBeVisible();
        expect(await screen.findByText('Lab Results')).toBeVisible();

        // Check default active nested tab content (Demographics is under General, which is default active)
        expect(await screen.findByText('Demographics Report')).toBeVisible();

        // Switch to Clinical
        const clinicalTab = await screen.findByText('Clinical');
        await act(async () => {
            userEvent.click(clinicalTab);
        });

        // Now "Clinical History" should be visible (first in Clinical)
        expect(await screen.findByText('Clinical History Report')).toBeVisible();
    });
});
