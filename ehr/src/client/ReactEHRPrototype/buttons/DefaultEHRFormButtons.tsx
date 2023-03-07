
import React, { FC, memo } from 'react';

import {
    createButton,
    COPY_FROM_SECTION_BUTTON,
    MORE_ACTIONS_BUTTON,
    TEMPLATES_BUTTON,
    ButtonProps
} from "./EHRFormButtons";

export const DefaultEHRFormButtons: FC<ButtonProps> = memo(props => {

    return (
        <>
            {createButton(COPY_FROM_SECTION_BUTTON)}
            {createButton(TEMPLATES_BUTTON)}
            {createButton(MORE_ACTIONS_BUTTON)}
        </>
    );

});

export default DefaultEHRFormButtons;