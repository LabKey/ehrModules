
import React, { FC, memo, useMemo } from 'react';
import { renderDuplicateWindow } from '../DuplicateSelectedWindow.js';

import {
    createButton,
    COPY_FROM_SECTION_BUTTON,
    MORE_ACTIONS_BUTTON,
    TEMPLATES_BUTTON,
    EHRFormButton, ButtonProps
} from "./EHRFormButtons";

export const DUPLICATE_SELECTED_BUTTON: EHRFormButton = {
    title: 'Duplicate Rows',
    label: 'Duplicate Rows',
    onClick: () => { renderDuplicateWindow() }
}

export const COPY_IDS_BUTTON: EHRFormButton = {
    title: 'Copy Ids',
    label: 'Copy Ids',
    onClick: () => undefined
}

export const CustomEHRFormButtons: FC<ButtonProps> = memo(props => {
    const { onDuplicateSelectedRows } = props;

    const duplicateButton = useMemo(() => {
        return {...DUPLICATE_SELECTED_BUTTON, ...{onClick: () => { renderDuplicateWindow(onDuplicateSelectedRows) }}}
    }, [onDuplicateSelectedRows]);

    return (
        <>
            {createButton(COPY_FROM_SECTION_BUTTON)}
            {createButton(TEMPLATES_BUTTON)}
            {createButton(duplicateButton)}
            {createButton(MORE_ACTIONS_BUTTON)}
        </>
    );

});

export default CustomEHRFormButtons;