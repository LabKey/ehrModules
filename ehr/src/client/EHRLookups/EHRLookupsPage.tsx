/*
 * Copyright (c) 2022-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
import React, { FC, memo } from 'react';

import {
    GridPanelWithModel,
    NotificationsContextProvider,
    SchemaQuery,
    withServerContext,
} from '@labkey/components';

const modelId = 'editable_ehr_lookups'
const queryConfig = {
        bindURL: false,
        id: modelId,
        maxRows: 500,
        schemaQuery: new SchemaQuery('ehr_lookups', 'editable_lookups'),
        includeTotalCount: true,
    };

export const EHRLookupsPage: FC = memo(() => {

    return (
        <div>
            <NotificationsContextProvider>
                <GridPanelWithModel
                    title={'Select table to edit values'}
                    asPanel={true}
                    queryConfig={queryConfig}
                    allowSelections={false}
                />
            </NotificationsContextProvider>
        </div>
    );
});

export const EHRLookups = withServerContext(EHRLookupsPage);
