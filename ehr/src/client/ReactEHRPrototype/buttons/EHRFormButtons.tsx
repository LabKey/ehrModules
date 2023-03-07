
import React, { ReactNode } from 'react';
import { Button } from 'react-bootstrap';

export interface EHRFormButton {
    title: string;
    label: string;
    onClick: () => void;
}

export const COPY_FROM_SECTION_BUTTON: EHRFormButton = {
    title: 'Copy From Section',
    label: 'Copy From Section',
    onClick: () => undefined
}

export const TEMPLATES_BUTTON: EHRFormButton = {
    title: 'Templates',
    label: 'Templates',
    onClick: () => undefined
}

export const MORE_ACTIONS_BUTTON: EHRFormButton = {
    title: 'More Actions',
    label: 'More Actions',
    onClick: () => undefined
}

export interface ButtonProps {
    onDuplicateSelectedRows: (count: number) => void;
}

export const createButton = (formButton: EHRFormButton): ReactNode => {
    return (
        <span className="control-right">
            <Button title={formButton.title} onClick={formButton.onClick}>
                {formButton.label}
            </Button>
        </span>
    )
}