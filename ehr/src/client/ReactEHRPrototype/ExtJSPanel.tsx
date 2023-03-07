import React, { FC, memo, useEffect } from "react";
import { renderAnimalDetailsPanel } from './AnimalDetailsWithReact.js';


export const ExtJSPanel: FC = memo( props => {

    useEffect(() => {
        renderAnimalDetailsPanel();
    }, []);

    return (
        <div className={'margin-bottom'}>
            <div id={'extjs-panel-with-react'}></div>
        </div>
    )

});