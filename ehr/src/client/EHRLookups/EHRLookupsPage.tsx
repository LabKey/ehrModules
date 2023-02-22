import React, { FC, memo } from 'react';

import {
    GridPanelWithModel,
    SchemaQuery,
} from "@labkey/components";

const modelId = 'editable_ehr_lookups'
const queryConfig = {
        bindURL: false,
        id: modelId,
        schemaQuery: new SchemaQuery('ehr_lookups', 'editable_lookups'),
        includeTotalCount: true,
    };

export const EHRLookupsPage: FC = memo(() => {

    return (
        <div>
            <GridPanelWithModel
                title={'Select table to edit values'}
                asPanel={true}
                queryConfig={queryConfig}
            />
        </div>
    );
});
