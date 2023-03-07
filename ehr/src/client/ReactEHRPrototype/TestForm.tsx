import React, { FC, memo, useCallback, useEffect, useState } from "react";
import { CustomizableEditableGrid } from "./CustomizableEditableGrid";
import { ExtJSPanel } from "./ExtJSPanel";
import { QueryConfigMap, SchemaQuery } from "@labkey/components";
import { Filter } from "@labkey/api";
import { MODEL_ID_GRID_1, MODEL_ID_GRID_2 } from "./models";
import { metadataSetup } from "./index";
import { updateAnimalId } from "./AnimalDetailsWithReact";

const grid1: QueryConfigMap = {
    [MODEL_ID_GRID_1]: {
        schemaQuery: new SchemaQuery("study", "demographics"),
        baseFilters: [Filter.create('TaskId', 1, Filter.Types.EQUALS)]
    }
}

const grid2: QueryConfigMap = {
    [MODEL_ID_GRID_2]: {
        schemaQuery: new SchemaQuery("study", "weight"),
        baseFilters: [Filter.create('TaskId', 1, Filter.Types.EQUALS)]
    }
}

export const TestForm: FC = memo(props => {
    const [ id, setId ] = useState<string>();


    useEffect(() => {
        metadataSetup();
    }, []);

    const updateId = useCallback((id: string) => {
        updateAnimalId(id);
    }, []);

    return (
        <>
            <ExtJSPanel />
            <CustomizableEditableGrid queryConfigs={grid1} modelId={MODEL_ID_GRID_1} title={'Demographics'} updateId={updateId}/>
            <CustomizableEditableGrid queryConfigs={grid2} modelId={MODEL_ID_GRID_2} title={'Weights'} updateId={updateId}/>
        </>
    )

});